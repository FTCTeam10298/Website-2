import './about.css'

function About() {
    return (
        <div className="content about">
            <h2 className='toppage title'>
                About Us
            </h2>
            <div className='info-container'>
            <div className='about'>
            
                <h3 className='subtitle'>Who are we?</h3>
                <p>
                Brain Stormz is a private, non-profit robotics team competing in FIRST Tech Challenge (FTC). 
                </p>
            </div>
            <div className='core'>
                <h3 className='subtitle'>Core Values</h3>
                <p>
                As a team, we strive to uphold FIRST’s core values. One of the values that we place the most focus on is “Gracious Professionalism”. With Gracious Professionalism, fierce competition and mutual gain are not separate notions. We allow our competition to drive us to do our best, but never so far as to degrade others. Another core value that we embrace is cooperation. When we talk about cooperation, we are not only referring to cooperation between team members and mentors, but it must include other FTC teams and our community. In past years, the emphasis we have placed on these values has earned us many awards and, most importantly, it has taught us how to become well-rounded, gracious professionals who are excited about our futures.
                </p>
            </div>
            
            <div className='first'>
                <h3 className='subtitle'>
                    What is FIRST?
                </h3>
                <p>
                FIRST (For Inspiration and Recognition of Science and Technology) is a non-profit organization that seeks to inspire the younger generation in Science, Technology, Engineering, and Math (STEM). It accomplishes this by engaging kids in exciting, mentor-based research and robotics programs that will help them become science and technology leaders for the future. Not only does FIRST encourage participants in STEM, but it also places great emphasis on great core values such as gracious professionalism and cooperation, which foster well-rounded life and work skills. To learn more about FIRST’s mission and impact, click <a href='https://www.firstinspires.org/about'>HERE</a>
                </p> 
            </div>
            <div className='ftc'>
                <h3 className='subtitle'>
                    What is FTC?
                </h3>
                <p>
                FTC (FIRST Tech Challenge) teams are challenged to design, build, program, and operate robots to compete in a head-to-head challenge. Teams must also raise funds, design, and market their team bra nd, and do community outreach in order to earn specific awards. Participants are encouraged to bring any skills they already have, like coding, electronics, graphic design, web creation, public speaking, etc. Each season concludes with regional championship events and an exciting FIRST Championship. For more information about FIRST Tech Challenge click 
                    <a href='https://www.firstinspires.org/robotics/ftc'> HERE</a>
                </p>
            </div>
            <div className='memoriam'>
                <h3 className='subtitle'>In Memory of Noah DeVico</h3>
                <h3>
                    September 12, 2001 - October 13, 2020
                </h3>
                <img src="/about_assets/Noah.png"/>
                <p>
                    Noah DeVico inspired the hearts and minds of many young innovators. He was part of an FLL team for 2 seasons, and went on to become a founding member of Brain Stormz where he competed, mentored and served in FTC for 5 seasons. He also mentored 4 seasons of FLL students. Tragically, Noah’s life was taken in an accident, however his legacy lives on in the students he has inspired, and we can all learn from the example he gave us all. “And so we know and rely on the love God has for us. God is love. Whoever lives in love lives in God and God in them.”
                </p>
            </div>
            </div>
        </div>
            
    )
}

export default About;