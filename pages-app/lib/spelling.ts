import {words,type Progress} from './course';
export const isMark=(token:string)=>/^[\u064B-\u065F\u0670]$/.test(token);
export const spellingTokens=(word:string)=>Array.from(word.normalize('NFC'));
export const matchesSpelling=(tokens:string[],word:string)=>tokens.join('').normalize('NFC')===word.normalize('NFC');
export function weakWords(p:Progress){return words.filter(w=>{if(!p.completed.includes(w.lesson))return false;const r=p.reviews[w.id];return !!r&&(r.lastKnown===false||(r.seen>0&&r.level<=1))}).sort((a,b)=>(p.reviews[a.id]?.level??0)-(p.reviews[b.id]?.level??0));}
