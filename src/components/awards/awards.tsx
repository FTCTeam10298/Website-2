import { useEffect, useState } from 'react';
import './awards.css'

type AwardEvent = {
    title: string;
    image?: string;
    awards: string[];
};

type AwardSeason = {
    title: string;
    events: AwardEvent[];
};

const decodeMarkdownText = (text: string) => text.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");

function getAwardType(award: string) {
    const lowerAward = award.toLowerCase();

    if (lowerAward.includes("winning alliance")) return "winning";
    if (lowerAward.includes("finalist")) return "finalist";
    if (lowerAward.includes("inspire")) return "inspire";
    if (lowerAward.includes("control")) return "control";
    if (lowerAward.includes("motivate")) return "motivate";
    if (lowerAward.includes("connect")) return "connect";
    if (lowerAward.includes("innovate")) return "innovate";
    if (lowerAward.includes("design")) return "design";
    if (lowerAward.includes("think")) return "think";
    if (lowerAward.includes("qualified")) return "qualified";
    return "default";
}

function parseAwards(markdown: string): AwardSeason[] {
    const seasons: AwardSeason[] = [];
    let currentSeason: AwardSeason | undefined;
    let currentEvent: AwardEvent | undefined;

    markdown.split(/\r?\n/).forEach((rawLine) => {
        const line = rawLine.trim();
        if (!line) return;

        if (line.startsWith("## ")) {
            currentSeason = { title: decodeMarkdownText(line.replace(/^##\s+/, "")), events: [] };
            seasons.push(currentSeason);
            currentEvent = undefined;
            return;
        }

        if (line.startsWith("### ")) {
            if (!currentSeason) return;
            currentEvent = { title: decodeMarkdownText(line.replace(/^###\s+/, "")), awards: [] };
            currentSeason.events.push(currentEvent);
            return;
        }

        const imageMatch = line.match(/^!\[[^\]]*\]\(([^)]+)\)$/);
        if (imageMatch && currentEvent) {
            currentEvent.image = imageMatch[1];
            return;
        }

        if (currentEvent) {
            currentEvent.awards.push(decodeMarkdownText(line));
        }
    });

    return seasons;
}

function Awards() {
    const [awardSeasons, setAwardSeasons] = useState<AwardSeason[]>([]);


    useEffect(() => {
        fetch(`/markdown/awards_page.md`)
            .then((response) => response.text())
            .then((text) => setAwardSeasons(parseAwards(text)))
            .catch((error) => console.error("Error fetching Markdown:", error));
            
    }, []);

    return (
        <div className='content awards-content'>
            <h2 className='title toppage'>Awards</h2>
            <div className="awards-timeline">
                {awardSeasons.map((season) => (
                    <section className="award-season" key={season.title}>
                        <h3>{season.title}</h3>
                        <div className="award-event-grid">
                            {season.events.map((event) => (
                                <article className="award-event-card" key={`${season.title}-${event.title}`}>
                                    {event.image && (
                                        <img src={event.image} alt={`${event.title} awards`} />
                                    )}
                                    <div className="award-event-body">
                                        <h4>{event.title}</h4>
                                        <div className="award-chip-list">
                                            {event.awards.map((award) => (
                                                <span className={`award-chip ${getAwardType(award)}`} key={award}>
                                                    {award}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}

export default Awards;
