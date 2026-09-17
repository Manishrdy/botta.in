import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import matter from 'gray-matter';
const profile=JSON.parse(fs.readFileSync('content/profile.json'));
const projects=JSON.parse(fs.readFileSync('content/projects.json'));
test('approved identity and dates remain intact',()=>{
 assert.equal(profile.email,'manish.botta@hotmail.com');
 assert.equal(profile.experience.find(e=>e.company==='Microsoft').endDate,'2026-04');
 assert.ok(!JSON.stringify(profile).includes('phone'));
});
test('project slugs are unique and source links use HTTPS',()=>{
 assert.equal(new Set(projects.map(p=>p.slug)).size,projects.length);
 for(const p of projects){assert.match(p.slug,/^[a-z0-9-]+$/);assert.ok(p.approach.length);for(const url of [p.repoUrl,...p.sources])assert.equal(new URL(url).protocol,'https:');}
});
test('published posts have complete metadata and social artwork',()=>{
 for(const file of fs.readdirSync('content/posts')){
 const {data,content}=matter(fs.readFileSync(`content/posts/${file}`,'utf8'));
 assert.equal(typeof data.published,'boolean'); assert.ok(data.title&&data.description&&data.tags.length);assert.match(data.date,/^\d{4}-\d{2}-\d{2}$/);assert.ok(content.length>100);
 if(data.published)assert.ok(fs.existsSync(`public/posts/${file.replace('.mdx','')}-og.png`));
 }
});
test('master and company stories preserve reviewed attribution and join to all jobs',()=>{
 const master=JSON.parse(fs.readFileSync('content/master-resume.json'));
 const stories=JSON.parse(fs.readFileSync('content/experience.json'));
 assert.deepEqual(new Set(master.experience.map(e=>e.id)),new Set(profile.experience.map(e=>e.id)));
 assert.deepEqual(new Set(stories.map(e=>e.id)),new Set(profile.experience.map(e=>e.id)));
 assert.match(master.experience.find(e=>e.id==='tradeliv').prototype,/prototype/);
 assert.match(master.experience.find(e=>e.id==='cognizant').scope,/proof of concept/);
 const yellow=master.experience.find(e=>e.id==='yellow-ai').bullets.join(' ');
 assert.match(yellow,/accuracy by 35%/);assert.match(yellow,/rates by 60%/);
 assert.ok(!JSON.stringify(master).includes('61%'));
 for(const slug of master.projectSlugs)assert.ok(projects.some(p=>p.slug===slug));
 for(const story of stories){assert.equal(story.nodes.length,6);for(const slug of story.related)assert.ok(projects.some(p=>p.slug===slug));}
});
