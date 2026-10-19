import {words,lessonSentenceBank} from './course';
export type PracticeExample={ids:number[];ru:string;kind?:string;parts?:{ids:number[];ru:string}[]};
export function practiceExamples(completed:number[]):PracticeExample[]{const seen=new Set<string>();return lessonSentenceBank.flat().filter(e=>{if(!e.ids.every(id=>words[id]&&completed.includes(words[id].lesson)))return false;const key=e.ids.join(',');if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>Math.max(...b.ids.map(id=>words[id].lesson))-Math.max(...a.ids.map(id=>words[id].lesson)))}
export function validatePractice(){lessonSentenceBank.forEach((bank,lesson)=>{for(const e of bank)if(!e.ids.length||!e.ru||e.ids.some(id=>!words[id]||words[id].lesson>lesson))throw Error('Invalid practice example')});return true}
validatePractice();

function shuffle<T>(items:T[]):T[]{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
export function practiceSession(completed:number[],previousFirst?:string,selectedLesson:number|null=null):PracticeExample[]{
 const pool=practiceExamples(completed);
 if(selectedLesson!==null)return shuffle(pool.filter(e=>Math.max(...e.ids.map(id=>words[id].lesson))===selectedLesson));
 const count=new Set(completed.filter(id=>Number.isInteger(id)&&id>=0&&id<lessonSentenceBank.length)).size*5;
 if(!count)return [];
 const latest=Math.max(...completed);
 const recent=shuffle(pool.filter(e=>e.ids.some(id=>words[id].lesson===latest)));
 const first=recent.slice(0,5);
 if(first[0]?.ids.join(',')===previousFirst&&recent.length>5)first[0]=recent[5];
 const remaining=shuffle(pool.filter(e=>!first.includes(e)));
 return [...first,...remaining].slice(0,count);
}
