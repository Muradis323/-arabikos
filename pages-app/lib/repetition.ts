import {intervals} from './course';
export function scheduleReview(old:{level:number;seen:number;misses?:number;spellingCleared?:boolean},known:boolean,now:number){
 const level=known?Math.min(old.level+1,intervals.length):0;
 return {level,due:now+(known?intervals[Math.max(0,level-1)]:5*60*1000),seen:old.seen+1,misses:(old.misses??0)+(known?0:1),lastKnown:known,spellingCleared:known?(old.spellingCleared??false):false};
}

// Reinsert a forgotten card after three others; never grow the queue with duplicates.
export function reviewQueueAfter<T>(queue:T[],known:boolean){const [id,...rest]=queue;if(known||id===undefined)return rest;const clean=rest.filter(v=>v!==id);clean.splice(Math.min(3,clean.length),0,id);return clean}
