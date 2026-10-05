import {words} from './course';
export type PracticeExample={ids:number[];ru:string};
import {lessonSentenceBank} from './sentence-bank';
export function practiceExamples(completed:number[]):PracticeExample[]{const seen=new Set<string>();return lessonSentenceBank.flat().filter(e=>{if(!e.ids.every(id=>words[id]&&completed.includes(words[id].lesson)))return false;const key=e.ids.join(',');if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>Math.max(...b.ids.map(id=>words[id].lesson))-Math.max(...a.ids.map(id=>words[id].lesson)))}
export function validatePractice(){lessonSentenceBank.forEach((bank,lesson)=>{for(const e of bank)if(!e.ids.length||!e.ru||e.ids.some(id=>!words[id]||words[id].lesson>lesson))throw Error('Invalid practice example')});return true}
validatePractice();

export function practiceSession(completed:number[],previousFirst?:string,selectedLesson:number|null=null):PracticeExample[]{
 const buckets=new Map<number,PracticeExample[]>();for(const e of practiceExamples(completed)){const lesson=Math.max(...e.ids.map(id=>words[id].lesson));if(selectedLesson!==null&&lesson!==selectedLesson)continue;buckets.set(lesson,[...(buckets.get(lesson)??[]),e])}
 const result=[...buckets.entries()].sort(([a],[b])=>b-a).flatMap(([,items])=>{const shuffled=[...items];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}return shuffled});
 if(result.length>1&&result[0].ids.join(',')===previousFirst&&Math.max(...result[0].ids.map(id=>words[id].lesson))===Math.max(...result[1].ids.map(id=>words[id].lesson)))[result[0],result[1]]=[result[1],result[0]];
 return result;
}
