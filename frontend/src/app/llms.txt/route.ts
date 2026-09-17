import {profile,projects} from '@/lib/content';
import {siteUrl} from '@/lib/metadata';
export const dynamic='force-static';
export function GET(){const body=[`# ${profile.name}`,'',profile.bio.join('\n\n'),'','## Experience',...profile.experience.flatMap(e=>[`\n### [${e.company}](${siteUrl}/experience/${e.id}/) — ${e.role}`,`${e.startDate} to ${e.endDate||'Present'}`,...e.bullets.map(b=>`- ${b}`)]),'','## Projects',...projects.map(p=>`- [${p.title}](${siteUrl}/projects/${p.slug}/): ${p.description}`),'','## Skills',...profile.skillGroups.map(g=>`- ${g.title}: ${g.items.join(', ')}`),'','## Contact',`${siteUrl}/contact/`,profile.email,profile.github,profile.linkedin,''].join('\n');return new Response(body,{headers:{'Content-Type':'text/plain; charset=utf-8'}})}
