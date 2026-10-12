import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import matter from 'gray-matter';
const root=path.resolve(import.meta.dirname,'..');
const pub=path.join(root,'public');
const projects=JSON.parse(fs.readFileSync(path.join(root,'content/projects.json'),'utf8'));
const escape=s=>s.replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
function lines(text,max=34){const result=[''];for(const word of text.split(' ')){const i=result.length-1;if((result[i]+' '+word).trim().length>max)result.push(word);else result[i]=(result[i]+' '+word).trim()}return result;}
async function card(file,title,label){const chunks=lines(title);const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#14181c"/><path d="M72 96h1056M72 530h1056" stroke="#303a42"/><text x="72" y="68" fill="#edf2f5" font-family="Arial" font-size="30" font-weight="bold">mb.</text><text x="1128" y="67" text-anchor="end" fill="#a5b0b8" font-family="Arial" font-size="20">botta.in</text><text x="72" y="170" fill="#b3d5e7" font-family="Arial" font-size="22">${escape(label)}</text>${chunks.map((line,i)=>`<text x="68" y="${265+i*76}" fill="#edf2f5" font-family="Arial" font-size="64" font-weight="bold" letter-spacing="-2">${escape(line)}</text>`).join('')}<text x="72" y="578" fill="#a5b0b8" font-family="Arial" font-size="22">Manish Botta / Software &amp; AI Engineer</text><circle cx="1104" cy="571" r="6" fill="#b3d5e7"/></svg>`;fs.mkdirSync(path.dirname(path.join(pub,file)),{recursive:true});await sharp(Buffer.from(svg)).png().toFile(path.join(pub,file));}
await card('og.png','Backend depth. AI in production.','Software, from the first question to the last mile.');
for(const p of projects)await card(`projects/${p.slug}-og.png`,p.title,p.category);
for(const file of fs.readdirSync(path.join(root,'content/posts')).filter(f=>f.endsWith('.mdx'))){const {data}=matter(fs.readFileSync(path.join(root,'content/posts',file),'utf8'));if(data.published)await card(`posts/${file.replace('.mdx','')}-og.png`,data.title,'Field notes / '+data.tags[0]);}
for(const e of JSON.parse(fs.readFileSync(path.join(root,'content/experience.json'),'utf8')))await card(`experience/${e.id}-og.png`,e.title,e.id==='navi-technologies-inc'?'Navi Technologies Inc.':e.id==='yellow-ai'?'Yellow.ai':e.id==='tradeliv'?'TradeLiv':e.id[0].toUpperCase()+e.id.slice(1));
const icon=fs.readFileSync(path.join(pub,'favicon.svg'));
for(const [file,size] of [['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]])await sharp(icon).resize(size,size).png().toFile(path.join(pub,file));
console.log('Generated social cards and app icons.');
