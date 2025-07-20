import { useEffect, useState } from 'react';
import ReactMarkdown  from 'react-markdown'
import remarkGfm from 'remark-gfm';
import './awards.css'

function Awards() {
    const [markdownContent, setMarkdownContent] = useState("");


    useEffect(() => {
        // Fetch the Markxown file for the selected season
        fetch(`/markdown/awards_page.md`)
            .then((response) => response.text())
            .then((text) => setMarkdownContent(text))
            .catch((error) => console.error("Error fetching Markdown:", error));
            
    });

    return (
        <div className='content'>
            <h2 className='title toppage'>Awards</h2>
            <ReactMarkdown className='markdown' remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
        </div>
    )
}

export default Awards;