import { ContributionGraph } from '@/components/contribution-graph';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Code2 as Github } from 'lucide-react';
import { profile, projects, month } from '@/lib/content';
import { getPosts } from '@/lib/posts';
import { ProjectCard } from '@/components/project-card';
import { PostList } from '@/components/post-list';
import Image from 'next/image';

export default function Home() {
 return <div className="container home-personal">
 <section className="hero" aria-labelledby="home-title">
  <div className="hero-copy">
   <p className="hero-eyebrow">Hi, I’m Manish Botta.</p>
   <h1 id="home-title">Backend depth.<br/>AI in production.</h1>
   <p>{profile.intro}</p>
   <div className="hero-actions">
    <Link className="button primary" href="/projects/">Explore my work <ArrowUpRight size={17}/></Link>
    <Link className="button secondary" href="/contact/">Let’s talk <ArrowUpRight size={17}/></Link>
    <a href={profile.github} className="hero-github" aria-label="Manish on GitHub" target="_blank" rel="noopener noreferrer"><Github size={20}/></a>
   </div>
   <Link className="hero-availability" href="/contact/"><span aria-hidden="true"/>Open to engineering opportunities</Link>
  </div>
  <figure className="hero-portrait">
   <div className="portrait-window"><Image src="/manish-botta.jpg" alt="Manish Botta wearing a white polo shirt" width={1200} height={900} preload sizes="(max-width: 600px) 280px, (max-width: 900px) 320px, 380px"/></div>
   <figcaption><span>Software &amp; AI engineer</span><span><MapPin size={13}/> San Francisco</span></figcaption>
  </figure>
 </section>
 <div className="experience-strip"><span>Built and shipped with</span><div><span className="company-name">Navi Technologies Inc.</span><span className="company-name">Yellow.ai</span><span className="company-name">TradeLiv</span><span className="company-name">Cognizant</span></div></div>
 <section className="section" id="selected-work"><div className="section-heading"><div><p className="section-label">Selected work</p><h2>Built to solve a real problem.</h2></div><Link className="text-link" href="/projects/">All projects <ArrowUpRight size={17}/></Link></div><div className="project-grid">{projects.filter(p=>p.featured).map(p=><ProjectCard key={p.slug} project={p}/>)}</div></section>
 <section className="section experience-section"><div className="experience-intro"><p className="section-label">The work behind the work</p><h2>From the first question<br/>to the last mile.</h2><p>I’ve worked inside enterprise teams and built as a solo engineer. The common thread is owning the path from an ambiguous problem to a system people rely on.</p><Link href="/about/" className="text-link">More about me <ArrowUpRight size={17}/></Link></div><div className="compact-timeline">{profile.experience.map(e=><div className="compact-role" key={e.id}><span className="timeline-dot"/><div><h3><Link href={`/experience/${e.id}/`}>{e.company}</Link></h3><p>{e.role}</p></div><span className="role-date">{month(e.startDate).split(' ')[1]}–{e.endDate?month(e.endDate).split(' ')[1]:'Now'}</span></div>)}</div></section>
 <section className="section writing-section"><div className="section-heading"><div><p className="section-label">Field notes</p><h2>Decisions, not just demos.</h2></div><Link className="text-link" href="/posts/">All writing <ArrowUpRight size={17}/></Link></div><PostList posts={getPosts().slice(0,3)}/></section><div className="home-contributions"><ContributionGraph username={profile.githubUsername} deferLoad/></div></div>;
}
