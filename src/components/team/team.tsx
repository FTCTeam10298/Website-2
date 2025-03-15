    import './team.css'

const team = [
    {
        name: "Albert Ruan", 
        age: 15,
        grade: "Sophomore @ Oak Park High",
        role: "Hardware / Drive / Co-Captain",
        hobbies: "Marvel Rivals, Eating, and Manwha",
        food: "Everything",
        photo: "src/components/team/team-pictures/albert.png"
    },

    {
        name: "Aaden Scalise",
        age: 16,
        grade: "Junior @ Trinity Pacific Christian",
        role: "Hardware / Drive / Co- Captain",
        hobbies: "Racing, robotics, mock trial",
        food: "Chicken Picatta",
        photo: "src/components/team/team-pictures/aaden.png"
    },
    {
        name: "Kevin Fei", 
        age: 16,
        grade: "Sophomore @ Westlake High School",
        role: "Software / Drive / Co-Captain",
        hobbies: "Coding",
        food: "Pho",
        photo: "src/components/team/team-pictures/kevin.png"
    },  
    {
        name: "Cooper Paulec",
        age: 15,
        grade: "9th Grade @ Home",
        role: "Hardware",
        hobbies: "Racecars",
        food: "Wood Ranch BBQ",
        photo: "src/components/team/team-pictures/cooper.png",
     },
     {
        name: "Henry Gasich",
        age: 15,
        grade: "9th Grade @ Home",
        role: "Hardware",
        hobbies: " ",
        food: "",
        photo: "src/components/team/team-pictures/henry.png",
     },
     {
        name: "Nathan Bancroft",
        age: 16,
        grade: "12th Grade @ Trinity Pacific Christian",
        role: "Hardware",
        hobbies: " ",
        food: " ",
        photo: "src/components/team/team-pictures/nathan.png",
    },
     {
        name: "John Bryson",
        age: 16,
        grade: "11th Grade @ Trinity Pacific Christian",
        role: "Hardware",
        hobbies: "Touching grass",
        food: "He doesn't eat",
        photo: "src/components/team/team-pictures/john.png",
     },
    {
        name: "Gavven Scalise",
        age: 14,
        grade: "8th Grade @ Trinity Pacific Christian",
        role: "Hardware",
        hobbies: "Racecars",
        food: "Melasenessa, chimichurri",
        photo: "src/components/team/team-pictures/gavven.png",
     },
    
    {
        name: "Micah Chi",
        age: 14,
        grade: "9th Grade @ Trinity Pacific Christian",
        role: "Software",
        hobbies: "Rubiks Cube, volleyball, track/field",
        food: "Sichuan Spicy Fish Soup",
        photo: "src/components/team/team-pictures/micah.png"
    },
    {
        name: "Ethan Xu",
        age: 14,
        grade: "8th Grade @ Medea Creek Middle School",
        role: "Hardware",
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
        role: "Outreach / Hardware",
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


    {
        name: "Lior Belkin",
        age: 14,
        grade: "8th Grade @ Chime Charter",
        role: "Outreach / Hardware",
        hobbies: "Sleeping",
        food: "Steak",
        photo: "src/components/team/team-pictures/lior.png",
    },
    {
        name: "Boyi Zheng",
        age: 13,
        grade: "8th Grade @ Oaks Christian",
        role: "Outreach / Hardware",
        hobbies: "Volunteering @ every single FIRST event",
        food: "In-n-out",
        photo: "src/components/team/team-pictures/boyi.png",
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
        name: "Alon Belkin", 
        role: "Hardware",
        hobbies: "Battle Bots",
        food: "Shwarma",
        photo: "src/components/team/team-pictures/alon.png"
    },
    {
        name: "Jacob Newman", 
        role: "Software / Hardware",
        hobbies: "Robots",
        food: "Coca Cola",
        photo: "src/components/team/team-pictures/jacob.png"
    },
    {
        name: "Sung Choi", 
        role: "Big Boss",
        hobbies: "Aura Farming",
        food: "Korean Food",
        photo: "src/components/team/team-pictures/sung.png"
    },
    {
        name: "Telly Chi", 
        role: "Big Boss",
        hobbies: "Going around and fixing things",
        food: "Tofu",
        photo: "src/components/team/team-pictures/telly.png"
    },
    {
        name: "Stu Penrose", 
        role: "Big Boss",
        hobbies: "Guitar",
        food: "",
        photo: "src/components/team/team-pictures/stu.png"
    },
    {
        name: "Teague Shepard", 
        role: "Mentor Man",
        hobbies: "Mogging",
        food: "In-n-out",
        photo: "src/components/team/team-pictures/teague.png"
    },
    {
        name: "James Gasich", 
        role: "Mentor Man",
        hobbies: "Mogging",
        food: "",
        photo: "src/components/team/team-pictures/jg.png"
    },
    {
        name: "James Penrose", 
        role: "Mentor Man",
        hobbies: "Mogging",
        food: "",
        photo: "src/components/team/team-pictures/james.png"
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