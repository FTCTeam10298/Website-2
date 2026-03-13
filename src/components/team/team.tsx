import { useState } from 'react'
import './team.css'

const team1 = [
    {
        name: "Hansen Chen", 
        age: 16,
        grade: "Junior @ FTHS Technology High",
        role: "Hardware / Drive",
        hobbies: "Valorant, Anime, and Golf",
        food: "Sushi",
        photo: "/team_assets/hansen.png"
    },
    {
        name: "Albert Ruan", 
        age: 16,
        grade: "Junior @ Oak Park High",
        role: "Hardware / Drive",
        hobbies: "Marvel Rivals, Eating, and Manwha",
        food: "Everything",
        photo: "/team_assets/albert.png"
    },
    {
        name: "Aaden Scalise",
        age: 17,
        grade: "Senior @ Trinity Pacific Christian",
        role: "Hardware / Drive",
        hobbies: "Racing, robotics, mock trial",
        food: "Chicken Picatta",
        photo: "/team_assets/aaden.png"
    },
    {
        name: "John Bryson",
        age: 17,
        grade: "Senior @ Trinity Pacific Christian",
        role: "Hardware",
        hobbies: "Touching grass",
        food: "None",
        photo: "/team_assets/john.png",
     },
     
    {
        name: "Kevin Fei", 
        age: 17,
        grade: "Junior @ Westlake High School",
        role: "Software / Drive",
        hobbies: "Coding",
        food: "Pho",
        photo: "/team_assets/kevin.png"
    },  
    {
        name: "Boyi Zheng", 
        age: 14,
        grade: "Freshman @ Oaks Christian High School",
        role: "Hardware / Outreach",
        hobbies: "Robotics",
        food: "Everything",
        photo: "/team_assets/boyi.png"
    },  
    {
        name: "Zoe Eisenstein", 
        age: 14,
        grade: "Sophomore @ De Toledo High School",
        role: "Outreach",
        hobbies: "Dancing idk",
        food: "smth",
        photo: "/team_assets/zoe.png"
    },  
    {
        name: "Sarah Chen", 
        age: 14,
        grade: "Freshman @ Oaks Park High School",
        role: "Outreach",
        hobbies: "idk",
        food: "idk",
        photo: "/team_assets/sarah.png"
    },  
    {
        name: "Joshua dude", 
        age: 14,
        grade: "Freshman @ Indiana High School in Indiana",
        role: "Hardware",
        hobbies: "idk",
        food: "idk",
        photo: "/team_assets/joshua.png"
    },  
]
const team2 = [
{
        name: "Micah Chi",
        age: 14,
        grade: "9th Grade @ Trinity Pacific Christian",
        role: "Software",
        hobbies: "Rubiks Cube, volleyball, track/field",
        food: "Sichuan Spicy Fish Soup",
        photo: "/team_assets/micah.jpeg"
    },
    {
        name: "Ethan Xu",
        age: 14,
        grade: "8th Grade @ Medea Creek Middle School",
        role: "Hardware",
        hobbies: "Robotics, piano, volleyball",
        food: "Chicken",
        photo: "/team_assets/ethan.png"
    }, 
    {
        name: "Gavven Scalise",
        age: 14,
        grade: "8th Grade @ Trinity Pacific Christian",
        role: "Hardware",
        hobbies: "Racecars",
        food: "Melasenessa, chimichurri",
        photo: "/team_assets/gavven.png",
     },  
     {
        name: "Connor idk",
        age: 14,
        grade: "8th Grade @ Trinity Pacific Christian",
        role: "Hardware",
        hobbies: "Racecars",
        food: "Melasenessa, chimichurri",
        photo: "/team_assets/connor.png",
     },  
      {
        name: "Lior Belkin",
        age: 15,
        grade: "th Grade @ VAAS",
        role: "Hardware",
        hobbies: "Swearing cuz he thinks its cool",
        food: "Melasenessa, chimichurri",
        photo: "/team_assets/lior.png",
     },  
]

const mentors = [
    {
        name: "Sung Choi", 
        role: "Big Boss",
        hobbies: "Aura Farming",
        food: "Korean Food",
        photo: "/team_assets/sung.jpeg"
    },
    {
        name: "Telly Chi", 
        role: "Big Boss",
        hobbies: "Going around and fixing things",
        food: "Tofu",
        photo: "/team_assets/telly.png"
    },
    {
        name: "Stu Penrose", 
        role: "Big Boss",
        hobbies: "Guitar",
        food: "N/A",
        photo: "/team_assets/stu.png"
    },
    {
        name: "Garret Smalley", 
        role: "Hardware",
        hobbies: "Robot",
        food: "None",
        photo: "/team_assets/garret.png"
    },
    {
        name: "Jacob Newman", 
        role: "BIG BOSS / Software / Hardware",
        aura: "MultiTalented",
        hobbies: "Robots",
        food: "Coca Cola",
        photo: "/team_assets/jacob.png"
    },
    {
        name: "Alon Belkin", 
        role: "Hardware",
        hobbies: "Battle Bots",
        food: "Shwarma",
        photo: "/team_assets/alon.png"
    },
    {
        name: "Teague Shepard", 
        role: "Hardware",
        hobbies: "Mogging",
        food: "In-n-out",
        photo: "/team_assets/teague.png"
    },
    {
        name: "James Gasich", 
        role: "Hardware",
        hobbies: "N/A",
        food: "N/A",
        photo: "/team_assets/jg.png"
    },
    {
        name: "James Penrose", 
        role: "Hardware / Software",
        hobbies: "N/A",
        food: "N/A",
        photo: "/team_assets/james.png"
    },
]

const alumni = [
    {
        name: "AJ", 
        numYears: ["Skystone"],
        photo: "/team_assets/AJ.JPG",
        role: "Alumni"
    },
    {
        name: "Ben", 
        numYears: ["Skystone"],
        photo: "/team_assets/Ben.jpg",
        role: "Alumni"
    },
    {
        name: "Brody", 
        numYears: ["Freight Frenzy", "Power Play", "Centerstage"],
        photo: "/team_assets/Brody.png",
        role: "Alumni"
    },
    {
        name: "Daniel", 
        numYears: ["Res-Q", "Velocity Vortex", "Relic Recovery"],
        photo: "/team_assets/Daniel.JPG",
        role: "Alumni"
    },
    {
        name: "David", 
        numYears: ["Velocity Vortex", "Relic Recovery"],
        photo: "/team_assets/David.jpg",
        role: "Alumni"
    },
    {
        name: "Destin", 
        numYears: ["Skystone"],
        photo: "/team_assets/Destin.JPG",
        role: "Alumni"
    },
    {
        name: "Gabe", 
        numYears: ["Ultimate Goal", "Freight Frenzy", "Power Play", "Centerstage"],
        photo: "/team_assets/Gabe.jpeg",
        role: "Alumni"
    },
    {
        name: "Hunter", 
        numYears: ["Ultimate Goal", "Freight Frenzy"],
        photo: "/team_assets/Hunter.jpeg",
        role: "Alumni"
    },
    {
        name: "Ian", 
        numYears: ["Rover Ruckus"],
        photo: "/team_assets/Ian.JPG",
        role: "Alumni"
    },
    {
        name: "Jacob", 
        numYears: ["Velocity Vortex", "Relic Recovery", "Rover Ruckus"],
        photo: "/team_assets/Jacob.JPG",
        role: "Alumni"
    },
    {
        name: "James", 
        numYears: ["Skystone", "Ultimate Goal", "Freight Frenzy", "Power Play", "Centerstage"],
        photo: "/team_assets/James.jpeg",
        role: "Alumni"
    },
    {
        name: "JG", 
        numYears: ["Centerstage"],
        photo: "/team_assets/JG.JPG",
        role: "Alumni"
    },
    {
        name: "Joshua", 
        numYears: ["Velocity Vortex", "Relic Recovery"],
        photo: "/team_assets/Joshua.jpg",
        role: "Alumni"
    },
    {
        name: "Kimberly", 
        numYears: ["Velocity Vortex", "Relic Recovery"],
        photo: "/team_assets/Kimberly.JPG",
        role: "Alumni"
    },
    {
        name: "Luke", 
        numYears: ["Ultimate Goal", "Frieght Frenzy"],
        photo: "/team_assets/Luke.jpeg",
        role: "Alumni"
    },
    {
        name: "Nathan C.", 
        numYears: ["Res-Q", "Velocity Vortex", "Relic Recovery", "Rover Ruckus", "Skystone"],
        photo: "/team_assets/Nathan C.JPG",
        role: "Alumni"
    },
    {
        name: "Noah", 
        numYears: ["Res-Q", "Velocity Vortex", "Relic Recovery", "Rover Ruckus", "Skystone"],
        photo: "/team_assets/Noah.JPG",
        role: "Alumni"
    },
    {
        name: "Olivia C.", 
        numYears: ["Relic Recovery"],
        photo: "/team_assets/Olivac.jpeg",
        role: "Alumni"
    },
    {
        name: "Olivia O.", 
        numYears: ["Rover Ruckus"],
        photo: "/team_assets/Livo.png",
        role: "Alumni"
    },
    {
        name: "Patrick", 
        numYears: ["Ulitmate Goal", "Freight Frenzy", "Power Play"],
        photo: "/team_assets/Patrick.jpeg",
        role: "Alumni"
    },
    {
        name: "Peter", 
        numYears: ["Ulitmate Goal", "Frieght Frenzy", "Power Play", "Centerstage"],
        photo: "/team_assets/Peter.jpeg",
        role: "Alumni"
    },
    {
        name: "Skyler", 
        numYears: ["Res-Q"],
        photo: "/team_assets/Skyler.jpg",
        role: "Alumni"
    },
    {
        name: "Stephanie", 
        numYears: ["Rover Ruckus"],
        photo: "/team_assets/Stephanie.JPG",
        role: "Alumni"
    },
    {
        name: "TC", 
        numYears: ["Centerstage"],
        photo: "/team_assets/TC.JPG",
        role: "Alumni"
    },
    {
        name: "Teague", 
        numYears: ["Ultimate Goal", "Freight Frenzy", "Power Play", "Centerstage"],
        photo: "/team_assets/Teague.JPG",
        role: "Alumni"
    },
    {
        name: "TJ", 
        numYears: ["Ultimate Goal", "Freight Frenzy", "Power Play", "Centerstage"],
        photo: "/team_assets/TJ.JPG",
        role: "Alumni"
    },
    {
        name: "Tobey", 
        numYears: ["Power Play", "Centerstage"],
        photo: "/team_assets/Tobey.JPG",
        role: "Alumni"
    },
]



function Team() {
    const [activeTeam, setActiveTeam] = useState('team1')

    const currentTeam = activeTeam === 'team1' ? team1 : team2

    return (
        <div className="team-content">
            <h2 className='toppage title'>Team</h2>
            <div className="team-toggle">
                <div
                    className={activeTeam === 'team1' ? 'toggle-btn active team1' : 'toggle-btn'}
                    onClick={() => setActiveTeam('team1')}
                >
                    Team 1
                </div>
                <div
                    className={activeTeam === 'team2' ? 'toggle-btn active team2' : 'toggle-btn'}
                    onClick={() => setActiveTeam('team2')}
                >
                    Team 2
                </div>
            </div>

            <div className='team-list'>
                {currentTeam.map((member) => (
                    <div key={member.name} className="team-card">
                        <div className={`team-main-card ${member.role}`}>
                            <h2 className='team-name'>{member.name}</h2>
                            <div className='team-role'>{member.role}</div>
                            <div className='team-photo-frame'>
                                <img src={member.photo} alt={member.name} />
                            </div>
                        </div>
                        <div className='team-expand-card'>
                            <div>Age: {member.age}</div>
                            <div>School: {member.grade}</div>
                            <div>Hobbies: {member.hobbies}</div>
                            <div>Favorite Food: {member.food}</div>
                        </div>
                    </div>
                ))}
            </div>
            <h2 className='title'>Coaches & Mentors</h2>
            

            <div className='team-list'>

            {mentors.map((member) => (
                <div key={member.name} className="team-card">
                    <div className={`team-main-card ${member.role}`}>
                        <h2 className='team-name'>
                            {member.name}
                        </h2>
                        <div className='team-role'>{member.role}</div>
                        <div className='team-photo-frame'>
                            <img src={member.photo}/>
                        </div>
                    </div>
                    <div className='team-expand-card'>
                        <div>
                            Hobbies: {member.hobbies}
                        </div>
                        <div>
                            Favorite Food: {member.food}
                        </div>
                    </div>
                </div>
            ))}
            
            </div>
            <h2 className='title'> Alumni </h2>
            <div className='team-list'>
            {alumni.map((member) => (
                <div key={member.name} className="team-card alumni">
                    <div className={`team-main-card ${member.role}`}>
                        <h2 className='team-name'>
                            {member.name}
                        </h2>
                    
                        <div className='team-photo-frame'>
                            <img src={member.photo}/>
                        </div>
                    </div>
                    <div className='team-expand-card'>
                        <div>
                            {member.numYears.map((season, index) => (
                                <div key={index}>{season}</div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
            </div>
            
        </div>
    )
}

export default Team;