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
