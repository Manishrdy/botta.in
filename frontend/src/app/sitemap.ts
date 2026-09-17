import type {MetadataRoute} from 'next';
import {projects} from '@/lib/content';
import {getPosts,tagSlug} from '@/lib/posts';
import {siteUrl} from '@/lib/metadata';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{const posts=getPosts();return [...['/','/about/','/projects/','/posts/','/activity/','/resume/','/contact/'].map(path=>({url:`${siteUrl}${path}`})),...projects.map(p=>({url:`${siteUrl}/projects/${p.slug}/`})),...posts.map(p=>({url:`${siteUrl}/posts/${p.slug}/`,lastModified:p.date})),...[...new Set(posts.flatMap(p=>p.tags).map(tagSlug))].map(tag=>({url:`${siteUrl}/posts/tags/${tag}/`}))]}
