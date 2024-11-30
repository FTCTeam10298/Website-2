import { useState } from 'react';
import './team.css'

const team = [
    {
        name: "Hansen Chen", 
        age: 15,
        grade: "Sophomore @ FTHS Technology High",
        role: "Drive",
        hobbies: "Valorant and Golf",
        food: "Sushi",
        photo: "src/components/team/team-pictures/hansen.png"
    },
    {
        name: "Kevin Fei", 
        age: 16,
        grade: "Sophomore @ Westlake High School",
        role: "Software",
        hobbies: "Cooking and Eating",
        food: "Pho",
        photo: "src/components/team/team-pictures/kevin.png"
    },
    {
        name: "Albert Ruan", 
        age: 15,
        grade: "Sophomore @ Oak Park High",
        role: "Hardware",
        hobbies: "Overwatch and Manwha",
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
    }
]

function Team() {
    const [expandedMember, setExpandedMember] = useState(null); 

    const toggleMemberInfo = (name) => {
        setExpandedMember((prevName) => (prevName === name ? null : name)); 
    };
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
                        <div className="team-expand-button" onClick={() => toggleMemberInfo(member.name)}>Learn more→</div>
                    </div>
                    <div className={`team-expand-card ${
                            expandedMember === member.name ? "expanded" : ""
                        }`}>
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
        </div>
    )
}

export default Team;