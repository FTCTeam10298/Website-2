import type { ActionStep, ActionType } from './types';

// ---- action catalog: drives the dropdowns + code generation -------------------
// `sleep` and `raw` are library-level (work against just NeuronDrive/NeuronLocalizer).
// shoot/farShoot/pulseOuttake/intake/gate/shooter/turret are this season's DECODE
// shooter-pipeline actions—they emit the same robot.X / shoot() calls as the
// team's real auto.java, since they're meant to be pasted into (or generated
// alongside) that season repo, which already has Robot/Turret/Gate/Intake/Shooter.
// Swap these out for your own game's subsystems by following the same shape.
export interface ActionDef {
  label: string;
  field?: 'ms' | 'sel' | 'txt';
  opts?: string[];
  def?: Partial<ActionStep>;
  gen: (a: ActionStep) => string;
}

export const ACTIONS: Record<ActionType, ActionDef> = {
  sleep:        { label: 'wait (ms)', field: 'ms', def: { ms: 500 },
                  gen: a => `waitMs(${Math.round(a.ms ?? 0)});` },
  shoot:        { label: 'shoot()', gen: () => 'shoot();' },
  farShoot:     { label: 'farShoot()', gen: () => 'farShoot();' },
  pulseOuttake: { label: 'pulseOuttake(ms)', field: 'ms', def: { ms: 300 },
                  gen: a => `pulseOuttake(${Math.round(a.ms ?? 0)});` },
  intake:       { label: 'intake …', field: 'sel', opts: ['in', 'off', 'out', 'shoot', 'farzoneshoot'], def: { mode: 'in' },
                  gen: a => `robot.intake.${a.mode}();` },
  gate:         { label: 'gate …', field: 'sel', opts: ['open', 'close'], def: { mode: 'open' },
                  gen: a => `robot.gate.${a.mode}();` },
  shooter:      { label: 'shooter …', field: 'sel', opts: ['shoot', 'off'], def: { mode: 'shoot' },
                  gen: a => `robot.shooter.${a.mode}();` },
  turret:       { label: 'turret state …', field: 'sel', opts: ['AUTO', 'ZERO', 'OFF'], def: { mode: 'OFF' },
                  gen: a => `robot.turret.turretState = Turret.TurretState.${a.mode};` },
  raw:          { label: 'custom line …', field: 'txt', def: { text: '// custom' },
                  gen: a => a.text ?? '' },
};

export const ACTION_TYPES = Object.keys(ACTIONS) as ActionType[];

export function newAction(type: ActionType): ActionStep {
  return { kind: 'action', type, ...structuredClone(ACTIONS[type].def ?? {}) };
}
