import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './seasons.css';
import { useSearchParams } from 'react-router-dom';
// const seasonsFiles: Record<string, { default: string }> = 
//   import.meta.glob('./seasons/*.md', { eager: true }) as Record<string, { default: string }>;

const seasons = [
    { name: "2024-2025 Into the Deep"},
    { name: "2023-2024 Centerstage"},
    { name: "2022-2023 Power Play" },
    { name: "2021-2022 Freight Frenzy"},
    { name: "2018-2019 Rover Ruckus"},
    { name: "2017-2018 Relic Recovery"},
    { name: "2016-2017 Velocity Vortex" },
    { name: "2015-2016 Res-Q"},
];

function Seasons() {
    const [searchParams] = useSearchParams();
    const seasonParam = searchParams.get('season');
    
    const [selectedSeason, setSelectedSeason] = useState<string>(
        seasonParam || "2024-2025 Into the Deep"
    );
    const [markdownContent, setMarkdownContent] = useState("");

    useEffect(() => {
        // Update selected season when URL parameter changes
        if (seasonParam && seasons.some(season => season.name === seasonParam)) {
            setSelectedSeason(seasonParam);
        } else {
            setSelectedSeason("2024-2025 Into the Deep"); // Default season
        }
    }, [seasonParam]);

    useEffect(() => {
        // Fetch the Markdown file for the selected season
        const seasonPath = `/seasons/${selectedSeason}.md?raw`;

        // if (seasonPath in seasonsFiles) {
        //     // If using eager: true, the content might already be available
        //     const content = seasonsFiles[seasonPath].default;
        //     setMarkdownContent(content);
        // } else {
            // Otherwise fetch it manually
            fetch(seasonPath)
                .then((response) => response.text())
                .then((text) => setMarkdownContent(text))
                .catch((error) => console.error("Error fetching Markdown:", error));
    //    }
    }, [selectedSeason]);

    return (
        <div className="season-content">
            <h2>{selectedSeason}</h2>
            <div className="season">
                <div className="season-info">
                    <ReactMarkdown
                        className="markdown"
                        remarkPlugins={[remarkGfm]}
                    >
                        {markdownContent}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

export default Seasons;