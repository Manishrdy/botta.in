'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowUpRight, CalendarDays, RefreshCw} from 'lucide-react';

type Day = {date: string; count: number; level: number};
const cache = new Map<string, {days: Day[]; at: number}>();
const dateLabel = (date: string) => new Intl.DateTimeFormat('en-US', {month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T00:00:00Z`));
function parseDays(value: unknown): Day[] {
 if (!value || typeof value !== 'object' || !('contributions' in value) || !Array.isArray(value.contributions)) throw new Error('Calendar unavailable');
 const days = value.contributions as Day[];
 if (!days.length || days.some(d => !d || !/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !Number.isInteger(d.count) || d.count < 0 || !Number.isInteger(d.level) || d.level < 0 || d.level > 4 || Number.isNaN(Date.parse(d.date)))) throw new Error('Calendar unavailable');
 const sorted = [...days].sort((a,b)=>a.date.localeCompare(b.date));
 if (sorted.length > 371 || sorted.some((d,i)=>i>0 && Date.parse(d.date)-Date.parse(sorted[i-1].date)!==86400000)) throw new Error('Calendar unavailable');
 return sorted;
}
export function ContributionGraph({username,deferLoad=false}: {username: string;deferLoad?:boolean}) {
 const panel=useRef<HTMLElement>(null);
 const [ready,setReady]=useState(!deferLoad);
 useEffect(()=>{
  if(ready||!panel.current)return;
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setReady(true);observer.disconnect()}},{rootMargin:"300px"});
  observer.observe(panel.current);return()=>observer.disconnect();
 },[ready]);
 const [days,setDays] = useState<Day[]>([]);
 const [error,setError] = useState(false);
 const [retry,setRetry] = useState(0);
 const [selected,setSelected] = useState<number|null>(null);
 const grid = useRef<HTMLDivElement>(null);
 const scroll = useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const container=scroll.current;
  if(!container||!days.length)return;
  container.scrollLeft=container.scrollWidth-container.clientWidth;
 },[days]);
 useEffect(()=>{
  if(!ready)return;
  const cached = cache.get(username);
  if(cached && Date.now()-cached.at<3600000){setDays(cached.days);return;}
  const controller = new AbortController();let active=true;
  const timeout=setTimeout(()=>controller.abort(),12000);setError(false);
  fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,{signal:controller.signal})
   .then(r=>{if(!r.ok)throw new Error('Calendar unavailable');return r.json()})
   .then(parseDays).then(data=>{if(active){cache.set(username,{days:data,at:Date.now()});setDays(data)}})
   .catch(()=>{if(active)setError(true)}).finally(()=>clearTimeout(timeout));
  return()=>{active=false;clearTimeout(timeout);controller.abort()};
 },[username,retry,ready]);
 const offset=days.length?new Date(`${days[0].date}T00:00:00Z`).getUTCDay():0;
 const weeks=Math.ceil((days.length+offset)/7);
 const total=days.reduce((sum,d)=>sum+d.count,0);
 const activeDays=days.filter(d=>d.count>0).length;
 const peak=days.length?Math.max(...days.map(d=>d.count)):0;
 const current=selected===null?null:days[selected];
 return <section ref={panel} className="contribution-panel" aria-label="GitHub contributions">
  <div className="contribution-heading"><div className="contribution-title"><span className="calendar-icon"><CalendarDays size={19}/></span><div><h2>One day at a time.</h2><p>GitHub contributions · past year</p></div></div><a className="text-link" href={`https://github.com/${username}?tab=overview`} target="_blank" rel="noopener noreferrer">@{username} <ArrowUpRight size={14}/></a></div>
  {error?<div className="calendar-state"><p role="status">The contribution calendar is temporarily unavailable.</p><button className="button secondary" onClick={()=>{setError(false);setRetry(r=>r+1)}}><RefreshCw size={14}/>Retry calendar</button><a className="text-link" href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer">View on GitHub <ArrowUpRight size={14}/></a></div>:!days.length?<div className="calendar-state" role="status"><div className="calendar-placeholder" aria-hidden="true"/><p>Loading contributions…</p></div>:<>
   <div className="contribution-summary"><strong>{total.toLocaleString()} <span>contributions</span></strong><div><span><b>{activeDays}</b> active days</span><span><b>{peak}</b> most in a day</span></div></div>
   <p className="calendar-scroll-hint">← Swipe to explore earlier months</p>
   <div ref={scroll} className="calendar-scroll" role="group" aria-label="Contribution calendar. Use arrow keys to explore days.">
    <div className="calendar-body" style={{'--weeks':weeks} as React.CSSProperties}>
     <div className="calendar-months" aria-hidden="true">{days.map((d,i)=>{const date=new Date(`${d.date}T00:00:00Z`);const column=Math.floor((i+offset)/7)+1;return (date.getUTCDate()===1 && column<weeks-1)?<span key={d.date} style={{gridColumn:column}}>{date.toLocaleDateString('en-US',{month:'short',timeZone:'UTC'})}</span>:null})}</div>
     <div className="calendar-weekdays" aria-hidden="true"><span>Mon</span><span>Wed</span><span>Fri</span></div>
     <div className="calendar-cells" ref={grid}>{days.map((d,i)=><button key={d.date} type="button" className={`calendar-day level-${d.level}`} style={{gridColumn:Math.floor((i+offset)/7)+1,gridRow:(i+offset)%7+1}} tabIndex={i===(selected??days.length-1)?0:-1} aria-label={`${d.count} ${d.count===1?'contribution':'contributions'} on ${dateLabel(d.date)}`} onMouseEnter={()=>setSelected(i)} onFocus={()=>setSelected(i)} onClick={()=>setSelected(i)} onKeyDown={e=>{const delta:Record<string,number>={ArrowLeft:-7,ArrowRight:7,ArrowUp:-1,ArrowDown:1};if(e.key in delta){e.preventDefault();const next=Math.min(days.length-1,Math.max(0,i+delta[e.key]));(grid.current?.children[next] as HTMLButtonElement)?.focus()}}}><span className="sr-only">{d.date}: {d.count}</span></button>)}</div>
    </div>
   </div>
   <div className="calendar-footer"><p>{current?<><strong>{current.count} {current.count===1?'contribution':'contributions'}</strong> on {dateLabel(current.date)}</>:<>Explore a day to see its contributions.</>}</p><div className="calendar-legend" aria-label="Color intensity: fewer to more contributions"><span>Less</span>{[0,1,2,3,4].map(level=><i key={level} className={`level-${level}`}/>)}<span>More</span></div></div>
  </>}
  <p className="calendar-source">Public profile calendar via <a href="https://github.com/grubersjoe/github-contributions-api" target="_blank" rel="noopener noreferrer">GitHub Contributions API</a>. Updates may take up to an hour.</p>
 </section>
}
