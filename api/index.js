import {makeApp} from '../server/app.js';
export default async function handler(req,res){
 try{
  const original=new URL(req.url,'https://vercel.local');
  const route=original.searchParams.get('route')||original.pathname;
  original.searchParams.delete('route');
  const origin=process.env.SITE_URL||'https://'+req.headers.host;
  const target=new URL(route,origin);target.search=original.search;
  const headers=new Headers();for(const [key,value] of Object.entries(req.headers))if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(','):String(value));
  let body;
  if(!['GET','HEAD'].includes(req.method)){
   if(req.body!==undefined)body=typeof req.body==='string'||Buffer.isBuffer(req.body)?req.body:JSON.stringify(req.body);
   else {const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>12000){res.statusCode=413;res.end('Dados excedem o limite.');return;}chunks.push(chunk);}body=Buffer.concat(chunks);}
  }
  const result=await makeApp()(new Request(target,{method:req.method,headers,body}));
  res.statusCode=result.status;
  for(const [key,value] of result.headers)if(key!=='set-cookie')res.setHeader(key,value);
  const cookies=result.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
  res.end(Buffer.from(await result.arrayBuffer()));
 }catch{res.statusCode=500;res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');res.end(JSON.stringify({message:'Não foi possível processar. Confira as variáveis do projeto e tente novamente.'}));}
}
