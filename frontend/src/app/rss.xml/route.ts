import {getPosts} from '@/lib/posts';
import {siteUrl} from '@/lib/metadata';
export const dynamic='force-static';
const escape=(value:string)=>value.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]||c));
export function GET(){const items=getPosts().map(p=>`<item><title>${escape(p.title)}</title><link>${siteUrl}/posts/${p.slug}/</link><guid isPermaLink="true">${siteUrl}/posts/${p.slug}/</guid><description>${escape(p.description)}</description><pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate></item>`).join('');return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Manish Botta — Field notes</title><link>${siteUrl}/posts/</link><description>Engineering notes from the workbench.</description><language>en-us</language>${items}</channel></rss>`,{headers:{'Content-Type':'application/rss+xml; charset=utf-8'}})}
