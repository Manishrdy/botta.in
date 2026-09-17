import Link from 'next/link';
import {pageMetadata} from '@/lib/metadata';
export const metadata={...pageMetadata('Writing has moved','Find engineering notes at /posts.','/posts/'),robots:{index:false,follow:true}};
export default function LegacyPosts(){return <div className="container not-found"><h1>Writing has a new home.</h1><p>All engineering notes are now collected in one place.</p><Link className="button primary" href="/posts/">Browse writing</Link></div>}
