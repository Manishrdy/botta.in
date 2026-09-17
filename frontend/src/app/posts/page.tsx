import Link from 'next/link';
import {getPosts,tagSlug} from '@/lib/posts';
import {PostList} from '@/components/post-list';
import {pageMetadata} from '@/lib/metadata';
export const metadata=pageMetadata('Writing','Engineering notes on AI pipelines, backend architecture, and the decisions behind working software.','/posts/');
export default function Posts(){const posts=getPosts();const tags=[...new Set(posts.flatMap(p=>p.tags))];return <div className="container"><header className="page-header"><p className="section-label">Field notes</p><h1>The thinking behind<br/>the implementation.</h1><p>Notes from building things: what the system needs to do, where the hard parts are, and why a particular design made sense.</p></header><div className="writing-tags">{tags.map(t=><Link className="tag-link" key={t} href={`/posts/tags/${tagSlug(t)}/`}>{t}</Link>)}</div><div className="page-section" style={{paddingTop:0}}><PostList posts={posts}/></div></div>}
