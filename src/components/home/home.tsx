import './home.css';

function Home() {
    return (
        <div className="welcome">
            <div className="welcome-inner">
                <div className="text">
                    <span className="tag">FTC Team 10298</span>
                    <h2>HI! WE'RE <span>BRAIN STORMZ.</span></h2>
                    <p>Brain Stormz is a private, non-profit robotics team competing in FIRST Tech Challenge (FTC).</p>
                    <div className="hero-btns">
                        <a className="btn btn-primary" href="/team">Meet the Team</a>
                        <a className="btn btn-ghost" href="/about">Learn More</a>
                    </div>
                </div>
                <div className="photo-frame">
                    <img src="/home_assets/brainstormzteam.png" alt="Brain Stormz team"/>
                </div>
            </div>
        </div>
    );
}

export default Home;