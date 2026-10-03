import type {Progress} from './course';
type Reply={data:Progress;revision:number;error?:string};
export class ProgressSync {
 private pending:Progress|null=null;
 private running=false;
 private stopped=false;
 private timer:ReturnType<typeof setTimeout>|undefined;
 private uncertain:{data:Progress;revision:number}|null=null;
 private conflict=false;
 constructor(private revision:number,private request:typeof fetch,private status:(pending:boolean,error:string)=>void){}
 get dirty(){return !!this.pending||this.running;}
 enqueue(data:Progress){this.pending=data;this.status(true,'');void this.flush();}
 retry(){if(this.timer)clearTimeout(this.timer);if(!this.conflict)void this.flush();}
 dispose(){this.stopped=true;if(this.timer)clearTimeout(this.timer);}
 private async send(url:string,options:RequestInit={}){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
  try{return await this.request(url,{...options,signal:controller.signal});}finally{clearTimeout(timer);}
 }
 private async flush(){
  if(this.running||this.stopped||this.conflict||!this.pending)return;
  this.running=true;
  try{
   while(this.pending&&!this.stopped){
    if(this.uncertain){
     const r=await this.send('/api/progress',{cache:'no-store'});
     if(!r.ok)throw Error('Не удалось проверить сохранение. Повторим автоматически.');
     const remote=await r.json() as Reply;
     if(remote.revision===this.uncertain.revision){this.uncertain=null;}
     else if(JSON.stringify(remote.data)===JSON.stringify(this.uncertain.data)){
      this.revision=remote.revision;if(this.pending===this.uncertain.data)this.pending=null;this.uncertain=null;if(!this.pending)break;
     }else{this.conflict=true;throw Error('Прогресс изменён в другой вкладке. Не закрывайте эту страницу; завершите работу в одной вкладке.');}
    }
    const data:Progress=this.pending!;this.uncertain={data,revision:this.revision};
    const r=await this.send('/api/progress',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data,revision:this.revision}),keepalive:true});
    if(!r.ok){if(r.status===409){this.conflict=true;this.uncertain=null;throw Error('Прогресс изменён в другой вкладке. Обновите страницу, чтобы загрузить сохранённую версию.');}if(r.status===401){this.conflict=true;throw Error('Сеанс входа истёк. Прогресс ещё не сохранён.');}throw Error('Нет связи с сервером. Продолжайте — повторим сохранение автоматически.');}
    const result=await r.json() as Reply;this.revision=result.revision;this.uncertain=null;
    if(this.pending===data)this.pending=null;
   }
   if(!this.stopped)this.status(!!this.pending,'');
  }catch(e){if(!this.stopped){this.status(true,(e as Error).message);if(!this.conflict)this.timer=setTimeout(()=>void this.flush(),3000);}}
  finally{this.running=false;}
 }
}
