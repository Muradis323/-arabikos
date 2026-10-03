import { env } from 'cloudflare:workers';
import {progressDb} from '../../../db/progress';
import {initial,type Progress} from '../../../lib/course';
import {getChatGPTUser} from '../../chatgpt-auth';
const response=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
export async function GET(){
 try{
  const user=await getChatGPTUser();
  if(!user)return response({error:'Войдите, чтобы открыть личный прогресс.'},401);
  const db=progressDb(), id='user:'+user.userId;
  let row=await db.prepare('SELECT data, revision FROM progress WHERE id = ?').bind(id).first<{data:string,revision:number}>();
  // One-time owner migration, guarded by the platform-verified email and a server secret.
  const owner=(env as unknown as {LEGACY_OWNER_EMAIL?:string}).LEGACY_OWNER_EMAIL;
  if(!row && owner && user.email.toLowerCase()===owner.toLowerCase()){
   await db.prepare('INSERT OR IGNORE INTO progress (id,data,revision) SELECT ?,data,revision FROM progress WHERE id = ?').bind(id,'owner').run();
   row=await db.prepare('SELECT data, revision FROM progress WHERE id = ?').bind(id).first<{data:string,revision:number}>();
  }
  return response({data:row?JSON.parse(row.data):initial,revision:row?.revision??0});
 }catch(e){console.error(e);return response({error:'Не удалось загрузить прогресс. Попробуйте ещё раз.'},503);}
}
function valid(data:Progress){
 if(!data||!Array.isArray(data.completed)||!Number.isInteger(data.lesson)||data.lesson<0||data.lesson>9||!Number.isInteger(data.step)||data.step<0||data.step>22)return false;
 if(data.completed.length>10||data.completed.some((v,i)=>v!==i)||data.lesson!==Math.min(data.completed.length,9))return false;
 if(!data.reviews||!data.days||Array.isArray(data.reviews)||Array.isArray(data.days))return false;
 for(const [id,r] of Object.entries(data.reviews))if(!/^\d{1,2}$/.test(id)||!data.completed.includes(Math.floor(Number(id)/10))||!r||!Number.isInteger(r.level)||r.level<0||r.level>9||!Number.isFinite(r.due)||r.due<0||!Number.isInteger(r.seen)||r.seen<0)return false;
 return Object.entries(data.days).every(([d,n])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isInteger(n)&&n>=0);
}
export async function PUT(req:Request){
 try{
  const user=await getChatGPTUser();
  if(!user)return response({error:'Войдите, чтобы сохранять прогресс.'},401);
  const origin=req.headers.get('origin');
  if((origin&&origin!==new URL(req.url).origin)||req.headers.get('sec-fetch-site')==='cross-site')return response({error:'Недопустимый источник запроса.'},403);
  if(!req.headers.get('content-type')?.includes('application/json'))return response({error:'Ожидается JSON.'},415);
  const text=await req.text();if(text.length>100000)return response({error:'Слишком большой запрос.'},413);
  const {data,revision}=JSON.parse(text) as {data:Progress;revision:number};
  if(!valid(data)||!Number.isInteger(revision)||revision<0)return response({error:'Некорректные данные.'},400);
  const db=progressDb(),id='user:'+user.userId;
  const [,result]=await db.batch([
   db.prepare('INSERT OR IGNORE INTO progress (id,data,revision) VALUES (?,?,0)').bind(id,JSON.stringify(initial)),
   db.prepare('UPDATE progress SET data = ?, revision = revision + 1 WHERE id = ? AND revision = ?').bind(JSON.stringify(data),id,revision)
  ]);
  if(!result.meta.changes)return response({error:'Прогресс изменился в другой вкладке. Обновите страницу.'},409);
  return response({revision:revision+1});
 }catch(e){console.error(e);return response({error:'Не удалось сохранить. Повторите действие.'},503);}
}
