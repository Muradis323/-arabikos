import {words,type Progress} from './course';
export const isMark=(token:string)=>/^[\u064B-\u065F\u0670]$/.test(token);
export const spellingTokens=(word:string)=>Array.from(word.normalize('NFC'));
export const matchesSpelling=(tokens:string[],word:string)=>tokens.join('').normalize('NFC')===word.normalize('NFC');
export function weakWords(p:Progress){return words.filter(w=>{if(!p.completed.includes(w.lesson))return false;const r=p.reviews[w.id];return !!r&&!r.spellingCleared&&(r.lastKnown===false||(r.misses??0)>0)}).sort((a,b)=>(p.reviews[a.id]?.level??0)-(p.reviews[b.id]?.level??0));}

export function clearDifficultWord(p:Progress,id:number,withoutHint:boolean):Progress{const r=p.reviews[id];if(!withoutHint||!r||!p.completed.includes(words[id]?.lesson))return p;return {...p,reviews:{...p.reviews,[id]:{...r,spellingCleared:true}}}}
