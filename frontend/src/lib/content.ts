import { z } from 'zod';
import profileData from '../../content/profile.json';
import projectsData from '../../content/projects.json';

const link = z.url().refine((value) => /^https:\/\//.test(value), 'Use HTTPS links');
const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/), title: z.string().min(1), category: z.string(),
  tagline: z.string(), description: z.string(), problem: z.string(), approach: z.array(z.string()),
  flow: z.array(z.string()), outcome: z.string(), tradeoff: z.string(), featured: z.boolean(),
  tags: z.array(z.string()), repoUrl: link, liveUrl: link.nullable(), contributionUrl: link.nullable(),
  sources: z.array(link),
});
export const projects = z.array(projectSchema).parse(projectsData);
if (new Set(projects.map((p) => p.slug)).size !== projects.length) throw new Error('Project slugs must be unique');
export type Project = z.infer<typeof projectSchema>;
export const profile = profileData;
export const categories = ['All', ...new Set(projects.map((p) => p.category))];
export function month(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}-01T00:00:00Z`));
}
