import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './seasons.css';
import { useSearchParams } from 'react-router-dom';

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

const formatSeasonLabel = (seasonName: string) => {
    const yearMatch = seasonName.match(/^(\d{4})-(\d{4})/);
    if (!yearMatch) return seasonName;

    return `'${yearMatch[1].slice(2)}-'${yearMatch[2].slice(2)}`;
};

function Seasons() {
    const [searchParams, setSearchParams] = useSearchParams();
    const seasonParam = searchParams.get('season');
    
    const [selectedSeason, setSelectedSeason] = useState<string>(
        seasonParam || "2024-2025 Into the Deep"
    );
    const [markdownContent, setMarkdownContent] = useState("");

    useEffect(() => {
        if (seasonParam && seasons.some(season => season.name === seasonParam)) {
            setSelectedSeason(seasonParam);
        } else {
            setSelectedSeason("2024-2025 Into the Deep");
        }
    }, [seasonParam]);

    useEffect(() => {
        const seasonPath = `/markdown/seasons/${selectedSeason}.md?raw`;

        fetch(seasonPath)
            .then((response) => response.text())
            .then((text) => setMarkdownContent(text))
            .catch((error) => console.error("Error fetching Markdown:", error));
    }, [selectedSeason]);

    const chooseSeason = (seasonName: string) => {
        setSelectedSeason(seasonName);
        setSearchParams({ season: seasonName });
    };

    return (
        <div className="content season-page">
            <h2 className='title toppage'>{selectedSeason}</h2>
            <div className="season-picker" aria-label="Season selector">
                {seasons.map((season) => (
                    <button
                        className={season.name === selectedSeason ? "season-picker-btn active" : "season-picker-btn"}
                        key={season.name}
                        onClick={() => chooseSeason(season.name)}
                        type="button"
                    >
                        {formatSeasonLabel(season.name)}
                    </button>
                ))}
            </div>
            <ReactMarkdown
                className="markdown season-markdown"
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => <h2 className="season-md-heading">{children}</h2>,
                    h2: ({ children }) => <h2 className="season-md-heading">{children}</h2>,
                    h3: ({ children }) => <h3 className="season-md-subheading">{children}</h3>,
                    h4: ({ children }) => <h4 className="season-md-subheading">{children}</h4>,
                    img: ({ src, alt }) => (
                        <figure className="season-figure">
                            <img src={src} alt={alt || ""} />
                            {alt && <figcaption>{alt}</figcaption>}
                        </figure>
                    ),
                    a: ({ href, children }) => {
                        const isVideo = href?.includes("youtube.com") || href?.includes("youtu.be");
                        return (
                            <a
                                className={isVideo ? "season-video-link" : undefined}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {children}
                            </a>
                        );
                    },
                    table: ({ children }) => (
                        <div className="season-table-wrap">
                            <table>{children}</table>
                        </div>
                    ),
                    hr: () => <hr className="season-divider" />,
                }}
            >
                {markdownContent}
            </ReactMarkdown>
        </div>
    );
    
    
}

export default Seasons; 
