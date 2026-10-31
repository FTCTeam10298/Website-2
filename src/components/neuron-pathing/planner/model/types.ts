// Field model: 144"x144", origin at the bottom-left corner
// (+X right, +Y up, heading 0 = +X, CCW positive).
// Generated poses are the literal numbers the user edits:
//     new Pose2D(X, Y, Math.toRadians(H))
// The field is symmetric, so the same path is used for both alliances.

export type MoveKind = 'spline' | 'goto';

export interface Pose {
  x: number;
  y: number;
  h: number;          // degrees
  locked?: boolean;   // can't be dragged or nudged (doesn't affect generated code)
}

export interface MoveStep extends Pose {
  kind: 'move';
  move: MoveKind;
  through: boolean;
  factor: number;
  maxSpeed: number;
  reversed?: boolean; // undefined = auto (derived from geometry), else pinned
}

export type ActionType =
  | 'sleep' | 'shoot' | 'farShoot' | 'pulseOuttake'
  | 'intake' | 'gate' | 'shooter' | 'turret' | 'raw';

export interface ActionStep {
  kind: 'action';
  type: ActionType;
  ms?: number;
  mode?: string;
  text?: string;
}

// Control-flow blocks live in the flat step list as balanced marker pairs:
// repeat … end, if … [else …] end.
export interface RepeatStep { kind: 'repeat'; count: number; var?: string }
export interface IfStep { kind: 'if'; cond?: string }
export interface ElseStep { kind: 'else' }
export interface EndStep { kind: 'end' }
export type ControlStep = RepeatStep | IfStep | ElseStep | EndStep;

export type Step = MoveStep | ActionStep | ControlStep;

export interface Auto {
  name: string;   // Java method name
  label: string;  // Driver-Station label (full OpMode autoNames[])
  start: Pose;
  steps: Step[];
}

export type NodeRef = { kind: 'start' } | { kind: 'step'; i: number };
export type Selection = NodeRef | null;

export type OutputMode = 'method' | 'opmode';

export interface PlannerState {
  output: OutputMode;
  opModeName: string;
  includeSetPos: boolean;
  clickAdds: MoveKind;
  showGrid: boolean;
  showZones: boolean;
  snap: boolean;
  showRobot: boolean;
  showSpeed: boolean;
  cmpCount: number;
  videoShow: boolean;
  videoOpacity: number;
  videoRot: number;
  youtubeUrl: string;
  videoScale: number;
  videoOffsetX: number;
  videoOffsetY: number;
  videoPerspectiveX: number;
  videoPerspectiveY: number;
  bgImage: string | null;   // data URL of a custom field image, else the bundled DECODE field
  bgRot: number;
  bgFlip: boolean;
  bgShow: boolean;
  robotW: number;
  robotL: number;
  simMaxV: number;
  simMaxA: number;
  defFactor: number;
  defMaxSpeed: number;
  accent: string;
  autos: Auto[];
  activeAuto: number;
  headingV: 2;
  originV: 2;
  selected: Selection;
}

// A pose in field space, as used by drawing / simulation.
export interface FieldPose { fx: number; fy: number; hdeg: number }

export interface ScreenPt { sx: number; sy: number }

export interface PathNode extends FieldPose {
  move: 'start' | MoveKind;
  st: MoveStep | null;
  ref: NodeRef;
}
