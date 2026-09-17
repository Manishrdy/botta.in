import Link from 'next/link';
import { Code2 as Github, BriefcaseBusiness as Linkedin, ArrowUpRight } from 'lucide-react';
import { profile } from '@/lib/content';
export function Footer() {
 return <footer className="site-footer"><div className="container"><div className="footer-top"><div><p className="section-label">Let’s work together</p><h2>Good software starts<br />with a conversation.</h2><Link href="/contact/" className="text-link">Get in touch <ArrowUpRight size={18} /></Link></div><div className="footer-links"><a href={profile.github} target="_blank" rel="noopener noreferrer"><Github size={17} /> GitHub <ArrowUpRight size={14} /></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={17} /> LinkedIn <ArrowUpRight size={14} /></a><Link href="/resume/">View resume <ArrowUpRight size={14} /></Link><a href="/rss.xml">RSS feed <ArrowUpRight size={14} /></a></div></div><div className="footer-bottom"><span>© {new Date().getUTCFullYear()} Manish Botta</span><span>Built with coffee, in San Francisco.</span><a href="#top">Back to top</a></div></div></footer>;
}
