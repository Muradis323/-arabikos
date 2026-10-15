import {type Progress,type StreakProtection} from './course';
export const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function shiftDay(key:string,offset:number){const d=new Date(key+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10)}
export function isDayKey(value:unknown):value is string{return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value}
export function protectionFor(p:Progress,now=new Date()):StreakProtection{return p.streakProtection??{credits:Object.values(p.lessonResults??{}).filter(r=>r.best===100).length,enabled:false,lastChecked:dayKey(now),frozenDays:[]}}
// Spend only on elapsed days, after protection was enabled, and while a series exists.
export function reconcileStreak(p:Progress,now=new Date()):Progress{
 const today=dayKey(now),state=protectionFor(p,now);if(p.streakProtection&&state.lastChecked>=today)return p;
 let credits=state.credits;const frozen=new Set(state.frozenDays);
 if(state.enabled)for(let day=state.lastChecked;day<today&&credits>0;day=shiftDay(day,1)){const previous=shiftDay(day,-1);if(!p.days[day]&&!frozen.has(day)&&(p.days[previous]>0||frozen.has(previous))){frozen.add(day);credits--}}
 return {...p,streakProtection:{...state,credits,lastChecked:today,frozenDays:[...frozen].sort()}};
}
export function setProtection(p:Progress,enabled:boolean,now=new Date()):Progress{const next=reconcileStreak(p,now);return {...next,streakProtection:{...protectionFor(next,now),enabled}}}
export function awardFreeze(p:Progress,now=new Date()):Progress{const next=reconcileStreak(p,now),state=protectionFor(next,now);if(state.lastAwarded===dayKey(now))return next;return {...next,streakProtection:{...state,credits:state.credits+1,lastAwarded:dayKey(now)}}}
export function streakCount(p:Progress,now=new Date()):number{const frozen=new Set(p.streakProtection?.frozenDays??[]);let count=0,day=dayKey(now);if(!p.days[day]&&!frozen.has(day))day=shiftDay(day,-1);while(p.days[day]>0||frozen.has(day)){if(p.days[day]>0)count++;day=shiftDay(day,-1)}return count}
export function validateProtection(value:unknown):boolean{const s=value as StreakProtection;return !!s&&typeof s==='object'&&!Array.isArray(s)&&Number.isSafeInteger(s.credits)&&s.credits>=0&&(s.lastAwarded===undefined||isDayKey(s.lastAwarded))&&typeof s.enabled==='boolean'&&isDayKey(s.lastChecked)&&Array.isArray(s.frozenDays)&&new Set(s.frozenDays).size===s.frozenDays.length&&s.frozenDays.every(d=>isDayKey(d)&&d<s.lastChecked)}
