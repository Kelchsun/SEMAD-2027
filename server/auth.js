import {err} from './helpers.js';
export const allowed=(email,env)=>!!email&&(env.ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
export function cookies(request){return Object.fromEntries((request.headers.get('cookie')||'').split(';').map(x=>{const i=x.indexOf('=');return i<0?[]:[x.slice(0,i).trim(),x.slice(i+1)];}).filter(x=>x.length===2));}
export function sessionCookies(tokens,secure=true){const flags=`; Path=/; HttpOnly; SameSite=Lax${secure?'; Secure':''}`;if(!tokens)return ['semad_access=; Max-Age=0'+flags,'semad_refresh=; Max-Age=0'+flags];return ['semad_access='+tokens.access_token+'; Max-Age='+Math.min(Number(tokens.expires_in)||3600,86400)+flags,'semad_refresh='+tokens.refresh_token+'; Max-Age=604800'+flags];}
export async function authenticate(request,db,env,setCookies){
 const c=cookies(request);let user,tokens;
 if(c.semad_access){try{user=await db.request('/auth/v1/user',{publicKey:true,token:c.semad_access});}catch(e){if(e.status!==401)throw e;}}
 if(!user&&c.semad_refresh){try{tokens=await db.request('/auth/v1/token?grant_type=refresh_token',{publicKey:true,data:{refresh_token:c.semad_refresh}});user=tokens?.user;}catch(e){if(e.status!==401)throw e;}}
 if(!user?.id)throw err('Entre com sua conta administrativa.',401);
 if(!allowed(user.email,env))throw err('Esta conta não tem permissão de administrador.',403);
 if(tokens)setCookies(sessionCookies(tokens,new URL(request.url).protocol==='https:'));
 return user;
}
