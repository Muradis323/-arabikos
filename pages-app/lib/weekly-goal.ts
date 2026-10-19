import {type Progress} from './course';
import {dayKey} from './streak';
export function weeklyGoal(p:Progress,now=new Date()){
 const start=new Date(now);start.setHours(12,0,0,0);start.setDate(start.getDate()-(start.getDay()+6)%7);
 const from=dayKey(start),end=new Date(start);end.setDate(end.getDate()+6);const to=dayKey(end);
 const ids=new Set(Object.entries(p.lessonCompletions??{}).filter(([day])=>day>=from&&day<=to).flatMap(([,ids])=>ids));
 return {count:ids.size,target:2,from,to,done:ids.size>=2,late:[0,6].includes(now.getDay())};
}
