import {err} from './helpers.js';
export function database(env,fetcher=fetch){
 const base=env.SUPABASE_URL?.replace(/\/$/,'');
 function configured(){if(!base||!env.SUPABASE_SECRET_KEY||!env.SUPABASE_PUBLISHABLE_KEY)throw err('Configure SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY e SUPABASE_SECRET_KEY na Vercel.',503);}
 async function request(path,{data,publicKey=false,token,method}={}){
  configured();const key=publicKey?env.SUPABASE_PUBLISHABLE_KEY:env.SUPABASE_SECRET_KEY;
  const headers={apikey:key,'content-type':'application/json'};
  if(token)headers.Authorization='Bearer '+token;
  else if(!key.startsWith('sb_'))headers.Authorization='Bearer '+key;
  let res;try{res=await fetcher(base+path,{method:method||(data?'POST':'GET'),headers,body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(15000),cache:'no-store'});}catch{throw err('Não foi possível conectar ao Supabase. Tente novamente.',503);}
  const result=await res.json().catch(()=>null);
  if(!res.ok){
   if(path.startsWith('/auth/'))throw err('E-mail ou senha inválidos, sessão expirada ou conta ainda não confirmada.',401);
   if(result?.message?.includes('presence_required'))throw err('Certificados são permitidos apenas para presenças confirmadas.',409);
   if(result?.message?.includes('settings_required'))throw err('Confirme as condições de certificação desta palestra antes de emitir.',409);
   if(result?.code==='23503')throw err('Inscrição ou palestra não encontrada.',404);
   if(result?.code==='23514'||result?.code==='22P02')throw err('Dados inválidos. Confira os campos enviados.',400);
   if(result?.code==='PGRST202'||result?.code==='42P01')throw err(path.includes('semad_chat_reserve')?'Execute supabase/02-chat-openai.sql no SQL Editor do Supabase.':'Execute supabase/01-schema.sql no SQL Editor do Supabase.',503);
   throw err('O banco não concluiu a operação. Confira as variáveis e o SQL no Supabase.',503);
  }return result;
 }
 return {request,rpc:(name,data={})=>request('/rest/v1/rpc/'+name,{data})};
}
