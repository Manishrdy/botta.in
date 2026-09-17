'use client';
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Project } from '@/lib/content';
import { ProjectCard } from './project-card';
export function ProjectExplorer({projects,categories}:{projects:Project[];categories:string[]}){
 const [category,setCategory]=useState('All');const [query,setQuery]=useState('');
 useEffect(()=>{const read=()=>{const p=new URLSearchParams(window.location.search);setCategory(p.get('category')||'All');setQuery(p.get('q')||'')};read();window.addEventListener('popstate',read);return()=>window.removeEventListener('popstate',read)},[]);
 function update(nextCategory:string,nextQuery:string,replace=false){setCategory(nextCategory);setQuery(nextQuery);const url=new URL(window.location.href);nextCategory==='All'?url.searchParams.delete('category'):url.searchParams.set('category',nextCategory);nextQuery?url.searchParams.set('q',nextQuery):url.searchParams.delete('q');window.history[replace?'replaceState':'pushState']({},'',url)}
 const filtered=projects.filter(p=>(category==='All'||p.category===category)&&[p.title,p.description,...p.tags].join(' ').toLowerCase().includes(query.toLowerCase().trim()));
 return <div className="project-listing"><div className="search-wrap"><Search size={17}/><label className="sr-only" htmlFor="project-search">Search projects or technologies</label><input id="project-search" className="search-input" type="search" value={query} onChange={e=>update(category,e.target.value,true)} placeholder="Search projects or technologies…"/></div><div className="filter-bar" role="group" aria-label="Filter projects by category">{categories.map(c=><button key={c} className="filter-chip" aria-pressed={category===c} onClick={()=>update(c,query)}>{c}</button>)}<span className="project-count" role="status">{filtered.length} {filtered.length===1?'project':'projects'}</span></div>{filtered.length?<div className="project-grid">{filtered.map(p=><ProjectCard key={p.slug} project={p}/>)}</div>:<div className="empty-state"><h2>No projects match that search.</h2><p>Try a different technology or explore the full collection.</p><button className="button secondary" onClick={()=>update('All','')}><X size={15}/> Clear filters</button></div>}</div>
}
