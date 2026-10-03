export function repeatLabel(due:number,now:number){
 const delta=due-now;if(delta<=0)return 'Пора повторить';
 const minutes=Math.ceil(delta/60000);let delay:string;
 if(minutes<60)delay=`${minutes} мин`;
 else if(minutes<1440){const hours=Math.floor(minutes/60),rest=minutes%60;delay=`${hours} ч${rest?' '+rest+' мин':''}`;}
 else delay=`${Math.ceil(minutes/1440)} дн`;
 const date=new Date(due).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
 return `Повторение через ${delay} · ${date}`;
}
