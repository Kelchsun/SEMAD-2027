export const event = {
 name:'SEMAD 2027', edition:'2027', theme:'Mentes conectadas: a Administração na era da Inteligência Artificial',
 start:'2027-03-15T00:00:00-03:00', end:'2027-03-20T00:00:00-03:00',
 privacyContact:'A confirmar pela organização', retention:'A confirmar pela organização',
 images:{hero:'/assets/hero-robo-executivo.webp',speaker:'/assets/palestrante-robo.webp',audience:'/assets/plateia-vermelha.webp',avatar:'/assets/participante-avatar.webp',pillars:'/assets/plateia-escura.webp'}
};
const days = [
 ['Administração e transformação','A Administração na era da Inteligência Artificial','Da transformação digital à transformação das decisões'],
 ['Pessoas e trabalho','Liderança e competências em organizações orientadas por IA','O futuro do trabalho e o papel do administrador'],
 ['Processos e dados','Automação de processos: da rotina à geração de valor','Dados e inteligência artificial na tomada de decisão'],
 ['Estratégia e mercado','IA, experiência do cliente e novas estratégias de negócio','Inovação e empreendedorismo na economia da inteligência'],
 ['Ética e futuro','Ética, governança e responsabilidade no uso da IA','Conexões que transformam: perspectivas para o futuro da gestão']
];
export const activities=days.flatMap(([category,...titles],d)=>titles.map((title,i)=>({id:`dia${d+15}-${i+1}`,day:d+15,title,category,summary:[ 'Um olhar sobre as mudanças, oportunidades e desafios da inteligência artificial para a Administração.', 'Conceitos e reflexões para conectar a transformação tecnológica à prática da gestão.' ][i],time:'A confirmar',speaker:'A confirmar'})));
export const profiles=['Estudante da UFRRJ','Estudante de outra instituição','Profissional','Docente','Outro'];
export function countdown(now=Date.now()){if(now>=Date.parse(event.end))return {message:'Até a próxima edição!'};if(now>=Date.parse(event.start))return {message:'A SEMAD começou!'};let s=Math.max(0,Math.floor((Date.parse(event.start)-now)/1000));return {days:Math.floor(s/86400),hours:Math.floor(s/3600)%24,minutes:Math.floor(s/60)%60,seconds:s%60};}
