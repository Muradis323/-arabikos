import {validateProtection} from './streak';
import {validateAlphabet} from './alphabet';
import {initial,lessons,BOOK1_COUNT,words,lessonSteps,isWordLearned,type Progress} from './course';
export const LEGACY_KEY='arabikos-progress-v2';
export const KEY='arabikos-madinah-v1';
export function validateProgress(p:Progress):boolean {
 if(!p||!Array.isArray(p.completed)||!Number.isInteger(p.lesson)||!Number.isInteger(p.step)||!p.reviews||!p.days)return false;
 if(p?.dailyPoints!==undefined&&(!p.dailyPoints||typeof p.dailyPoints!=='object'||Array.isArray(p.dailyPoints)||Object.entries(p.dailyPoints).some(([date,points])=>!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isSafeInteger(points)||points<0)))return false;
 if(p?.book1Exam!==undefined){const e=p.book1Exam;if(!e||!Number.isInteger(e.best)||e.best<0||e.best>100||!Number.isInteger(e.last)||e.last<0||e.last>e.best||!Number.isSafeInteger(e.runs)||e.runs<1||typeof e.passed!=='boolean'||e.passed!==(e.best>=80)||p.completed?.length<BOOK1_COUNT)return false;}
 if(p?.book1ExamAttempt!==undefined&&(!Array.isArray(p.book1ExamAttempt)||p.book1ExamAttempt.length>=24||p.completed?.length<BOOK1_COUNT||p.book1ExamAttempt.some(n=>!Number.isInteger(n)||n<0||n>3)))return false;
 if(p?.completed?.length>BOOK1_COUNT&&!p.book1Exam?.passed)return false;
 if(p?.lesson>=BOOK1_COUNT&&p.step>0&&!p.book1Exam?.passed)return false;

 if(p?.lessonCompletions!==undefined&&(!p.lessonCompletions||typeof p.lessonCompletions!=='object'||Array.isArray(p.lessonCompletions)||Object.entries(p.lessonCompletions).some(([day,ids])=>!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Array.isArray(ids)||ids.some(id=>!Number.isInteger(id)||!p.completed?.includes(id)))))return false;
 if(p?.attempts!==undefined&&(!p.attempts||typeof p.attempts!=='object'||Array.isArray(p.attempts)||Object.entries(p.attempts).some(([id,a])=>String(a?.id)!==id||!validateProgress({...p,attempts:undefined,attempt:a}))))return false;
 if(p?.attempt!==undefined){const a=p.attempt;if(!a||!Number.isInteger(a.id)||a.id<0||a.id>=lessons.length||a.id>p.completed.length||(a.id>=BOOK1_COUNT&&!p.book1Exam?.passed)||!Number.isInteger(a.step)||a.step<0||a.step>=lessonSteps(a.id)||!Array.isArray(a.mistakes)||new Set(a.mistakes).size!==a.mistakes.length||a.mistakes.some(i=>!Number.isInteger(i)||i<0||i>=24))return false;}
 if(p?.sentenceSession!==undefined){const s=p.sentenceSession;if(!s||typeof s.completed!=='string'||!Array.isArray(s.keys)||s.keys.length>lessons.length*5||s.keys.some(k=>typeof k!=='string'||k.length>1500)||!Number.isInteger(s.index)||s.index<0||s.index>s.keys.length||(s.part!==undefined&&(!Number.isInteger(s.part)||s.part<0||s.part>10)))return false;}
 if(p?.wordErrors!==undefined&&(!p.wordErrors||typeof p.wordErrors!=='object'||Array.isArray(p.wordErrors)||Object.entries(p.wordErrors).some(([id,n])=>!words[Number(id)]||!Number.isSafeInteger(n)||n<0)))return false;
 if(p?.reading!==undefined){const r=p.reading;if(r?.storyId!==undefined&&typeof r.storyId!=='string')return false;if(r?.bookmarks!==undefined&&(!r.bookmarks||typeof r.bookmarks!=='object'||Array.isArray(r.bookmarks)||Object.values(r.bookmarks).some(n=>!Number.isInteger(n)||n<0||n>10000)))return false;if(!r||!Number.isInteger(r.paragraph)||r.paragraph<0||r.paragraph>10000||!Number.isInteger(r.font)||r.font<28||r.font>44||(r.finished!==undefined&&typeof r.finished!=='boolean')||!r.cards||typeof r.cards!=='object'||Array.isArray(r.cards)||Object.keys(r.cards).length>2000)return false;for(const c of Object.values(r.cards))if(!c||typeof c.ar!=='string'||!c.ar||c.ar.length>200||typeof c.ru!=='string'||c.ru.length>1000||!Number.isInteger(c.level)||c.level<0||c.level>9||!Number.isFinite(c.due)||c.due<0||!Number.isSafeInteger(c.seen)||c.seen<0)return false;}
 if(p?.daily!==undefined&&(!p.daily||typeof p.daily!=='object'||Array.isArray(p.daily)||Object.entries(p.daily).some(([d,v])=>!/^\d{4}-\d{2}-\d{2}$/.test(d)||!v||!Number.isSafeInteger(v.reviews)||v.reviews<0||!Number.isSafeInteger(v.lessonSteps)||v.lessonSteps<0||typeof v.read!=='boolean')))return false;
 if(p?.streakProtection!==undefined&&!validateProtection(p.streakProtection))return false;
 if(p?.lessonResults!==undefined){if(!p.lessonResults||typeof p.lessonResults!=='object'||Array.isArray(p.lessonResults))return false;for(const [id,r] of Object.entries(p.lessonResults))if(!/^\d{1,2}$/.test(id)||!p.completed?.includes(Number(id))||!r||!Number.isInteger(r.best)||r.best<0||r.best>100||!Number.isInteger(r.last)||r.last<0||r.last>r.best||!Number.isSafeInteger(r.runs)||r.runs<1)return false;}
 if(p?.alphabet!==undefined&&!validateAlphabet(p.alphabet))return false;
 if(!p||!Array.isArray(p.completed)||!Number.isInteger(p.lesson)||p.lesson<0||p.lesson>=lessons.length||!Number.isInteger(p.step)||p.step<0||p.step>=lessonSteps(p.lesson))return false;
 if(p?.mastered!==undefined&&(!Array.isArray(p.mastered)||new Set(p.mastered).size!==p.mastered.length||p.mastered.some(id=>!Number.isInteger(id)||!isWordLearned(p,id))))return false;
 if(p.completed.length>lessons.length||p.completed.some((v,i)=>v!==i)||p.lesson!==Math.min(p.completed.length,lessons.length-1))return false;
 if(!p.reviews||!p.days||typeof p.reviews!=='object'||typeof p.days!=='object'||Array.isArray(p.reviews)||Array.isArray(p.days))return false;
 for(const [id,r] of Object.entries(p.reviews))if(!/^\d{1,3}$/.test(id)||!words[Number(id)]||!isWordLearned(p,Number(id))||!r||!Number.isInteger(r.level)||r.level<0||r.level>9||!Number.isFinite(r.due)||r.due<0||!Number.isSafeInteger(r.seen)||r.seen<0||(r.misses!==undefined&&(!Number.isSafeInteger(r.misses)||r.misses<0))||(r.lastKnown!==undefined&&typeof r.lastKnown!=='boolean')||(r.spellingCleared!==undefined&&typeof r.spellingCleared!=='boolean'))return false;
 return Object.entries(p.days).every(([d,n])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isSafeInteger(n)&&n>=0);
}
export function normalizeProgress(data:Progress):Progress {
 if(data?.completed?.length===20&&data.lesson===19)data={...data,lesson:20,step:0};
 if(data?.completed?.length===5&&data.lesson===4&&data.step===0)data={...data,lesson:5};
 if(!validateProgress(data))throw Error('Сохранённые данные не удалось прочитать. Они не удалены.');return data;
}
export function readProgress(storage:Pick<Storage,'getItem'>):Progress {
 const raw=storage.getItem(KEY);if(!raw){const n=structuredClone(initial);try{const old=JSON.parse(storage.getItem(LEGACY_KEY)||'null');if(old){if(validateAlphabet(old.alphabet))n.alphabet=old.alphabet;else if(old.completed?.length)n.alphabet={status:'skipped',passed:[]};if(old.days&&typeof old.days==='object'&&!Array.isArray(old.days))n.days=Object.fromEntries(Object.entries(old.days).filter(([d,v])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isSafeInteger(v)&&Number(v)>=0)) as Record<string,number>;}}catch{}return n;}
 return normalizeProgress(JSON.parse(raw));
}
export function writeProgress(storage:Pick<Storage,'setItem'>&Partial<Pick<Storage,'getItem'>>,data:Progress){if(!validateProgress(data))throw Error('Некорректный прогресс');if(storage.getItem){try{const previous=storage.getItem(KEY),date=new Date().toLocaleDateString('sv-SE');let copies=JSON.parse(storage.getItem('arabikos-recovery-v1')||'[]');if(!Array.isArray(copies))copies=[];if(previous&&!copies.some((c:{date:string})=>c.date===date)){const old=normalizeProgress(JSON.parse(previous));if(validateProgress(old))storage.setItem('arabikos-recovery-v1',JSON.stringify([{date,progress:old},...copies].slice(0,3)));}}catch{/* optional snapshots must not block the primary save */}}storage.setItem(KEY,JSON.stringify(data));}
