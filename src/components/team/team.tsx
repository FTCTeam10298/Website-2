    import './team.css'

const team = [
    {
        name: "Albert Ruan", 
        age: 15,
        grade: "Sophomore @ Oak Park High",
        role: "Hardware",
        hobbies: "Marvel Rivals, Eating, and Manwha",
        food: "Everything",
        photo: "src/components/team/team-pictures/albert.png"
    },

    {
        name: "Aaden Scalise",
        age: 16,
        grade: "Junior @ Trinity Pacific Christian",
        role: "Hardware",
        hobbies: "Racing, robotics, mock trial",
        food: "Chicken Picatta",
        photo: "src/components/team/team-pictures/aaden.png"
    },
    {
        name: "Gavven Scalise (Junior Member)",
        age: 14,
        grade: "8th Grade @ Trinity Pacific Christian",
        role: "Hardware / Cad",
        hobbies: "Racecars",
        food: "Melasenessa, chimichurri",
        photo: "src/components/team/team-pictures/gavven.png",
     },
    {
        name: "Kevin Fei", 
        age: 16,
        grade: "Sophomore @ Westlake High School",
        role: "Software",
        hobbies: "Coding",
        food: "Pho",
        photo: "src/components/team/team-pictures/kevin.jpeg"
    },
    {
        name: "Micah Chi",
        age: 14,
        grade: "9th Grade @ Trinity Pacific Christian",
        role: "Software / Build",
        hobbies: "Rubiks Cube, volleyball, track/field",
        food: "Sichuan Spicy Fish Soup",
        photo: "src/components/team/team-pictures/Micah5.jpeg"
    },
    {
        name: "Ethan Xu",
        age: 14,
        grade: "8th Grade @ Medea Creek Middle School",
        role: "Drive / Build",
        hobbies: "Robotics, piano, volleyball, getting perms",
        food: "Chicken",
        photo: "src/components/team/team-pictures/ethan.png"
    },
    {
        name: "Hansen Chen", 
        age: 15,
        grade: "Sophomore @ FTHS Technology High",
        role: "Drive",
        hobbies: "Valorant, Anime, and Golf",
        food: "Sushi",
        photo: "src/components/team/team-pictures/hansen.png"
    },
    
    
    {
        name: "Livi Richert",
        age: 16,
        grade: "11th Grade @ Moorpark College",
        role: "Outreach / Build",
        hobbies: "life",
        food: "Salami",
        photo: "src/components/team/team-pictures/livi.png"
    },

   
    {
        name: "Therelene Penrose",
        age: 17,
        grade: "11th Grade @ Trinity Pacific Christian",
        role: "Outreach",
        hobbies: "Playing musical instruments, reading good books",
        food: "Soup",
        photo: "src/components/team/team-pictures/therelene.png",
    },
]

const mentors = [
    {
        name: "Garret Smalley", 
        role: "Hardware",
        hobbies: "Robot",
        food: "None",
        photo: "src/components/team/team-pictures/garret.png"
    },
    {
        name: "Jacob Newman", 
        role: "Software",
        hobbies: "Robot",
        food: "French Fries loaded with salt",
        photo: "src/components/team/team-pictures/garret.png"
    }
]
const coach = [
    {
        name: "Sung Choi", 
        role: "Coach",
        hobbies: "Robot",
        food: "None",
        photo: "src/components/team/team-pictures/Mr.Choi.jpeg"
    }
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
        </div>
    )
}

export default Team;