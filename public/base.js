
const CONFIG={
 apiUrl:"/api/registrations",chatUrl:"/api/chat",                       // inscrições conectadas ao banco; assistente sem serviço configurado
 start:"2027-03-15T00:00:00-03:00",              // provisório: início do dia 15/03 (Brasília)
 end:"2027-03-19T23:59:59-03:00",
 privacidade:{responsavel:"[PENDENTE: definir responsável e contato]",retencao:"[PENDENTE: definir prazo de retenção]"},
 dias:[
  {d:"15 de março",t:[["Administração e transformação","A Administração na era da Inteligência Artificial","Panorama de como a IA redefine o papel do administrador e das organizações."],["Administração e transformação","Da transformação digital à transformação das decisões","Como a tecnologia passa de ferramenta de apoio a parte do processo decisório."]]},
  {d:"16 de março",t:[["Pessoas e trabalho","Liderança e competências em organizações orientadas por IA","Que habilidades humanas ganham valor quando as máquinas assumem tarefas."],["Pessoas e trabalho","O futuro do trabalho e o papel do administrador","Mudanças nas carreiras, nas equipes e na cultura organizacional."]]},
  {d:"17 de março",t:[["Processos e dados","Automação de processos: da rotina à geração de valor","Onde automatizar, o que manter sob decisão humana e como medir resultados."],["Processos e dados","Dados e inteligência artificial na tomada de decisão","Do dado bruto à decisão: possibilidades, limites e cuidados."]]},
  {d:"18 de março",t:[["Estratégia e mercado","IA, experiência do cliente e novas estratégias de negócio","Como a IA muda a relação com clientes e a competição entre empresas."],["Estratégia e mercado","Inovação e empreendedorismo na economia da inteligência","Oportunidades de negócios e novos modelos na era da IA."]]},
  {d:"19 de março",t:[["Ética e futuro","Ética, governança e responsabilidade no uso da IA","Transparência, supervisão humana e critérios para o uso responsável."],["Ética e futuro","Conexões que transformam: perspectivas para o futuro da gestão","Encerramento: o que levar da SEMAD 2027 para a prática profissional."]]}
 ]};
const $=id=>document.getElementById(id),p2=n=>String(n).padStart(2,"0");
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,FINE=matchMedia("(hover:hover) and (pointer:fine)").matches;
// cabeçalho
const hd=$("hd"),mb=$("mb");
addEventListener("scroll",()=>hd.classList.toggle("on",scrollY>40),{passive:true});
function menu(o){hd.classList.toggle("open",o);mb.setAttribute("aria-expanded",o);mb.setAttribute("aria-label",o?"Fechar menu":"Abrir menu");$("mp").setAttribute("d",o?"M5 5l16 16M21 5L5 21":"M3 7h20M3 13h20M3 19h20")}
mb.onclick=()=>menu(!hd.classList.contains("open"));
$("nv").onclick=e=>{if(e.target.tagName==="A")menu(false)};
addEventListener("keydown",e=>{if(e.key==="Escape"&&hd.classList.contains("open")){menu(false);mb.focus()}});
// contagem
const T0=new Date(CONFIG.start).getTime(),T1=new Date(CONFIG.end).getTime();let lastA="";
function tick(){const n=Date.now();
 if(n<T0){const s=Math.max(0,Math.floor((T0-n)/1000));const v={d:Math.floor(s/86400),h:Math.floor(s%86400/3600),m:Math.floor(s%3600/60),s:s%60};
  for(const k in v){const el=$(k),t=p2(v[k]);if(el.textContent!==t){el.textContent=t;if(!RM){el.classList.remove("t");void el.offsetWidth;el.classList.add("t")}}}
  const a=`Faltam ${v.d} dias para a SEMAD 2027.`;if(a!==lastA){$("cds").textContent=a;lastA=a}return}
 $("cdn").hidden=true;const m=$("cdm");m.hidden=false;m.textContent=n<=T1?"A SEMAD começou!":"Até a próxima edição!";clearInterval(iv)}
const iv=setInterval(tick,1000);tick();
// programação
const tabs=$("tabs"),evs=$("evs");let cur=0,opener=null;
CONFIG.dias.forEach((x,i)=>{const b=document.createElement("button");b.role="tab";b.id="tb"+i;b.setAttribute("aria-label",x.d);
 const [n,...r]=x.d.split(" "),mes=r.at(-1)||"";const nb=document.createElement("b"),dl=document.createElement("span"),ds=document.createElement("span");
 nb.textContent=n;dl.className="dl";dl.textContent=" "+r.join(" ");ds.className="ds";ds.textContent=mes.slice(0,3);ds.setAttribute("aria-hidden","true");
 b.append(nb,dl,ds);b.setAttribute("aria-controls","evs");b.onclick=()=>show(i,true);tabs.append(b)});
const ind=document.createElement("span");ind.className="ind";ind.setAttribute("aria-hidden","true");tabs.append(ind);
const tabBtns=()=>[...tabs.querySelectorAll("button")];
function moveInd(){const b=tabBtns()[cur];if(b){ind.style.left=b.offsetLeft+"px";ind.style.width=b.offsetWidth+"px"}}
addEventListener("resize",moveInd);addEventListener("load",moveInd);document.fonts?.ready.then(moveInd);
function show(i,f){cur=i;tabBtns().forEach((b,j)=>{b.setAttribute("aria-selected",j===i);b.tabIndex=j===i?0:-1});if(f)tabBtns()[i].focus();moveInd();
 evs.setAttribute("aria-labelledby","tb"+i);evs.innerHTML="";if(f&&!RM){evs.classList.remove("swap");void evs.offsetWidth;evs.classList.add("swap")}
 CONFIG.dias[i].t.forEach((t,j)=>{const a=document.createElement("article");a.innerHTML=`<span class="cat"></span><h3></h3><p></p><span class="m">Horário: A confirmar · Palestrante: A confirmar</span><button class="btn" type="button">Ver detalhes</button>`;
  a.querySelector(".cat").textContent=t[0];a.querySelector("h3").textContent=t[1];a.querySelector("p").textContent=t[2];
  a.querySelector("button").onclick=e=>{opener=e.currentTarget;$("dc").textContent=t[0];$("dt").textContent=t[1];$("dr").textContent=t[2];$("dh").textContent="A confirmar";$("dp").textContent="A confirmar";$("dlg").showModal()};evs.append(a)})}
tabs.onkeydown=e=>{const k={ArrowRight:1,ArrowLeft:-1}[e.key];if(k){e.preventDefault();show((cur+k+5)%5,true)}};
show(0);
$("dx").onclick=()=>$("dlg").close();
$("dlg").addEventListener("close",()=>opener&&opener.focus());
$("dlg").addEventListener("click",e=>{if(e.target===$("dlg"))$("dlg").close()});
// assistente
const cw=$("cw"),cl=$("cl"),cf=$("cf");let CH=[],cb=false;
const co=$("co"),small=matchMedia("(max-width:600px)");
function cx(){cw.hidden=true;co.hidden=false;co.setAttribute("aria-expanded","false");document.body.classList.remove("chat-open");co.focus()}
co.onclick=()=>{cw.hidden=false;co.hidden=true;co.setAttribute("aria-expanded","true");document.body.classList.add("chat-open");cl.scrollTop=cl.scrollHeight;if(!small.matches)$("ci").focus()};$("cc").onclick=cx;
cw.addEventListener("keydown",e=>{if(e.key==="Escape")cx()});
function add(t,w){const d=document.createElement("p");d.className="m "+w;d.textContent=t;cl.append(d);cl.scrollTop=cl.scrollHeight;return d}
function typing(){const d=document.createElement("p");d.className="m a typing";d.setAttribute("aria-label","O assistente está digitando");d.innerHTML="<i></i><i></i><i></i>";cl.append(d);cl.scrollTop=cl.scrollHeight;return d}
cl.querySelectorAll(".ch button").forEach(b=>b.onclick=()=>{$("ci").value=b.textContent;cf.requestSubmit()});
cf.onsubmit=async e=>{e.preventDefault();const t=$("ci").value.trim();if(!t||cb)return;$("ci").value="";cl.querySelector(".ch")?.remove();add(t,"u");
 if(!CONFIG.chatUrl){add("O assistente só funciona quando o site roda com o servidor. Consulte a seção Dúvidas.","a");return}
 CH.push({role:"user",content:t});cb=true;$("cs").disabled=true;const w=typing();
 try{const r=await fetch(CONFIG.chatUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mensagens:CH.slice(-7)})});const j=await r.json();if(!r.ok)throw new Error(j.message||"O assistente não conseguiu responder. Consulte Dúvidas.");
  w.remove();add(j.resposta,"a");CH.push({role:"assistant",content:j.resposta});if(j.escalou)add("Essa informação ainda não foi divulgada. A organização vai publicá-la no site.","n")}
 catch(error){w.remove();add(error instanceof TypeError?"Falha de conexão. Consulte Dúvidas ou tente novamente.":error.message,"a");CH.pop()}
 cb=false;$("cs").disabled=false;if(!small.matches)$("ci").focus()};
// inscrição
$("pv-r").textContent=CONFIG.privacidade.responsavel;$("pv-p").textContent=CONFIG.privacidade.retencao;
const F=$("f"),ST=$("st"),GO=$("go"),startedAt=Date.now();let busy=false;
function stat(c,t){ST.className="st show "+c;ST.textContent=t;ST.focus()}
function setErr(id,msg,el){$("e-"+id).textContent=msg?"Erro: "+msg:"";el.setAttribute("aria-invalid",!!msg)}
function validate(){let first=null;const bad=(id,el,m)=>{setErr(id,m,el);if(m&&!first)first=el};
 const n=F.nome.value.trim(),em=F.email.value.trim();
 bad("nome",F.nome,n.length<3?"informe seu nome completo.":"");
 bad("email",F.email,!em?"informe seu e-mail.":!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)?"e-mail em formato inválido. Exemplo: nome@dominio.com.":"");
 bad("perfil",F.perfil,F.perfil.value?"":"selecione seu perfil.");
 bad("priv",$("priv"),$("priv").checked?"":"confirme que leu o aviso de privacidade.");
 if(first)first.focus();return !first}
F.addEventListener("submit",async e=>{e.preventDefault();if(busy)return;ST.className="st";
 if(!validate())return;
 const d={name:F.nome.value.trim(),email:F.email.value.trim(),profile:F.perfil.value,course:F.curso.value.trim(),institution:F.instituicao.value.trim(),
  interests:[...F.querySelectorAll("[name=temas]:checked")].map(x=>x.value),privacy:true,marketing:F.divulgacao.checked,website:F.site.value,startedAt};
 if(!CONFIG.apiUrl){stat("info","Modo de demonstração: o servidor de inscrições não está configurado e nada foi gravado. Seus dados são válidos, mas a inscrição não foi registrada.");return}
 busy=true;GO.disabled=true;GO.textContent="Enviando…";
 try{const r=await fetch(CONFIG.apiUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});
  let j={};try{j=await r.json()}catch{}
  if(r.ok&&j.id){F.hidden=true;$("rc").classList.add("show");$("rc-id").textContent=j.id;$("rc-n").textContent=d.name;$("rc-e").textContent=d.email;$("rc").scrollIntoView({block:"center"})}
  else if(r.status===409)stat("bad","Este e-mail já está inscrito na SEMAD 2027. Se foi você, use o comprovante anterior.");
  else if(r.status===422&&j.campos){for(const k in j.campos){const el=F[k];if($("e-"+k))setErr(k,j.campos[k],el)}stat("bad","Corrija os campos indicados e envie novamente.")}
  else if(r.status===429)stat("bad","Muitas tentativas. Aguarde alguns minutos e tente de novo.");
  else stat("bad",j.message||"Não foi possível gravar sua inscrição. Seus dados continuam no formulário: tente novamente.")}
 catch{stat("bad","Falha de conexão. Seus dados continuam no formulário: verifique a internet e tente novamente.")}
 finally{busy=false;GO.disabled=false;GO.textContent="Confirmar minha inscrição"}});

$("print-receipt").addEventListener("click",()=>print());

// ===== interações =====
// Abertura: as luzes do palco acendem.
const hero=document.querySelector(".hero"),heroImg=hero.querySelector("img"),h1=hero.querySelector("h1");
// Título em letras individuais (palavras não quebram no meio).
(function(){const chars=[];(function walk(n,red){n.childNodes.forEach(c=>{if(c.nodeType===3)[...c.textContent].forEach(ch=>chars.push({ch,red}));else walk(c,red||c.tagName==="B")})})(h1,false);
 h1.setAttribute("aria-label",h1.textContent.trim());h1.textContent="";let wd=null;
 chars.forEach(({ch,red})=>{if(ch===" "){h1.append(" ");wd=null;return}
  if(!wd){wd=document.createElement("span");wd.className="wd";wd.setAttribute("aria-hidden","true");h1.append(wd)}
  const s=document.createElement("span");s.className="lt"+(red?" r":"");s.textContent=ch;wd.append(s)})})();
const letters=[...h1.querySelectorAll(".lt")];
requestAnimationFrame(()=>requestAnimationFrame(()=>hero.classList.add("ready")));
if(FINE&&!RM){
 // Holofote que segue o cursor + leve paralaxe da imagem + peso das letras pela proximidade.
 const spot=document.createElement("div");spot.className="spot";spot.setAttribute("aria-hidden","true");heroImg.after(spot);hero.classList.add("lit");
 let tx=.72,ty=.3,cx=tx,cy=ty,mx=-1e4,my=-1e4,raf=0;
 const loop=()=>{if(!raf)raf=requestAnimationFrame(step)};
 function step(){raf=0;cx+=(tx-cx)*.1;cy+=(ty-cy)*.1;
  hero.style.setProperty("--sx",(cx*100).toFixed(2)+"%");hero.style.setProperty("--sy",(cy*100).toFixed(2)+"%");
  hero.style.setProperty("--px",((.5-cx)*16).toFixed(2)+"px");hero.style.setProperty("--py",((.5-cy)*10).toFixed(2)+"px");
  letters.forEach(l=>{const b=l.getBoundingClientRect(),d=Math.hypot(b.left+b.width/2-mx,b.top+b.height/2-my);l.style.fontWeight=Math.round(300+500*Math.max(0,1-d/240))});
  if(Math.abs(tx-cx)>.0005||Math.abs(ty-cy)>.0005)loop()}
 hero.addEventListener("pointermove",e=>{const r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width;ty=(e.clientY-r.top)/r.height;mx=e.clientX;my=e.clientY;loop()});
 hero.addEventListener("pointerleave",()=>{tx=.72;ty=.3;mx=my=-1e4;loop()});
 // Botões principais atraídos pelo cursor.
 document.querySelectorAll(".hero .acts .btn,.cd .btn,.fin .btn").forEach(b=>{
  b.addEventListener("pointermove",e=>{const r=b.getBoundingClientRect();b.style.translate=`${((e.clientX-r.left-r.width/2)*.2).toFixed(1)}px ${((e.clientY-r.top-r.height/2)*.35).toFixed(1)}px`});
  b.addEventListener("pointerleave",()=>b.style.translate="")});
 // Imagens editoriais inclinam conforme o cursor, com reflexo de luz.
 document.querySelectorAll(".ed figure").forEach(f=>{
  f.addEventListener("pointermove",e=>{const r=f.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
   f.style.setProperty("--ry",((x-.5)*7).toFixed(2)+"deg");f.style.setProperty("--rx",((.5-y)*7).toFixed(2)+"deg");f.style.setProperty("--gx",(x*100).toFixed(1)+"%");f.style.setProperty("--gy",(y*100).toFixed(1)+"%")});
  f.addEventListener("pointerleave",()=>{f.style.setProperty("--rx","0deg");f.style.setProperty("--ry","0deg")})});
}
// Menu marca a seção que está na tela.
const navLinks=[...document.querySelectorAll("#nv a")];
if("IntersectionObserver" in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)navLinks.forEach(a=>a.classList.toggle("cur",a.getAttribute("href")==="#"+e.target.id))}),{rootMargin:"-45% 0px -50% 0px"});
 navLinks.forEach(a=>{const s=document.querySelector(a.getAttribute("href"));if(s)io.observe(s)})}
$("privacy-link").addEventListener("click",()=>document.querySelector(".pv").open=true);
