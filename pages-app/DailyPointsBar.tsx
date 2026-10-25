import {DAILY_POINT_GOAL,dailyPoints} from './lib/daily-points';
import {type Progress} from './lib/course';
export function DailyPointsBar({progress,now}:{progress:Progress;now:number}){
 const points=dailyPoints(progress,new Date(now)),full=points>=DAILY_POINT_GOAL;
 return <div className={'daily-points-bar '+(full?'goal-reached':'')} title="Слово — 1 балл · предложение — 3 балла"><div className="daily-points-caption"><span>{full?'Дневная цель выполнена':'Сегодня'}</span><strong aria-live="polite">{points} / {DAILY_POINT_GOAL}<small> баллов</small></strong></div><div className="daily-points-track" role="progressbar" aria-label="Баллы за сегодня" aria-valuemin={0} aria-valuemax={DAILY_POINT_GOAL} aria-valuenow={Math.min(points,DAILY_POINT_GOAL)} aria-valuetext={`${points} из ${DAILY_POINT_GOAL} баллов`}><i style={{width:Math.min(100,points/DAILY_POINT_GOAL*100)+'%'}}/></div></div>;
}
