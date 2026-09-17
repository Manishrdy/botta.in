import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Post } from '@/lib/posts';
export function PostList({ posts }: { posts: Post[] }) {
 return <div className="post-list">{posts.map(post=><Link href={`/posts/${post.slug}/`} className="post-row" key={post.slug}><time dateTime={post.date}>{new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(post.date))}</time><div><h3>{post.title}</h3><p>{post.description}</p><span className="post-meta">{post.readingTime} min read <span className="post-topic">{post.tags[0]}</span></span></div><ArrowUpRight size={20}/></Link>)}</div>;
}
