/* LogoBoss immersive package stories. Display only; existing checkout and customer account flows are unchanged. */
(()=>{
'use strict';
const track=document.getElementById('motionTrack');if(!track)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),lang=()=>localStorage.getItem('lb_lang')==='en'?'en':'de',t=(de,en)=>lang()==='de'?de:en;
const f=(type,de,en,descDe,descEn,meta={})=>({type,de,en,descDe,descEn,...meta});
const pages=n=>f('web','Bis zu '+n+' Seiten','Up to '+n+' pages','Eine responsive Website mit bis zu '+n+' Seiten für Ihr Unternehmen. Inhalte und Struktur werden vor der Umsetzung abgestimmt.','A responsive website with up to '+n+' pages for your business. Content and structure are agreed before implementation.',{amount:n});
const contact=()=>f('form','Kontaktformular','Contact form','Interessenten können ihr Anliegen und ihre Kontaktdaten über ein abgestimmtes Formular senden.','Visitors can send their request and contact details through an agreed form.');
const inbox=()=>f('inbox','Anfragen im Überblick','Your inquiry overview','Kundenanfragen bleiben an einem Ort übersichtlich. Ihr Team kann die Informationen für den nächsten Schritt nutzen.','Customer inquiries stay together in a clear overview, giving your team the information for the next step.');
const languages=single=>f('language',single?'Eine Sprachversion':'Deutsch + Englisch',single?'One language version':'German + English',single?'Sie wählen eine Sprachversion: Deutsch oder Englisch.':'Ihre Website wird in Deutsch und Englisch bereitgestellt.',single?'Choose one language version: German or English.':'Your website is delivered in German and English.',{single});
const login=()=>f('login','Geschützter Kundenlogin','Protected customer login','Registrierung und Login schaffen einen geschützten Bereich. Die Funktionen werden nach Einrichtung und Freischaltung bereitgestellt.','Registration and login provide a protected area. Features are provided after setup and access has been enabled.');
const calendar=()=>f('calendar','Termine anfragen','Appointment requests','Kunden können einen Terminwunsch senden. Ihr Team prüft und bestätigt die Anfrage.','Customers can send an appointment request. Your team reviews and confirms it.');
const dashboard=()=>f('dashboard','Dashboard & Status','Dashboard & statuses','Eine einfache Übersicht zeigt Anfragen und ihren Bearbeitungsstatus. Der genaue Umfang richtet sich nach Ihrem Paket.','A simple overview shows inquiries and their status. The exact scope depends on your package.');
const workflow=n=>f('workflow',n===1?'Ein definierter Workflow':'Bis zu '+n+' Workflows',n===1?'One defined workflow':'Up to '+n+' workflows','Wir verbinden '+(n===1?'einen einfachen Ablauf':'bis zu '+n+' definierte Abläufe')+'. Werkzeuge, Auslöser und Grenzen werden vor der Umsetzung abgestimmt.','We connect '+(n===1?'one simple workflow':'up to '+n+' defined workflows')+'. Tools, triggers and boundaries are agreed before implementation.',{amount:n});
const chat=()=>f('chat','Chat auf Ihrer Website','Chat on your website','Ein textbasierter Chat unterstützt die Kundenkommunikation auf Ihrer Website. Die Inhalte werden gemeinsam festgelegt.','A text chat supports customer communication on your website. Its content is defined together.');
const faq=()=>f('faq','Freigegebene FAQ-Inhalte','Approved FAQ content','Antworten basieren auf den freigegebenen Informationen Ihres Unternehmens. Sie bestimmen die Wissensgrundlage.','Answers are based on approved information from your business. You define the knowledge source.');
const email=templates=>f('email',templates?'E-Mail-Vorlagen & Bestätigungen':'E-Mail-Hinweise',templates?'Email templates & acknowledgements':'Email alerts',templates?'Abgestimmte E-Mail-Vorlagen unterstützen den definierten Workflow. Versand und Anbieter werden bei der Einrichtung konfiguriert.':'Nach der Einrichtung kann ein abgestimmter E-Mail-Hinweis Teil des Workflows sein.',templates?'Agreed email templates support the defined workflow. Sending and the provider are configured during setup.':'After setup, an agreed email alert can be part of the workflow.',{templates});
const handover=approval=>f('approval',approval?'Menschliche Freigabe':'Übergabe an Ihr Team',approval?'Human approval':'Handover to your team',approval?'Sensible Aktionen können eine manuelle Freigabe durch Ihr Team erfordern. Die Regeln werden vor der Umsetzung vereinbart.':'Für definierte Anliegen übernimmt Ihr Team. Die Regeln für die menschliche Übergabe werden bei der Einrichtung abgestimmt.',approval?'Sensitive actions can require manual approval by your team. The rules are agreed before implementation.':'Your team takes over for defined requests. Human handover rules are agreed during setup.');
const companyFeatures=[
f('login','Ein Unternehmen. Ihr Login.','One business. Your login.','Company OS Start schafft einen geschützten Bereich für ein Unternehmen. Zugang und Freischaltung erfolgen nach der Einrichtung.','Company OS Start provides a protected workspace for one business. Access is enabled after setup.'),
inbox(),calendar(),
f('services','Ihr Leistungskatalog','Your service catalog','Ihre Leistungen werden in einer übersichtlichen Struktur hinterlegt. Inhalte und Umfang werden bei der Einrichtung abgestimmt.','Your services are organized in a clear catalog. Content and scope are agreed during setup.'),
dashboard(),
f('modules','Module gezielt freischalten','Enable selected modules','Module werden einzeln nach Bereitstellung freigeschaltet. So starten Sie mit den vereinbarten Funktionen.','Modules are enabled individually after provisioning, so you start with the agreed features.')
];
const manifest={
'digital-start':[pages(5),contact(),inbox(),f('seo','SEO-Basics & SSL','Basic SEO & SSL','SEO-Grundlagen und SSL unterstützen Ihren professionellen Webauftritt.','Basic SEO and SSL support your professional website.'),f('phone','Responsive Mobilansicht','Responsive mobile layout','Die Website passt sich an Smartphone, Tablet und Desktop an.','The website adapts to smartphones, tablets and desktop screens.'),languages(true)],
'web-business':[pages(8),calendar(),f('inbox','Geschützte Anfrageübersicht','Protected inquiry overview','Ihr Unternehmen erhält eine geschützte Übersicht für eingegangene Anfragen.','Your business receives a protected overview of incoming inquiries.'),languages(false)],
'web-pro':[pages(12),languages(false),login(),dashboard(),workflow(2)],
'ai-business':[chat(),faq(),contact(),inbox()],
'ai-pro':[chat(),faq(),contact(),inbox(),f('chatflows','Bis zu zwei Chat-Abläufe','Up to two chat flows','Bis zu zwei abgestimmte Chat- oder Anfrageabläufe unterstützen unterschiedliche Anliegen.','Up to two agreed chat or inquiry flows support different requests.'),dashboard(),handover(false)],
'automation-start':[workflow(1),f('database','Formular → Datenbank → Status','Form → database → status','Informationen aus dem Formular werden im definierten Ablauf weitergegeben und mit einem Status versehen.','Form information is passed through the defined workflow and given a status.'),email(false),f('guide','Test & kurze Anleitung','Test & short guide','Der vereinbarte Workflow wird getestet und mit einer kurzen Anleitung übergeben.','The agreed workflow is tested and handed over with a short guide.')],
'automation-business':[workflow(3),email(true),dashboard(),handover(true)],
'company-os-start':companyFeatures
};
manifest["hosting-web"]=[{"type": "server", "de": "Hosting in Frankfurt", "en": "Hosting in Frankfurt", "descDe": "Ihre Website wird auf einem Hostingkonto im Rechenzentrum Frankfurt eingerichtet.", "descEn": "Your website is set up on a hosting account in Frankfurt."}, {"type": "storage", "de": "5 GB für Ihre Website", "en": "5 GB for your website", "descDe": "5 GB Gesamtplatz für Website, Datenbanken und E-Mails.", "descEn": "5 GB total storage shared by website, databases and email."}, {"type": "shield", "de": "SSL & verschlüsselte Verbindung", "en": "SSL & encrypted connection", "descDe": "SSL wird nach Domain- und DNS-Einrichtung aktiviert.", "descEn": "SSL is activated after domain and DNS setup."}, {"type": "mailbox", "de": "E-Mail auf Ihrer Domain", "en": "Email on your domain", "descDe": "Bis zu 5 Postfächer, je maximal 2 GB innerhalb der 5 GB Gesamtquote.", "descEn": "Up to 5 mailboxes, each capped at 2 GB within the 5 GB total quota."}];
manifest["hosting-wordpress"]=[{"type": "wordpress", "de": "WordPress einrichten", "en": "Set up WordPress", "descDe": "Eine WordPress-Website auf 10 GB Gesamtplatz; 200 GB monatlicher Datenverkehr.", "descEn": "One WordPress site with 10 GB total storage and 200 GB monthly traffic."}, {"type": "maintenance", "de": "Updates & Pflege", "en": "Updates & care", "descDe": "WordPress, Plugins und Themes werden abgestimmt gepflegt; Änderungen werden geprüft.", "descEn": "WordPress, plugins and themes receive agreed maintenance; changes are checked."}, {"type": "backup", "de": "Backups prüfen", "en": "Check backups", "descDe": "Vor Änderungen wird der Backup-Status geprüft. Wiederherstellung wird nach Bedarf abgestimmt.", "descEn": "Backup status is checked before changes. Restoration is agreed as needed."}, {"type": "maintenance", "de": "30 Minuten Änderungen", "en": "30 minutes of changes", "descDe": "30 Minuten kleine Änderungen pro Monat. Größere Arbeiten werden separat angeboten.", "descEn": "30 minutes of small changes per month. Larger work is quoted separately."}];
manifest["hosting-apps"]=[{"type": "deploy", "de": "Ihre App. Ihr Dienst.", "en": "Your app. Your service.", "descDe": "Eine definierte Anwendung oder ein Bot. Ressourcen und Laufzeit werden vor Start bestätigt.", "descEn": "One agreed app or bot. Resources and runtime are confirmed before launch."}, {"type": "server", "de": "Passende Serverressourcen", "en": "Appropriate server resources", "descDe": "Der passende Server wird vor Vertragsabschluss bereitgestellt und getestet.", "descEn": "The appropriate server is provisioned and tested before contract."}, {"type": "monitor", "de": "Betrieb im Blick", "en": "Monitor operations", "descDe": "Grundlegende Überwachung und Neustartregeln werden pro Dienst vereinbart.", "descEn": "Basic monitoring and restart rules are agreed for each service."}, {"type": "deploy", "de": "AI & APIs nach Nutzung", "en": "AI & APIs by usage", "descDe": "AI/API-Nutzung ist nicht im Hostingpreis enthalten und wird vor Start geklärt.", "descEn": "AI/API usage is excluded from the hosting price and agreed before launch."}];
manifest["hosting-domains"]=[{"type": "domain", "de": "Ihre eigene Domain", "en": "Your own domain", "descDe": ".de 14,04 € pro Jahr; .com 21,60 € pro Jahr. Registrierung nur bei Verfügbarkeit.", "descEn": ".de €14.04 per year; .com €21.60 per year. Registration subject to availability."}, {"type": "dns", "de": "Domain und Website verbinden", "en": "Connect domain and website", "descDe": "DNS verbindet Ihre Domain mit dem richtigen Web- und Mailserver.", "descEn": "DNS connects your domain to the appropriate web and mail server."}, {"type": "domain", "de": "Jährlich verlängern", "en": "Renew annually", "descDe": "Domainregistrierung wird jährlich abgerechnet. Weitere Endungen auf Anfrage.", "descEn": "Domain registration is billed annually. Other extensions on request."}];
manifest["hosting-email"]=[{"type": "mailbox", "de": "Ihre Geschäftsadresse", "en": "Your business address", "descDe": "Ein 2-GB-Postfach auf Ihrer eigenen Domain. Domainkosten kommen separat hinzu.", "descEn": "One 2 GB mailbox on your own domain. Domain fees are separate."}, {"type": "mailbox", "de": "Webmail · IMAP · SMTP", "en": "Webmail · IMAP · SMTP", "descDe": "E-Mails im Browser und in Ihren Mailprogrammen lesen und senden.", "descEn": "Read and send email in your browser and mail applications."}, {"type": "shield", "de": "Ihre Domain authentifizieren", "en": "Authenticate your domain", "descDe": "SPF und DKIM werden passend eingerichtet. Zustellung hängt auch von Empfänger und Inhalt ab.", "descEn": "SPF and DKIM are configured. Delivery also depends on recipient and content."}, {"type": "mailbox", "de": "Einfach jährlich abrechnen", "en": "Simple annual billing", "descDe": "1,35 € monatlicher Vergleichspreis; jährliche Zahlung 16,20 €.", "descEn": "€1.35 monthly equivalent; billed annually at €16.20."}];
const categories={web:{label:'Web',number:'01',color:'#9c82ff'},ai:{label:'AI',number:'02',color:'#69bdff'},automation:{label:'Automation',number:'03',color:'#b186ff'},company:{label:'Company OS',number:'04',color:'#759dff'},hosting:{label:'Hosting',number:'05',color:'#68c2ff'}};
const packages=[...document.querySelectorAll('.lb-safe-card')].map(card=>{
 const id=card.id.replace('offer-',''),request=card.querySelector('[data-order-setup]')||{dataset:{orderSetup:0,orderMonthly:card.dataset.price}},type=card.querySelector('.lb-safe-type').textContent.toLowerCase();
 return{id,card,name:card.querySelector('h3').textContent,setup:Number(request.dataset.orderSetup),monthly:Number(request.dataset.orderMonthly),period:card.dataset.period||'month',category:card.dataset.category|| (type.includes('company')?'company':type.includes('automation')?'automation':type.includes('ai')?'ai':'web'),features:manifest[id]||[]};
});
let category='company',selected=packages.find(p=>p.category===category),step=0,allOffers=false;
const price=p=>p.category==='hosting'?number(p.monthly)+' € / '+t(p.period==='year'?'Jahr':'Monat',p.period==='year'?'year':'month'):number(p.setup)+' € '+t('Einrichtung','setup')+' + '+number(p.monthly)+' € / '+t('Monat','month');
const number=n=>new Intl.NumberFormat(lang()==='de'?'de-DE':'en-GB').format(n);
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const badge=(label,icon='↗')=>'<div class="fx-satellite"><span class="fx-icon">'+icon+'</span><span>'+label+'</span></div>';
const mini=(label,body,cls='')=>'<div class="fx-mini '+cls+'"><span class="fx-caption">'+label+'</span>'+body+'</div>';
const bar=(label='LOGOBOSS AI')=>'<div class="fx-browser-bar"><span><i></i><i></i><i></i></span><b>'+label+'</b><span>↗</span></div>';
const row=(label,tag)=>'<div class="fx-row"><span class="fx-row-icon">↗</span><span>'+label+'</span><small>'+tag+'</small></div>';
function visual(feature){
 const label=t(feature.de,feature.en),type=feature.type;
 let body='',floating='',icon='◇';
 if(['server','storage','shield','wordpress','maintenance','backup','deploy','monitor','domain','dns','mailbox'].includes(type)){
 let content='';
 if(type==='server')content='<div class="fx-server-rack">'+['WEB','DATA','MAIL'].map(x=>'<div class="fx-server-unit"><i></i><b>'+x+'</b><span>FRANKFURT · DE</span></div>').join('')+'</div>';
 else if(type==='storage')content='<div class="fx-capacity"><i></i></div>'+row('NVMe',t('SPEICHER','STORAGE'))+row(t('Website · Daten · Mail','Website · data · mail'),'5 GB');
 else if(type==='shield')content='<div class="fx-lock"></div><div class="fx-action">SSL · SPF · DKIM</div>';
 else if(type==='wordpress')content='<div class="fx-hosting-seal">W</div>'+row('WordPress','10 GB')+row(t('Website einrichten','Set up website'),'↗');
 else if(type==='maintenance')content=row('WordPress','✓')+row('Plugins','✓')+row('Themes','✓');
 else if(type==='backup')content='<div class="fx-hosting-seal">↶</div>'+row(t('Sicherung prüfen','Check backup'),'01')+row(t('Änderung vorbereiten','Prepare change'),'02');
 else if(type==='deploy')content='<div class="fx-deploy"><span>&lt;/&gt;</span><i></i><span>SERVER</span><i></i><span>BOT</span></div>';
 else if(type==='monitor')content='<div class="fx-status-grid">'+['APP','CPU','RAM'].map((x,i)=>'<div><span>'+x+'</span><i style="height:'+(45+i*20)+'px"></i><small>MONITOR</small></div>').join('')+'</div>';
 else if(type==='domain')content='<div class="fx-domain-name">your-business<span>.de</span></div>'+row('.de','14,04 € / '+t('Jahr','year'))+row('.com','21,60 € / '+t('Jahr','year'));
 else if(type==='dns')content='<div class="fx-deploy"><span>DOMAIN</span><i></i><span>WEB</span><i></i><span>MAIL</span></div>';
 else content='<div class="fx-envelope"><div class="fx-mail-letter"><b>info@your-business.de</b><i></i><i></i></div><span></span></div>';
 body=bar('LOGOBOSS · HOSTING')+'<div class="fx-content"><div class="fx-caption">'+t('IHRE DIGITALE BASIS','YOUR DIGITAL FOUNDATION')+'</div><h4>'+label+'</h4>'+content+'</div>';
 floating=mini('HOSTING','<span class="fx-big-symbol">'+({server:'◉',storage:'▤',shield:'◇',wordpress:'W',maintenance:'✓',backup:'↶',deploy:'⟷',monitor:'▥',domain:'◎',dns:'⟷',mailbox:'@'}[type])+'</span><b>'+t('Passend zu Ihrem System.','Built around your system.')+'</b>','fx-mini-right');icon='◎';
 }else if(type==='web'){
 body=bar(t('IHRE WEBSITE','YOUR WEBSITE'))+'<div class="fx-content"><div class="fx-caption">'+t('IHR UNTERNEHMEN','YOUR BUSINESS')+'</div><div class="fx-web-head">'+t('Ein Auftritt.<br>Ihre Geschichte.','One website.<br>Your story.')+'</div><div class="fx-web-picture"><span class="fx-web-sculpture"></span><span class="fx-web-sculpture second"></span><span class="fx-web-sculpture third"></span></div><div class="fx-web-nav"><span>'+t('Leistungen','Services')+'</span><span>'+t('Über uns','About')+'</span><span>'+t('Kontakt','Contact')+'</span></div></div>';
 floating=mini(t('SEITENSTRUKTUR','PAGE STRUCTURE'),'<b>'+feature.amount+' '+t('Seiten','pages')+'</b><div class="fx-page-stack"><i></i><i></i><i></i></div>','fx-mini-right');icon='▤';
 }else if(type==='form'){
 body=bar(t('KONTAKTANFRAGE','CONTACT REQUEST'))+'<div class="fx-content"><div class="fx-caption">'+t('DER NÄCHSTE SCHRITT','THE NEXT STEP')+'</div><h4>'+t('Sprechen wir darüber.','Let’s talk about it.')+'</h4><div class="fx-field">Name <span>↗</span></div><div class="fx-field">E-Mail <span>@</span></div><div class="fx-field fx-field-large">'+t('Ihr Anliegen','Your request')+'<span>✎</span></div><div class="fx-action">'+t('Anfrage senden','Send inquiry')+' ↗</div></div>';
 floating=mini(t('EINGANG','INBOX'),'<span class="fx-big-symbol">↗</span><b>'+t('Eine neue Anfrage.','A new inquiry.')+'</b><p>'+t('Bereit für Ihr Team.','Ready for your team.')+'</p>','fx-mini-right');icon='↗';
 }else if(type==='inbox'){
 body=bar(t('ANFRAGEÜBERSICHT','INQUIRY OVERVIEW'))+'<div class="fx-content"><div class="fx-caption">'+t('ALLE ANLIEGEN · EIN ORT','ALL REQUESTS · ONE PLACE')+'</div><h4>'+t('Ihr Eingang. Übersichtlich.','Your inbox. Organized.')+'</h4>'+row(t('Kontaktanfrage','Contact inquiry'),t('NEU','NEW'))+row(t('Information zu Leistungen','Service information'),t('OFFEN','PENDING'))+row(t('Rückmeldung vorbereiten','Prepare a reply'),t('IN ARBEIT','IN PROGRESS'))+'</div>';
 floating=mini(t('KUNDENKONTAKT','CUSTOMER CONTACT'),'<span class="fx-big-symbol">◎</span><b>'+t('Das Anliegen bleibt verbunden.','The inquiry stays connected.')+'</b><p>'+t('Kontakt · Nachricht · Status','Contact · Message · Status')+'</p>','fx-mini-left');icon='▤';
 }else if(type==='calendar'){
 body=bar(t('TERMINWUNSCH','APPOINTMENT REQUEST'))+'<div class="fx-content"><div class="fx-caption">'+t('KONTAKT → TERMIN','CONTACT → APPOINTMENT')+'</div><h4>'+t('Zeit für Ihre Kunden.','Time for your customers.')+'</h4><div class="fx-calendar">'+Array.from({length:21},(_,i)=>'<span class="'+(i===12?'chosen':'')+'">'+(i+1)+'</span>').join('')+'</div><div class="fx-action">'+t('Termin anfragen','Request appointment')+' ↗</div></div>';
 floating=mini(t('IHR TEAM','YOUR TEAM'),'<span class="fx-big-symbol">◷</span><b>'+t('Anfrage prüfen.','Review the request.')+'</b><p>'+t('Bestätigung durch Ihr Unternehmen.','Confirmed by your business.')+'</p>','fx-mini-right');icon='◷';
 }else if(type==='language'){
 body=bar(t('SPRACHVERSION','LANGUAGE VERSION'))+'<div class="fx-content fx-language"><span>DE</span><h4>Hallo.</h4><div class="fx-caption">'+t('Ihre Marke. Ihre Sprache.','Your brand. Your language.')+'</div><div class="fx-language-line"></div><span>EN</span><h4>Hello.</h4></div>';
 floating=mini(t('IM PAKET','INCLUDED'),'<span class="fx-big-symbol">◎</span><b>'+(feature.single?t('DE oder EN','DE or EN'):'DE + EN')+'</b><p>'+t(feature.single?'Eine Sprachversion auswählen.':'Zwei Sprachversionen.',feature.single?'Choose one language version.':'Two language versions.')+'</p>','fx-mini-right');icon='◎';
 }else if(type==='phone'){
 body='<div class="fx-phone"><div class="fx-phone-notch"></div><div class="fx-content"><div class="fx-caption">YOUR BUSINESS</div><h4>'+t('Ihr Auftritt.<br>Auch mobil.','Your website.<br>On mobile too.')+'</h4><div class="fx-web-picture"><span class="fx-web-sculpture"></span></div><div class="fx-web-nav"><span>01</span><span>02</span><span>03</span></div></div></div>';
 floating=mini('RESPONSIVE','<div class="fx-screen-sizes"><i></i><i></i><i></i></div><b>'+t('Jede Bildschirmgröße.','Every screen size.')+'</b>','fx-mini-right');icon='▯';
 }else if(type==='seo'){
 body=bar('SEO · SSL')+'<div class="fx-content"><div class="fx-caption">'+t('DIE GRUNDLAGE IHRES AUFTRITTS','YOUR WEBSITE FOUNDATION')+'</div><h4>'+t('Sichtbar. Klar. Geschützt.','Visible. Clear. Protected.')+'</h4><div class="fx-search"><span>⌕</span>'+t('Ihr Unternehmen','Your business')+'</div><div class="fx-search-result"><small>YOUR BUSINESS</small><b>'+t('Ihre Leistungen auf einen Blick.','Your services at a glance.')+'</b><p>'+t('Eine klare Seitenstruktur und SEO-Grundlagen.','A clear site structure and basic SEO.')+'</p></div></div>';
 floating=mini('SSL','<div class="fx-lock small"></div><b>'+t('Verschlüsselte Verbindung.','Encrypted connection.')+'</b>','fx-mini-right');icon='⌕';
 }else if(type==='login'){
 body=bar('COMPANY WORKSPACE')+'<div class="fx-content fx-login"><div class="fx-lock"></div><h4>'+t('Ihr Unternehmen.<br>Ihr Zugang.','Your business.<br>Your access.')+'</h4><div class="fx-field">E-Mail <span>@</span></div><div class="fx-field">•••••••• <span>◇</span></div><div class="fx-action">'+t('Geschützter Login','Protected login')+' ↗</div></div>';
 floating=mini(t('EIN UNTERNEHMEN','ONE BUSINESS'),'<span class="fx-big-symbol">◇</span><b>'+t('Ihr eigener Bereich.','Your own workspace.')+'</b><p>'+t('Freischaltung nach Einrichtung.','Enabled after setup.')+'</p>','fx-mini-right');icon='◇';
 }else if(type==='dashboard'){
 body=bar('LOGOBOSS · DASHBOARD')+'<div class="fx-content"><div class="fx-caption">'+t('GRUNDLEGENDE ÜBERSICHT','BASIC OVERVIEW')+'</div><h4>'+t('Sehen, was ansteht.','See what comes next.')+'</h4><div class="fx-status-grid">'+[t('Neu','New'),t('In Arbeit','In progress'),t('Erledigt','Done')].map((x,i)=>'<div><span>'+x+'</span><i style="height:'+(55+i*18)+'px"></i><small>STATUS</small></div>').join('')+'</div></div>';
 floating=mini(t('ANFRAGEN & STATUS','INQUIRIES & STATUS'),'<span class="fx-big-symbol">▥</span><b>'+t('Ein klarer Überblick.','One clear overview.')+'</b>','fx-mini-left');icon='▥';
 }else if(type==='workflow'||type==='database'||type==='chatflows'){
 const count=type==='workflow'?feature.amount:type==='chatflows'?2:1;
 body=bar(t('VERBUNDENE ABLÄUFE','CONNECTED WORKFLOWS'))+'<div class="fx-content"><div class="fx-caption">'+t('SCHRITT FÜR SCHRITT','STEP BY STEP')+'</div><h4>'+t('Der Ablauf verbindet.','Let the workflow connect.')+'</h4><div class="fx-pipelines">'+Array.from({length:count},(_,i)=>'<div class="fx-pipeline"><span class="fx-pipe-node">'+(type==='chatflows'?'AI':'↗')+'</span><i></i><span class="fx-pipe-node">'+(type==='database'?'▤':'◇')+'</span><i></i><span class="fx-pipe-node">✓</span></div>').join('')+'</div><div class="fx-web-nav"><span>'+t('Auslöser','Trigger')+'</span><span>'+t('Verbindung','Connection')+'</span><span>'+t('Ergebnis','Result')+'</span></div></div>';
 floating=mini(type==='database'?'DATABASE':t('IM PAKET','INCLUDED'),'<div class="fx-data-cube"></div><b>'+t(type==='database'?'Daten & Status':count===1?'Ein Workflow':'Bis zu '+count+' Abläufe',type==='database'?'Data & status':count===1?'One workflow':'Up to '+count+' flows')+'</b>','fx-mini-right');icon='⟷';
 }else if(type==='chat'){
 body=bar('AI · TEXT CHAT')+'<div class="fx-content"><div class="fx-caption">'+t('AUF IHRER WEBSITE','ON YOUR WEBSITE')+'</div><h4>'+t('Ein Gespräch beginnt.','A conversation starts.')+'</h4><div class="fx-chat user">'+t('Welche Leistungen bieten Sie an?','What services do you offer?')+'</div><div class="fx-chat">'+t('Ich helfe Ihnen mit Informationen zu unseren Leistungen.','I can help with information about our services.')+'</div><div class="fx-chat-compose">'+t('Ihre Frage …','Your question …')+'<span>↗</span></div></div>';
 floating=mini('TEXT CHAT','<div class="fx-ai-orb"></div><b>'+t('Antworten im Chat.','Answers in chat.')+'</b>','fx-mini-right');icon='✧';
 }else if(type==='faq'){
 body=bar(t('FREIGEGEBENE INHALTE','APPROVED CONTENT'))+'<div class="fx-content"><div class="fx-caption">'+t('IHRE WISSENSGRUNDLAGE','YOUR KNOWLEDGE SOURCE')+'</div><h4>'+t('Ihr Wissen. Passende Antworten.','Your knowledge. Relevant answers.')+'</h4><div class="fx-document-stack"><div>FAQ<span>01 · '+t('Leistungen','Services')+'</span><span>02 · '+t('Kontakt','Contact')+'</span><span>03 · '+t('Informationen','Information')+'</span></div><i></i><i></i></div></div>';
 floating=mini(t('FREIGABE','APPROVAL'),'<span class="fx-big-symbol">✓</span><b>'+t('Von Ihnen festgelegt.','Defined by you.')+'</b><p>'+t('Nur freigegebene Inhalte.','Approved content only.')+'</p>','fx-mini-right');icon='▤';
 }else if(type==='email'){
 body=bar(t('E-MAIL-WORKFLOW','EMAIL WORKFLOW'))+'<div class="fx-content"><div class="fx-caption">'+t('NACH DER EINRICHTUNG','AFTER SETUP')+'</div><h4>'+t('Information erreicht Ihr Team.','Information reaches your team.')+'</h4><div class="fx-envelope"><div class="fx-mail-letter"><b>'+t('Eine neue Anfrage.','A new inquiry.')+'</b><i></i><i></i></div><span></span></div></div>';
 floating=mini(t('ABGESTIMMT','AGREED'),'<span class="fx-big-symbol">@</span><b>'+t(feature.templates?'Vorlagen & Bestätigung':'Ein E-Mail-Hinweis',feature.templates?'Templates & acknowledgement':'An email alert')+'</b>','fx-mini-right');icon='@';
 }else if(type==='approval'){
 body=bar(t('MENSCHLICHE KONTROLLE','HUMAN CONTROL'))+'<div class="fx-content"><div class="fx-caption">'+t('IHR TEAM ENTSCHEIDET','YOUR TEAM DECIDES')+'</div><h4>'+t('Der nächste Schritt.<br>In Ihren Händen.','The next step.<br>In your hands.')+'</h4><div class="fx-approval-symbol">✓</div><div class="fx-action">'+t('Zur Prüfung bereit','Ready for review')+' ↗</div></div>';
 floating=mini(t('REGELN','RULES'),'<span class="fx-big-symbol">◇</span><b>'+t('Definierte Übergabe.','Defined handover.')+'</b><p>'+t('Vor Umsetzung abgestimmt.','Agreed before implementation.')+'</p>','fx-mini-left');icon='✓';
 }else if(type==='guide'){
 body=bar(t('TEST & ÜBERGABE','TEST & HANDOVER'))+'<div class="fx-content"><div class="fx-caption">'+t('KLARER ABLAUF','CLEAR PROCESS')+'</div><h4>'+t('Bereit für die Übergabe.','Ready for handover.')+'</h4>'+row(t('Ablauf vereinbaren','Agree workflow'),'01')+row(t('Workflow testen','Test workflow'),'02')+row(t('Anleitung übergeben','Provide guide'),'03')+'</div>';
 floating=mini(t('ANLEITUNG','GUIDE'),'<span class="fx-big-symbol">▤</span><b>'+t('Die nächsten Schritte.','The next steps.')+'</b>','fx-mini-right');icon='✓';
 }else if(type==='services'){
 body=bar(t('LEISTUNGSKATALOG','SERVICE CATALOG'))+'<div class="fx-content"><div class="fx-caption">'+t('IHR ANGEBOT · KLAR STRUKTURIERT','YOUR OFFER · CLEARLY STRUCTURED')+'</div><h4>'+t('Was Ihr Unternehmen anbietet.','What your business offers.')+'</h4><div class="fx-service-grid">'+[t('Beratung','Consultation'),t('Dienstleistung','Service'),t('Individuelle Anfrage','Custom inquiry')].map((x,i)=>'<div><span>0'+(i+1)+'</span><b>'+x+'</b><i>↗</i></div>').join('')+'</div></div>';
 floating=mini(t('LEISTUNGEN','SERVICES'),'<span class="fx-big-symbol">▦</span><b>'+t('An einem Ort.','In one place.')+'</b>','fx-mini-left');icon='▦';
 }else{
 body=bar('COMPANY OS · MODULES')+'<div class="fx-content"><div class="fx-caption">'+t('GEZIELT FREISCHALTEN','ENABLE SELECTED FEATURES')+'</div><h4>'+t('Ihr System wächst in Modulen.','Your system grows in modules.')+'</h4><div class="fx-module-grid">'+[t('Anfragen','Inquiries'),t('Termine','Appointments'),t('Leistungen','Services'),t('Übersicht','Overview')].map((x,i)=>'<div><span>'+['▤','↗','◷','▦'][i]+'</span><b>'+x+'</b><small>'+t('NACH FREISCHALTUNG','AFTER ENABLEMENT')+'</small></div>').join('')+'</div></div>';
 floating=mini(t('IHR PAKET','YOUR PACKAGE'),'<span class="fx-big-symbol">◇</span><b>'+t('Vereinbarte Funktionen.','Agreed features.')+'</b>','fx-mini-right');icon='◇';
 }
 document.getElementById('motionScene').setAttribute('aria-label',t('Illustrativer 3D-Präsentationsbereich: ','Illustrative 3D presentation: ')+label);
 document.getElementById('motionScene').innerHTML='<div class="fx-floor"></div><div class="fx-orbit-ring"></div><div class="fx-depth-particles"><i></i><i></i><i></i><i></i></div><div class="fx-visual" data-visual="'+type+'" data-flows="'+(type==='workflow'?feature.amount:type==='chatflows'?2:1)+'"><div class="fx-solid"><div class="fx-thickness"></div><div class="fx-surface">'+body+'</div></div>'+floating+badge(label,icon)+'</div>';
}
function filterOffers(){
 let count=0;
 for(const p of packages){const visible=allOffers||p.category===category;p.card.hidden=!visible;if(visible)count++;}
 const name=categories[category].label;
 const intro=document.querySelector('.lb-safe-head>p');intro.textContent=category==='hosting'&&!allOffers?t('Webhosting, WordPress-Pflege, Apps, Domains und Geschäfts-E-Mail: Wählen Sie die passende digitale Basis. Umfang, Verfügbarkeit und Start werden vor Vertragsabschluss bestätigt.','Web hosting, WordPress care, apps, domains and business email: choose your digital foundation. Scope, availability and start date are confirmed before contract.'):t(intro.dataset.lbDe,intro.dataset.lbEn);
 document.querySelector('.lb-safe-grid').dataset.visibleCount=String(count);
 document.getElementById('lbSellableHeading').textContent=allOffers?t(packages.length+' Pakete. Ein klarer Leistungsumfang.',packages.length+' packages. Clear deliverables.'):name+' · '+count+' '+t(count===1?'Paket':'Pakete',count===1?'package':'packages');
 document.getElementById('motionOfferFilterLabel').textContent=allOffers?t('ALLE BEREICHE','ALL AREAS'):name.toUpperCase()+' · '+t('PASSENDE PAKETE','MATCHING PACKAGES');
}
function picker(){
 const offerLink=document.getElementById('motionSelectedOffer');offerLink.textContent=selected.category==='hosting'&&!window.lbHostingReady?.(selected.id)?t('Umfang & Anfrage ansehen ↗','View scope & inquiry ↗'):t('Umfang & Kauf ansehen ↗','View scope & purchase ↗');
 const list=packages.filter(p=>p.category===category);
 document.getElementById('motionPackagePicker').innerHTML=list.map(p=>'<button type="button" data-package="'+p.id+'" aria-pressed="'+(p.id===selected.id)+'"><span>'+escape(p.name)+'</span><small>'+price(p)+'</small><i>↗</i></button>').join('');
 document.getElementById('motionSelectedPackage').textContent=selected.name;
 document.getElementById('motionSelectedPrice').textContent=price(selected);
 for(const id of ['motionSelectedOffer','motionStoryOffer'])document.getElementById(id).href='#offer-'+selected.id;
}
function render(){
 const c=categories[category],feature=selected.features[step];
 if(!feature)return;
 track.dataset.category=category;track.dataset.step=String(step);track.style.setProperty('--accent',c.color);
 track.style.height=reduced.matches?'auto':(selected.features.length*84+86)+'svh';
 document.getElementById('motionSystemName').textContent=selected.name.toUpperCase();
 document.getElementById('motionStageTitle').textContent=t(feature.de,feature.en);
 document.getElementById('motionStageDescription').textContent=t(feature.descDe,feature.descEn);
 const count=String(step+1).padStart(2,'0')+' / '+String(selected.features.length).padStart(2,'0');
 document.getElementById('motionStepNumber').textContent=count;document.getElementById('motionFeatureIndex').textContent=count;
 document.getElementById('motionStepList').innerHTML=selected.features.map((x,i)=>'<button type="button" data-feature="'+i+'" aria-current="'+(i===step)+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+escape(t(x.de,x.en))+'</button>').join('');
 const link=document.getElementById('motionPackageLink');link.href='#offer-'+selected.id;link.textContent=t('Dieses Paket ansehen →','View this package →');
 document.querySelectorAll('.motion-tabs [data-category]').forEach(b=>{const active=b.dataset.category===category;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
 document.getElementById('motion-panel').setAttribute('aria-labelledby','motion-tab-'+category);
 filterOffers();
}
function refresh(){picker();render();visual(selected.features[step]);document.querySelectorAll('.lb-hosting-card').forEach(card=>{card.querySelector('.lb-safe-price').innerHTML=number(Number(card.dataset.price))+' € <small>/ '+t(card.dataset.period==='year'?'Jahr':'Monat',card.dataset.period==='year'?'year':'month')+'</small>';});window.lbRefreshHostingLinks?.();const checkoutSummary=window.lbHostingCheckoutSummary?.();const notice=document.querySelector('.lb-safe-alert');if(!notice.dataset.original)notice.dataset.original=notice.innerHTML;if(category==='hosting'&&!allOffers)notice.innerHTML='<b>HOSTING · '+t('AUF ANFRAGE','ON REQUEST')+'</b><span>'+t('Preise für Privatkunden inkl. anwendbarer MwSt. Verfügbarkeit und Start werden vor Vertragsabschluss bestätigt. Hosting wird noch nicht automatisch aktiviert. Domains und AI/API-Verbrauch sind separat, sofern nicht ausdrücklich enthalten.','Consumer prices include applicable VAT. Availability and start date are confirmed before contract. Hosting is not yet activated automatically. Domains and AI/API usage are separate unless explicitly included.')+'</span>';else {notice.innerHTML=notice.dataset.original;notice.querySelectorAll('[data-lb-de]').forEach(e=>e.textContent=t(e.dataset.lbDe,e.dataset.lbEn));}if(category==='hosting'&&!allOffers&&checkoutSummary){notice.innerHTML='<b></b><span></span>';notice.querySelector('b').textContent=checkoutSummary.title;notice.querySelector('span').textContent=checkoutSummary.body;}}
function selectCategory(id,hash=false){if(!categories[id])return;category=id;selected=packages.find(p=>p.category===id);step=0;allOffers=false;track.style.setProperty('--progress','0');refresh();if(hash)history.replaceState(null,'','#system-'+id);}
function selectPackage(id,hash=false){const p=packages.find(x=>x.id===id);if(!p)return;category=p.category;selected=p;step=0;allOffers=false;track.style.setProperty('--progress','0');refresh();if(hash)history.replaceState(null,'','#package-'+id);}
const topOffset=()=>innerWidth<=700?66:78;
function scrollFeature(next){
 if(reduced.matches){step=next;render();visual(selected.features[step]);return;}
 const y=track.getBoundingClientRect().top+scrollY-topOffset(),distance=Math.max(1,track.offsetHeight-track.querySelector('.motion-stage').offsetHeight);
 scrollTo({top:y+distance*(next+.12)/selected.features.length,behavior:'smooth'});
}
function updateScroll(){
 if(reduced.matches)return;
 const rect=track.getBoundingClientRect(),distance=Math.max(1,rect.height-track.querySelector('.motion-stage').offsetHeight),p=Math.max(0,Math.min(.9999,(topOffset()-rect.top)/distance)),next=Math.floor(p*selected.features.length);
 track.style.setProperty('--progress',String(p));track.style.setProperty('--scene-phase',String((p*selected.features.length)%1));
 if(next!==step){step=next;render();visual(selected.features[step]);}
}
let queued=false;addEventListener('scroll',()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;updateScroll();});},{passive:true});
addEventListener('resize',()=>requestAnimationFrame(updateScroll));
document.getElementById('motionStepList').addEventListener('click',e=>{const b=e.target.closest('[data-feature]');if(b)scrollFeature(Number(b.dataset.feature));});
document.getElementById('motionPackagePicker').addEventListener('click',e=>{const b=e.target.closest('[data-package]');if(b)selectPackage(b.dataset.package,true);});
document.querySelector('.motion-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b)selectCategory(b.dataset.category,true);});
document.querySelector('.motion-tabs').addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 const list=[...document.querySelectorAll('.motion-tabs button')],at=list.indexOf(document.activeElement);if(at<0)return;e.preventDefault();
 const next=e.key==='Home'?0:e.key==='End'?list.length-1:(at+(e.key==='ArrowRight'?1:list.length-1))%list.length;selectCategory(list[next].dataset.category,true);list[next].focus();
});
function ensureHome(){if(document.getElementById('homeView').classList.contains('hidden'))document.querySelector('[data-home]').click();}
document.addEventListener('click',e=>{
 const all=e.target.closest('[data-motion-all]');
 if(all){allOffers=true;filterOffers();const notice=document.querySelector('.lb-safe-alert');if(notice.dataset.original)notice.innerHTML=notice.dataset.original;if(all.tagName==='BUTTON'){e.preventDefault();document.getElementById('services').scrollIntoView({behavior:reduced.matches?'auto':'smooth'});}return;}
 const a=e.target.closest('a[href^="#"]');if(!a)return;const href=a.getAttribute('href'),m=href.match(/^#system-(web|ai|automation|company|hosting)$/);
 if(m){e.preventDefault();ensureHome();selectCategory(m[1],true);document.getElementById('megaClose')?.click();document.getElementById('systems').scrollIntoView({behavior:reduced.matches?'auto':'smooth'});document.getElementById('motion-tab-'+category).focus({preventScroll:true});return;}
 if(href==='#systems'){ensureHome();}
 if(href.startsWith('#offer-')){const p=packages.find(x=>'#offer-'+x.id===href);if(p&&p.card.hidden){selectPackage(p.id);ensureHome();}}
});
function deepLink(){
 let m=location.hash.match(/^#system-(web|ai|automation|company|hosting)$/);
 if(m){selectCategory(m[1]);requestAnimationFrame(()=>document.getElementById('systems').scrollIntoView());return;}
 m=location.hash.match(/^#package-(.+)$/);
 if(m&&packages.some(p=>p.id===m[1])){selectPackage(m[1]);requestAnimationFrame(()=>document.getElementById('motionPackagePicker').scrollIntoView());return;}
 m=location.hash.match(/^#offer-(.+)$/);if(m&&packages.some(p=>p.id===m[1])){selectPackage(m[1]);requestAnimationFrame(()=>document.getElementById('offer-'+m[1]).scrollIntoView());return;}
 if(location.hash==='#services'){allOffers=true;filterOffers();}
}
addEventListener('hashchange',deepLink);
new MutationObserver(()=>refresh()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
reduced.addEventListener('change',()=>{render();updateScroll();});
const observer=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('depth-visible');observer.unobserve(x.target);}}),{threshold:.1});
document.querySelectorAll('.lb-safe-card,.about-pro-card,.lb-footer-top').forEach(el=>{el.classList.add('motion-depth');observer.observe(el);});
refresh();deepLink();requestAnimationFrame(updateScroll);
})();