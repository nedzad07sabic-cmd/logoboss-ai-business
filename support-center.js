const endpoint='https://ppmefffjhqpmrjnlewoq.supabase.co/functions/v1/support-tickets';
const publicKey='sb_publishable_TcFfVY1GiPZOufw6tQDh1A_vWoS2dsO';
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initSupport({client,openAccount=()=>{},beforeOpen=()=>{},admin=false}){
 if(document.getElementById('lbSupportDialog'))return;
 const lang=()=>admin?'bs':document.documentElement.lang==='en'?'en':'de';
 const tr=(de,en,bs=en)=>lang()==='bs'?bs:lang()==='en'?en:de;
 const statusLabel=s=>({open:tr('Offen','Open','Otvoren'),in_progress:tr('In Bearbeitung','In progress','U obradi'),waiting_customer:tr('Ihre Antwort erforderlich','Waiting for your reply','Čeka kupca'),closed:tr('Geschlossen','Closed','Zatvoren')})[s]||s;
 const categoryLabel=s=>({website:'Web',ai:'AI',automation:tr('Automatisierung','Automation','Automatizacija'),company:'Company OS',hosting:tr('Hosting & Domains','Hosting & domains','Hosting i domene'),billing:tr('Zahlung & Rechnung','Billing & invoices','Plaćanje i računi'),other:tr('Andere Frage','Other question','Drugo')})[s]||s;
 const dialog=document.createElement('dialog');dialog.id='lbSupportDialog';dialog.setAttribute('aria-labelledby','lbSupportTitle');document.body.append(dialog);
 let view='list',current=null,currentCustomer=null,tickets=[],orders=[],messages=[],hasMore=false,messageMore=false,offset=0,messageOffset=0,user=null,busy=false,version=0,returnFocus=null,previousOverflow='',createRequestId=null,replyRequestId=null,pendingLogin=false,pendingTicket=null;
 const date=v=>new Date(v).toLocaleString(lang()==='bs'?'bs-BA':lang()==='en'?'en-GB':'de-DE',{dateStyle:'medium',timeStyle:'short'});
 const $=id=>dialog.querySelector('#'+id);
 function notice(message,bad=false){const el=$('lbSupportAlert');if(!el)return;el.textContent=message;el.hidden=!message;el.classList.toggle('error',bad);}
 function globe(){return '<div class="lb-support-visual" aria-hidden="true"><div class="lb-support-globe">'+[0,45,90,135].map(a=>'<i class="lb-support-meridian" style="--angle:'+a+'deg"></i>').join('')+[25,65,105].map(a=>'<i class="lb-support-latitude" style="--angle:'+a+'deg"></i>').join('')+'</div>'+[0,1].map(o=>'<div class="lb-support-orbit '+(o?'second':'')+'">'+Array.from({length:6},(_,i)=>'<i class="lb-support-node" style="--angle:'+(i*60)+'deg;--radius:'+(o?87:103)+'px;--delay:-'+i+'s"></i>').join('')+'</div>').join('')+'</div>';}
 async function api(payload,file){
  const {data:{session},error}=await client.auth.getSession();
  if(error||!session?.access_token)throw Error(tr('Bitte melden Sie sich erneut an.','Please sign in again.','Prijavi se ponovo.'));
  let body,headers={Authorization:'Bearer '+session.access_token,apikey:publicKey};
  if(file){body=new FormData();body.append('payload',JSON.stringify(payload));body.append('attachment',file);}else{headers['Content-Type']='application/json';body=JSON.stringify(payload);}
  const r=await fetch(endpoint,{method:'POST',headers,body,signal:AbortSignal.timeout(45000)});
  const data=await r.json().catch(()=>({}));
  if(!r.ok){const code=r.status;
   throw Error(code===401?tr('Sitzung abgelaufen. Bitte erneut anmelden.','Session expired. Please sign in again.','Sesija je istekla. Prijavi se ponovo.'):code===403?tr('Bestätigtes Konto und Zugriffsberechtigung erforderlich.','A verified account and permission are required.','Potrebni su potvrđen račun i dozvola pristupa.'):code===404?tr('Ticket nicht gefunden.','Ticket not found.','Tiket nije pronađen.'):code===429?tr('Zu viele Anfragen. Bitte später erneut versuchen.','Too many requests. Please try again later.','Previše zahtjeva. Pokušaj kasnije.'):data.error||tr('Support momentan nicht erreichbar.','Support is temporarily unavailable.','Podrška trenutno nije dostupna.'));
  }return data;
 }
 function fileField(){return '<label class="lb-support-field wide">'+tr('Anhang (optional)','Attachment (optional)','Prilog (opcionalno)')+'<input type="file" name="attachment" accept="image/png,image/jpeg,image/webp,application/pdf"><span class="lb-support-help">PNG, JPG, WebP, PDF · '+tr('max. 2 MB. Keine Passwörter, API-Schlüssel oder Zahlungsdaten senden.','Maximum 2 MB. Do not send passwords, API keys or payment details.','Najviše 2 MB. Ne šalji lozinke, API ključeve ili podatke kartice.')+'</span></label>';}
 function form(type){return '<form id="lbSupportForm" class="lb-support-form">'+(type==='create'?'<label class="lb-support-field">'+tr('Bereich','Category','Kategorija')+'<select name="category" required>'+['website','ai','automation','company','hosting','billing','other'].map(c=>'<option value="'+c+'">'+categoryLabel(c)+'</option>').join('')+'</select></label><label class="lb-support-field">'+tr('Paket / Bestellung','Package / order','Paket / narudžba')+'<select name="order_id"><option value="">'+tr('Allgemeine Frage / nicht zugeordnet','General question / not linked','Opći zahtjev / bez narudžbe')+'</option>'+orders.map(o=>'<option value="'+escapeHtml(o.id)+'">'+escapeHtml(o.package_name)+' · '+escapeHtml(o.id.slice(0,8))+'</option>').join('')+'</select></label><label class="lb-support-field wide">'+tr('Betreff','Subject','Naslov')+'<input name="subject" required minlength="3" maxlength="160"></label>':'')+'<label class="lb-support-field wide">'+tr('Ihre Nachricht','Your message','Poruka')+'<textarea name="body" required maxlength="6000" rows="5"></textarea></label>'+fileField()+'<div class="lb-support-field wide"><button class="lb-support-button primary" type="submit">'+(type==='create'?tr('Ticket senden →','Submit ticket →','Pošalji tiket →'):tr('Antwort senden →','Send reply →','Pošalji odgovor →'))+'</button></div></form>';}
 function render(){
  const t=tr('Support, direkt verbunden.','Support, connected to you.','Podrška, sve na jednom mjestu.');
  dialog.innerHTML='<div class="lb-support-top"><div class="lb-support-brand">LogoBoss <b>AI</b> · Support</div><button type="button" class="lb-support-close" data-action="close" aria-label="'+tr('Schließen','Close','Zatvori')+'">×</button></div><div class="lb-support-hero"><div><div class="lb-support-eyebrow">'+tr('Ihr direkter Kontakt','Your direct connection','Tvoja direktna veza')+'</div><h2 id="lbSupportTitle">'+t+'</h2><p>'+tr('Eine Anfrage. Ein Gespräch. Alles sicher in Ihrem Konto — für Web, AI, Systeme und Hosting.','One request. One conversation. Securely in your account — for web, AI, systems and hosting.','Jedan zahtjev, jedan razgovor. Sve u tvom računu — za web, AI, sisteme i hosting.')+'</p></div>'+globe()+'</div><div class="lb-support-content">'+
   '<div class="lb-support-tabs"><button type="button" class="lb-support-button '+(view==='list'?'active':'')+'" data-action="list">'+(admin?tr('Alle Tickets','All tickets','Svi tiketi'):tr('Meine Tickets','My tickets','Moji tiketi'))+'</button>'+(!admin?'<button type="button" class="lb-support-button '+(view==='create'?'active':'')+'" data-action="new">'+tr('Neues Ticket +','New ticket +','Novi tiket +')+'</button>':'')+'</div><div id="lbSupportAlert" class="lb-support-alert" role="status" aria-live="polite" hidden></div><div id="lbSupportView"></div><div class="lb-support-footer"><span>'+tr('Persönlicher Support · Antworten in Ihrem Konto','Personal support · Replies in your account','Lična podrška · Odgovori u tvom računu')+'</span><a href="mailto:info.logobossai@gmail.com">'+tr('Frage vor dem Kauf?','Question before buying?','Pitanje prije kupovine?')+' ↗</a></div></div>';
  const box=$('lbSupportView');
  if(!user){box.innerHTML='<div class="lb-support-note">'+tr('Melden Sie sich mit Ihrem bestätigten Konto an, um ein Ticket zu öffnen oder Ihre Nachrichten zu lesen.','Sign in with your verified account to open a ticket or read your messages.','Prijavi se potvrđenim računom da otvoriš tiket ili pročitaš poruke.')+'</div><p><button type="button" class="lb-support-button primary" data-action="login">'+tr('Anmelden / Registrieren','Log in / Register','Prijava / registracija')+'</button></p>';return;}
  if(admin&&String(user.email).toLowerCase()!=='nedzad07sabic@gmail.com'){notice(tr('Kein Zugriff','Access denied','Nema pristupa'),true);return;}
  if(view==='create'){box.innerHTML=form('create');return;}
  if(view==='detail'&&current){
   const order=orders.find(o=>o.id===current.order_id);
   box.innerHTML='<button type="button" class="lb-support-button" data-action="list">← '+tr('Zur Übersicht','Back to tickets','Nazad na tikete')+'</button><div class="lb-support-detail-heading"><div><div class="lb-support-eyebrow">LB-'+escapeHtml(current.number)+' · '+escapeHtml(categoryLabel(current.category))+'</div><h3>'+escapeHtml(current.subject)+'</h3>'+(order?'<div class="lb-support-help">'+escapeHtml(order.package_name)+'</div>':'')+'</div><span class="lb-support-state '+escapeHtml(current.status)+'">'+statusLabel(current.status)+'</span></div>'+ 
    (admin&&currentCustomer?.email?'<p class="lb-support-help">'+escapeHtml(currentCustomer.email)+'</p>':'')+(messageMore?'<button type="button" class="lb-support-button" data-action="older">'+tr('Ältere Nachrichten laden','Load older messages','Učitaj starije poruke')+'</button>':'')+messages.map(m=>'<article class="lb-support-message '+escapeHtml(m.author_role)+'"><header><strong>'+ (m.author_role==='support'?'LogoBoss AI':tr('Kunde','Customer','Kupac'))+'</strong><time datetime="'+escapeHtml(m.created_at)+'">'+escapeHtml(date(m.created_at))+'</time></header><p>'+escapeHtml(m.body)+'</p>'+(m.attachment_name?'<p><button type="button" class="lb-support-button" data-attachment="'+escapeHtml(m.id)+'">↗ '+escapeHtml(m.attachment_name)+'</button></p>':'')+'</article>').join('')+
    '<div class="lb-support-statusbar">'+(admin?'<select id="lbSupportStatus" aria-label="Status">'+['open','in_progress','waiting_customer','closed'].map(s=>'<option value="'+s+'" '+(current.status===s?'selected':'')+'>'+statusLabel(s)+'</option>').join('')+'</select><button type="button" class="lb-support-button" data-action="status">'+tr('Status speichern','Save status','Sačuvaj status')+'</button>':'<button type="button" class="lb-support-button" data-action="status">'+(current.status==='closed'?tr('Ticket erneut öffnen','Reopen ticket','Ponovo otvori tiket'):tr('Ticket schließen','Close ticket','Zatvori tiket'))+'</button>')+'<button type="button" class="lb-support-button" data-action="refresh-detail">↻ '+tr('Aktualisieren','Refresh','Osvježi')+'</button></div>'+(current.status==='closed'?'<div class="lb-support-note">'+tr('Dieses Ticket ist geschlossen. Öffnen Sie es erneut, um zu antworten.','This ticket is closed. Reopen it to reply.','Tiket je zatvoren. Ponovo ga otvori da odgovoriš.')+'</div>':form('reply'));
  }else{
   box.innerHTML='<div class="lb-support-list">'+(tickets.length?tickets.map(t=>'<button type="button" class="lb-support-ticket" data-ticket="'+escapeHtml(t.id)+'"><span><small>LB-'+escapeHtml(t.number)+' · '+escapeHtml(categoryLabel(t.category))+'</small><strong>'+escapeHtml(t.subject)+'</strong><small>'+escapeHtml(date(t.updated_at))+'</small></span><span class="lb-support-state '+escapeHtml(t.status)+'">'+statusLabel(t.status)+'</span></button>').join(''):'<div class="lb-support-note">'+tr('Noch keine Tickets. Öffnen Sie eine Anfrage, wenn Sie Hilfe benötigen.','No tickets yet. Open a request when you need help.','Još nema tiketa. Otvori zahtjev kada ti zatreba pomoć.')+'</div>')+'</div><p><button type="button" class="lb-support-button" data-action="refresh">↻ '+tr('Aktualisieren','Refresh','Osvježi')+'</button> '+(hasMore?'<button type="button" class="lb-support-button" data-action="more">'+tr('Mehr laden','Load more','Učitaj još')+'</button>':'')+'</p>';
  }
 }
 function setBusy(value){busy=value;dialog.querySelectorAll('button,input,textarea,select').forEach(el=>{if(el.dataset.action!=='close')el.disabled=value;});dialog.setAttribute('aria-busy',String(value));}
 async function loadList(more=false){const token=++version;setBusy(true);notice(tr('Tickets werden geladen …','Loading tickets …','Učitavam tikete …'));try{const page=more?offset+100:0;const data=await api({action:'list',offset:page});if(token!==version)return;offset=page;tickets=more?[...new Map([...tickets,...data.tickets].map(t=>[t.id,t])).values()]:data.tickets;orders=data.orders;hasMore=data.has_more;view='list';render();}catch(e){if(token===version)notice(e.message,true);}finally{if(token===version)setBusy(false);}}
 async function loadDetail(id,older=false){const token=++version;setBusy(true);try{const page=older?messageOffset+100:0;const data=await api({action:'detail',ticket_id:id,offset:page});if(token!==version)return;current=data.ticket;currentCustomer=data.customer||null;if(data.order&&!orders.some(o=>o.id===data.order.id))orders.push(data.order);messageOffset=page;messages=older?[...new Map([...data.messages,...messages].map(m=>[m.id,m])).values()]:data.messages;messages.sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id));messageMore=data.has_more;view='detail';render();}catch(e){if(token===version)notice(e.message,true);}finally{if(token===version)setBusy(false);}}
 async function open(ticketId){
  beforeOpen();pendingTicket=ticketId||null;returnFocus=document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  if(!dialog.open)dialog.showModal();
  const token=++version;render();setBusy(true);
  try{const {data,error}=await client.auth.getUser();if(error)throw error;if(token!==version)return;user=data.user||null;view='list';render();if(user){await loadList();if(ticketId)await loadDetail(ticketId);}}
  catch{if(token===version){user=null;render();}}
  finally{if(token===version||!busy)setBusy(false);dialog.querySelector('[data-action="close"]')?.focus();}
 }
 function close(){version++;busy=false;dialog.close();document.body.style.overflow=previousOverflow;if(returnFocus?.isConnected)returnFocus.focus();if(location.hash.startsWith('#support'))history.replaceState(null,'',location.pathname+location.search);}
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;const action=b.dataset.action;
  if(action==='close'){close();return;}if(busy)return;
  if(action==='login'){pendingLogin=true;close();openAccount();return;}
  if(!user){notice(tr('Bitte zuerst anmelden.','Please sign in first.','Prvo se prijavi.'),true);return;}
  if(action==='new'){if(!user){notice(tr('Bitte zuerst anmelden.','Please sign in first.','Prvo se prijavi.'),true);return;}view='create';render();$('lbSupportForm').elements.subject.focus();return;}
  if(['list','refresh'].includes(action)){await loadList();return;}if(action==='more'){await loadList(true);return;}
  if(b.dataset.ticket){replyRequestId=null;await loadDetail(b.dataset.ticket);return;}
  if(action==='older'){await loadDetail(current.id,true);return;}
  if(action==='refresh-detail'){await loadDetail(current.id);return;}
  if(action==='status'&&current){const status=admin?$('lbSupportStatus').value:current.status==='closed'?'open':'closed';setBusy(true);try{await api({action:'status',ticket_id:current.id,status});await loadDetail(current.id);}catch(e){notice(e.message,true);}finally{setBusy(false);}return;}
  if(b.dataset.attachment){
   // Only open a server-authorized, short-lived Storage URL.
   setBusy(true);try{const data=await api({action:'attachment',message_id:b.dataset.attachment});const url=new URL(data.url);if(url.origin!=='https://ppmefffjhqpmrjnlewoq.supabase.co'||!url.pathname.startsWith('/storage/v1/object/sign/support-attachments/'))throw Error('Invalid attachment URL');const a=document.createElement('a');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.download=data.name||'attachment';document.body.append(a);a.click();a.remove();}catch(e){notice(e.message,true);}finally{setBusy(false);}
  }
 });
 dialog.addEventListener('submit',async e=>{
  if(e.target.id!=='lbSupportForm')return;e.preventDefault();if(busy)return;
  const f=e.target,file=f.elements.attachment.files[0];
  if(file&&(file.size>2097152||!['image/png','image/jpeg','image/webp','application/pdf'].includes(file.type))){notice(tr('PNG, JPG, WebP oder PDF, maximal 2 MB.','Use PNG, JPG, WebP or PDF, maximum 2 MB.','PNG, JPG, WebP ili PDF, najviše 2 MB.'),true);return;}
  const creating=view==='create';if(creating&&!createRequestId)createRequestId=crypto.randomUUID();if(!creating&&!replyRequestId)replyRequestId=crypto.randomUUID();
  const payload={action:creating?'create':'reply',request_id:creating?createRequestId:replyRequestId,body:f.elements.body.value.trim(),language:lang()==='en'?'en':'de',...(creating?{subject:f.elements.subject.value.trim(),category:f.elements.category.value,order_id:f.elements.order_id.value}:{ticket_id:current.id})};
  setBusy(true);notice(tr('Ihre Nachricht wird gespeichert …','Saving your message …','Spremam poruku …'));
  try{const result=await api(payload,file);if(creating)createRequestId=null;else replyRequestId=null;await loadDetail(result.ticket.id);notice(result.notification_pending?tr('Gespeichert. Die E-Mail-Benachrichtigung ist noch nicht bestätigt; Ihre Nachricht ist hier verfügbar.','Saved. The email notification is not yet confirmed; your message is available here.','Spremljeno. Email obavijest još nije potvrđena; poruka je dostupna ovdje.'):tr('Gespeichert. Sie können den Verlauf hier verfolgen.','Saved. You can follow the conversation here.','Spremljeno. Razgovor možeš pratiti ovdje.'));}
  catch(e){notice(e.message,true);}finally{setBusy(false);}
 });
 // A changed draft is a new logical request after a failed or uncertain submission.
 dialog.addEventListener('input',()=>{if(!busy){if(view==='create')createRequestId=null;else replyRequestId=null;}});
 document.addEventListener('click',e=>{const launcher=e.target.closest('[data-lb-support-open]');if(launcher){e.preventDefault();void open();}});
 const fromHash=()=>{if(location.hash==='#support'||location.hash.startsWith('#support-ticket=')){const id=location.hash.split('=')[1];void open(/^[0-9a-f-]{36}$/i.test(id||'')?id:null);}};
 window.addEventListener('hashchange',fromHash);
 client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'&&pendingLogin){pendingLogin=false;const id=pendingTicket;setTimeout(()=>void open(id),0);}if(event==='SIGNED_OUT'||(user&&session?.user?.id&&session.user.id!==user.id)){version++;user=null;tickets=[];orders=[];messages=[];current=null;currentCustomer=null;view='list';createRequestId=null;replyRequestId=null;if(dialog.open){render();setBusy(false);}}});
 new MutationObserver(()=>{
  document.querySelectorAll('[data-lb-support-open]').forEach(b=>b.textContent=admin?'Podrška · Tiketi':tr('Support','Support'));
  if(dialog.open){
   const oldForm=$('lbSupportForm');const draft=oldForm?Array.from(oldForm.elements).filter(e=>e.name).map(e=>({name:e.name,value:e.value,files:e.type==='file'?e.files:null})):[];
   render();const newForm=$('lbSupportForm');if(newForm)for(const field of draft){const e=newForm.elements.namedItem(field.name);if(e){if(field.files)e.files=field.files;else e.value=field.value;}}
  }
 }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 render();fromHash();
 return {open,close};
}
