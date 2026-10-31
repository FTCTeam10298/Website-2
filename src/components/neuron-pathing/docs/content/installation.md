## Requirements

- An omnidirectional drivetrain (mecanum or X-drive). NeuronDrive's mecanum math assumes
  four independently-driven wheels named `frontLeft`, `frontRight`, `backLeft`, `backRight`
  in your robot configuration (or pass your own names to the `NeuronDrive` constructor).
- A [goBILDA Pinpoint](https://www.gobilda.com/pinpoint-odometry-computer/) odometry
  computer, wired per goBILDA's instructions, named `pinpoint` in your robot configuration
  (or pass your own device name to `NeuronLocalizer`).
- Android Studio (Narwhal 3 Feature Drop or later). Neuron Pathing is a plain Java library, so it
  does not work from Blocks or OnBot Java.

The Pinpoint driver ships inside the stock FTC SDK itself, so this quickstart needs **no
extra Gradle dependencies** beyond what `FtcRobotController` already provides.

## Get the code

Open Android Studio, then download the SDK and clone the quickstart repository.

1. Open Android Studio. If you have another project open, close it with **File → Close Project**. Make sure **Projects** is selected in the sidebar.

   ![Android Studio welcome screen](https://raw.githubusercontent.com/gamemanual0/gm0/1ef047ce037c1e5b7cf9910bdda4612cee58ec40/source/docs/software/getting-started/images/using-android-studio/as-welcome.png)

2. Click the gear icon in the bottom-left corner, then select **Check for Updates**. If you do not have the latest version, download the updates.

3. Select **Get from VCS**. Make sure **Repository URL** is selected in the sidebar, then paste the repository URL into the field:

   ```
   https://github.com/FTCTeam10298/Neuron-Pathing-Quickstart.git
   ```

   > 💡 Consider also changing the name of the final folder in the Directory textbox from `Neuron-Pathing-Quickstart` to something that reflects your team and the season, e.g. team number 99999 might use `99999-2026-27-code`.

   ![Get from VCS dialog in Android Studio](https://raw.githubusercontent.com/gamemanual0/gm0/1ef047ce037c1e5b7cf9910bdda4612cee58ec40/source/docs/software/getting-started/images/using-android-studio/as-get-from-vcs.png)

4. When Android Studio asks if you want to trust and open the project, choose **Trust Project**.

   ![Trust project dialog in Android Studio](https://raw.githubusercontent.com/gamemanual0/gm0/1ef047ce037c1e5b7cf9910bdda4612cee58ec40/source/docs/software/getting-started/images/using-android-studio/as-trust-project-dialog.png)

5. Select the hammer icon in the top-right corner of the window. This will download any missing modules and build the project.

   ![Build project icon in Android Studio](https://raw.githubusercontent.com/gamemanual0/gm0/1ef047ce037c1e5b7cf9910bdda4612cee58ec40/source/docs/software/getting-started/images/using-android-studio/as-make-module.png)

6. Wait for Gradle to finish. This indicator is usually located at the bottom of the window by default.

   ![Gradle build in progress](https://raw.githubusercontent.com/gamemanual0/gm0/1ef047ce037c1e5b7cf9910bdda4612cee58ec40/source/docs/software/getting-started/images/using-android-studio/build-gradle.png)

## Where everything lives

```
TeamCode/.../neuronpathing/   the library: Pose2D, Spline, NeuronLocalizer, NeuronDrive, ...
TeamCode/.../opmodes/         example OpModes built on the library
```

## Wire up your robot

1. In the Driver Station / Driver Hub, create a robot configuration with:
   - Four `DcMotorEx` entries named `frontLeft`, `frontRight`, `backLeft`, `backRight`
     (or your own names; see below).
   - A goBILDA Pinpoint entry named `pinpoint` (I2C).
2. Measure your Pinpoint's offset from the robot's center of rotation, in millimeters
   (X = forward/back offset, Y = left/right offset; see goBILDA's docs for sign
   conventions). You'll need these numbers next.
3. In your OpMode, construct the library:

   ```java
   NeuronLocalizer localizer = new NeuronLocalizer(hardwareMap, telemetry,
                               /*xOffsetMm=*/ -78.74, /*yOffsetMm=*/ -184.15);
   NeuronDrive drive = new NeuronDrive(hardwareMap, localizer, /*trackWidthIn=*/ 14);
   ```

   `trackWidthIn` is the distance between your left and right wheel contact points, in
   inches; measure your actual robot, don't guess.

   If your hardware config uses different motor names than the default four, use the
   longer constructor instead:

   ```java
   NeuronDrive drive = new NeuronDrive(hardwareMap, localizer, trackWidthIn,
                       "myFrontLeft", "myFrontRight", "myBackLeft", "myBackRight");
   ```
4. Before trusting any pose data, calibrate once (blocks briefly, ~1s):

   ```java
   localizer.setPosition(new Pose2D(0, 0, 0)); // wherever your robot actually starts
   localizer.calibrate(true);
   ```
5. Call `drive.update()` every loop. That's it: `drive.pose` now tracks the robot's
   field position, and `drive.goToPoint()` / `drive.splineToPoint()` will drive there.

None of this will behave correctly yet on a fresh robot: the offsets, motor directions,
and PID gains above are all starting points. Follow **[Tuning](/neuron-pathing/docs/tuning)** next before
trusting any of it in a match.
