import {intervals} from './course';
export function scheduleReview(old:{level:number;seen:number;misses?:number},known:boolean,now:number){
 const level=known?Math.min(old.level+1,intervals.length):Math.max(0,old.level-1);
 return {level,due:now+intervals[Math.max(0,level-1)],seen:old.seen+1,misses:(old.misses??0)+(known?0:1),lastKnown:known};
}
