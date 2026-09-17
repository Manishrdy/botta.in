import {ContributionGraph} from '@/components/contribution-graph';
import {ActivityFeed} from '@/components/activity-feed';
import {profile} from '@/lib/content';
import {pageMetadata} from '@/lib/metadata';
export const metadata=pageMetadata('Activity','Recent public GitHub activity and repositories from Manishrdy.','/activity/');
export default function Activity(){return <div className="container"><header className="page-header"><p className="section-label">On GitHub</p><h1>A little closer to the code.</h1><p>Recent public work, pulled directly from GitHub. For the context behind the commits, explore the project case studies.</p></header><div className="page-section" style={{paddingTop:0}}><noscript><div className="noscript-message">Enable JavaScript to load live events, or <a href={profile.github}>view Manishrdy on GitHub</a>.</div></noscript><ContributionGraph username={profile.githubUsername}/><ActivityFeed username={profile.githubUsername}/></div></div>}
