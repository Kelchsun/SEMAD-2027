import {validateMessages,answerChat} from './chat.js';
import {readFile} from 'node:fs/promises';
import {createHmac} from 'node:crypto';
import {activities} from './config.js';
import {err,validateRegistration,certificatePage,sendEmail} from './helpers.js';
import {database} from './supabase.js';
import {authenticate,allowed,cookies,sessionCookies} from './auth.js';
export const security={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
const activity=x=>{if(!activities.some(a=>a.id===x))throw err('Selecione uma palestra válida.');return x;};
async function input(req){if(Number(req.headers.get('content-length'))>12000)throw err('Dados excedem o limite permitido.',413);const text=await req.text();if(text.length>12000)throw err('Dados excedem o limite permitido.',413);try{const d=JSON.parse(text);if(!d||typeof d!=='object'||Array.isArray(d))throw 0;return d;}catch{throw err('Dados inválidos.');}}
export function makeApp({env=process.env,fetcher=fetch,db:injectedDB}={}){
 const db=injectedDB||database(env,fetcher);
 const emailReady=()=>!!(env.RESEND_API_KEY&&env.CERTIFICATE_FROM);
 return async function app(req){
 let setCookie=[];const setCookies=c=>setCookie=c;
 const respond=(data,status=200,type='application/json; charset=utf-8',more={})=>{const h=new Headers({...security,'content-type':type,...more});for(const c of setCookie)h.append('set-cookie',c);return new Response(type.startsWith('application/json')?JSON.stringify(data):data,{status,headers:h});};
 try{
  const url=new URL(req.url),path=url.pathname;const site=env.SITE_URL?new URL(env.SITE_URL).origin:null;
  if(req.method==='POST'){
   if(!site)throw err('Configure SITE_URL com o endereço principal do site na Vercel.',503);
   if(req.headers.get('origin')!==site)throw err('Origem da solicitação inválida. Abra o endereço principal do site.',403);
   if(req.headers.get('content-type')?.split(';')[0]!=='application/json')throw err('Formato inválido.',415);
  }
  async function rate(scope,limit){
   if(!env.SUPABASE_SECRET_KEY)throw err('Configure a conexão com o Supabase na Vercel.',503);
   const ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
   const key=scope+':'+createHmac('sha256',env.SUPABASE_SECRET_KEY).update(ip).digest('hex')+':'+Math.floor(Date.now()/60000);
   if(!await db.rpc('semad_rate',{p_key:key,p_limit:limit}))throw err('Muitas tentativas. Aguarde um minuto e tente novamente.',429);
  }
  if(path==='/api/chat'&&req.method==='POST'){
   if(!env.GEMINI_API_KEY)throw err('O assistente ainda não foi ativado. Consulte a seção Dúvidas.',503);
   const x=await input(req);const messages=validateMessages(x.mensagens);
   await rate('chat',6);
   if(!await db.rpc('semad_rate',{p_key:'chat-global:'+Math.floor(Date.now()/60000),p_limit:30}))throw err('O assistente está com muitos acessos. Tente novamente em um minuto.',429);
   const limit=Number(env.CHAT_DAILY_LIMIT||200);
   if(!Number.isInteger(limit)||limit<0||limit>5000)throw err('A organização precisa conferir CHAT_DAILY_LIMIT.',503);
   if(!await db.rpc('semad_chat_reserve',{p_limit:limit}))throw err('O assistente atingiu o limite diário. Consulte Dúvidas ou retorne amanhã.',429);
   return respond(await answerChat({messages,env,fetcher}));
  }
  if(path==='/api/login'&&req.method==='POST'){
   await rate('login',8);const x=await input(req);const email=String(x.email||'').trim().toLowerCase();
   if(email.length>254||typeof x.password!=='string'||x.password.length>200||!x.password)throw err('Informe e-mail e senha válidos.');
   const tokens=await db.request('/auth/v1/token?grant_type=password',{publicKey:true,data:{email,password:x.password}});
   if(!tokens?.access_token||!tokens?.refresh_token||!allowed(tokens.user?.email,env))throw err('E-mail, senha ou permissão administrativa inválidos.',403);
   setCookies(sessionCookies(tokens,url.protocol==='https:'));return respond({ok:true});
  }
  if(path==='/api/logout'&&req.method==='POST'){
   const c=cookies(req);if(c.semad_access){try{await db.request('/auth/v1/logout',{publicKey:true,token:c.semad_access,method:'POST'});}catch{}}
   setCookies(sessionCookies(null,url.protocol==='https:'));return respond({ok:true});
  }
  if(path==='/api/registrations'&&req.method==='POST'){
   await rate('registration',8);const x=validateRegistration(await input(req));const r=await db.rpc('semad_register',{p_data:{...x,privacy:true}});
   if(r?.duplicate)throw err('Não foi criada outra inscrição. O cadastro original desse e-mail foi mantido.',409);
   if(!r?.id)throw err('O banco não confirmou a gravação. Tente novamente.',503);
   return respond(r,201);
  }
  if(path==='/login'&&req.method==='GET')return respond(await readFile(new URL('./login.html',import.meta.url),'utf8'),200,'text/html; charset=utf-8');
  if(path==='/admin'&&req.method==='GET'){
   try{await authenticate(req,db,env,setCookies);}catch(e){if(e.status===401||e.status===403)return respond('',303,'text/html',{location:'/login'});throw e;}
   return respond(await readFile(new URL('./admin.html',import.meta.url),'utf8'),200,'text/html; charset=utf-8');
  }
  if(path==='/api/session'&&req.method==='GET'){const u=await authenticate(req,db,env,setCookies);return respond({admin:true,email:u.email,emailReady:emailReady()});}
  if(path.startsWith('/api/admin/')){
   const u=await authenticate(req,db,env,setCookies);
   if(path==='/api/admin/overview'&&req.method==='GET')return respond({...await db.rpc('semad_overview'),emailReady:emailReady()});
   if(path==='/api/admin/registrations'&&req.method==='GET'){
    const filter=url.searchParams.get('status')||'all';if(!['all','present','absent','unchecked'].includes(filter))throw err('Filtro inválido.');
    return respond(await db.rpc('semad_list',{p_activity:activity(url.searchParams.get('activity')),p_query:(url.searchParams.get('q')||'').slice(0,120),p_status:filter,p_page:Math.max(0,Math.min(10000,Math.floor(Number(url.searchParams.get('page'))||0)))}));
   }
   if(path==='/api/admin/audit'&&req.method==='GET')return respond(await db.request('/rest/v1/semad_audit?select=action,subject,actor,created_at&order=created_at.desc&limit=100'));
   if(req.method!=='POST')throw err('Rota não encontrada.',404);
   const x=await input(req);activity(x.activity);
   if(path==='/api/admin/settings'){
    if(typeof x.confirmed!=='boolean'||!Number.isFinite(x.hours)||x.hours<0||x.hours>24||typeof x.issuer!=='string'||x.issuer.length>160||(x.confirmed&&(x.hours<=0||x.issuer.trim().length<3)))throw err('Confira carga horária (0 a 24h) e responsável antes de liberar.');
    await db.rpc('semad_set_settings',{p_activity:x.activity,p_confirmed:x.confirmed,p_hours:x.hours,p_issuer:x.issuer.trim(),p_actor:u.email});return respond({ok:true});
   }
   if(!uuid(x.id))throw err('Identificador de inscrição inválido.');
   if(path==='/api/admin/attendance'){
    if(!['present','absent','unchecked'].includes(x.status))throw err('Presença inválida.');
    await db.rpc('semad_set_attendance',{p_id:x.id,p_activity:x.activity,p_status:x.status,p_actor:u.email});return respond({ok:true});
   }
   if(path==='/api/admin/certificates'){
    if(!['issue','send'].includes(x.action))throw err('Ação inválida.');
    if(x.action==='send'&&!emailReady())throw err('Sem serviço de e-mail configurado. Use Abrir / salvar PDF e envie manualmente.',503);
    const c=await db.rpc('semad_issue',{p_id:x.id,p_activity:x.activity,p_actor:u.email});
    if(!c?.id)throw err('O banco não confirmou a emissão.',503);
    if(x.action==='send'){
     try{await sendEmail(env,c,activities.find(a=>a.id===x.activity),site);await db.rpc('semad_email_result',{p_id:c.id,p_state:'accepted',p_error:null,p_actor:u.email});}
     catch(e){await db.rpc('semad_email_result',{p_id:c.id,p_state:'failed',p_error:e.message?.slice(0,300)||'Falha no envio',p_actor:u.email});throw e;}
    }
    return respond({id:c.id,url:'/certificado/'+c.id,sent:x.action==='send'});
   }
  }
  if(path.startsWith('/certificado/')&&req.method==='GET'){
   const id=path.split('/')[2];if(!uuid(id))throw err('Certificado não encontrado.',404);
   const c=await db.rpc('semad_get_certificate',{p_id:id});const a=activities.find(a=>a.id===c?.activity_id);
   if(!c||!a)throw err('Certificado indisponível ou revogado. Consulte a organização.',404);
   return respond(certificatePage(c,a,site||url.origin),200,'text/html; charset=utf-8',{'x-robots-tag':'noindex, nofollow'});
  }
  throw err('Página ou endpoint não encontrado.',404);
 }catch(e){return respond({message:e.status?e.message:'Ocorreu uma falha no servidor. Nenhuma operação foi confirmada. Tente novamente.'},e.status||500);}
 };
}
