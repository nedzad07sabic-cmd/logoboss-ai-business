/* Public catalog. Existing auth, orders and support remain in index.html. */
(function (root) {
  'use strict';
  const data = root.LB_CATALOG;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const symbols = {
    web: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M8 21h8M12 18v3"/>',
    ai: '<path d="M20 11a7 7 0 0 1-7 7H6l-4 3V9a6 6 0 0 1 6-6h5M17 2v6M14 5h6M7 10h6M7 14h3"/>',
    automation: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h9v9M3 18h8m-3-3 3 3-3 3"/>',
    company: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12M13 13h4M13 17h4"/>',
    hosting: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6h.01M7 17h.01M11 6h6M11 17h6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>',
    'web-business':'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M8 21h8M12 18v3M8 12h3M8 15h6"/>',
    'web-pro':'<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M2 8h20M9 21h6M12 18v3M15 12a2 2 0 0 1 4 0v3h-4v-3Z"/>',
    'ai-pro':'<path d="M20 10a7 7 0 0 1-7 7H6l-4 3V9a6 6 0 0 1 6-6h5M17 2v6M14 5h6M9 10h3M16 19h5M18 17l3 2-3 2"/>',
    'automation-business':'<rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="9" y="16" width="6" height="6" rx="1"/><path d="M5 8v4h14V8M12 12v4"/>',
    'hosting-wordpress':'<circle cx="12" cy="12" r="9"/><path d="m5 8 4 10 3-8 3 8 4-10M7 8h3M12 8h4"/>',
    'hosting-apps':'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8h3v3H8zM14 8h2M8 15h2M13 14h3v3h-3z"/>',
    'hosting-domains':'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>',
    'hosting-email':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>'
  };
  function icon(id) { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+(symbols[id] || symbols.web)+'</svg>'; }
  const languageInfo = lang => data.languages.find(item => item.code === lang) || data.languages[0];
  const t = (key, lang) => data.ui[key]?.[lang] || data.ui[key]?.de || key;
  const local = (object, lang) => object?.[lang] || object?.de || '';
  const money = (amount, lang) => new Intl.NumberFormat(languageInfo(lang).locale, {style:'currency',currency:'EUR',maximumFractionDigits:2,minimumFractionDigits:amount % 1 ? 2 : 0}).format(amount);
  const packageUrl = (p, lang) => '/packages/'+p.id+'.html'+(lang==='de'?'':'?lang='+lang);
  const groupUrl = (g, lang) => '/systems/'+g.id+'.html'+(lang==='de'?'':'?lang='+lang);
  const mailUrl = p => 'mailto:info.logobossai@gmail.com?subject='+encodeURIComponent('LogoBoss AI'+(p?' · '+p.name:''));
  function checkoutUrl(p,lang) {
    if (!p.pay || !p.live) return '';
    if (p.group === 'hosting') {
      const url = new URL(p.pay);
      url.searchParams.set('language',lang==='de'?'German':'English');
      return url.href;
    }
    return p.pay;
  }
  function header(lang) {
    return '<a class="lb-skip" href="#lbExperience">'+esc(t('skip',lang))+'</a><header class="lb-header"><div class="lb-container lb-header-inner"><a class="lb-wordmark" href="/?lang='+lang+'#home" aria-label="LogoBoss AI Home">LogoBoss <b>AI</b></a><nav aria-label="'+esc(t('systems',lang))+'"><a href="/?lang='+lang+'#home">'+esc(t('home',lang))+'</a><a href="/?lang='+lang+'#systems">'+esc(t('systems',lang))+'</a><a href="/?lang='+lang+'#account">'+esc(t('account',lang))+'</a></nav></div></header>';
  }
  function languagePicker(lang){
    return '<div class="lb-language-picker"><button class="lb-language-toggle" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="lbLanguageMenu" aria-label="'+esc(t('language',lang))+'">'+icon('globe')+' <span>'+lang.toUpperCase()+'</span><span class="lb-language-chevron" aria-hidden="true">⌃</span></button><div class="lb-language-list" id="lbLanguageMenu" role="menu" aria-label="'+esc(t('language',lang))+'" hidden>'+data.languages.map(item=>'<button type="button" role="menuitemradio" lang="'+item.code+'" dir="'+(item.code==='ar'?'rtl':'ltr')+'" aria-checked="'+(item.code===lang)+'" data-catalog-lang="'+item.code+'">'+esc(item.name)+'<span class="lb-language-dot" aria-hidden="true"></span></button>').join('')+'</div></div>';
  }
  function footer(lang) {
    return '<footer class="lb-footer"><div class="lb-container"><div class="lb-footer-grid"><div><a class="lb-wordmark" href="/?lang='+lang+'"><img class="lb-brand-icon" src="/logo-boss.svg" width="38" height="38" alt="">LogoBoss <b>AI</b></a><p>'+esc(t('heroEyebrow',lang))+'</p><a href="mailto:info.logobossai@gmail.com">info.logobossai@gmail.com</a></div><div><b>'+esc(t('systems',lang))+'</b>'+Object.values(data.groups).map(g=>'<a href="'+groupUrl(g,lang)+'">'+esc(local(g.name,lang))+'</a>').join('')+'</div><div><b>'+esc(t('account',lang))+'</b><a href="/?lang='+lang+'#account">'+esc(t('account',lang))+'</a><a href="/?lang='+lang+'#support">'+esc(t('support',lang))+'</a><a href="https://portal.logobossweb-ai.eu/clientarea.php?language='+(lang==='de'?'German':'English')+'">'+esc(t('hostingPortal',lang))+'</a><a href="https://billing.stripe.com/p/login/00wbJ15ybdVk4mK7pp3ZK00">'+esc(t('invoices',lang))+'</a><a href="/app.html">'+esc(t('install',lang))+'</a><small>'+esc(t('moduleLang',lang))+'</small></div></div><div class="lb-footer-bottom"><span>© '+new Date().getFullYear()+' LogoBoss AI</span><div class="lb-footer-legal"><a href="/impressum.html">'+esc(t('legal',lang))+'</a><a href="/datenschutz.html">'+esc(t('privacy',lang))+'</a>'+languagePicker(lang)+'</div></div></div></footer>';
  }
  function process(lang) {
    return '<section class="lb-process lb-container"><h2>'+esc(t('processTitle',lang))+'</h2><div>'+[1,2,3].map(n=>'<article><span>0'+n+'</span><h3>'+esc(t('step'+n,lang))+'</h3><p>'+esc(t('step'+n+'Copy',lang))+'</p></article>').join('')+'</div></section>';
  }
  function help(lang,p) {
    return '<section class="lb-contact-section lb-container"><div><span class="lb-kicker">LOGOBOSS AI</span><h2>'+esc(t('helpTitle',lang))+'</h2><p>'+esc(t('helpCopy',lang))+'</p></div><a class="lb-button lb-button-primary" href="'+esc(mailUrl(p))+'">'+esc(t('talk',lang))+' <span aria-hidden="true">↗</span></a></section>';
  }
  function card(p,lang) {
    const g = data.groups[p.group];
    return '<article class="lb-package-card" id="card-'+p.id+'"><div class="lb-card-top"><span class="lb-card-category">'+icon(p.group)+esc(local(g.name,lang))+'</span>'+(!p.live?'<span class="lb-status lb-status-soon">'+esc(t('soon',lang))+'</span>':'')+'</div><h3>'+esc(p.name)+'</h3><p class="lb-card-desc">'+esc(local(p.short,lang))+'</p><div class="lb-card-price"><strong><bdi>'+(p.id==='hosting-domains'?esc(t('from',lang))+' ':'')+esc(money(p.setup||p.recurring,lang))+'</bdi></strong><span>'+esc(p.setup?t('setup',lang):'/ '+t(p.period,lang))+'</span></div>'+(p.setup?'<p class="lb-recurring">+ <bdi>'+esc(money(p.recurring,lang))+'</bdi> / '+esc(t('month',lang))+'</p>':'<p class="lb-recurring">'+esc(p.id==='hosting-domains'?local(data.features.domainPrice,lang):t(p.live?'available':'soon',lang))+'</p>')+'<ul>'+p.features.slice(0,3).map(k=>'<li>'+esc(local(data.features[k],lang))+'</li>').join('')+'</ul><a class="lb-button lb-button-outline" href="'+packageUrl(p,lang)+'">'+esc(t('details',lang))+' <span aria-hidden="true">↗</span></a></article>';
  }
  function catalog(lang,filter) { return data.packages.filter(p=>filter==='all'||p.group===filter).map(p=>card(p,lang)).join(''); }
  function home(lang) {
    const order=['web','ai','automation','company','hosting'];
    const paths='<svg class="lb-network-links" viewBox="0 0 1200 640" aria-hidden="true" fill="none"><defs><linearGradient id="lbNetworkGlow"><stop stop-color="#498aff" stop-opacity=".08"/><stop offset=".5" stop-color="#74bcff" stop-opacity=".6"/><stop offset="1" stop-color="#a276ff" stop-opacity=".12"/></linearGradient></defs><g stroke="url(#lbNetworkGlow)" stroke-width="1"><path d="M600 315C460 160 400 110 225 110M600 315C750 130 810 100 975 110M600 315C785 360 825 345 975 365M600 315C550 450 560 510 600 560M600 315C405 350 380 370 225 365"/><ellipse cx="600" cy="315" rx="370" ry="210" stroke-dasharray="3 8"/></g><g fill="#9abfff"><circle cx="225" cy="110" r="3"/><circle cx="975" cy="110" r="3"/><circle cx="975" cy="365" r="3"/><circle cx="600" cy="560" r="3"/><circle cx="225" cy="365" r="3"/></g></svg>';
    const groups=order.map(id=>{const g=data.groups[id];return '<section class="lb-orbit-group lb-orbit-'+id+'" aria-labelledby="orbit-title-'+id+'"><a class="lb-orbit-group-title" id="orbit-title-'+id+'" href="'+groupUrl(g,lang)+'">'+esc(local(g.name,lang))+' <span aria-hidden="true">↗</span></a><div>'+data.packages.filter(p=>p.group===id).map(p=>'<a class="lb-orbit-package" href="'+packageUrl(p,lang)+'" data-orbit-package="'+p.id+'"><span class="lb-orbit-icon">'+icon(symbols[p.id]?p.id:p.group)+'</span><span>'+esc(p.name)+'</span></a>').join('')+'</div></section>';}).join('');
    return '<section class="lb-brand-intro lb-container" id="home"><span class="lb-kicker">LOGOBOSS AI · '+esc(t('heroEyebrow',lang))+'</span><h1>'+esc(t('heroTitle',lang)).replace(/\n/g,'<br>')+'</h1><p>'+esc(t('heroCopy',lang))+'</p></section><section class="lb-network-section lb-container" id="systems" aria-label="'+esc(t('globeLabel',lang))+'"><span id="services" class="lb-anchor"></span><p class="lb-network-hint">'+esc(t('globeHint',lang))+'</p><div class="lb-network-stage">'+paths+'<div class="lb-globe"><canvas id="motionEarth" aria-hidden="true"></canvas><button id="motionPause" class="lb-globe-pause" type="button" aria-label="'+esc(t('pauseGlobe',lang))+'" aria-pressed="false"><span aria-hidden="true">Ⅱ</span></button></div>'+groups+'<div class="lb-network-signature" aria-hidden="true"><span>LOGOBOSS AI</span><small>CONNECTED BUSINESS</small></div></div></section><section class="lb-about lb-container" id="about"><span class="lb-kicker">LOGOBOSS AI</span><h2>'+esc(t('aboutTitle',lang))+'</h2><p>'+esc(t('aboutCopy',lang))+'</p><a class="lb-button lb-button-primary" href="'+mailUrl()+'">'+esc(t('talk',lang))+' <span aria-hidden="true">↗</span></a></section>';
  }
  function categoryPage(g,lang){
    const list=data.packages.filter(p=>p.group===g.id);
    return '<section class="lb-category-intro lb-container"><a class="lb-back-link" href="/?lang='+lang+'#systems">← '+esc(t('home',lang))+'</a><div class="lb-category-heading"><span class="lb-category-icon">'+icon(g.id)+'</span><div><span class="lb-kicker">LOGOBOSS AI</span><h1>'+esc(local(g.name,lang))+'</h1><p>'+esc(local(g.why,lang))+'</p></div></div></section><section class="lb-category-offers lb-container"><div class="lb-package-grid">'+list.map(p=>card(p,lang)).join('')+'</div><p class="lb-billing-summary">'+esc(t(g.id==='hosting'?'hostingNote':'billingNote',lang))+'</p></section>'+help(lang);
  }
  function flowSection(p,lang){
    return '<section class="lb-flow-section lb-container"><div><span class="lb-kicker">'+esc(t('flowTitle',lang))+'</span><h2>'+esc(t('flowTitle',lang))+'</h2><p>'+esc(t('flowCopy',lang))+'</p></div><ol class="lb-product-flow">'+p.flow.map((k,i)=>'<li><span class="lb-flow-number">0'+(i+1)+'</span><span class="lb-flow-icon" aria-hidden="true">'+icon(i===0?'web':i===1?'ai':i===2?'automation':'company')+'</span><b>'+esc(t(k,lang))+'</b>'+(i<3?'<span class="lb-flow-arrow" aria-hidden="true">→</span>':'')+'</li>').join('')+'</ol></section>';
  }
  function faq(lang,hosting) {
    const pairs=[['faq1','faq1Answer'],['faq2','faq2Answer'],[hosting?'faqHosting':'faq3',hosting?'faqHostingAnswer':'faq3Answer']];
    return '<section class="lb-faq lb-container"><h2>'+esc(t('faq',lang))+'</h2><div>'+pairs.map(([q,a])=>'<details><summary>'+esc(t(q,lang))+'</summary><p>'+esc(t(a,lang))+'</p></details>').join('')+'</div></section>';
  }
  function packagePage(p,lang) {
    const g=data.groups[p.group],href=checkoutUrl(p,lang);
    const primary=href?'<a class="lb-button lb-button-primary" href="'+esc(href)+'">'+esc(t(p.group==='hosting'?'chooseHosting':'buy',lang))+' <span aria-hidden="true">↗</span></a>':'<a class="lb-button lb-button-outline" href="'+esc(mailUrl(p))+'">'+esc(t('wait',lang))+' ↗</a>';
    return '<section class="lb-package-hero lb-container" id="home"><a class="lb-back-link" href="'+groupUrl(g,lang)+'">← '+esc(t('backPackages',lang))+'</a><div class="lb-package-hero-grid"><div><span class="lb-kicker">'+icon(p.group)+esc(local(g.name,lang))+'</span><h1>'+esc(p.name)+'</h1><p>'+esc(local(p.short,lang))+'</p><span class="lb-status '+(p.live?'lb-status-live':'lb-status-soon')+'">'+esc(t(p.live?'available':'soon',lang))+'</span><div class="lb-actions">'+primary+'<a class="lb-text-link" href="'+esc(mailUrl(p))+'">'+esc(t('mail',lang))+' →</a></div></div><div class="lb-package-photo"><img src="'+p.visual+'" width="1536" height="1024" alt="'+esc(t('visualAlt',lang)+' · '+p.name)+'" fetchpriority="high"><span>'+esc(t('visualLabel',lang))+'</span></div></div><p class="lb-visual-note">'+esc(t('visualNote',lang))+'</p></section><section class="lb-package-content lb-container"><div class="lb-scope-column"><section><h2>'+esc(t('why',lang))+'</h2><p class="lb-benefit-copy">'+esc(local(g.why,lang))+'</p></section><section class="lb-included"><h2>'+esc(t('included',lang))+'</h2><ul>'+p.features.map(k=>'<li><span aria-hidden="true">✓</span><div>'+esc(local(data.features[k],lang))+'</div></li>').join('')+'</ul></section><aside class="lb-limits"><b>'+esc(t('scope',lang))+'</b><p>'+esc(local(data.limits[p.limit],lang))+'</p></aside></div><aside class="lb-price-panel" id="pricing"><span class="lb-kicker">'+esc(t('priceTitle',lang))+'</span><h2>'+esc(p.name)+'</h2>'+(p.setup?'<dl><div><dt>'+esc(t('setup',lang))+'</dt><dd><bdi>'+esc(money(p.setup,lang))+'</bdi></dd></div><div><dt>'+esc(t('monthly',lang))+'</dt><dd><bdi>'+esc(money(p.recurring,lang))+'</bdi></dd></div></dl><div class="lb-total"><span>'+esc(t('today',lang))+'</span><strong><bdi>'+esc(money(p.setup+p.recurring,lang))+'</bdi></strong><small>'+esc(t('firstMonth',lang))+'</small></div><p class="lb-price-followup">'+esc(t('then',lang))+' <bdi>'+esc(money(p.recurring,lang))+'</bdi> / '+esc(t('month',lang))+'</p>':'<div class="lb-total"><span>'+esc(t(p.live?'today':'soon',lang))+'</span><strong><bdi>'+(p.id==='hosting-domains'?esc(t('from',lang))+' ':'')+esc(money(p.recurring,lang))+'</bdi></strong><small>/ '+esc(t(p.period,lang))+'</small></div>'+(p.id==='hosting-domains'?'<p>'+esc(local(data.features.domainPrice,lang))+'</p>':''))+'<div class="lb-price-actions">'+primary+(p.live&&p.group!=='hosting'?'<a class="lb-button lb-button-outline" href="/?request='+p.id+'&lang='+lang+'#request">'+esc(t('inquiry',lang))+'</a>':'')+'</div><p class="lb-price-note">'+esc(t(!p.live?'soonNote':p.group==='hosting'?'hostingNote':'billingNote',lang))+'</p></aside></section>'+flowSection(p,lang)+root.LB_PREVIEW.builder(p,lang)+process(lang)+faq(lang,p.group==='hosting')+help(lang,p);
  }
  root.LB_RENDER={header,footer,home,packagePage,categoryPage,catalog,packageUrl,groupUrl,checkoutUrl};
  if(typeof document==='undefined') return;

  const main=document.getElementById('lbExperience');
  if(!main) return;
  const currentPackage=data.packages.find(p=>p.id===main.dataset.package);
  const currentGroup=data.groups[main.dataset.group];
  const query=new URLSearchParams(location.search);
  let saved;try{saved=localStorage.getItem('lb_experience_lang')||localStorage.getItem('lb_lang');}catch{}
  let lang=languageInfo(query.get('lang')||saved||'de').code;
  let filter='all';
  function render() {
    const globe=main.querySelector('.lb-globe');
    // Keep the existing WebGL canvas and animation across language changes.
    main.innerHTML=currentPackage?packagePage(currentPackage,lang):currentGroup?categoryPage(currentGroup,lang):home(lang);
    document.body.classList.toggle('lb-home-page',!currentPackage&&!currentGroup);
    if(globe) main.querySelector('.lb-globe')?.replaceWith(globe);
    document.getElementById('lbHeader').innerHTML=header(lang);
    document.getElementById('lbFooter').innerHTML=footer(lang);
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.title=(currentPackage?currentPackage.name:currentGroup?local(currentGroup.name,lang):t('heroTitle',lang).replace(/\n/g,' '))+' | LogoBoss AI';
    const description=local(currentPackage?currentPackage.short:currentGroup?currentGroup.why:data.ui.heroCopy,lang);
    document.querySelector('meta[name="description"]')?.setAttribute('content',description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content',description);
    const pause=main.querySelector('#motionPause');if(pause)pause.setAttribute('aria-label',t(pause.getAttribute('aria-pressed')==='true'?'resumeGlobe':'pauseGlobe',lang));
    document.dispatchEvent(new CustomEvent('lb:catalog-language',{detail:{language:lang}}));
  }
  function saveLanguage(code) {
    lang=languageInfo(code).code;
    try{localStorage.setItem('lb_experience_lang',lang);localStorage.setItem('lb_lang',lang==='en'?'en':'de');localStorage.setItem('lb_site_lang',lang==='en'?'en':'de');}catch{}
    // Existing account/order modules remain natively DE/EN.
    document.getElementById(lang==='en'?'enBtn':'deBtn')?.click();
    const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);
    render();
    document.querySelector('.lb-language-toggle')?.focus();
  }
  function applyFilter(value,scroll) {
    if(currentPackage||!currentGroup) return;
    filter=value==='all'||data.groups[value]?value:'all';
    const grid=document.getElementById('lbPackageGrid');if(grid)grid.innerHTML=catalog(lang,filter);
    document.querySelectorAll('[data-catalog-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.catalogFilter===filter)));
    if(scroll) document.getElementById('services')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
  function handleHash() {
    const category=location.hash.match(/^#category-(web|ai|automation|company|hosting)$/);
    if(category&&!currentPackage&&!currentGroup) location.replace(groupUrl(data.groups[category[1]],lang));
    const offer=location.hash.match(/^#offer-(.+)$/);
    const p=offer&&data.packages.find(item=>item.id===offer[1]);
    if(p&&!currentPackage) location.replace(packageUrl(p,lang));
    // The retained app router scrolls its old home view to the top.
    // Restore only the public section anchor after that router finishes.
    if(!currentPackage&&!currentGroup&&['#home','#systems','#services'].includes(location.hash)){
      const id=location.hash==='#home'?'home':'systems';
      setTimeout(()=>document.getElementById(id)?.scrollIntoView({block:'start',behavior:'auto'}),40);
    }
  }
  function closeLanguageMenu() {
    const menu=document.getElementById('lbLanguageMenu'),toggle=document.querySelector('.lb-language-toggle');
    if(menu)menu.hidden=true;if(toggle)toggle.setAttribute('aria-expanded','false');
  }
  document.addEventListener('click',e=>{
    const anchor=e.target.closest('#lbHeader a,#lbExperience a');
    if(anchor&&!currentPackage&&!currentGroup){
      const url=new URL(anchor.href,location.href);
      if(url.origin===location.origin&&url.pathname===location.pathname&&['#home','#systems','#services'].includes(url.hash)){
        e.preventDefault();history.replaceState(null,'',url);
        document.getElementById(url.hash==='#home'?'home':'systems')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
        return;
      }
    }
    const toggle=e.target.closest('.lb-language-toggle');
    if(toggle){const menu=document.getElementById('lbLanguageMenu');menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)menu.querySelector('[aria-checked="true"]')?.focus();return;}
    const choice=e.target.closest('[data-catalog-lang]');if(choice){saveLanguage(choice.dataset.catalogLang);return;}
    if(!e.target.closest('.lb-language-picker'))closeLanguageMenu();
    const cat=e.target.closest('[data-catalog-category]');
    const fil=e.target.closest('[data-catalog-filter]');
    if(cat||fil){e.preventDefault();const next=cat?.dataset.catalogCategory||fil.dataset.catalogFilter;applyFilter(next,!!cat);history.replaceState(null,'','#'+(next==='all'?'services':'category-'+next));return;}
  });
  document.addEventListener('keydown',e=>{
    const menu=document.getElementById('lbLanguageMenu');
    if(e.key==='Escape'&&menu&&!menu.hidden){closeLanguageMenu();document.querySelector('.lb-language-toggle')?.focus();}
    if(menu&&!menu.hidden&&menu.contains(e.target)&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
      e.preventDefault();const options=[...menu.querySelectorAll('button')];const at=options.indexOf(document.activeElement);options[e.key==='Home'?0:e.key==='End'?options.length-1:(at+(e.key==='ArrowDown'?1:-1)+options.length)%options.length].focus();
    }
    if(e.key==='Tab')closeLanguageMenu();
  });
  window.addEventListener('hashchange',handleHash);
  try{localStorage.setItem('lb_experience_lang',lang);localStorage.setItem('lb_lang',lang==='en'?'en':'de');localStorage.setItem('lb_site_lang',lang==='en'?'en':'de');}catch{}
  document.getElementById(lang==='en'?'enBtn':'deBtn')?.click();
  render();
  handleHash();
  // Open the established authenticated order-request flow with approved package data.
  const request=data.packages.find(p=>p.id===query.get('request')&&p.live&&p.group!=='hosting');
  if(request&&!currentPackage){
    const open=()=>{
      const button=document.createElement('button');button.type='button';button.hidden=true;
      button.dataset.orderName=request.name;button.dataset.orderId=request.id==='digital-start'?'web-digital-start':request.id;
      button.dataset.orderSetup=request.setup;button.dataset.orderMonthly=request.recurring;
      document.body.append(button);button.click();button.remove();
      const note=document.getElementById('orderFairUse');if(note)note.textContent=local(data.limits[request.limit],lang);
    };
    if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',open,{once:true});else open();
  }
  // Native dialogs retain their own handlers; these adjustments are presentation-only.
  const fields={orderName:['Name','Name'],orderCompany:['Firma','Company'],orderEmail:['E-Mail','Email'],orderPhone:['Telefon / WhatsApp (optional)','Phone / WhatsApp (optional)'],orderCountry:['Land','Country'],orderNote:['Nachricht','Message']};
  for(const [id,names] of Object.entries(fields)){
    const field=document.getElementById(id);if(!field||document.querySelector('label[for="'+id+'"]'))continue;
    const label=document.createElement('label');label.htmlFor=id;label.className='lb-order-label'+(field.classList.contains('full')||field.tagName==='TEXTAREA'?' full':'');const title=document.createElement('span');title.dataset.lbDe=names[0]+(field.required?' *':'');title.dataset.lbEn=names[1]+(field.required?' *':'');title.textContent=title.dataset[lang==='en'?'lbEn':'lbDe'];label.append(title);field.parentNode.insertBefore(label,field);label.append(field);
  }
  const submit=document.getElementById('orderSubmit');if(submit){const actions=document.createElement('div');actions.className='lb-inquiry-actions';submit.closest('form').append(actions);actions.append(submit);const a=document.createElement('a');a.href=mailUrl(request);a.textContent=t('mail',lang);actions.append(a);document.addEventListener('lb:catalog-language',()=>{a.textContent=t('mail',lang);if(request){const note=document.getElementById('orderFairUse');if(note)note.textContent=local(data.limits[request.limit],lang);}});}
})(typeof window!=='undefined'?window:globalThis);
