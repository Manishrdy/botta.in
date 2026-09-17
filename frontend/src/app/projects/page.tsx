import { ProjectExplorer } from '@/components/project-explorer';
import { projects,categories } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
export const metadata=pageMetadata('Projects','Explore production systems, AI workflows, developer tools, and open-source contributions by Manish Botta.','/projects/');
export default function Projects(){return <div className="container"><div className="page-header"><p className="section-label">Projects</p><h1>Ideas, made operational.</h1><p>A collection of systems I’ve built, experiments I’ve followed through, and contributions to tools I use. The decisions behind each one are part of the story.</p></div><ProjectExplorer projects={projects} categories={categories}/></div>}
