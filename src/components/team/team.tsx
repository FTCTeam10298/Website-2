import { useState } from 'react'
import './team.css'
import team1 from './data/team1.json'
import team2 from './data/team2.json'
import mentors from './data/mentors.json'
import alumni from './data/alumni.json'

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
            <h2 className='title team-section-title'>Coaches & Mentors</h2>
            

            <div className='team-list'>

            {mentors.map((member) => (
                <div key={member.name} className="team-card mentor-card">
                    <div className={`team-main-card ${member.role}`}>
                        <h2 className='team-name'>
                            {member.name}
                        </h2>
                        <div className='team-role'>{member.role}</div>
                        <div className='team-photo-frame'>
                            <img src={member.photo} alt={member.name}/>
                        </div>
                    </div>
                    <div className='team-expand-card mentor-details-card'>
                        <div className="mentor-detail">
                            <span>Hobbies</span>
                            {member.hobbies}
                        </div>
                        <div className="mentor-detail">
                            <span>Favorite Food</span>
                            {member.food}
                        </div>
                    </div>
                </div>
            ))}
            
            </div>
            <h2 className='title team-section-title'> Alumni </h2>
            <div className='team-list'>
            {alumni.map((member) => (
                <div key={member.name} className="team-card alumni">
                    <div className={`team-main-card ${member.role}`}>
                        <h2 className='team-name'>
                            {member.name}
                        </h2>
                    
                        <div className='team-photo-frame'>
                            <img src={member.photo} alt={member.name}/>
                        </div>
                    </div>
                    <div className='team-expand-card alumni-seasons-card'>
                        <div className="alumni-season-list">
                            {member.numYears.map((season, index) => (
                                <span className="alumni-season-chip" key={`${member.name}-${season}-${index}`}>
                                    {season}
                                </span>
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
