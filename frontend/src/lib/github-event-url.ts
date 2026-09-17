/** Resolve the most specific public GitHub destination without extra API requests. */
export function githubEventUrl(type: string, repo: string, payload: Record<string, unknown>): string {
 const base = `https://github.com/${repo}`;
 const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {};
 const number = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
 const sha = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{40,64}$/i.test(value) && !/^0+$/.test(value);
 const safe = (value: unknown, expectedRepo = repo): string | null => {
  if(typeof value !== 'string')return null;
  try { const url = new URL(value); return url.origin === 'https://github.com' && !url.username && !url.password && (url.pathname === `/${expectedRepo}` || url.pathname.startsWith(`/${expectedRepo}/`)) ? url.href : null; } catch { return null; }
 };
 const pr=object(payload.pull_request),issue=object(payload.issue),comment=object(payload.comment),review=object(payload.review),release=object(payload.release);
 const prNumber=number(pr.number)??number(payload.number);
 const prUrl=safe(pr.html_url)??(prNumber?`${base}/pull/${prNumber}`:null);
 const issueNumber=number(issue.number);
 const issueUrl=safe(issue.html_url)??(issueNumber?`${base}/issues/${issueNumber}`:null);
 if(type==='PushEvent'){
  if(sha(payload.before)&&sha(payload.head)&&payload.before!==payload.head)return `${base}/compare/${payload.before}...${payload.head}`;
  if(sha(payload.head))return `${base}/commit/${payload.head}`;
  const commits=Array.isArray(payload.commits)?payload.commits:[];
  const latest=object(commits[commits.length-1]);
  if(sha(latest.sha))return `${base}/commit/${latest.sha}`;
  if(typeof payload.ref==='string'&&payload.ref.startsWith('refs/heads/')&&payload.ref.length>11)return `${base}/tree/${encodeURIComponent(payload.ref.slice(11))}`;
 }
 if(type==='PullRequestEvent')return prUrl??base;
 if(type==='IssuesEvent')return issueUrl??base;
 if(type==='IssueCommentEvent')return safe(comment.html_url)??(issueUrl&&number(comment.id)?`${issueUrl}#issuecomment-${comment.id}`:issueUrl)??base;
 if(type==='PullRequestReviewEvent')return safe(review.html_url)??(prUrl&&number(review.id)?`${prUrl}#pullrequestreview-${review.id}`:prUrl)??base;
 if(type==='PullRequestReviewCommentEvent')return safe(comment.html_url)??(prUrl&&number(comment.id)?`${prUrl}#discussion_r${comment.id}`:prUrl)??base;
 if(type==='CommitCommentEvent')return safe(comment.html_url)??(sha(comment.commit_id)?`${base}/commit/${comment.commit_id}${number(comment.id)?`#commitcomment-${comment.id}`:''}`:base);
 if(type==='ReleaseEvent')return safe(release.html_url)??(typeof release.tag_name==='string'&&release.tag_name?`${base}/releases/tag/${encodeURIComponent(release.tag_name)}`:base);
 if(type==='CreateEvent'&&typeof payload.ref==='string'&&payload.ref&&(payload.ref_type==='branch'||payload.ref_type==='tag'))return `${base}/tree/${encodeURIComponent(payload.ref)}`;
 if(type==='ForkEvent'){
  const fork=object(payload.forkee);
  if(typeof fork.full_name==='string'&&/^[-\w.]+\/[-\w.]+$/.test(fork.full_name))return safe(fork.html_url,fork.full_name)??`https://github.com/${fork.full_name}`;
 }
 return base;
}
