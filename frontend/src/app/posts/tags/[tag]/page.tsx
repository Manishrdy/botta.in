import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {getPosts,tagSlug} from '@/lib/posts';
import {PostList} from '@/components/post-list';
import {pageMetadata} from '@/lib/metadata';
export function generateStaticParams(){return [...new Set(getPosts().flatMap(p=>p.tags).map(tagSlug))].map(tag=>({tag}))}
export async function generateMetadata({params}:{params:Promise<{tag:string}>}){const {tag}=await params;return pageMetadata('Writing by topic',`Engineering notes about ${tag.replaceAll('-',' ')}.`,`/posts/tags/${tag}/`)}
export default async function TagPage({params}:{params:Promise<{tag:string}>}){const {tag}=await params;const posts=getPosts().filter(p=>p.tags.some(t=>tagSlug(t)===tag));if(!posts.length)notFound();const title=posts[0].tags.find(t=>tagSlug(t)===tag);return <div className="container"><header className="page-header"><Link href="/posts/" className="breadcrumb"><ArrowLeft size={14}/> All writing</Link><p className="section-label">Notes by topic</p><h1>{title}</h1><p>{posts.length} {posts.length===1?'note':'notes'} from the workbench.</p></header><div className="page-section" style={{paddingTop:0}}><PostList posts={posts}/></div></div>}
