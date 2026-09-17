import stories from '../../content/experience.json';
import master from '../../content/master-resume.json';
import {profile} from './content';
export const masterResume=master;
export const experiences=stories.map(story=>{
 const job=profile.experience.find(e=>e.id===story.id);
 const detail=master.experience.find(e=>e.id===story.id);
 if(!job||!detail)throw new Error(`Missing experience source: ${story.id}`);
 return {...job,...story,detail};
});
export type Experience=typeof experiences[number];
