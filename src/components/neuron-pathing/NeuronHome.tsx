import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { docPath } from './docs/docs';
import './neuron.css';

const GUIDES = [
  { slug: 'installation', title: 'Installation',
    blurb: 'Clone the repo, wire up your Pinpoint and drive motors, and construct the library in your OpMode.' },
  { slug: 'tuning', title: 'Tuning',
    blurb: 'A step-by-step order of operations: localizer sign conventions, PID gains, then the spline follower.' },
  { slug: 'subsystems', title: 'Subsystems & Public Methods',
    blurb: 'Add your own mechanisms (intake, arm, shooter...) alongside NeuronDrive, and call them from both TeleOp and Autonomous.' },
  { slug: 'troubleshooting', title: 'Troubleshooting',
    blurb: 'Robot driving the wrong way, oscillating, cutting corners? Look here before you start changing gains at random.' },
];

const SAMPLE = `NeuronLocalizer localizer = new NeuronLocalizer(hardwareMap, telemetry, xOffsetMm, yOffsetMm);
NeuronDrive drive = new NeuronDrive(hardwareMap, localizer, trackWidthIn);
localizer.setPosition(new Pose2D(0, 0, 0));
localizer.calibrate(true);

waitForStart();

drive.splineToPoint(new Pose2D(24, 24, Math.toRadians(90)), false, false, 1, 0.8);
while (opModeIsActive() && drive.isBusy()) {
    drive.update();   // NeuronDrive only moves while this is being called
}`;

export default function NeuronHome() {
  useEffect(() => { document.title = 'Neuron Pathing: Quickstart'; }, []);

  return (
    <div className="np-site">
      <div className="np-home-wrap">
        <div className="np-hero">
          <div className="np-eyebrow">FTC Team 10298 · Brain Stormz</div>
          <h1>Neuron Pathing</h1>
          <p className="np-tag">A custom autonomous path-following library for FTC, plus a browser-based
            visual tool for drawing a path on the field and generating the Java to drive it.</p>
          <p className="np-credit">This quickstart is built on the{' '}
            <a href="https://github.com/FIRST-Tech-Challenge/FtcRobotController">official SDK</a>.</p>
        </div>

        <div className="np-cards">
          <Link className="np-home-card np-card-primary" to="/neuron-pathing/planner">
            <h2>Open the Neuron Path Planner</h2>
            <p>Draw a path on the field, tune it visually, and copy the generated Java straight
              into an OpMode. Start here: no setup required, it just runs in your browser.</p>
            <span className="np-go">Launch the planner →</span>
          </Link>
          {GUIDES.map(g => (
            <Link key={g.slug} className="np-home-card" to={docPath(g.slug)}>
              <h2>{g.title}</h2>
              <p>{g.blurb}</p>
              <span className="np-go">Read the guide →</span>
            </Link>
          ))}
        </div>

        <div className="np-section">
          <h2>Get started in 3 steps</h2>
          <div className="np-steps-row">
            <div className="np-step-card">
              <div className="np-num">1</div>
              <h3>Clone &amp; open</h3>
              <p>Clone this repo and open the root folder in Android Studio. Build once to
                confirm everything syncs cleanly.</p>
            </div>
            <div className="np-step-card">
              <div className="np-num">2</div>
              <h3>Configure &amp; tune</h3>
              <p>Set your Pinpoint offsets and track width, then work through{' '}
                <Link to={docPath('tuning')}>Tuning</Link> in order: localizer first, PID second,
                spline follower last.</p>
            </div>
            <div className="np-step-card">
              <div className="np-num">3</div>
              <h3>Plan a path</h3>
              <p>Open the <Link to="/neuron-pathing/planner">Neuron Path Planner</Link>, draw
                your auto, and paste the generated code into an OpMode like{' '}
                <code>NeuronSplineAuto.java</code>.</p>
            </div>
          </div>
        </div>

        <div className="np-section">
          <h2>What's in this repo</h2>
          <div className="np-filetree">
            <div><span className="np-hi">TeamCode/.../neuronpathing/</span> <span className="np-f">: the library itself: Pose2D, Spline, NeuronLocalizer, NeuronDrive</span></div>
            <div><span className="np-hi">TeamCode/.../opmodes/</span> <span className="np-f">: NeuronTeleOp, NeuronSplineAuto, NeuronLocalizerTest example OpModes</span></div>
          </div>
        </div>

        <div className="np-section">
          <h2>The shape of the code</h2>
          <p className="np-lede">This is what the planner generates, and what every example OpMode follows:</p>
          <pre><code>{SAMPLE}</code></pre>
        </div>

        <footer>Neuron Pathing &amp; Neuron Path Planner, by FTC Team 10298, Brain Stormz.</footer>
      </div>
    </div>
  );
}
