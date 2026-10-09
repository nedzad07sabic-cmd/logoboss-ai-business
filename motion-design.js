/* LogoBoss cinematic system preview; no checkout or account operations. */
(()=>{
'use strict';
const canvas=document.getElementById('motionEarth'),track=document.getElementById('motionTrack');
if(!canvas||!track)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const lang=()=>localStorage.getItem('lb_lang')==='en'?'en':'de';
const text=(de,en)=>lang()==='de'?de:en;
const categories={
 company:{name:'04 / COMPANY OS',accent:'#86eee0',offer:'company-os-start',package:'Company OS Start',steps:[
 ['Anfragen an einem Ort.','Your inquiries. One place.','Sehen Sie neue Kundenanfragen übersichtlich in einem zentralen Bereich. Company OS Start schafft die Basis für die Abläufe eines Unternehmens.','See new customer inquiries in one central area. Company OS Start lays the foundation for the workflows of a single business.','Anfragen','Inquiries'],
 ['Vom Kontakt zum Terminwunsch.','From contact to appointment request.','Kunden können einen Termin anfragen. Die Anfrage bleibt mit dem Kontakt verbunden und wird von Ihrem Team bestätigt.','Customers can request an appointment. The request stays connected to the contact and is confirmed by your team.','Terminwünsche','Appointment requests'],
 ['Leistungen im Überblick.','Your services. In view.','Anfragen, Terminwünsche und Leistungen bilden einen einfachen gemeinsamen Ablauf. Der genaue Umfang wird beim Einrichten abgestimmt.','Inquiries, appointment requests and services form a simple shared workflow. The exact scope is agreed during setup.','Leistungen','Services']
 ]},
 web:{name:'01 / WEB',accent:'#b6a5ef',offer:'digital-start',package:'Web',steps:[
 ['Der erste Eindruck zählt.','Make your first impression count.','Eine klare Website zeigt Ihre Leistungen und macht Ihr Unternehmen sichtbar. Mit einer Struktur, die auch auf dem Smartphone funktioniert.','A clear website presents your services and makes your business visible. With a layout that works on smartphones too.','Website','Website'],
 ['Aus Besuchern werden Anfragen.','Turn visits into inquiries.','Ein passendes Kontakt- oder Anfrageformular gibt Interessenten einen einfachen nächsten Schritt. Umfang und Inhalte richten sich nach Ihrem Paket.','A contact or inquiry form gives visitors an easy next step. Its scope and content depend on your package.','Kontakt','Contact'],
 ['Ein Auftritt. Alle Bildschirmgrößen.','One website. Every screen size.','Responsive Gestaltung, grundlegendes SEO und vorbereitete Veröffentlichung gehören zum Web-Angebot. Wählen Sie Digital Start, Web Business oder Web Pro.','Responsive design, basic SEO and deployment preparation are part of the web offering. Choose Digital Start, Web Business or Web Pro.','Responsive','Responsive']
 ]},
 ai:{name:'02 / AI',accent:'#9fb8fd',offer:'ai-business',package:'AI',steps:[
 ['Antworten direkt im Text-Chat.','Answers in a text chat.','Ein Website-Chat hilft bei häufigen Fragen auf Basis der freigegebenen Unternehmensinformationen. Sie bestimmen die Inhalte.','A website chat helps with common questions using approved business information. You define the content.','Fragen','Questions'],
 ['Das Anliegen weitergeben.','Pass the inquiry along.','Der Chat kann Kontaktdaten und das Anliegen erfassen. So erhält Ihr Team die Informationen für den nächsten Schritt.','The chat can capture contact details and the inquiry, giving your team the information for the next step.','Anfragen','Inquiries'],
 ['Klare Inhalte. Klare Grenzen.','Clear content. Clear boundaries.','Business AI oder Pro AI: Der abgestimmte Text-Chat unterstützt Ihre Kundenkommunikation. Umfang und Übergabe werden beim Einrichten festgelegt.','Business AI or Pro AI: the agreed text chat supports customer communication. Scope and handover are defined during setup.','Übergabe','Handover']
 ]},
 automation:{name:'03 / AUTOMATION',accent:'#edc58f',offer:'automation-start',package:'Automation',steps:[
 ['Ein Auslöser. Der Anfang.','One trigger. A starting point.','Ein Formular oder eine neue Anfrage startet einen abgestimmten Ablauf. Wir legen gemeinsam fest, welche Schritte verbunden werden.','A form or new inquiry starts an agreed workflow. Together we define which steps should be connected.','Auslöser','Trigger'],
 ['Weniger wiederkehrende Schritte.','Fewer repetitive tasks.','Informationen werden an die vorgesehenen Werkzeuge weitergegeben, zum Beispiel für eine interne Benachrichtigung.','Information is passed to the designated tools, for example for an internal notification.','Verbindung','Connection'],
 ['Ihr Ablauf, nachvollziehbar.','A workflow you can follow.','Automation Start umfasst einen einfachen Workflow; Automation Business bis zu drei. Die Werkzeuge und Abläufe werden vor der Umsetzung abgestimmt.','Automation Start includes one simple workflow; Automation Business up to three. Tools and workflows are agreed before implementation.','Ergebnis','Result']
 ]}
};
let category='company',step=0,progress=0;
const panel=(title,body,cls)=>'<div class="motion-panel '+cls+'"><div class="motion-panel-bar"><span>'+title+'</span><span class="dots"><i></i><i></i><i></i></span></div>'+body+'</div>';
const row=(icon,label,status)=>'<div class="motion-ui-row"><span class="motion-ui-dot">'+icon+'</span><span>'+label+'</span><span class="motion-ui-badge">'+status+'</span></div>';
function scene(){
 const label='<div class="motion-ui-label">LOGOBOSS · '+(category==='company'?'COMPANY OS':category.toUpperCase())+'</div>';
 let main,two,three;
 if(category==='company'){
 main=label+'<div class="motion-ui-title">'+text('Ihr Unternehmen.<br>Ein Überblick.','Your business.<br>One overview.')+'</div>'+row('01',text('Neue Kundenanfrage','New customer inquiry'),text('NEU','NEW'))+row('02',text('Terminwunsch','Appointment request'),text('OFFEN','PENDING'))+row('03',text('Leistungen','Services'),text('ÜBERSICHT','OVERVIEW'));
 two='<div class="motion-ui-label">'+text('TERMINWUNSCH','APPOINTMENT REQUEST')+'</div><b>'+text('Beratung anfragen','Request a consultation')+'</b><div class="motion-date"><span>12</span><span class="picked">13</span><span>14</span></div><p>'+text('Bestätigung durch Ihr Team','Confirmed by your team')+'</p>';
 three='<div class="motion-ui-label">'+text('LEISTUNGEN','SERVICES')+'</div><b>'+text('Alles verbunden.','All connected.')+'</b><p>'+text('Kontakt → Anfrage → Terminwunsch','Contact → Inquiry → Appointment request')+'</p>';
 }else if(category==='web'){
 main=label+'<div class="motion-web-banner"><strong>'+text('Ihre Marke. Ihr Auftritt.','Your brand. Your website.')+'</strong><small>'+text('Klar. Responsive. Für Ihre Kunden.','Clear. Responsive. For your customers.')+'</small></div><div class="motion-mini-grid"><span>'+text('Leistungen','Services')+'</span><span>'+text('Über uns','About')+'</span><span>'+text('Kontakt','Contact')+'</span></div>'+row('↗',text('Kontakt aufnehmen','Get in touch'),text('FORMULAR','FORM'));
 two='<div class="motion-ui-label">'+text('KONTAKTFORMULAR','CONTACT FORM')+'</div><b>'+text('Eine neue Anfrage.','A new inquiry.')+'</b><p>'+text('Name · E-Mail · Nachricht','Name · Email · Message')+'</p><span class="motion-ui-badge">'+text('NÄCHSTER SCHRITT','NEXT STEP')+'</span>';
 three='<div class="motion-ui-label">RESPONSIVE</div><b>'+text('Auch mobil.','On mobile too.')+'</b><div class="motion-web-banner"><strong style="font-size:13px">YOUR BRAND</strong></div>';
 }else if(category==='ai'){
 main=label+'<div class="motion-ui-title">'+text('Wie können wir helfen?','How can we help?')+'</div><div class="motion-chat user">'+text('Welche Leistungen bieten Sie an?','What services do you offer?')+'</div><div class="motion-chat">'+text('Ich helfe Ihnen mit Informationen zu unseren Leistungen. Möchten Sie eine Anfrage senden?','I can help with information about our services. Would you like to send an inquiry?')+'</div>';
 two='<div class="motion-ui-label">'+text('ANFRAGE','INQUIRY')+'</div><b>'+text('Kontakt aufnehmen.','Capture the contact.')+'</b><p>'+text('Name · E-Mail · Anliegen','Name · Email · Request')+'</p><span class="motion-ui-badge">TEXT CHAT</span>';
 three='<div class="motion-ui-label">'+text('ÜBERGABE','HANDOVER')+'</div><b>'+text('Ihr Team übernimmt.','Your team takes over.')+'</b><p>'+text('Auf Basis freigegebener Inhalte.','Based on approved content.')+'</p>';
 }else{
 main=label+'<div class="motion-ui-title">'+text('Schritt für Schritt verbunden.','Connected, step by step.')+'</div><div class="motion-flow"><span>'+text('Formular','Form')+'</span><i>→</i><span>'+text('Anfrage','Inquiry')+'</span><i>→</i><span>'+text('Hinweis','Notification')+'</span></div>'+row('↗',text('Abgestimmter Workflow','Agreed workflow'),text('BEISPIEL','EXAMPLE'));
 two='<div class="motion-ui-label">'+text('VERBINDUNG','CONNECTION')+'</div><b>'+text('Information weitergeben.','Pass on information.')+'</b><p>'+text('An das vereinbarte Werkzeug.','To the agreed tool.')+'</p>';
 three='<div class="motion-ui-label">'+text('ERGEBNIS','RESULT')+'</div><b>'+text('Weniger Handarbeit.','Less manual work.')+'</b><p>'+text('Ein klar definierter Ablauf.','One clearly defined workflow.')+'</p>';
 }
 document.getElementById('motionScene').innerHTML='<div class="motion-flow-line"></div>'+panel(categories[category].name,'<div class="motion-panel-content">'+main+'</div>','motion-main-panel')+panel('02 / '+text('VERBINDEN','CONNECT'),'<div class="motion-float-body">'+two+'</div>','motion-layer-two')+panel('03 / '+text('ÜBERBLICK','OVERVIEW'),'<div class="motion-float-body">'+three+'</div>','motion-layer-three');
}
function render(){
 const c=categories[category],s=c.steps[step],english=lang()==='en';
 track.dataset.category=category;track.dataset.step=String(step);track.style.setProperty('--accent',c.accent);
 document.getElementById('motionSystemName').textContent=c.name;
 document.getElementById('motionStageTitle').textContent=s[english?1:0];
 document.getElementById('motionStageDescription').textContent=s[english?3:2];
 document.getElementById('motionStepNumber').textContent='0'+(step+1)+' / 03';
 document.getElementById('motionStepList').innerHTML=c.steps.map((x,i)=>'<button type="button" data-step="'+i+'" aria-current="'+(i===step)+'"><span>0'+(i+1)+'</span>'+x[english?5:4]+'</button>').join('');
 const link=document.getElementById('motionPackageLink');link.href='#offer-'+c.offer;link.textContent=c.package+' '+text('Pakete ansehen →','packages →');
 document.querySelectorAll('.motion-tabs [data-category]').forEach(b=>{const active=b.dataset.category===category;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
 document.getElementById('motion-panel').setAttribute('aria-labelledby','motion-tab-'+category);
}
function select(id,updateHash=false){
 if(!categories[id])return;
 category=id;render();scene();
 if(updateHash)history.replaceState(null,'','#system-'+id);
}
function updateScroll(){
 if(reduced.matches)return;
 const rect=track.getBoundingClientRect(),stage=track.querySelector('.motion-stage'),top=innerWidth<=700?68:80;
 const distance=Math.max(1,rect.height-stage.offsetHeight);
 progress=Math.max(0,Math.min(1,(top-rect.top)/distance));
 track.style.setProperty('--progress',String(progress));
 const next=progress<.3?0:progress<.7?1:2;
 if(next!==step){step=next;render();}
}
let scrollQueued=false;
addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(()=>{scrollQueued=false;updateScroll();});}},{passive:true});
document.querySelector('.motion-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b)select(b.dataset.category,true);});
document.querySelector('.motion-tabs').addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 const buttons=[...document.querySelectorAll('.motion-tabs button')],at=buttons.indexOf(document.activeElement);if(at<0)return;
 e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?3:(at+(e.key==='ArrowRight'?1:3))%4;
 select(buttons[next].dataset.category,true);buttons[next].focus();
});
document.getElementById('motionStepList').addEventListener('click',e=>{
 const b=e.target.closest('[data-step]');if(!b)return;const next=Number(b.dataset.step);
 if(reduced.matches){step=next;render();return;}
 const y=track.getBoundingClientRect().top+scrollY-(innerWidth<=700?68:80),distance=track.offsetHeight-track.querySelector('.motion-stage').offsetHeight;
 scrollTo({top:y+distance*([.04,.46,.93][next]),behavior:'smooth'});
});
function navigateCategory(id){
 if(document.getElementById('homeView').classList.contains('hidden')&&typeof showHome==='function')showHome();
 select(id,true);document.getElementById('systems').scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});
}
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href^="#system-"]');if(!a)return;
 const id=a.getAttribute('href').slice(8);if(!categories[id])return;
 e.preventDefault();navigateCategory(id);
 if(typeof closeMega==='function')closeMega();
});
function deepLink(){const match=location.hash.match(/^#system-(web|ai|automation|company)$/);if(match){select(match[1]);requestAnimationFrame(()=>document.getElementById('systems').scrollIntoView({block:'start'}));}}
addEventListener('hashchange',deepLink);
new MutationObserver(()=>{render();scene();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
let lastFocus;
const menu=document.getElementById('megaBackdrop');
new MutationObserver(()=>{
 if(menu.classList.contains('open'))lastFocus=document.getElementById('megaOpen');
 else if(lastFocus&&document.activeElement===document.getElementById('megaClose')){lastFocus.focus();lastFocus=null;}
}).observe(menu,{attributes:true,attributeFilter:['class']});
menu.addEventListener('keydown',e=>{
 if(e.key!=='Tab'||!menu.classList.contains('open'))return;
 const focusable=[...menu.querySelectorAll('a[href],button')],first=focusable[0],last=focusable.at(-1);
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});
select(category);deepLink();addEventListener('resize',updateScroll);requestAnimationFrame(updateScroll);
const ctx=canvas.getContext('2d');
if(!ctx)return;
const points=window.LB_EARTH_POINTS||[],earth=canvas.parentElement;
let width=0,height=0,angle=.45,frame=0,last=0,visible=true;
function size(){const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
function project(p){const c=Math.cos(angle),s=Math.sin(angle);return[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];}
function draw(){
 if(!width||!height)return;
 ctx.clearRect(0,0,width,height);
 const x=width/2,y=height/2,r=width*.335;
 const gradient=ctx.createRadialGradient(x-r*.3,y-r*.4,0,x,y,r);
 gradient.addColorStop(0,'rgba(72,127,145,.13)');gradient.addColorStop(.75,'rgba(20,53,73,.14)');gradient.addColorStop(1,'rgba(39,87,107,.19)');
 ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='rgba(147,212,228,.16)';ctx.lineWidth=1;ctx.stroke();
 for(let lat=-60;lat<=60;lat+=30){
 const phi=lat*Math.PI/180;ctx.beginPath();let started=false;
 for(let lon=0;lon<=360;lon+=4){const a=lon*Math.PI/180,p=project([Math.cos(phi)*Math.sin(a),-Math.sin(phi),Math.cos(phi)*Math.cos(a)]);if(p[2]>0){if(!started)ctx.moveTo(x+p[0]*r,y+p[1]*r);else ctx.lineTo(x+p[0]*r,y+p[1]*r);started=true;}else started=false;}
 ctx.strokeStyle='rgba(111,160,188,.11)';ctx.lineWidth=.6;ctx.stroke();
 }
 for(let lon=0;lon<360;lon+=30){
 const a=lon*Math.PI/180;ctx.beginPath();let started=false;
 for(let lat=-90;lat<=90;lat+=4){const q=lat*Math.PI/180,p=project([Math.cos(q)*Math.sin(a),-Math.sin(q),Math.cos(q)*Math.cos(a)]);if(p[2]>0){if(!started)ctx.moveTo(x+p[0]*r,y+p[1]*r);else ctx.lineTo(x+p[0]*r,y+p[1]*r);started=true;}else started=false;}
 ctx.stroke();
 }
 for(const dot of points){const p=project(dot),front=p[2]>0,alpha=front?.3+.65*p[2]:.08;ctx.fillStyle=front?'rgba(156,224,223,'+alpha.toFixed(2)+')':'rgba(101,132,168,.08)';ctx.beginPath();ctx.arc(x+p[0]*r,y+p[1]*r,front?1.15+.65*p[2]:.7,0,Math.PI*2);ctx.fill();}
 const hubs=[[.12,-.74,.66],[-.8,-.52,.3],[.85,.3,.43]];
 for(let i=0;i<hubs.length;i++){const p=project(hubs[i]);if(p[2]<0)continue;const px=x+p[0]*r,py=y+p[1]*r;ctx.fillStyle='#acf4e4';ctx.beginPath();ctx.arc(px,py,2.6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(157,232,225,.28)';ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.stroke();const q=project(hubs[(i+1)%hubs.length]);if(q[2]>0){ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(x+(p[0]+q[0])*r*.6,y+(p[1]+q[1])*r*.7-r*.24,x+q[0]*r,y+q[1]*r);ctx.strokeStyle='rgba(157,231,220,.35)';ctx.stroke();}}
}
function animate(time){frame=0;if(document.hidden||!visible||reduced.matches)return;if(time-last>=33){angle+=Math.min(time-last,66)*.000065;last=time;draw();}frame=requestAnimationFrame(animate);}
function resume(){if(!frame&&!document.hidden&&visible&&!reduced.matches){last=performance.now();frame=requestAnimationFrame(animate);}else if(reduced.matches)draw();}
new ResizeObserver(size).observe(earth);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)resume();else if(frame){cancelAnimationFrame(frame);frame=0;}},{rootMargin:'100px'}).observe(earth);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();});
reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(frame);frame=0;draw();}else{updateScroll();resume();}});
size();resume();
})();
