import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {makeApp,security} from './app.js';
// Carregue .env.local: node --env-file=.env.local server/local.js
const port=Number(process.env.PORT||3000);process.env.SITE_URL||='http://localhost:'+port;
const app=makeApp();
createServer(async(req,res)=>{try{const url=new URL(req.url,process.env.SITE_URL);if(url.pathname.startsWith('/api/')||url.pathname==='/admin'||url.pathname==='/login'||url.pathname.startsWith('/certificado/')){
 let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>12000){res.writeHead(413);res.end();return;}chunks.push(chunk);}
 const response=await app(new Request(url,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)}));res.writeHead(response.status,{...Object.fromEntries(response.headers),'set-cookie':response.headers.getSetCookie()});res.end(Buffer.from(await response.arrayBuffer()));return;}
 const name=url.pathname==='/'?'index.html':url.pathname.slice(1);if(!/^[\w.-]+$/.test(name))throw 0;
 const bytes=await readFile(new URL('../public/'+name,import.meta.url));res.writeHead(200,{...security,'content-type':name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8'});res.end(bytes);
 }catch{res.writeHead(404);res.end('Não encontrado');}}).listen(port,'127.0.0.1',()=>console.log('Preview local em http://localhost:'+port));
