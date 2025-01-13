import { useEffect, useState } from 'react';
import ReactMarkdown  from 'react-markdown'
import remarkGfm from 'remark-gfm';
import './seasons.css';

const seasons = [
    {name: "2023-2024 Centerstage", color: "#F4D738",    },
    {name: "2022-2023 Power Play",color: "#87CEEB"},
    {name: "2021-2022 Freight Frenzy", color: "#FFDB58"},
    {name: "2018-2019 Rover Ruckus",color: "#E3A018"},
    {name: "2017-2018 Relic Recovery",color: "#7FBC8C"},
    {name: "2016-2017 Velocity Vortex",color: "#FF6B6B"},
    {name: "2015-2016 Res-Q", color: "#F8D6B3"},
]


function Seasons() {

    const [selectedSeason, setSelectedSeason] = useState<string>("2023-2024 Centerstage");
    const [markdownContent, setMarkdownContent] = useState("");
    const toggleSeason = (name : string) => {
        setSelectedSeason(name); 
    };
    
    useEffect(() => {
        // Fetch the Markxown file for the selected season
        fetch(`src/components/season/seasons/${selectedSeason}.md`)
            .then((response) => response.text())
            .then((text) => setMarkdownContent(text))
            .catch((error) => console.error("Error fetching Markdown:", error));
        
    }, [selectedSeason]);

    return (
        <div className="season-content">
            <h2>Seasons</h2>
            <span className='dropdown'>
                Selected Season: {selectedSeason} 

                <div className='dropdown-content'>
                    {seasons.map((season) => (
                        <div 
                            key={season.name} 
                            onClick={() => toggleSeason(season.name)}
                        >
                            {season.name}
                        </div>
                    ))}
                </div>
            </span>
            
            <div className='season'>
                <div className='season-info'>
                    <ReactMarkdown className='markdown' remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
                </div>
            </div>
        </div>
    )
}

export default Seasons;