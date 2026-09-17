import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/content';
import { ProjectArt } from './project-art';
export function ProjectCard({ project }: { project: Project }) {
 return <Link className="project-card" href={`/projects/${project.slug}/`}><ProjectArt slug={project.slug} /><div className="project-card-body"><div className="card-category">{project.category}<ArrowUpRight size={18} /></div><h3>{project.title}</h3><p>{project.description}</p><div className="tags">{project.tags.slice(0,3).map(tag=><span key={tag}>{tag}</span>)}{project.tags.length>3&&<span aria-label={`${project.tags.length-3} more technologies`}>+{project.tags.length-3}</span>}</div></div></Link>;
}
