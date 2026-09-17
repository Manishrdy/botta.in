import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

const directory = path.join(process.cwd(), 'content/posts');
const schema = z.object({ title: z.string(), description: z.string(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), tags: z.array(z.string()), published: z.boolean() });
export const tagSlug = (tag: string) => tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function getPosts() {
  return fs.readdirSync(directory).filter((file) => file.endsWith('.mdx')).map((file) => {
    const { data, content } = matter(fs.readFileSync(path.join(directory, file), 'utf8'));
    const meta = schema.parse(data);
    return { ...meta, slug: file.replace(/\.mdx$/, ''), content, readingTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 220)) };
  }).filter((post) => post.published).sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}
export type Post = ReturnType<typeof getPosts>[number];
export function formatDate(date: string) { return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)); }
export function headings(content: string) {
  return [...content.replace(/```[\s\S]*?```/g, '').matchAll(/^(#{2,3}) (.+)$/gm)].map((match) => ({ level: match[1].length, title: match[2], id: match[2].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s/g, '-') }));
}
