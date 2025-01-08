import { useEffect, useState } from 'react';
import ReactMarkdown  from 'react-markdown'
import remarkGfm from 'remark-gfm';
import './awards.css'

function Awards() {
    const [markdownContent, setMarkdownContent] = useState("");


    useEffect(() => {
            // Fetch the Markxown file for the selected season
        fetch(`src/components/awards/awards.md`)
            .then((response) => response.text())
            .then((text) => setMarkdownContent(text))
            .catch((error) => console.error("Error fetching Markdown:", error));
            
    });

    return (
        <div className='awards-content'>
            <h2>Awards</h2>
            <div>
                <ReactMarkdown className='markdown' remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
            </div>
        </div>
    )
}

export default Awards;