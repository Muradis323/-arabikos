import {type Progress,lessons} from './course';
import {dayKey} from './streak';
export const DAILY_POINT_GOAL=60;
export function dailyPoints(progress:Progress,date=new Date()){return progress.dailyPoints?.[dayKey(date)]??0}
export function awardPoints(progress:Progress,points:number,date=new Date()):Progress{
 if(!Number.isSafeInteger(points)||points<=0)return progress;
 const key=dayKey(date),total=dailyPoints(progress,date)+points;
 if(!Number.isSafeInteger(total))return progress;
 return {...progress,dailyPoints:{...progress.dailyPoints,[key]:total}};
}
/** New word / word task = 1, full sentence = 3, four matching pairs = 4. */
export function lessonStepPoints(id:number,step:number){
 const wordCount=lessons[id].words.length;if(step<wordCount)return 1;if(step<wordCount+3)return 3;
 const index=step-wordCount-3;
 if(index<10)return index===3||index===6?4:index>=7?3:1;
 const type=(index-10)%5;return type===2?4:type===4?3:1;
}
