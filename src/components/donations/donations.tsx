import { useEffect, useState } from 'react';
import ReactMarkdown  from 'react-markdown'
import remarkGfm from 'remark-gfm';
import './donations.css'

function Donations() {
    const [markdownContent, setMarkdownContent] = useState("");


    useEffect(() => {
        // Fetch the Markxown file for the selected season
        fetch(`/markdown/donations_page.md`)
            .then((response) => response.text())
            .then((text) => setMarkdownContent(text))
            .catch((error) => console.error("Error fetching Markdown:", error));
            
    });

    return (
        <div className='donations-content'>
            <div>
                <ReactMarkdown className='markdown' remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
            </div>
        </div>
    )
}

export default Donations;