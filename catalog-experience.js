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
    hosting: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6h.01M7 17h.01M11 6h6M11 17h6"/>'
  };
  function icon(id) { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+(symbols[id] || symbols.web)+'</svg>'; }
  const languageInfo = lang => data.languages.find(item => item.code === lang) || data.languages[0];
  const t = (key, lang) => data.ui[key]?.[lang] || data.ui[key]?.de || key;
  const local = (object, lang) => object?.[lang] || object?.de || '';
  const money = (amount, lang) => new Intl.NumberFormat(languageInfo(lang).locale, {style:'currency',currency:'EUR',maximumFractionDigits:2,minimumFractionDigits:amount % 1 ? 2 : 0}).format(amount);
  const packageUrl = (p, lang) => '/packages/'+p.id+'.html'+(lang==='de'?'':'?lang='+lang);
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
    return '<a class="lb-skip" href="#lbExperience">'+esc(t('skip',lang))+'</a><header class="lb-header"><div class="lb-container lb-header-inner"><a class="lb-wordmark" href="/?lang='+lang+'#home" aria-label="LogoBoss AI Home"><span class="lb-logo-icon" aria-hidden="true">'+icon('company')+'</span>LogoBoss <b>AI</b></a><nav aria-label="'+esc(t('systems',lang))+'"><a href="/?lang='+lang+'#home">'+esc(t('home',lang))+'</a><a href="/?lang='+lang+'#systems">'+esc(t('systems',lang))+'</a></nav><div class="lb-language-picker"><button class="lb-language-toggle" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="lbLanguageMenu" aria-label="'+esc(t('language',lang))+'"><span aria-hidden="true">◎</span> '+lang.toUpperCase()+' <span aria-hidden="true">⌄</span></button><div class="lb-language-list" id="lbLanguageMenu" role="menu" aria-label="'+esc(t('language',lang))+'" hidden>'+data.languages.map(item=>'<button type="button" role="menuitemradio" lang="'+item.code+'" dir="'+(item.code==='ar'?'rtl':'ltr')+'" aria-checked="'+(item.code===lang)+'" data-catalog-lang="'+item.code+'">'+esc(item.name)+'<span aria-hidden="true">'+(item.code===lang?'✓':'')+'</span></button>').join('')+'</div></div></div></header>';
  }
  function footer(lang) {
    return '<footer class="lb-footer"><div class="lb-container"><div class="lb-footer-grid"><div><a class="lb-wordmark" href="/?lang='+lang+'">LogoBoss <b>AI</b></a><p>'+esc(t('heroEyebrow',lang))+'</p><a href="mailto:info.logobossai@gmail.com">info.logobossai@gmail.com</a></div><div><b>'+esc(t('systems',lang))+'</b>'+Object.values(data.groups).map(g=>'<a href="/?lang='+lang+'#category-'+g.id+'">'+esc(local(g.name,lang))+'</a>').join('')+'</div><div><b>'+esc(t('account',lang))+'</b><a href="/?lang='+lang+'#account">'+esc(t('account',lang))+'</a><a href="/?lang='+lang+'#support">'+esc(t('support',lang))+'</a><a href="https://portal.logobossweb-ai.eu/clientarea.php?language='+(lang==='de'?'German':'English')+'">'+esc(t('hostingPortal',lang))+'</a><a href="https://billing.stripe.com/p/login/00wbJ15ybdVk4mK7pp3ZK00">'+esc(t('invoices',lang))+'</a><a href="/app.html">'+esc(t('install',lang))+'</a><small>'+esc(t('moduleLang',lang))+'</small></div></div><div class="lb-footer-bottom"><span>© '+new Date().getFullYear()+' LogoBoss AI</span><div><a href="/impressum.html">'+esc(t('legal',lang))+'</a><a href="/datenschutz.html">'+esc(t('privacy',lang))+'</a></div></div><details class="lb-credits"><summary>'+esc(t('photoCredit',lang))+'</summary><p>'+esc(t('photoNote',lang))+'</p><a href="https://unsplash.com/photos/UpsEF48wAgk">Cherrydeck / Unsplash</a> · <a href="https://unsplash.com/photos/tdnYk4qOGhc">ergonofis / Unsplash</a> · <a href="https://images.unsplash.com/photo-1560066984-138dadb4c035">Salon / Unsplash</a></details></div></footer>';
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
    return '<section class="lb-hero lb-container" id="home"><div class="lb-hero-copy"><span class="lb-kicker">'+esc(t('heroEyebrow',lang))+'</span><h1>'+esc(t('heroTitle',lang)).replace(/\n/g,'<br>')+'</h1><p>'+esc(t('heroCopy',lang))+'</p><div class="lb-actions"><a class="lb-button lb-button-primary" href="#services">'+esc(t('seePackages',lang))+' <span aria-hidden="true">↗</span></a><a class="lb-text-link" href="'+mailUrl()+'">'+esc(t('talk',lang))+' <span aria-hidden="true">→</span></a></div><small>'+esc(t('noObligation',lang))+'</small></div><div class="lb-hero-visual"><div class="lb-globe"><canvas id="motionEarth" aria-hidden="true"></canvas><button id="motionPause" class="lb-globe-pause" type="button" aria-label="Pause globe animation" aria-pressed="false"><span aria-hidden="true">Ⅱ</span></button><span class="lb-globe-caption">LOGOBOSS AI · CONNECTED BUSINESS</span></div><div class="lb-hero-preview"><img src="/assets/workspace.webp" width="1400" height="2100" alt="'+esc(local(data.groups.hosting.short,lang))+'" fetchpriority="high"><div><span class="lb-mini-label">WEB · AI · SYSTEMS</span><b>'+esc(t('clearScope',lang))+'</b><p>'+esc(t('ownPage',lang))+'</p></div></div></div></section><div class="lb-value-bar lb-container"><span>✓ '+esc(t('clearScope',lang))+'</span><span>✓ '+esc(t('ownPage',lang))+'</span><span>✓ '+esc(t('personalSetup',lang))+'</span></div><section class="lb-system-section lb-container" id="systems"><div class="lb-section-head"><div><span class="lb-kicker">LOGOBOSS AI · 5 '+esc(t('systems',lang).toUpperCase())+'</span><h2>'+esc(t('systemsTitle',lang))+'</h2></div><p>'+esc(t('systemsCopy',lang))+'</p></div><div class="lb-system-grid">'+Object.values(data.groups).map(g=>'<a href="#category-'+g.id+'" class="lb-system-tile" data-catalog-category="'+g.id+'"><span class="lb-system-icon">'+icon(g.id)+'</span><h3>'+esc(local(g.name,lang))+'</h3><p>'+esc(local(g.short,lang))+'</p><span aria-hidden="true">↗</span></a>').join('')+'</div></section><section class="lb-package-section" id="services"><div class="lb-container"><div class="lb-section-head"><div><span class="lb-kicker">13 '+esc(t('all',lang).toUpperCase())+'</span><h2>'+esc(t('packagesTitle',lang))+'</h2></div><p>'+esc(t('packagesCopy',lang))+'</p></div><div class="lb-catalog-filters" role="group" aria-label="'+esc(t('all',lang))+'">'+['all',...Object.keys(data.groups)].map(g=>'<button type="button" data-catalog-filter="'+g+'" aria-pressed="'+(g==='all')+'">'+esc(g==='all'?t('all',lang):local(data.groups[g].name,lang))+' <span>'+data.packages.filter(p=>g==='all'||p.group===g).length+'</span></button>').join('')+'</div><div class="lb-package-grid" id="lbPackageGrid">'+catalog(lang,'all')+'</div><p class="lb-billing-summary">'+esc(t('billingNote',lang))+'</p></div></section>'+process(lang)+help(lang);
  }
  function inbox(lang,kind) {
    const isPro=kind==='web-pro',os=kind==='company-os-start';
    return '<div class="lb-demo-workspace"><div class="lb-demo-toolbar"><b>LogoBoss <span>AI</span></b><span class="lb-demo-mark">'+esc(t('demo',lang))+'</span></div>'+(os?'<div class="lb-demo-tabs">'+['inbox','appointments','services'].map((k,i)=>'<button type="button" data-demo-tab="'+k+'" aria-pressed="'+(!i)+'">'+esc(t(k,lang))+'</button>').join('')+'</div>':'')+'<div class="lb-demo-inbox" data-demo-inbox><h3>'+esc(t('inbox',lang))+'</h3><div class="lb-demo-table"><div class="lb-demo-table-head"><span>'+esc(t('contactName',lang))+'</span><span>'+esc(t('newRequest',lang))+'</span><span>'+esc(t('status',lang))+'</span></div><div><b>Alex M.</b><span>'+esc(t('sampleContact',lang))+'</span><span class="lb-pill" data-demo-status>'+esc(t('new',lang))+'</span></div><div><b>Sam K.</b><span>'+esc(t('requestTime',lang))+'</span><span class="lb-pill lb-pill-blue">'+esc(t('inProgress',lang))+'</span></div></div><button type="button" class="lb-button lb-button-small" data-demo="process">'+esc(t('markProgress',lang))+' →</button></div><div class="lb-demo-result" role="status" aria-live="polite"></div></div>';
  }
  function demo(p,lang) {
    if(p.group==='web') {
      return '<div class="lb-browser-demo"><div class="lb-browser-bar"><span aria-hidden="true">● ● ●</span><span>studio.example</span><span>'+esc(t('demo',lang))+'</span></div><div class="lb-sample-web"><div><span>'+esc(t('sampleBusiness',lang))+'</span><h3>'+esc(t(p.id==='digital-start'?'sampleContactTitle':'sampleTitle',lang))+'</h3><p>'+esc(t(p.id==='digital-start'?'sampleContactCopy':'sampleCopy',lang))+'</p><button type="button" class="lb-button lb-button-primary lb-button-small" data-demo="web">'+esc(t(p.id==='digital-start'?'sampleContact':'requestTime',lang))+' ↗</button></div><img src="/assets/salon.webp" width="1400" height="1050" alt="'+esc(local(data.groups.web.short,lang))+'" loading="lazy"></div><div class="lb-demo-result" role="status" aria-live="polite"></div></div>'+(p.id==='web-pro'?inbox(lang,p.id):'');
    }
    if(p.group==='ai') {
      return '<div class="lb-chat-demo"><div class="lb-demo-toolbar"><b>'+esc(t('sampleBusiness',lang))+' · AI</b><span class="lb-demo-mark">'+esc(t('demo',lang))+'</span></div><div class="lb-demo-chat-log" aria-live="polite"><p class="lb-chat-bubble">'+esc(t('chatReply',lang))+'</p></div><div class="lb-demo-chat-actions"><button type="button" class="lb-button lb-button-primary lb-button-small" data-demo="chat">'+esc(t('chatTry',lang))+'</button>'+(p.id==='ai-pro'?'<button type="button" class="lb-button lb-button-outline lb-button-small" data-demo="handoff">'+esc(t('chatHandoff',lang))+'</button>':'')+'</div><div class="lb-chat-capture"><span>'+icon('company')+'</span><div><b>'+esc(t('contactCapture',lang))+'</b><p>'+esc(local(data.features.oneInbox,lang))+'</p></div></div><div class="lb-demo-result" role="status" aria-live="polite"></div></div>';
    }
    if(p.group==='automation') {
      return '<div class="lb-workflow-demo"><div class="lb-demo-toolbar"><b>'+esc(t('demo',lang))+'</b><span>01</span></div><div class="lb-workflow-nodes">'+[1,2,3,4].map((n)=>'<div data-workflow-step="'+n+'"><span>0'+n+'</span><b>'+esc(t('workflow'+n,lang))+'</b><small aria-hidden="true">'+(n<4?'→':'✓')+'</small></div>').join('')+'</div><p>'+esc(local(data.features[p.id==='automation-business'?'manualApproval':'emailAlert'],lang))+'</p><button type="button" class="lb-button lb-button-primary lb-button-small" data-demo="workflow">'+esc(t('runWorkflow',lang))+' →</button><div class="lb-demo-result" role="status" aria-live="polite"></div></div>';
    }
    if(p.group==='company') return inbox(lang,p.id);
    let cells=p.id==='hosting-wordpress'?[['storage','10 GB NVMe'],['websites','1 WordPress']]:p.id==='hosting-web'?[['storage','5 GB NVMe'],['websites','1'],['email','5']]:p.id==='hosting-email'?[['storage','2 GB'],['email','1']]:p.id==='hosting-domains'?[['domain','business.example']]:[['websites','1 App / Bot']];
    return '<div class="lb-hosting-demo"><div class="lb-demo-toolbar"><b>'+esc(p.name)+'</b><span class="lb-demo-mark">'+esc(t('demo',lang))+'</span></div><span class="lb-hosting-large-icon">'+icon('hosting')+'</span><h3>'+esc(t('hostingDemo',lang))+'</h3><p>'+esc(t('hostingDemoCopy',lang))+'</p><div class="lb-hosting-cells">'+cells.map(([k,v])=>'<div><small>'+esc(t(k,lang))+'</small><b><bdi>'+esc(v)+'</bdi></b></div>').join('')+'</div><p class="lb-hosting-domain"><bdi>business.example</bdi> → '+esc(t('websites',lang))+'</p></div>';
  }
  function faq(lang,hosting) {
    const pairs=[['faq1','faq1Answer'],['faq2','faq2Answer'],[hosting?'faqHosting':'faq3',hosting?'faqHostingAnswer':'faq3Answer']];
    return '<section class="lb-faq lb-container"><h2>'+esc(t('faq',lang))+'</h2><div>'+pairs.map(([q,a])=>'<details><summary>'+esc(t(q,lang))+'</summary><p>'+esc(t(a,lang))+'</p></details>').join('')+'</div></section>';
  }
  function packagePage(p,lang) {
    const g=data.groups[p.group],href=checkoutUrl(p,lang);
    const primary=href?'<a class="lb-button lb-button-primary" href="'+esc(href)+'">'+esc(t(p.group==='hosting'?'chooseHosting':'buy',lang))+' <span aria-hidden="true">↗</span></a>':'<a class="lb-button lb-button-outline" href="'+esc(mailUrl(p))+'">'+esc(t('wait',lang))+' ↗</a>';
    return '<section class="lb-package-hero lb-container" id="home"><a class="lb-back-link" href="/?lang='+lang+'#services">← '+esc(t('backPackages',lang))+'</a><div class="lb-package-hero-grid"><div><span class="lb-kicker">'+icon(p.group)+esc(local(g.name,lang))+'</span><h1>'+esc(p.name)+'</h1><p>'+esc(local(p.short,lang))+'</p><span class="lb-status '+(p.live?'lb-status-live':'lb-status-soon')+'">'+esc(t(p.live?'available':'soon',lang))+'</span><div class="lb-actions">'+primary+'<a class="lb-text-link" href="'+esc(mailUrl(p))+'">'+esc(t('mail',lang))+' →</a></div></div><div class="lb-package-photo"><img src="/assets/'+g.photo+'.webp" width="1400" height="'+(g.photo==='workspace'?'2100':g.photo==='salon'?'1050':'915')+'" alt="'+esc(local(g.short,lang))+'" fetchpriority="high"><span>'+esc(t('example',lang))+'</span></div></div></section><section class="lb-package-content lb-container"><div class="lb-scope-column"><section><h2>'+esc(t('why',lang))+'</h2><p class="lb-benefit-copy">'+esc(local(g.why,lang))+'</p></section><section class="lb-included"><h2>'+esc(t('included',lang))+'</h2><ul>'+p.features.map(k=>'<li><span aria-hidden="true">✓</span><div>'+esc(local(data.features[k],lang))+'</div></li>').join('')+'</ul></section><aside class="lb-limits"><b>'+esc(t('scope',lang))+'</b><p>'+esc(local(data.limits[p.limit],lang))+'</p></aside></div><aside class="lb-price-panel" id="pricing"><span class="lb-kicker">'+esc(t('priceTitle',lang))+'</span><h2>'+esc(p.name)+'</h2>'+(p.setup?'<dl><div><dt>'+esc(t('setup',lang))+'</dt><dd><bdi>'+esc(money(p.setup,lang))+'</bdi></dd></div><div><dt>'+esc(t('monthly',lang))+'</dt><dd><bdi>'+esc(money(p.recurring,lang))+'</bdi></dd></div></dl><div class="lb-total"><span>'+esc(t('today',lang))+'</span><strong><bdi>'+esc(money(p.setup+p.recurring,lang))+'</bdi></strong><small>'+esc(t('firstMonth',lang))+'</small></div><p class="lb-price-followup">'+esc(t('then',lang))+' <bdi>'+esc(money(p.recurring,lang))+'</bdi> / '+esc(t('month',lang))+'</p>':'<div class="lb-total"><span>'+esc(t(p.live?'today':'soon',lang))+'</span><strong><bdi>'+(p.id==='hosting-domains'?esc(t('from',lang))+' ':'')+esc(money(p.recurring,lang))+'</bdi></strong><small>/ '+esc(t(p.period,lang))+'</small></div>'+(p.id==='hosting-domains'?'<p>'+esc(local(data.features.domainPrice,lang))+'</p>':''))+'<div class="lb-price-actions">'+primary+(p.live&&p.group!=='hosting'?'<a class="lb-button lb-button-outline" href="/?request='+p.id+'&lang='+lang+'#request">'+esc(t('inquiry',lang))+'</a>':'')+'</div><p class="lb-price-note">'+esc(t(!p.live?'soonNote':p.group==='hosting'?'hostingNote':'billingNote',lang))+'</p></aside></section><section class="lb-demo-section"><div class="lb-container"><div class="lb-section-head"><div><span class="lb-kicker">'+esc(t('demo',lang))+'</span><h2>'+esc(t('example',lang))+'</h2></div><p>'+esc(t('demoNote',lang))+'</p></div><div class="lb-demo-container" data-demo-package="'+p.id+'">'+demo(p,lang)+'</div></div></section>'+process(lang)+faq(lang,p.group==='hosting')+help(lang,p);
  }
  root.LB_RENDER={header,footer,home,packagePage,catalog,packageUrl,checkoutUrl};
  if(typeof document==='undefined') return;

  const main=document.getElementById('lbExperience');
  if(!main) return;
  const currentPackage=data.packages.find(p=>p.id===main.dataset.package);
  const query=new URLSearchParams(location.search);
  let saved;try{saved=localStorage.getItem('lb_experience_lang')||localStorage.getItem('lb_lang');}catch{}
  let lang=languageInfo(query.get('lang')||saved||'de').code;
  let filter='all';
  let demoTimer;
  function render() {
    const globe=main.querySelector('.lb-globe');
    // Keep the existing WebGL canvas and animation across language changes.
    main.innerHTML=currentPackage?packagePage(currentPackage,lang):home(lang);
    if(globe) main.querySelector('.lb-globe')?.replaceWith(globe);
    document.getElementById('lbHeader').innerHTML=header(lang);
    document.getElementById('lbFooter').innerHTML=footer(lang);
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.title=(currentPackage?currentPackage.name:t('heroTitle',lang).replace(/\n/g,' '))+' | LogoBoss AI';
    const description=local(currentPackage?currentPackage.short:data.ui.heroCopy,lang);
    document.querySelector('meta[name="description"]')?.setAttribute('content',description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content',description);
    applyFilter(filter,false);
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
    if(currentPackage) return;
    filter=value==='all'||data.groups[value]?value:'all';
    const grid=document.getElementById('lbPackageGrid');if(grid)grid.innerHTML=catalog(lang,filter);
    document.querySelectorAll('[data-catalog-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.catalogFilter===filter)));
    if(scroll) document.getElementById('services')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
  function handleHash() {
    const category=location.hash.match(/^#category-(web|ai|automation|company|hosting)$/);
    if(category&&!currentPackage) applyFilter(category[1],true);
    const offer=location.hash.match(/^#offer-(.+)$/);
    const p=offer&&data.packages.find(item=>item.id===offer[1]);
    if(p&&!currentPackage) location.replace(packageUrl(p,lang));
  }
  function closeLanguageMenu() {
    const menu=document.getElementById('lbLanguageMenu'),toggle=document.querySelector('.lb-language-toggle');
    if(menu)menu.hidden=true;if(toggle)toggle.setAttribute('aria-expanded','false');
  }
  document.addEventListener('click',e=>{
    const toggle=e.target.closest('.lb-language-toggle');
    if(toggle){const menu=document.getElementById('lbLanguageMenu');menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)menu.querySelector('[aria-checked="true"]')?.focus();return;}
    const choice=e.target.closest('[data-catalog-lang]');if(choice){saveLanguage(choice.dataset.catalogLang);return;}
    if(!e.target.closest('.lb-language-picker'))closeLanguageMenu();
    const cat=e.target.closest('[data-catalog-category]');
    const fil=e.target.closest('[data-catalog-filter]');
    if(cat||fil){e.preventDefault();const next=cat?.dataset.catalogCategory||fil.dataset.catalogFilter;applyFilter(next,!!cat);history.replaceState(null,'','#'+(next==='all'?'services':'category-'+next));return;}
    const tab=e.target.closest('[data-demo-tab]');
    if(tab){const holder=tab.closest('.lb-demo-workspace');holder.querySelectorAll('[data-demo-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b===tab)));const panel=holder.querySelector('.lb-demo-inbox');const kind=tab.dataset.demoTab;
      if(kind==='services')panel.innerHTML='<h3>'+esc(t('services',lang))+'</h3><div class="lb-demo-table"><div class="lb-demo-table-head"><span>'+esc(t('services',lang))+'</span><span>'+esc(t('duration',lang))+'</span><span>'+esc(t('status',lang))+'</span></div><div><b>'+esc(t('consultation',lang))+'</b><span>30 '+esc(t('minutes',lang))+'</span><span class="lb-pill">'+esc(t('active',lang))+'</span></div></div>';
      else if(kind==='appointments')panel.innerHTML='<h3>'+esc(t('appointments',lang))+'</h3><div class="lb-demo-table"><div class="lb-demo-table-head"><span>'+esc(t('contactName',lang))+'</span><span>'+esc(t('appointments',lang))+'</span><span>'+esc(t('status',lang))+'</span></div><div><b>Alex M.</b><span><bdi>13.10.2026 · 10:30</bdi></span><span class="lb-pill">'+esc(t('new',lang))+'</span></div></div><p>'+esc(t('sampleSent',lang))+'</p>';
      else{const tmp=document.createElement('div');tmp.innerHTML=inbox(lang,'company-os-start');panel.innerHTML=tmp.querySelector('.lb-demo-inbox').innerHTML;}
      holder.querySelector('.lb-demo-result').textContent=t('demoNote',lang);return;}
    const button=e.target.closest('[data-demo]');if(!button)return;
    const holder=button.closest('.lb-demo-container'),result=holder.querySelector('.lb-demo-result');
    if(button.dataset.demo==='web') result.textContent=t('sampleSent',lang);
    if(button.dataset.demo==='process'){holder.querySelector('[data-demo-status]').textContent=t('inProgress',lang);holder.querySelector('[data-demo-status]').classList.add('lb-pill-blue');result.textContent=t('demoNote',lang);}
    if(button.dataset.demo==='chat'){holder.querySelector('.lb-demo-chat-log').innerHTML='<p class="lb-chat-bubble lb-chat-user">'+esc(t('chatQuestion',lang))+'</p><p class="lb-chat-bubble">'+esc(t('chatReply',lang))+'</p>';result.textContent=t('demoNote',lang);}
    if(button.dataset.demo==='handoff')result.textContent=t('handoffReply',lang);
    if(button.dataset.demo==='workflow'){
      clearTimeout(demoTimer);button.disabled=true;let step=0;
      holder.querySelectorAll('[data-workflow-step]').forEach(n=>n.classList.remove('lb-step-done'));
      const advance=()=>{step++;holder.querySelector('[data-workflow-step="'+step+'"]')?.classList.add('lb-step-done');if(step<4){demoTimer=setTimeout(advance,350);}else{result.textContent=t('workflowDone',lang);button.disabled=false;}};
      advance();
    }
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
    const label=document.createElement('label');label.htmlFor=id;label.className='lb-order-label'+(field.classList.contains('full')||field.tagName==='TEXTAREA'?' full':'');label.textContent=names[lang==='en'?1:0]+(field.required?' *':'');field.parentNode.insertBefore(label,field);label.append(field);
  }
  const submit=document.getElementById('orderSubmit');if(submit){const actions=document.createElement('div');actions.className='lb-inquiry-actions';submit.closest('form').append(actions);actions.append(submit);const a=document.createElement('a');a.href=mailUrl(request);a.textContent=t('mail',lang);actions.append(a);}
})(typeof window!=='undefined'?window:globalThis);
