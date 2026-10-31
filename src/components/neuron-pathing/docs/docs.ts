import installation from './content/installation.md?raw';
import subsystems from './content/subsystems.md?raw';
import troubleshooting from './content/troubleshooting.md?raw';
import tuning from './content/tuning.md?raw';

export interface Doc { slug: string; title: string; markdown: string }

// in reading order: drives the prev/next links at the bottom of each page
export const DOCS: Doc[] = [
  { slug: 'installation', title: 'Installation', markdown: installation },
  { slug: 'tuning', title: 'Tuning', markdown: tuning },
  { slug: 'subsystems', title: 'Subsystems & Public Methods', markdown: subsystems },
  { slug: 'troubleshooting', title: 'Troubleshooting', markdown: troubleshooting },
];

export const docPath = (slug: string) => `/neuron-pathing/docs/${slug}`;
