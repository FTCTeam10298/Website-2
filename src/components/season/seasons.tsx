import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './seasons.css';

const seasons = [
    { name: "2023-2024 Centerstage"},
    { name: "2022-2023 Power Play" },
    { name: "2021-2022 Freight Frenzy"},
    { name: "2018-2019 Rover Ruckus"},
    { name: "2017-2018 Relic Recovery"},
    { name: "2016-2017 Velocity Vortex" },
    { name: "2015-2016 Res-Q"},
];

function Seasons() {
    const [selectedSeason, setSelectedSeason] = useState<string>("2023-2024 Centerstage");
    const [toggleSelect, setToggleSelect] = useState<boolean>(false);
    const [markdownContent, setMarkdownContent] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleSeason = (name: string) => {
        setSelectedSeason(name);
        setToggleSelect(false); // Close dropdown after selection
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setToggleSelect(false); // Close dropdown when clicking outside
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Fetch the Markdown file for the selected season
        fetch(`src/components/season/seasons/${selectedSeason}.md`)
            .then((response) => response.text())
            .then((text) => setMarkdownContent(text))
            .catch((error) => console.error("Error fetching Markdown:", error));
    }, [selectedSeason]);

    return (
        <div className="season-content">
            <h2>Seasons</h2>
            <div
                ref={dropdownRef}
                className={`dropdown ${toggleSelect ? "selected" : "unselected"}`}
                onClick={() => setToggleSelect(!toggleSelect)}
            >
                <span>Selected Season: {selectedSeason}</span>
                {toggleSelect && (
                    <div className="dropdown-content">
                        {seasons.map((season) => (
                            <div
                                key={season.name}
                                onClick={() => toggleSeason(season.name)}
                            >
                                {season.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
