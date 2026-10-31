import { useEffect, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import { DOCS, docPath } from './docs';
import '../neuron.css';

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node && typeof node === 'object' && 'props' in node) return textOf((node.props as { children?: ReactNode }).children);
  return '';
}

// "Stage 1: Localizer sign conventions" -> "stage-1-localizer-sign-conventions"
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s-]+/g, '-');

const components: Components = {
  h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(textOf(children))}>{children}</h3>,
  // site-internal links navigate in-app; everything else is a normal external link
  a: ({ href = '', children }) => href.startsWith('/')
    ? <Link to={href}>{children}</Link>
    : <a href={href} target="_blank" rel="noreferrer">{children}</a>,
  blockquote: ({ children }) => <div className="np-tip">{children}</div>,
};

export default function DocPage() {
  const { slug = '' } = useParams();
  const { hash } = useLocation();
  const idx = DOCS.findIndex(d => d.slug === slug);
  const doc = DOCS[idx];

  useEffect(() => {
    if (doc) document.title = `${doc.title}: Neuron Pathing`;
  }, [doc]);

  // jump to #anchor after the page renders (or to the top on a new page)
  useEffect(() => {
    const el = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) el.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [slug, hash]);

  // old static URLs: docs/installation.html -> docs/installation
  if (slug.endsWith('.html')) return <Navigate to={docPath(slug.replace(/\.html$/, '')) + hash} replace />;
  if (!doc) return <Navigate to="/neuron-pathing" replace />;

  const prev = DOCS[idx - 1], next = DOCS[idx + 1];
  return (
    <div className="np-site">
      <div className="np-docs-wrap">
        <div className="np-docs-topbar">
          <Link className="np-home" to="/neuron-pathing">&larr; Neuron Pathing</Link>
          <h1>{doc.title}</h1>
        </div>
        <div className="np-doc">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{doc.markdown}</ReactMarkdown>
        </div>
        <div className="np-nextprev">
          {prev ? <Link to={docPath(prev.slug)}>&larr; {prev.title}</Link> : <span />}
          {next ? <Link to={docPath(next.slug)}>{next.title} &rarr;</Link> : <span />}
        </div>
        <footer>Neuron Pathing &amp; Neuron Path Planner &mdash; FTC Team 10298, Brain Stormz.</footer>
      </div>
    </div>
  );
}
