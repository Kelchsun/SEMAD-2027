
const CONFIG={
 apiUrl:"/api/registrations",chatUrl:"/api/chat",                       // inscrições conectadas ao banco; assistente sem serviço configurado
 start:"2027-03-15T00:00:00-03:00",              // provisório: início do dia 15/03 (Brasília)
 end:"2027-03-19T23:59:59-03:00",
 privacidade:{responsavel:"[PENDENTE: definir responsável e contato]",retencao:"[PENDENTE: definir prazo de retenção]"},
 dias:[
  {d:"15 de março",w:"Segunda",t:[["Administração e transformação","A Administração na era da Inteligência Artificial","Panorama de como a IA redefine o papel do administrador e das organizações."],["Administração e transformação","Da transformação digital à transformação das decisões","Como a tecnologia passa de ferramenta de apoio a parte do processo decisório."]]},
  {d:"16 de março",w:"Terça",t:[["Pessoas e trabalho","Liderança e competências em organizações orientadas por IA","Que habilidades humanas ganham valor quando as máquinas assumem tarefas."],["Pessoas e trabalho","O futuro do trabalho e o papel do administrador","Mudanças nas carreiras, nas equipes e na cultura organizacional."]]},
  {d:"17 de março",w:"Quarta",t:[["Processos e dados","Automação de processos: da rotina à geração de valor","Onde automatizar, o que manter sob decisão humana e como medir resultados."],["Processos e dados","Dados e inteligência artificial na tomada de decisão","Do dado bruto à decisão: possibilidades, limites e cuidados."]]},
  {d:"18 de março",w:"Quinta",t:[["Estratégia e mercado","IA, experiência do cliente e novas estratégias de negócio","Como a IA muda a relação com clientes e a competição entre empresas."],["Estratégia e mercado","Inovação e empreendedorismo na economia da inteligência","Oportunidades de negócios e novos modelos na era da IA."]]},
  {d:"19 de março",w:"Sexta",t:[["Ética e futuro","Ética, governança e responsabilidade no uso da IA","Transparência, supervisão humana e critérios para o uso responsável."],["Ética e futuro","Conexões que transformam: perspectivas para o futuro da gestão","Encerramento: o que levar da SEMAD 2027 para a prática profissional."]]}
 ],
 eixos:[
  {e:"Estratégia e decisão",q:"Quem decide quando o algoritmo recomenda?",r:"A IA já sugere preço, estoque e crédito. O eixo discute onde ela melhora a decisão, onde engana e quem assina embaixo.",dias:[0,3]},
  {e:"Pessoas e liderança",q:"O que um líder faz que a IA não faz?",r:"Quando tarefas passam para as máquinas, mudam as carreiras, as equipes e o que se espera de quem lidera.",dias:[1]},
  {e:"Processos e inovação",q:"O que automatizar amanhã, e o que nunca?",r:"Rotina, dados e geração de valor: como escolher o que automatizar e como medir se valeu a pena.",dias:[2]},
  {e:"Ética e responsabilidade",q:"Quem responde quando a IA erra?",r:"Transparência, governança e supervisão humana para usar a tecnologia sem terceirizar a responsabilidade.",dias:[4]}
 ]};
const $=id=>document.getElementById(id),p2=n=>String(n).padStart(2,"0");
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,FINE=matchMedia("(hover:hover) and (pointer:fine)").matches;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
// cabeçalho
const hd=$("hd"),mb=$("mb");
function menu(o){hd.classList.toggle("open",o);mb.setAttribute("aria-expanded",o);mb.setAttribute("aria-label",o?"Fechar menu":"Abrir menu");$("mp").setAttribute("d",o?"M5 5l16 16M21 5L5 21":"M3 9h20M3 17h20");document.body.style.overflow=o?"hidden":""}
mb.onclick=()=>menu(!hd.classList.contains("open"));
$("nv").onclick=e=>{if(e.target.tagName==="A")menu(false)};
addEventListener("keydown",e=>{if(e.key==="Escape"&&hd.classList.contains("open")){menu(false);mb.focus()}});
// contagem
const T0=new Date(CONFIG.start).getTime(),T1=new Date(CONFIG.end).getTime();let lastA="";
function tick(){const n=Date.now();
 if(n<T0){const s=Math.max(0,Math.floor((T0-n)/1000));const v={d:Math.floor(s/86400),h:Math.floor(s%86400/3600),m:Math.floor(s%3600/60),s:s%60};
  for(const k in v){const el=$(k),t=k==="d"?String(v[k]):p2(v[k]);if(el.textContent!==t){el.textContent=t;if(!RM){el.classList.remove("t");void el.offsetWidth;el.classList.add("t")}}}
  const a=`Faltam ${v.d} dias para a SEMAD 2027.`;if(a!==lastA){$("cds").textContent=a;lastA=a}return}
 $("cdn").hidden=true;const m=$("cdm");m.hidden=false;m.textContent=n<=T1?"A SEMAD começou.":"Até a próxima edição.";clearInterval(iv)}
const iv=setInterval(tick,1000);tick();
// eixos: cartões em carrossel com folha de detalhes
const rail=$("rail"),dots=$("dots"),dlg=$("dlg");let opener=null;
const plus='<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="2"><path d="M8 2v12M2 8h12"/></svg>';
CONFIG.eixos.forEach((x,i)=>{const b=document.createElement("button");b.type="button";b.className="card c"+(i+1);
 b.innerHTML=`<span class="sh" aria-hidden="true"></span><span class="n">Eixo ${p2(i+1)}</span><span class="q"></span><span class="e"></span><span class="pl" aria-hidden="true">${plus}</span>`;
 b.querySelector(".q").textContent=x.q;b.querySelector(".e").textContent=x.e;b.setAttribute("aria-label",`Eixo ${i+1}, ${x.e}: ${x.q} Ver detalhes`);
 b.onclick=()=>openAxis(i,b);rail.append(b);dots.append(document.createElement("i"))});
function openAxis(i,from){const x=CONFIG.eixos[i];opener=from;$("dtop").className="top c"+(i+1);$("dc").textContent=`Eixo ${p2(i+1)} · ${x.e}`;$("dt").textContent=x.q;$("dr").textContent=x.r;
 const ul=$("dl");ul.innerHTML="";x.dias.forEach(di=>{const dd=CONFIG.dias[di];dd.t.forEach(t=>{const li=document.createElement("li"),b=document.createElement("b");b.textContent=`${dd.w}, ${dd.d}`;li.append(b,t[1]);ul.append(li)})});
 dlg.showModal()}
$("dx").onclick=()=>dlg.close();
dlg.addEventListener("close",()=>opener&&opener.focus());
dlg.addEventListener("click",e=>{if(e.target===dlg)dlg.close()});
const cards=()=>[...rail.children],step=()=>(cards()[0]?.offsetWidth||360)+22;
function railState(){const max=rail.scrollWidth-rail.clientWidth,i=Math.round(rail.scrollLeft/step());
 const a=rail.scrollLeft>=max-4?cards().length-1:Math.min(i,cards().length-1);[...dots.children].forEach((d,j)=>d.classList.toggle("on",j===a));
 $("axp").disabled=rail.scrollLeft<=4;$("axn").disabled=rail.scrollLeft>=max-4}
rail.addEventListener("scroll",()=>requestAnimationFrame(railState),{passive:true});addEventListener("resize",railState);railState();
$("axp").onclick=()=>rail.scrollBy({left:-step(),behavior:RM?"auto":"smooth"});
$("axn").onclick=()=>rail.scrollBy({left:step(),behavior:RM?"auto":"smooth"});
if(FINE){let down=null,moved=false;
 rail.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse")return;down={x:e.clientX,l:rail.scrollLeft};moved=false});
 addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-down.x;if(Math.abs(dx)>6){moved=true;rail.classList.add("drag")}if(moved)rail.scrollLeft=down.l-dx});
 addEventListener("pointerup",()=>{if(!down)return;down=null;if(moved){rail.classList.remove("drag");const i=Math.round(rail.scrollLeft/step());rail.scrollTo({left:i*step(),behavior:"smooth"})}});
 rail.addEventListener("click",e=>{if(moved){e.stopPropagation();e.preventDefault();moved=false}},true)}
// programação: seletor de dias + palestras que abrem no lugar
const tabs=$("tabs"),evs=$("evs");let cur=0;
CONFIG.dias.forEach((x,i)=>{const b=document.createElement("button");b.type="button";b.role="tab";b.id="tb"+i;b.setAttribute("aria-controls","evs");b.setAttribute("aria-label",`${x.w}, ${x.d}`);
 const sp=document.createElement("span"),nb=document.createElement("b");sp.textContent=x.w.slice(0,3)+" ";nb.textContent=x.d.split(" ")[0];b.append(sp,nb);b.onclick=()=>show(i,true);tabs.append(b)});
const th=document.createElement("span");th.className="th";th.setAttribute("aria-hidden","true");tabs.prepend(th);
const tabBtns=()=>[...tabs.querySelectorAll("button")];
function moveTh(){const b=tabBtns()[cur];if(b){th.style.left=b.offsetLeft+"px";th.style.width=b.offsetWidth+"px"}}
addEventListener("resize",moveTh);addEventListener("load",moveTh);document.fonts?.ready.then(moveTh);
const ico='<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 1v10M1 6h10"/></svg>';
function show(i,f){cur=i;tabBtns().forEach((b,j)=>{b.setAttribute("aria-selected",j===i);b.tabIndex=j===i?0:-1});if(f)tabBtns()[i].focus();moveTh();
 const x=CONFIG.dias[i];evs.setAttribute("aria-labelledby","tb"+i);evs.innerHTML="";
 const day=document.createElement("div");day.className="day";
 day.innerHTML=`<div class="dh"><p class="wd"></p><h3></h3><p>${x.t.length} conversas no dia. Horários e convidados a confirmar.</p></div><ol class="tl"></ol>`;
 day.querySelector(".wd").textContent=`${x.w}-feira, ${x.d}`;day.querySelector("h3").textContent=x.t[0][0];
 const ol=day.querySelector(".tl");x.t.forEach((t,j)=>{const li=document.createElement("li"),id=`tk${i}-${j}`;
  li.innerHTML=`<button type="button" aria-expanded="false" aria-controls="${id}"><span class="ix">${p2(j+1)}</span><span class="tt"></span><span class="ic" aria-hidden="true">${ico}</span></button><div class="bd" id="${id}"><div><p></p><div class="mt"><span>Horário a confirmar</span><span>Palestrante a confirmar</span></div></div></div>`;
  li.querySelector(".tt").textContent=t[1];li.querySelector(".bd p").textContent=t[2];
  const btn=li.querySelector("button");btn.onclick=()=>{const o=btn.getAttribute("aria-expanded")!=="true";btn.setAttribute("aria-expanded",o);li.classList.toggle("open",o)};ol.append(li)});
 evs.append(day);if(f&&!RM){evs.classList.remove("swap");void evs.offsetWidth;evs.classList.add("swap")}}
tabs.onkeydown=e=>{const k={ArrowRight:1,ArrowLeft:-1}[e.key];if(k){e.preventDefault();show((cur+k+5)%5,true)}};
show(0);
// calendário (.ics)
$("ics").onclick=()=>{const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//SEMAD 2027//PT-BR","BEGIN:VEVENT","UID:semad2027@ufrrj","DTSTAMP:20261126T000000Z","DTSTART;VALUE=DATE:20270315","DTEND;VALUE=DATE:20270320","SUMMARY:SEMAD 2027 — Semana Acadêmica de Administração da UFRRJ","DESCRIPTION:A Administração na era da Inteligência Artificial. Programação em semad2027.vercel.app","END:VEVENT","END:VCALENDAR"].join("\r\n");
 const a=document.createElement("a");a.href="data:text/calendar;charset=utf-8,"+encodeURIComponent(ics);a.download="semad-2027.ics";document.body.append(a);a.click();a.remove()};
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
  if(r.ok&&j.id){F.hidden=true;$("rc").classList.add("show");stepsDone();$("rc-id").textContent=j.id;$("rc-n").textContent=d.name;$("rc-e").textContent=d.email;$("rc").scrollIntoView({block:"center"})}
  else if(r.status===409)stat("bad","Este e-mail já está inscrito na SEMAD 2027. Se foi você, use o comprovante anterior.");
  else if(r.status===422&&j.campos){for(const k in j.campos){const el=F[k];if($("e-"+k))setErr(k,j.campos[k],el)}stat("bad","Corrija os campos indicados e envie novamente.")}
  else if(r.status===429)stat("bad","Muitas tentativas. Aguarde alguns minutos e tente de novo.");
  else stat("bad",j.message||"Não foi possível gravar sua inscrição. Seus dados continuam no formulário: tente novamente.")}
 catch{stat("bad","Falha de conexão. Seus dados continuam no formulário: verifique a internet e tente novamente.")}
 finally{busy=false;GO.disabled=false;GO.textContent="Confirmar minha inscrição"}});

$("print-receipt").addEventListener("click",()=>print());

// ===== interações =====
// Etapas da inscrição acompanham o campo em foco.
const stepsEl=[...$("steps").children];
function setStep(n){stepsEl.forEach((li,j)=>{li.classList.toggle("on",j===n);li.classList.toggle("ok",j<n)})}
function stepsDone(){stepsEl.forEach(li=>{li.classList.remove("on");li.classList.add("ok")})}
F.addEventListener("focusin",e=>{const t=e.target;setStep(t.closest("#tms")?1:(t.id==="priv"||t.id==="go"||t.name==="divulgacao"||t.closest(".pv"))?2:0)});
// Manifesto: palavras acendem conforme a rolagem.
const mf=document.querySelector(".mf"),mft=$("mft");
(function(){const txt=mft.textContent.trim();mft.setAttribute("aria-label",txt);mft.textContent="";
 txt.split(/\s+/).forEach((w,i,a)=>{const s=document.createElement("span");s.className="w"+(i>=a.indexOf("quem")&&i<=a.indexOf("isso.")?" hi":"");s.setAttribute("aria-hidden","true");s.textContent=w;mft.append(s," ")})})();
const words=[...mft.querySelectorAll(".w")];
// Rolagem: cabeçalho claro/escuro, barra de progresso, hero encolhe, manifesto acende.
const heroSec=$("hero"),pg=$("pg"),darkSecs=[...document.querySelectorAll(".hero,.mf,.dk")];
function onScroll(){const vh=innerHeight,y=scrollY,docH=document.documentElement.scrollHeight-vh;
 pg.style.transform=`scaleX(${docH>0?clamp(y/docH):0})`;
 const probe=(hd.offsetHeight||52)/2;hd.classList.toggle("lite",!darkSecs.some(s=>{const r=s.getBoundingClientRect();return r.top<=probe&&r.bottom>probe}));
 if(RM){words.forEach(w=>w.classList.add("on"));return}
 const hr=heroSec.getBoundingClientRect();heroSec.style.setProperty("--hp",clamp(-hr.top/(hr.height-vh)).toFixed(3));
 const mr=mf.getBoundingClientRect(),p=clamp((-mr.top+vh*.25)/(mr.height-vh*1.15)),n=Math.round(p*words.length);
 words.forEach((w,i)=>w.classList.toggle("on",i<n))}
let sr=0;addEventListener("scroll",()=>{if(!sr)sr=requestAnimationFrame(()=>{sr=0;onScroll()})},{passive:true});addEventListener("resize",onScroll);onScroll();
// Revela blocos ao entrar na tela e conta os números.
function countUp(el){const n=+el.dataset.n;if(RM||!n)return;const t0=performance.now(),d=1100;
 (function f(t){const k=clamp((t-t0)/d),e=1-Math.pow(1-k,3);el.textContent=Math.round(n*e);if(k<1)requestAnimationFrame(f)})(t0)}
if("IntersectionObserver" in window&&!RM){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");e.target.querySelectorAll("[data-n]").forEach(countUp);io.unobserve(e.target)}}),{rootMargin:"0px 0px -10% 0px"});
 document.querySelectorAll(".rv").forEach(el=>io.observe(el))}
else document.querySelectorAll(".rv").forEach(el=>el.classList.add("in"));
// Menu marca a seção que está na tela.
const navLinks=[...document.querySelectorAll("#nv a")];
if("IntersectionObserver" in window){const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)navLinks.forEach(a=>a.classList.toggle("cur",a.getAttribute("href")==="#"+e.target.id))}),{rootMargin:"-45% 0px -50% 0px"});
 navLinks.forEach(a=>{const s=document.querySelector(a.getAttribute("href"));if(s)io2.observe(s)});io2.observe(heroSec)}
$("privacy-link").addEventListener("click",()=>document.querySelector(".pv").open=true);
if(FINE&&!RM){
 // Luz do fundo segue o cursor.
 document.querySelectorAll(".hero .stk,.fin").forEach(sec=>{const au=sec.querySelector(".aura");
  sec.addEventListener("pointermove",e=>{const r=sec.getBoundingClientRect();au.style.setProperty("--ax",((e.clientX-r.left)/r.width-.5)*8+"vmax");au.style.setProperty("--ay",((e.clientY-r.top)/r.height-.5)*8+"vmax")});
  sec.addEventListener("pointerleave",()=>{au.style.setProperty("--ax","0");au.style.setProperty("--ay","0")})});
 // Cartões do bento: brilho segue o cursor e inclinação leve.
 document.querySelectorAll(".tile").forEach(t=>{t.addEventListener("pointermove",e=>{const r=t.getBoundingClientRect();t.style.setProperty("--mx",e.clientX-r.left+"px");t.style.setProperty("--my",e.clientY-r.top+"px")})});
 // Botões principais atraídos pelo cursor.
 document.querySelectorAll(".hero .btn,.fin .btn").forEach(b=>{
  b.addEventListener("pointermove",e=>{const r=b.getBoundingClientRect();b.style.translate=`${((e.clientX-r.left-r.width/2)*.18).toFixed(1)}px ${((e.clientY-r.top-r.height/2)*.3).toFixed(1)}px`});
  b.addEventListener("pointerleave",()=>b.style.translate="")});
}
