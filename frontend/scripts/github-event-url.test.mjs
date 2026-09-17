import {test} from 'node:test';
import assert from 'node:assert/strict';
import {githubEventUrl} from '../src/lib/github-event-url.ts';
const repo='Manishrdy/coldstart',base=`https://github.com/${repo}`;
const before='a'.repeat(40),head='b'.repeat(40);
test('pushes link to comparisons, commits, branches, or repository in that order',()=>{
 assert.equal(githubEventUrl('PushEvent',repo,{before,head}),`${base}/compare/${before}...${head}`);
 assert.equal(githubEventUrl('PushEvent',repo,{before:'0'.repeat(40),head}),`${base}/commit/${head}`);
 assert.equal(githubEventUrl('PushEvent',repo,{commits:[{sha:head}]}),`${base}/commit/${head}`);
 assert.equal(githubEventUrl('PushEvent',repo,{ref:'refs/heads/feat/search'}),`${base}/tree/feat%2Fsearch`);
 assert.equal(githubEventUrl('PushEvent',repo,{}),base);
});
test('discussion and review links preserve exact comment anchors',()=>{
 assert.equal(githubEventUrl('IssueCommentEvent',repo,{issue:{number:3},comment:{html_url:`${base}/issues/3#issuecomment-4`}}),`${base}/issues/3#issuecomment-4`);
 assert.equal(githubEventUrl('PullRequestReviewEvent',repo,{pull_request:{number:3},review:{id:4}}),`${base}/pull/3#pullrequestreview-4`);
 assert.equal(githubEventUrl('PullRequestReviewCommentEvent',repo,{pull_request:{number:3},comment:{id:4}}),`${base}/pull/3#discussion_r4`);
 assert.equal(githubEventUrl('CommitCommentEvent',repo,{comment:{commit_id:head,id:4}}),`${base}/commit/${head}#commitcomment-4`);
 assert.equal(githubEventUrl('PullRequestEvent',repo,{number:3}),`${base}/pull/3`);
});
test('release, branch, tag, and fork destinations are specific',()=>{
 assert.equal(githubEventUrl('ReleaseEvent',repo,{release:{tag_name:'v1.0'}}),`${base}/releases/tag/v1.0`);
 assert.equal(githubEventUrl('CreateEvent',repo,{ref_type:'tag',ref:'v1.0'}),`${base}/tree/v1.0`);
 assert.equal(githubEventUrl('ForkEvent',repo,{forkee:{full_name:'Manishrdy/fork'}}),'https://github.com/Manishrdy/fork');
});
test('unsafe and unrelated links fall back to the known GitHub destination',()=>{
 for(const html_url of ['javascript:alert(1)','https://github.com.evil.test/x','https://evil.test/x','https://github.com/another/repo/issues/3','https://user:pass@github.com/Manishrdy/coldstart/issues/3'])
 assert.equal(githubEventUrl('IssuesEvent',repo,{issue:{number:3,html_url}}),`${base}/issues/3`);
});
