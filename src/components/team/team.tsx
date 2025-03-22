import './team.css'

const team = [
    {
        name: "Hansen Chen", 
        age: 15,
        grade: "Sophomore @ FTHS Technology High",
        role: "Hardware / Drive",
        hobbies: "Valorant, Anime, and Golf",
        food: "Sushi",
        photo: "/team_assets/hansen.png"
    },
    {
        name: "Albert Ruan", 
        age: 15,
        grade: "Sophomore @ Oak Park High",
        role: "Hardware / Drive",
        hobbies: "Marvel Rivals, Eating, and Manwha",
        food: "Everything",
        photo: "/team_assets/albert.png"
    },

    {
        name: "Aaden Scalise",
        age: 16,
        grade: "Junior @ Trinity Pacific Christian",
        role: "Hardware / Drive",
        hobbies: "Racing, robotics, mock trial",
        food: "Chicken Picatta",
        photo: "/team_assets/aaden.png"
    },
    {
        name: "John Bryson",
        age: 16,
        grade: "11th Grade @ Trinity Pacific Christian",
        role: "Hardware",
        hobbies: "Touching grass",
        food: "None",
        photo: "/team_assets/john.png",
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
        name: "Cooper Paulec",
        age: 15,
        grade: "9th Grade @ Home",
        role: "Hardware",
        hobbies: "N/A",
        food: "Wood Ranch BBQ",
        photo: "/team_assets/cooper.png",
     },
     {
        name: "Henry Gasich",
        age: 15,
        grade: "9th Grade @ Home",
        role: "Hardware",
        hobbies: "N/A",
        food: "N/A",
        photo: "/team_assets/henry.jpg",
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
        name: "Nathan Bancroft",
        age: 16,
        grade: "12th Grade @ Trinity Pacific Christian",
        role: "Hardware",
        hobbies: "N/A",
        food: "N/A",
        photo: "/team_assets/nathan.jpg",
    },
    {
        name: "Livi Richert",
        age: 16,
        grade: "11th Grade @ Moorpark College",
        role: "Outreach / Hardware",
        hobbies: "life",
        food: "Salami",
        photo: "/team_assets/livi.png"
    },
    {
        name: "Therelene Penrose",
        age: 17,
        grade: "11th Grade @ Trinity Pacific Christian",
        role: "Outreach",
        hobbies: "Playing musical instruments, reading good books",
        food: "Soup",
        photo: "/team_assets/therelene.png",
    },
    
    {
        name: "Kevin Fei", 
        age: 16,
        grade: "Sophomore @ Westlake High School",
        role: "Software / Drive",
        hobbies: "Coding",
        food: "Pho",
        photo: "/team_assets/kevin.jpeg"
    },  
    {
        name: "Micah Chi",
        age: 14,
        grade: "9th Grade @ Trinity Pacific Christian",
        role: "Software",
        hobbies: "Rubiks Cube, volleyball, track/field",
        food: "Sichuan Spicy Fish Soup",
        photo: "/team_assets/micah.jpeg"
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
        name: "A", 
        numYears: "Big Boss",
        photo: "/team_assets/sung.jpeg"
    },
    {
        name: "B", 
        numYears: "Big Boss",
        photo: "/team_assets/sung.jpeg"
    },
    {
        name: "C", 
        numYears: "Big Boss",
        photo: "/team_assets/sung.jpeg"
    },
    {
        name: "D", 
        numYears: "Big Boss",
        photo: "/team_assets/sung.jpeg"
    },
    {
        name: "E", 
        numYears: "Big Boss",
        photo: "/team_assets/sung.jpeg"
    },
    {
        name: "F", 
        numYears: "Big Boss",
        photo: "/team_assets/sung.jpeg"
    },
    
   
]

function Team() {
    
    return (
        <div className="team-content">
            <div className='team-intro'>
                <h1>BRAINSTORMZ 2024-2025 INTO THE DEEP TEAM</h1>
                
            </div>
            <div className='team-list'>
            {team.map((member) => (
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
                            Age: {member.age}
                        </div>
                        <div>
                            School: {member.grade}
                        </div>
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

            <h1>Coaches & Mentors</h1>
            

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
            <h1>Alumni</h1>
            <div className='team-list'>
            {alumni.map((member) => (
                <div key={member.name} className="team-card alumni">
                    <div className="team-main-card">
                        <h2 className='team-name'>
                            {member.name}
                        </h2>
                    
                        <div className='team-photo-frame'>
                            <img src={member.photo}/>
                        </div>
                    </div>
                    <div className='team-expand-card'>
                        <div>
                            numYears: {member.numYears}
                        </div>
                      
                    </div>
                </div>
            ))}
            </div>
            
        </div>
    )
}

export default Team;