const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/PathPlanner-CT734Bbv.js","assets/index-AY7GaI4R.js","assets/index-DdgH7uB4.css","assets/PathPlanner-DeUpu6gl.css"])))=>i.map(i=>d[i]);
import{a as e,c as t,d as n,f as r,i,l as a,n as o,o as s,r as c,s as l,t as u,u as d}from"./index-AY7GaI4R.js";var f=r(n(),1),p=[{slug:`installation`,title:`Installation`,markdown:`## Requirements

- An omnidirectional drivetrain (mecanum or X-drive). NeuronDrive's mecanum math assumes
  four independently-driven wheels named \`frontLeft\`, \`frontRight\`, \`backLeft\`, \`backRight\`
  in your robot configuration (or pass your own names to the \`NeuronDrive\` constructor).
- A [goBILDA Pinpoint](https://www.gobilda.com/pinpoint-odometry-computer/) odometry
  computer, wired per goBILDA's instructions, named \`pinpoint\` in your robot configuration
  (or pass your own device name to \`NeuronLocalizer\`).
- Android Studio (Narwhal 3 Feature Drop or later). Neuron Pathing is a plain Java library, so it
  does not work from Blocks or OnBot Java.

The Pinpoint driver ships inside the stock FTC SDK itself, so this quickstart needs **no
extra Gradle dependencies** beyond what \`FtcRobotController\` already provides.

## Get the code

Open Android Studio, then download the SDK and clone the quickstart repository.

1. Open Android Studio. If you have another project open, close it with **File → Close Project**. Make sure **Projects** is selected in the sidebar.

   ![Android Studio welcome screen](https://raw.githubusercontent.com/gamemanual0/gm0/1ef047ce037c1e5b7cf9910bdda4612cee58ec40/source/docs/software/getting-started/images/using-android-studio/as-welcome.png)

2. Click the gear icon in the bottom-left corner, then select **Check for Updates**. If you do not have the latest version, download the updates.

3. Select **Get from VCS**. Make sure **Repository URL** is selected in the sidebar, then paste the repository URL into the field:

   \`\`\`
   https://github.com/FTCTeam10298/Neuron-Pathing-Quickstart.git
   \`\`\`

   > 💡 Consider also changing the name of the final folder in the Directory textbox from \`Neuron-Pathing-Quickstart\` to something that reflects your team and the season, e.g. team number 99999 might use \`99999-2026-27-code\`.

   ![Get from VCS dialog in Android Studio](https://raw.githubusercontent.com/gamemanual0/gm0/1ef047ce037c1e5b7cf9910bdda4612cee58ec40/source/docs/software/getting-started/images/using-android-studio/as-get-from-vcs.png)

4. When Android Studio asks if you want to trust and open the project, choose **Trust Project**.

   ![Trust project dialog in Android Studio](https://raw.githubusercontent.com/gamemanual0/gm0/1ef047ce037c1e5b7cf9910bdda4612cee58ec40/source/docs/software/getting-started/images/using-android-studio/as-trust-project-dialog.png)

5. Select the hammer icon in the top-right corner of the window. This will download any missing modules and build the project.

   ![Build project icon in Android Studio](https://raw.githubusercontent.com/gamemanual0/gm0/1ef047ce037c1e5b7cf9910bdda4612cee58ec40/source/docs/software/getting-started/images/using-android-studio/as-make-module.png)

6. Wait for Gradle to finish. This indicator is usually located at the bottom of the window by default.

   ![Gradle build in progress](https://raw.githubusercontent.com/gamemanual0/gm0/1ef047ce037c1e5b7cf9910bdda4612cee58ec40/source/docs/software/getting-started/images/using-android-studio/build-gradle.png)

## Where everything lives

\`\`\`
TeamCode/.../neuronpathing/   the library: Pose2D, Spline, NeuronLocalizer, NeuronDrive, ...
TeamCode/.../opmodes/         example OpModes built on the library
\`\`\`

## Wire up your robot

1. In the Driver Station / Driver Hub, create a robot configuration with:
   - Four \`DcMotorEx\` entries named \`frontLeft\`, \`frontRight\`, \`backLeft\`, \`backRight\`
     (or your own names; see below).
   - A goBILDA Pinpoint entry named \`pinpoint\` (I2C).
2. Measure your Pinpoint's offset from the robot's center of rotation, in millimeters
   (X = forward/back offset, Y = left/right offset; see goBILDA's docs for sign
   conventions). You'll need these numbers next.
3. In your OpMode, construct the library:

   \`\`\`java
   NeuronLocalizer localizer = new NeuronLocalizer(hardwareMap, telemetry,
                               /*xOffsetMm=*/ -78.74, /*yOffsetMm=*/ -184.15);
   NeuronDrive drive = new NeuronDrive(hardwareMap, localizer, /*trackWidthIn=*/ 14);
   \`\`\`

   \`trackWidthIn\` is the distance between your left and right wheel contact points, in
   inches; measure your actual robot, don't guess.

   If your hardware config uses different motor names than the default four, use the
   longer constructor instead:

   \`\`\`java
   NeuronDrive drive = new NeuronDrive(hardwareMap, localizer, trackWidthIn,
                       "myFrontLeft", "myFrontRight", "myBackLeft", "myBackRight");
   \`\`\`
4. Before trusting any pose data, calibrate once (blocks briefly, ~1s):

   \`\`\`java
   localizer.setPosition(new Pose2D(0, 0, 0)); // wherever your robot actually starts
   localizer.calibrate(true);
   \`\`\`
5. Call \`drive.update()\` every loop. That's it: \`drive.pose\` now tracks the robot's
   field position, and \`drive.goToPoint()\` / \`drive.splineToPoint()\` will drive there.

None of this will behave correctly yet on a fresh robot: the offsets, motor directions,
and PID gains above are all starting points. Follow **[Tuning](/neuron-pathing/docs/tuning)** next before
trusting any of it in a match.
`},{slug:`tuning`,title:`Tuning`,markdown:`Do these in order. Each stage assumes the previous one is already correct: PID tuning
on top of a localizer with the wrong sign conventions will never converge, no matter how
long you fiddle with gains.

Before starting: build and deploy once, and confirm your hardware configuration on the
Driver Hub actually has the motor/Pinpoint names your code expects (Installation).

## Stage 1: Localizer sign conventions

Run **Neuron Localizer Test** (\`NeuronLocalizerTest.java\`) on the Driver Station. It never
commands the motors; you push the robot by hand and just watch the numbers.

Set \`xOffsetMm\`/\`yOffsetMm\` in the OpMode to your measured Pinpoint offset first.

With the robot on the field, facing what you consider "heading 0":

| Push the robot... | ...and this should happen |
| --- | --- |
| straight forward | \`x\` increases |
| straight left (strafe) | \`y\` increases |
| turn counter-clockwise (viewed from above) | \`heading\` increases |

If any of these are backwards, the fix is in \`NeuronLocalizer\`'s construction, **not** in
\`NeuronDrive\`'s math:

- \`x\` or \`y\` backwards -> swap/flip the corresponding \`EncoderDirection\` you pass to
  \`NeuronLocalizer\` (or check the pod is plugged into the correct Pinpoint port).
- \`heading\` backwards -> the Pinpoint's IMU orientation is flipped; double check it's
  mounted flat and its port assignment matches goBILDA's wiring diagram.
- Numbers are wildly wrong (not just backwards) -> re-check \`xOffsetMm\`/\`yOffsetMm\` and
  that you called \`calibrate(true)\` after \`setPosition()\`.

Don't move on until pushing the robot in a straight line down the field gives you a clean,
correctly-signed \`x\`/\`y\`/\`heading\` reading.

## Stage 2: Track width

Measure the distance between your left and right wheel contact patches, in inches, and
set it as the \`trackWidthIn\` argument to \`NeuronDrive\`'s constructor. This isn't something
you "tune" by feel; use a tape measure. Getting it wrong makes the spline follower turn
too sharply or too lazily relative to how fast it thinks it's turning.

## Stage 3: Point-holding PID

This is \`NeuronDrive.goToPoint()\`: driving straight to and holding a single point, no
spline. Use \`NeuronSplineAuto.java\`'s \`goToPoint\` call (or write your own quick test
OpMode) to send the robot a few feet away and watch it arrive.

Tune in this order, one axis at a time if possible (command a pure forward move, then a
pure strafe, then a pure turn-in-place):

1. **\`forwardP\` / \`strafeP\` / \`hP\`**: raise until the robot approaches its target
   promptly without a large overshoot. Too low: crawls in slowly or stalls short. Too
   high: overshoots and/or oscillates visibly around the target.
2. **\`forwardD\` / \`strafeD\` / \`hD\`**: raise to damp any oscillation or overshoot left
   over from P. Too high: the robot feels "stiff" or twitchy, especially over small
   corrections.
3. **\`forwardI\` / \`strafeI\` / \`hI\`**: leave at \`0\` unless the robot consistently settles
   just short of the target and stays there (steady-state error). If so, add a *small*
   amount of I. Too much causes slow oscillation ("wind-up"); if you see that, you went
   too far.

All six gains, plus the three I-terms, are \`public static\` fields on \`NeuronDrive\`:
tune them live with FTC Dashboard, or edit the defaults directly in
\`NeuronDrive.java\` and redeploy.

Also check \`pointToleranceIn\` / \`headingToleranceDeg\` (how close counts as "arrived") and
the tighter \`closePointToleranceIn\` / \`closeHeadingToleranceDeg\` (final settle). Loosen
these if the robot is spending too much match time "settling"; tighten them if your
autos need to be more precise than the defaults (5 in / 5°, then 2 in / 2°).

## Stage 4: Spline follower

Now test \`drive.splineToPoint()\` / \`drive.followSpline()\`: actual curved paths, not just
point-to-point. Plan a path in the **[Neuron Path Planner](/neuron-pathing/planner)**,
paste the generated code into \`NeuronSplineAuto.java\` (or your own OpMode), and run it.

Three tunables control this, all \`public static\` on \`NeuronDrive\`:

- **\`lookaheadIn\`** (default 14): how far ahead along the path the robot aims. Too
  small: the robot hunts/oscillates trying to track a point that's almost underneath it,
  especially on tight curves. Too large: it cuts corners, drifting noticeably inside the
  curve.
- **\`centripetalGain\`** (default 0.3): corrects for the robot sliding to the outside of
  a curve. Raise it if the robot visibly drifts wide on curves; lower it if the robot
  overshoots/wobbles to the *inside* of curves or feels jerky mid-curve.
- **\`splineEndRadiusIn\`** (default 14): how close to the path's last point the robot
  switches from pure-pursuit over to the point-holding PID from Stage 3. If the robot
  hands off too early it may miss the final heading; too late and it can overshoot before
  the PID takes over.

Also double check the per-call \`factor\` argument (in \`splineToPoint\`/the planner's spline
steps): it shapes how aggressively the curve pulls toward each waypoint's heading tangent.
\`1.0\` is a reasonable default; raise it for wider, gentler curves between waypoints that
are far apart or at sharp angles.

## Stage 5: Validate

Before trusting any of this in a match:

1. Re-run **Neuron Localizer Test** and confirm the sign conventions from Stage 1 still
   hold (a loose pod mount can silently break this after Stage 2-4 changes).
2. Run a full autonomous end to end, starting from your actual match starting position,
   at least 3 times in a row without touching the code; one clean run proves nothing.
3. If something drifts over a long path but Stage 1-4 all checked out individually, it's
   almost always the Pinpoint offsets (Stage 1) being slightly off, not the follower gains;
   small heading errors compound a lot over a long path.

If you're stuck, see **[Troubleshooting](/neuron-pathing/docs/troubleshooting)**.
`},{slug:`subsystems`,title:`Subsystems & Public Methods`,markdown:`Neuron Pathing only knows about driving and following paths. Everything else on your
robot (an intake, a shooter, an arm, a claw) is a **subsystem**: a small class that
owns one mechanism's hardware, and a handful of methods you call from your OpModes. This
page is the pattern for writing those, and for calling their public methods directly from
both TeleOp and Autonomous alongside \`NeuronDrive\`.

This repo doesn't use a command-scheduler framework (like FTCLib's \`CommandScheduler\`);
you just call a subsystem's public methods directly, in whatever order your OpMode needs.
That's simpler to reason about for a first robot, and it's exactly the pattern
\`NeuronDrive\` itself already follows. If your robot grows complex enough that manual
sequencing gets unwieldy, a command-scheduler library is a reasonable next step, but
start here.

## Writing a subsystem

See \`TeamCode/.../subsystems/ExampleClaw.java\` for a working copy of this shape:

\`\`\`java
public class ExampleClaw {
    public enum State { OPEN, CLOSED }

    private final Servo servo;
    public State state = State.CLOSED;

    public ExampleClaw(HardwareMap hwMap, String servoName) {
        servo = hwMap.get(Servo.class, servoName);
        close();
    }

    public void open()  { servo.setPosition(OPEN_POS);  state = State.OPEN; }
    public void close() { servo.setPosition(CLOSED_POS); state = State.CLOSED; }
    public void toggle() { if (state == State.OPEN) close(); else open(); }

    public void update() { /* PID, timed sequence, telemetry (see below) */ }
}
\`\`\`

The rules that make this pattern work:

- **The subsystem owns its hardware.** Only \`ExampleClaw\` ever calls
  \`hardwareMap.get(Servo.class, ...)\` for that servo. Nothing else reaches in and touches
  it directly. If you need a new capability, add a method, don't bypass the class.
- **Public methods are what your OpModes call.** Name them as verbs (\`open()\`, \`shoot()\`,
  \`setPosition(...)\`). Keep them non-blocking where possible (set a target/state and
  return immediately) so they don't stall your main loop.
- **\`update()\` is for anything that has to happen every loop cycle**, even when nothing
  just changed: running a PID toward a target position, advancing a timed sequence,
  reporting telemetry. A one-servo claw doesn't need real work here, but a motor-driven
  arm holding position against gravity does. Call every subsystem's \`update()\` once per
  loop, right alongside \`drive.update()\`.

## Using subsystems in TeleOp

Construct every subsystem once, before \`waitForStart()\`, next to \`drive\`/\`localizer\`.
Then in the loop: read gamepad buttons, call the matching subsystem method, and call
\`update()\` on everything. See \`NeuronTeleOp.java\`:

\`\`\`java
NeuronDrive drive = new NeuronDrive(hardwareMap, localizer, trackWidthIn);
ExampleClaw claw = new ExampleClaw(hardwareMap);

waitForStart();
while (opModeIsActive()) {
    drive.drive(gamepad1);
    drive.update();

    if (gamepad1.aWasPressed()) claw.toggle();   // edge-detected: fires once per press
    claw.update();

    telemetry.addData("claw", claw.state);
    telemetry.update();
}
\`\`\`

Use \`*WasPressed()\` (e.g. \`gamepad1.aWasPressed()\`) for anything that should fire once per
button press, not once per loop iteration for the whole time it's held down.

## Using subsystems in Autonomous

Subsystem calls just sit in the same sequence as your drive calls, in whatever order the
auto needs. The only wrinkle: a move like \`drive.splineToPoint(...)\` doesn't block, so
follow it with \`driveToTarget()\` (or call \`claw.update()\` inside your own wait loop) so
subsystems that need per-loop updates keep running while the robot drives. See
\`NeuronSplineAuto.java\`:

\`\`\`java
drive.splineToPoint(new Pose2D(24, 24, Math.toRadians(90)), false, false, 1, 0.8);
driveToTarget();          // blocks until the move finishes, still calling claw.update()

claw.open();
waitMs(300);              // a dwell, also still calling claw.update()

drive.goToPoint(new Pose2D(24, 0, 0), false, 0.6);
driveToTarget();

claw.close();
\`\`\`

\`driveToTarget()\` and \`waitMs()\` are small private helper methods defined at the bottom of
the OpMode (loop calling \`drive.update()\`/\`claw.update()\` until the move finishes or the
timer's up). This is exactly what the Neuron Path Planner's "Full OpMode" output
generates for you automatically. If you're pasting planner output into your own OpMode,
copy these two helpers over once and every generated auto will compile against them.
`},{slug:`troubleshooting`,title:`Troubleshooting`,markdown:`Symptoms, in the order you're likely to hit them.

## Build / setup

**Gradle sync fails on a fresh clone.**
Make sure you're on Android Studio Narwhal 3 Feature Drop or later (older versions fail to sync, and may offer to downgrade the Android Gradle Plugin; don't accept), and that you opened the
repo's root folder (the one with \`settings.gradle\` in it), not the \`TeamCode\` or
\`FtcRobotController\` subfolder directly.

**Can't find \`GoBildaPinpointDriver\`.**
It ships inside the FTC SDK's \`Hardware\` module, which \`build.dependencies.gradle\`
already includes -- if this still fails, you likely edited that file or are on a much
older SDK version. No separate Pinpoint dependency should be needed.

## Robot won't drive / drives the wrong way

**Robot does nothing when a goToPoint/splineToPoint runs.**
\`NeuronDrive.update()\` has to be called every loop for anything to move -- check your
OpMode has a loop calling \`drive.update()\` (see \`driveToTarget()\` in the generated/example
code). A one-shot call to \`goToPoint()\` by itself does nothing.

**Robot drives away from the target instead of toward it, or spins the wrong way.**
This is almost always Stage 1 of tuning (localizer sign conventions), not the drive
math -- see [Tuning](/neuron-pathing/docs/tuning#stage-1-localizer-sign-conventions). Fix the localizer,
don't try to compensate by negating things in \`NeuronDrive\`.

**Robot strafes when it should drive straight, or vice versa.**
Motor directions/wiring, not software. Confirm all four drive motors are wired and
configured with the standard mecanum roller orientation, and that \`frontLeft\`/\`backLeft\`
are the two reversed motors (the constructor already reverses them, assuming standard
goBILDA/REV wiring; if yours differs, adjust the direction calls in \`NeuronDrive\`'s
constructor).

## Path following

**Robot oscillates / wiggles along a straight spline segment.**
Lower \`lookaheadIn\` slightly first; if that doesn't help, your point-holding PID gains
(Stage 3) may be too aggressive and bleeding into the spline follower's cross-track
correction. Re-check Stage 3 before touching spline tunables.

**Robot cuts corners / drifts to the inside of curves.**
Raise \`centripetalGain\`, or increase \`lookaheadIn\` slightly.

**Robot overshoots past the end of a path, or the final heading is off.**
\`splineEndRadiusIn\` is handing off to the point-holding PID too late (or too early),
see Stage 4. Also confirm the path's final waypoint has the heading you actually want;
\`Pose2D\`'s \`h\` is in radians, and a common mistake is passing degrees by accident.

**Everything is fine at slow speed but falls apart at higher \`maxSpeed\`.**
Centripetal/cross-track correction needs to work harder at speed.
Re-tune Stage 3/4 at the actual speed you intend to run in a match, not at a conservative
test speed.

## Path Planner-specific

**Generated code references \`robot.something\` and won't compile.**
The shooter-pipeline actions (shoot/farShoot/intake/gate/turret) intentionally generate
calls into *your season's* \`Robot\`/\`Turret\`/\`Gate\`/\`Intake\`/\`Shooter\` classes, not the
pathing library. They're meant for your real season repo, not a bare Neuron Pathing
checkout. Either add those classes, or don't use those actions (movement-only autos
compile fine against just \`NeuronDrive\`/\`NeuronLocalizer\`).

**Importing an existing OpMode back into the planner finds "No autos found."**
The importer looks for \`public class X extends LinearOpMode\` plus a \`case N: method();\`
switch structure matching what the planner itself generates in "Full OpMode" mode. Autos
written by hand in a different structure won't parse, but any unrecognized line is kept
as a raw custom line if it appears *inside* a method the importer does recognize.

**The field background/video overlay doesn't line up with real match footage.**
Use the rotate/flip controls on the field image, and the perspective/scale/offset sliders
under the video overlay. These are separate from the path's actual coordinates and only
affect what you see while planning, not the generated code.
`}],m=e=>`/neuron-pathing/docs/${e}`,h=c();function g(e){return typeof e==`string`||typeof e==`number`?String(e):Array.isArray(e)?e.map(g).join(``):e&&typeof e==`object`&&`props`in e?g(e.props.children):``}var _=e=>e.toLowerCase().replace(/[^a-z0-9\s-]/g,``).trim().replace(/[\s-]+/g,`-`),v={h2:({children:e})=>(0,h.jsx)(`h2`,{id:_(g(e)),children:e}),h3:({children:e})=>(0,h.jsx)(`h3`,{id:_(g(e)),children:e}),a:({href:e=``,children:t})=>e.startsWith(`/`)?(0,h.jsx)(i,{to:e,children:t}):(0,h.jsx)(`a`,{href:e,target:`_blank`,rel:`noreferrer`,children:t}),blockquote:({children:e})=>(0,h.jsx)(`div`,{className:`np-tip`,children:e})};function y(){let{slug:n=``}=a(),{hash:r}=t(),s=p.findIndex(e=>e.slug===n),c=p[s];if((0,f.useEffect)(()=>{c&&(document.title=`${c.title}: Neuron Pathing`)},[c]),(0,f.useEffect)(()=>{let e=r&&document.getElementById(decodeURIComponent(r.slice(1)));e?e.scrollIntoView():window.scrollTo(0,0)},[n,r]),n.endsWith(`.html`))return(0,h.jsx)(e,{to:m(n.replace(/\.html$/,``))+r,replace:!0});if(!c)return(0,h.jsx)(e,{to:`/neuron-pathing`,replace:!0});let l=p[s-1],d=p[s+1];return(0,h.jsx)(`div`,{className:`np-site`,children:(0,h.jsxs)(`div`,{className:`np-docs-wrap`,children:[(0,h.jsxs)(`div`,{className:`np-docs-topbar`,children:[(0,h.jsx)(i,{className:`np-home`,to:`/neuron-pathing`,children:`← Neuron Pathing`}),(0,h.jsx)(`h1`,{children:c.title})]}),(0,h.jsx)(`div`,{className:`np-doc`,children:(0,h.jsx)(o,{remarkPlugins:[u],components:v,children:c.markdown})}),(0,h.jsxs)(`div`,{className:`np-nextprev`,children:[l?(0,h.jsxs)(i,{to:m(l.slug),children:[`← `,l.title]}):(0,h.jsx)(`span`,{}),d?(0,h.jsxs)(i,{to:m(d.slug),children:[d.title,` →`]}):(0,h.jsx)(`span`,{})]}),(0,h.jsx)(`footer`,{children:`Neuron Pathing & Neuron Path Planner — FTC Team 10298, Brain Stormz.`})]})})}var b=[{slug:`installation`,title:`Installation`,blurb:`Clone the repo, wire up your Pinpoint and drive motors, and construct the library in your OpMode.`},{slug:`tuning`,title:`Tuning`,blurb:`A step-by-step order of operations: localizer sign conventions, PID gains, then the spline follower.`},{slug:`subsystems`,title:`Subsystems & Public Methods`,blurb:`Add your own mechanisms (intake, arm, shooter...) alongside NeuronDrive, and call them from both TeleOp and Autonomous.`},{slug:`troubleshooting`,title:`Troubleshooting`,blurb:`Robot driving the wrong way, oscillating, cutting corners? Look here before you start changing gains at random.`}],x=`NeuronLocalizer localizer = new NeuronLocalizer(hardwareMap, telemetry, xOffsetMm, yOffsetMm);
NeuronDrive drive = new NeuronDrive(hardwareMap, localizer, trackWidthIn);
localizer.setPosition(new Pose2D(0, 0, 0));
localizer.calibrate(true);

waitForStart();

drive.splineToPoint(new Pose2D(24, 24, Math.toRadians(90)), false, false, 1, 0.8);
while (opModeIsActive() && drive.isBusy()) {
    drive.update();   // NeuronDrive only moves while this is being called
}`;function S(){return(0,f.useEffect)(()=>{document.title=`Neuron Pathing: Quickstart`},[]),(0,h.jsx)(`div`,{className:`np-site`,children:(0,h.jsxs)(`div`,{className:`np-home-wrap`,children:[(0,h.jsxs)(`div`,{className:`np-hero`,children:[(0,h.jsx)(`div`,{className:`np-eyebrow`,children:`FTC Team 10298 · Brain Stormz`}),(0,h.jsx)(`h1`,{children:`Neuron Pathing`}),(0,h.jsx)(`p`,{className:`np-tag`,children:`A custom autonomous path-following library for FTC, plus a browser-based visual tool for drawing a path on the field and generating the Java to drive it.`}),(0,h.jsxs)(`p`,{className:`np-credit`,children:[`This quickstart is built on the`,` `,(0,h.jsx)(`a`,{href:`https://github.com/FIRST-Tech-Challenge/FtcRobotController`,children:`official SDK`}),`.`]})]}),(0,h.jsxs)(`div`,{className:`np-cards`,children:[(0,h.jsxs)(i,{className:`np-home-card np-card-primary`,to:`/neuron-pathing/planner`,children:[(0,h.jsx)(`h2`,{children:`Open the Neuron Path Planner`}),(0,h.jsx)(`p`,{children:`Draw a path on the field, tune it visually, and copy the generated Java straight into an OpMode. Start here: no setup required, it just runs in your browser.`}),(0,h.jsx)(`span`,{className:`np-go`,children:`Launch the planner →`})]}),b.map(e=>(0,h.jsxs)(i,{className:`np-home-card`,to:m(e.slug),children:[(0,h.jsx)(`h2`,{children:e.title}),(0,h.jsx)(`p`,{children:e.blurb}),(0,h.jsx)(`span`,{className:`np-go`,children:`Read the guide →`})]},e.slug))]}),(0,h.jsxs)(`div`,{className:`np-section`,children:[(0,h.jsx)(`h2`,{children:`Get started in 3 steps`}),(0,h.jsxs)(`div`,{className:`np-steps-row`,children:[(0,h.jsxs)(`div`,{className:`np-step-card`,children:[(0,h.jsx)(`div`,{className:`np-num`,children:`1`}),(0,h.jsx)(`h3`,{children:`Clone & open`}),(0,h.jsx)(`p`,{children:`Clone this repo and open the root folder in Android Studio. Build once to confirm everything syncs cleanly.`})]}),(0,h.jsxs)(`div`,{className:`np-step-card`,children:[(0,h.jsx)(`div`,{className:`np-num`,children:`2`}),(0,h.jsx)(`h3`,{children:`Configure & tune`}),(0,h.jsxs)(`p`,{children:[`Set your Pinpoint offsets and track width, then work through`,` `,(0,h.jsx)(i,{to:m(`tuning`),children:`Tuning`}),` in order: localizer first, PID second, spline follower last.`]})]}),(0,h.jsxs)(`div`,{className:`np-step-card`,children:[(0,h.jsx)(`div`,{className:`np-num`,children:`3`}),(0,h.jsx)(`h3`,{children:`Plan a path`}),(0,h.jsxs)(`p`,{children:[`Open the `,(0,h.jsx)(i,{to:`/neuron-pathing/planner`,children:`Neuron Path Planner`}),`, draw your auto, and paste the generated code into an OpMode like`,` `,(0,h.jsx)(`code`,{children:`NeuronSplineAuto.java`}),`.`]})]})]})]}),(0,h.jsxs)(`div`,{className:`np-section`,children:[(0,h.jsx)(`h2`,{children:`What's in this repo`}),(0,h.jsxs)(`div`,{className:`np-filetree`,children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`span`,{className:`np-hi`,children:`TeamCode/.../neuronpathing/`}),` `,(0,h.jsx)(`span`,{className:`np-f`,children:`: the library itself: Pose2D, Spline, NeuronLocalizer, NeuronDrive`})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`span`,{className:`np-hi`,children:`TeamCode/.../opmodes/`}),` `,(0,h.jsx)(`span`,{className:`np-f`,children:`: NeuronTeleOp, NeuronSplineAuto, NeuronLocalizerTest example OpModes`})]})]})]}),(0,h.jsxs)(`div`,{className:`np-section`,children:[(0,h.jsx)(`h2`,{children:`The shape of the code`}),(0,h.jsx)(`p`,{className:`np-lede`,children:`This is what the planner generates, and what every example OpMode follows:`}),(0,h.jsx)(`pre`,{children:(0,h.jsx)(`code`,{children:x})})]}),(0,h.jsx)(`footer`,{children:`Neuron Pathing & Neuron Path Planner, by FTC Team 10298, Brain Stormz.`})]})})}var C=(0,f.lazy)(()=>d(()=>import(`./PathPlanner-CT734Bbv.js`),__vite__mapDeps([0,1,2,3])));function w(){return(0,h.jsxs)(l,{children:[(0,h.jsx)(s,{index:!0,element:(0,h.jsx)(S,{})}),(0,h.jsx)(s,{path:`planner`,element:(0,h.jsx)(f.Suspense,{fallback:null,children:(0,h.jsx)(C,{})})}),(0,h.jsx)(s,{path:`docs/:slug`,element:(0,h.jsx)(y,{})}),(0,h.jsx)(s,{path:`index.html`,element:(0,h.jsx)(e,{to:`/neuron-pathing`,replace:!0})}),(0,h.jsx)(s,{path:`tools/neuron-path-planner.html`,element:(0,h.jsx)(e,{to:`/neuron-pathing/planner`,replace:!0})}),(0,h.jsx)(s,{path:`*`,element:(0,h.jsx)(e,{to:`/neuron-pathing`,replace:!0})})]})}export{w as default};