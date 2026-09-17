'use client';
import {useEffect,useState} from 'react';
import {githubEventUrl} from '@/lib/github-event-url';
import {GitCommitHorizontal,GitPullRequest,Star,RefreshCw,ArrowUpRight,Code2,GitBranch,MessageSquare,ChevronDown} from 'lucide-react';

type Category='Code'|'Reviews & issues'|'Other';
type PublicEvent={id:string;type:string;repo:string;createdAt:string;title:string;detail:string;url:string;category:Category};
type Activity={repositories:number;followers:number;events:PublicEvent[];fetchedAt:number};
function record(value:unknown):value is Record<string,unknown>{return typeof value==='object'&&value!==null}
function parseEvents(data:unknown):PublicEvent[]{
 if(!Array.isArray(data))throw new Error('Invalid GitHub response');
 const seen=new Set<string>();
 return data.flatMap((event:unknown)=>{
  if(!record(event)||!record(event.repo)||typeof event.repo.name!=='string'||!/^[-\w.]+\/[-\w.]+$/.test(event.repo.name)||typeof event.id!=='string'||typeof event.type!=='string'||typeof event.created_at!=='string'||Number.isNaN(Date.parse(event.created_at))||seen.has(event.id))return [];
  seen.add(event.id);
  const payload=record(event.payload)?event.payload:{};
  const repo=event.repo.name;
  let title='Updated activity',detail='',url=`https://github.com/${repo}`,category:Category='Other';
  if(event.type==='PushEvent'){
   title='Pushed code';category='Code';
   if(typeof payload.ref==='string')detail=payload.ref.replace(/^refs\/heads\//,'');
   if(Array.isArray(payload.commits)&&record(payload.commits[0])&&typeof payload.commits[0].message==='string')detail=payload.commits[0].message.split('\n')[0];
  }else if(event.type==='PullRequestEvent'){
   category='Reviews & issues';const pr=record(payload.pull_request)?payload.pull_request:{};
   title=pr.merged===true?'Merged pull request':payload.action==='opened'?'Opened pull request':payload.action==='closed'?'Closed pull request':'Updated pull request';
   if(typeof pr.number==='number')url+=`/pull/${pr.number}`;
   if(typeof pr.title==='string')detail=pr.title;
  }else if(event.type==='IssuesEvent'){
   category='Reviews & issues';title=payload.action==='opened'?'Opened issue':payload.action==='closed'?'Closed issue':'Updated issue';
   if(record(payload.issue)){if(typeof payload.issue.number==='number')url+=`/issues/${payload.issue.number}`;if(typeof payload.issue.title==='string')detail=payload.issue.title}
  }else if(event.type==='CreateEvent'){category='Code';title=payload.ref_type==='repository'?'Created repository':payload.ref_type==='tag'?'Created tag':'Created branch';if(typeof payload.ref==='string')detail=payload.ref}
  else if(event.type==='WatchEvent')title='Starred repository';
  else if(event.type==='ForkEvent')title='Forked repository';
  else if(event.type==='ReleaseEvent'){category='Code';title='Published release';if(record(payload.release)&&typeof payload.release.name==='string')detail=payload.release.name}
  else if(event.type==='IssueCommentEvent'){category='Reviews & issues';title='Joined discussion';if(record(payload.issue)){if(typeof payload.issue.number==='number')url+=`/issues/${payload.issue.number}`;if(typeof payload.issue.title==='string')detail=payload.issue.title}}
  else if(event.type==='PullRequestReviewEvent'){category='Reviews & issues';title='Reviewed pull request';if(record(payload.pull_request)&&typeof payload.pull_request.number==='number')url+=`/pull/${payload.pull_request.number}`}
  if(event.type==='PullRequestReviewCommentEvent'||event.type==='CommitCommentEvent'){category='Reviews & issues';title=event.type==='CommitCommentEvent'?'Commented on commit':'Commented on code';}
  url=githubEventUrl(event.type,repo,payload);
  return [{id:event.id,type:event.type,repo,createdAt:event.created_at,title,detail:detail.slice(0,240),url,category}];
 }).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}
function EventIcon({event}:{event:PublicEvent}){return event.type==='PushEvent'?<GitCommitHorizontal size={17}/>:event.type==='WatchEvent'?<Star size={17}/>:event.type==='CreateEvent'?<GitBranch size={17}/>:event.type.includes('PullRequest')?<GitPullRequest size={17}/>:event.category==='Reviews & issues'?<MessageSquare size={17}/>:<Code2 size={17}/>}
const filters=['All activity','Code','Reviews & issues','Other'] as const;
export function ActivityFeed({username}:{username:string}){
 const [activity,setActivity]=useState<Activity|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[refresh,setRefresh]=useState(0);
 const [filter,setFilter]=useState<string>('All activity'),[limit,setLimit]=useState(10);
 useEffect(()=>{
  const controller=new AbortController();let active=true;setLoading(true);setError('');
  const timeout=setTimeout(()=>controller.abort(),12000);
  async function load(){try{
   const [userResponse,eventsResponse]=await Promise.all([fetch(`https://api.github.com/users/${encodeURIComponent(username)}`,{signal:controller.signal}),fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`,{signal:controller.signal})]);
   if(!userResponse.ok||!eventsResponse.ok)throw new Error('GitHub is temporarily unavailable or its public request limit has been reached.');
   const user:unknown=await userResponse.json();if(!record(user)||typeof user.public_repos!=='number'||typeof user.followers!=='number')throw new Error('GitHub returned an unexpected response.');
   const result={repositories:user.public_repos,followers:user.followers,events:parseEvents(await eventsResponse.json()),fetchedAt:Date.now()};if(active)setActivity(result);
  }catch(e){if(active)setError(e instanceof Error&&e.name!=='AbortError'?e.message:'GitHub took too long to respond. Please try again.')}finally{clearTimeout(timeout);if(active)setLoading(false)}}
  void load();return()=>{active=false;clearTimeout(timeout);controller.abort()};
 },[username,refresh]);
 const filtered=activity?.events.filter(e=>filter==='All activity'||e.category===filter)??[];
 const grouped=Map.groupBy(filtered.slice(0,limit),e=>new Date(e.createdAt).toLocaleDateString('en-CA',{timeZone:'UTC'}));
 return <section className="recent-activity" aria-labelledby="recent-activity-title">
  <div className="recent-heading"><div><p className="section-label">The latest changes</p><h2 id="recent-activity-title">Recent activity</h2><p>Commits, conversations, and things taking shape.</p></div><button className="button secondary refresh-activity" disabled={loading} onClick={()=>setRefresh(x=>x+1)}><RefreshCw size={14} className={loading?'refresh-spinning':''}/>{loading?'Loading…':'Refresh'}</button></div>
  {activity&&<div className="activity-summary-bar"><span><Code2 size={15}/><strong>{activity.repositories}</strong> public repositories</span><span><strong>{activity.followers}</strong> followers</span><span className="activity-updated"><i/>Updated {new Date(activity.fetchedAt).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</span></div>}
  {loading&&!activity?<div className="event-skeleton" role="status"><span className="sr-only">Loading GitHub activity</span>{[0,1,2].map(i=><div key={i}><i/><span/><span/></div>)}</div>:error&&!activity?<div className="error-panel"><h3>Activity is taking a break.</h3><p role="status">{error}</p><div className="form-buttons"><button className="button secondary" onClick={()=>setRefresh(x=>x+1)}>Try again</button><a className="text-link" href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer">View GitHub <ArrowUpRight size={14}/></a></div></div>:<>
   <div className="event-filters" role="group" aria-label="Filter recent activity">{filters.map(f=><button key={f} className="filter-chip" aria-pressed={filter===f} onClick={()=>{setFilter(f);setLimit(10)}}>{f}</button>)}<span role="status">{filtered.length} {filtered.length===1?'event':'events'}</span></div>
   {error&&<p role="status" className="form-status">Couldn’t refresh. Showing the last successful response.</p>}
   {filtered.length?<div className="event-timeline">{[...grouped.entries()].map(([date,events])=><section className="event-day-group" key={date}><h3 className="event-date"><time dateTime={date}>{new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'})}</time><span>{new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US',{weekday:'long',timeZone:'UTC'})}</span></h3><div className="event-day-list">{events.map(e=><article className="event-card" key={e.id}><span className={`event-icon ${e.category==='Code'?'event-code':e.category==='Reviews & issues'?'event-review':'event-other'}`}><EventIcon event={e}/></span><div className="event-content"><div className="event-eyebrow"><span>{e.title}</span><time dateTime={e.createdAt} title={new Date(e.createdAt).toUTCString()}>{new Date(e.createdAt).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'UTC'})} UTC</time></div><h4><a href={e.url} target="_blank" rel="noopener noreferrer"><span>{e.repo.split('/')[0]} / </span>{e.repo.split('/')[1]}<ArrowUpRight size={14}/></a></h4>{e.detail&&<p>{e.detail}</p>}</div></article>)}</div></section>)}</div>:<div className="empty-state"><Code2 size={25}/><h3>{activity?.events.length?'No events in this category.':'A quiet stretch on the public feed.'}</h3><p>{activity?.events.length?'Choose another filter to explore recent work.':'Recent events don’t include private work. Explore the projects for a fuller picture.'}</p>{activity?.events.length?<button className="button secondary" onClick={()=>setFilter('All activity')}>Show all activity</button>:<a className="button secondary" href="/projects/">Explore projects</a>}</div>}
   {filtered.length>limit&&<button className="button secondary more-events" onClick={()=>setLimit(n=>n+10)}>Show more activity <ChevronDown size={15}/></button>}
  </>}
  <p className="activity-note">Latest 30 public events from GitHub. Events can be delayed; this feed is separate from the contribution calendar.</p>
 </section>;
}
