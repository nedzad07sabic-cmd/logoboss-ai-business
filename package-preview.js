/* Illustrative, browser-local company previews. No booking, publishing or API calls. */
(function(root){
  'use strict';
  const d=root.LB_CATALOG;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const t=(k,l)=>d.ui[k]?.[l]||d.ui[k]?.de||k;
  const types=['hotel','salon','restaurant','workshop','clinic','consulting'];
  const states=new Map();
  const viewsFor=p=>p.group==='web'&&p.id!=='digital-start'?['desktop','phone','workspace']:['desktop','phone'];
  function clean(raw,p){
    const name=String(raw?.name||'').trim().slice(0,80)||'Example Studio';
    const type=types.includes(raw?.type)?raw.type:p.businessType;
    const city=String(raw?.city||'').trim().slice(0,80);
    const color=/^#[0-9a-f]{6}$/i.test(raw?.color||'')?raw.color:'#285dce';
    const views=viewsFor(p);
    const view=views.includes(raw?.view)?raw.view:'desktop';
    return {name,type,city,color,view,tab:['inbox','appointments','services'].includes(raw?.tab)?raw.tab:'inbox',progress:!!raw?.progress,chat:!!raw?.chat,handoff:!!raw?.handoff};
  }
  const domain=s=>(s.name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,32)||'business')+'.example';
  function website(p,l,s){
    const hospitality=['hotel','restaurant'].includes(s.type);
    const action=p.id==='digital-start'?'sampleContact':s.type==='hotel'?'requestStay':s.type==='restaurant'?'requestTable':p.group==='web'?'requestTime':'sampleAction';
    const primary=s.type==='hotel'?'rooms':s.type==='restaurant'?'menu':'services';
    const intro=p.id==='digital-start'?'sampleContactCopy':s.type==='hotel'?'hotelIntro':s.type==='restaurant'?'restaurantIntro':'sampleCopy';
    return '<div class="lb-custom-site"><div class="lb-custom-nav"><b>'+esc(s.name)+'</b><span>'+esc(t(primary,l))+' <i aria-hidden="true">/</i> '+esc(t('contact',l))+'</span></div><div class="lb-custom-hero"><div><span class="lb-custom-eyebrow">'+esc(t(s.type,l))+(s.city?' · '+esc(s.city):'')+'</span><h3>'+esc(t(s.type==='restaurant'?'restaurantHero':hospitality?'hospitalityHero':'serviceHero',l))+'</h3><p>'+esc(t(intro,l))+'</p><button type="button" data-preview-action="request" class="lb-custom-cta">'+esc(t(action,l))+' <span aria-hidden="true">↗</span></button></div><img src="/assets/business/'+s.type+'.webp" width="1000" height="667" alt="'+esc(t(s.type,l))+'" loading="lazy"></div><div class="lb-custom-services">'+[primary,'location','contact'].map((k,i)=>'<div><span>0'+(i+1)+'</span><b>'+esc(t(k,l))+'</b></div>').join('')+'</div>'+(p.group==='ai'?'<div class="lb-custom-chat-teaser"><b>'+esc(s.name)+' · AI</b><p>'+esc(t('chatReply',l))+'</p><button type="button" data-preview-action="chat">'+esc(t('chatTry',l))+' →</button></div>':'')+'<div class="lb-custom-foot"><b>'+esc(s.name)+'</b><span>'+esc(s.city||t('contact',l))+'</span></div></div>';
  }
  function table(p,l,s){
    const service=s.tab==='services',appointment=s.tab==='appointments';
    return '<div class="lb-preview-table"><div><b>'+esc(t(service?'services':'contactName',l))+'</b><b>'+esc(t(service?'duration':appointment?'appointments':'newRequest',l))+'</b><b>'+esc(t('status',l))+'</b></div><div><strong>'+esc(service?t('consultation',l):'Alex M.')+'</strong><span>'+esc(service?'30 '+t('minutes',l):appointment?'13.10.2026 · 10:30':t('sampleContact',l))+'</span><span class="lb-preview-status">'+esc(t(service?'active':s.progress?'inProgress':'new',l))+'</span></div>'+(!service?'<div><strong>Sam K.</strong><span>'+esc(t('requestTime',l))+'</span><span class="lb-preview-status is-progress">'+esc(t('inProgress',l))+'</span></div>':'')+'</div>';
  }
  function workspace(p,l,s){
    let body='';
    if(p.group==='ai')body='<div class="lb-personal-chat"><div class="lb-personal-chat-heading"><span class="lb-chat-avatar">AI</span><div><b>'+esc(s.name)+'</b><small>'+esc(t('approvedAnswer',l))+'</small></div></div><div class="lb-personal-chat-log"><p>'+esc(t('chatReply',l))+'</p>'+(s.chat?'<p class="is-user">'+esc(t('chatQuestion',l))+'</p><p>'+esc(t('chatReply',l))+'</p>':'')+'</div><div class="lb-preview-controls"><button type="button" data-preview-action="chat">'+esc(t('chatTry',l))+'</button>'+(p.id==='ai-pro'?'<button type="button" data-preview-action="handoff">'+esc(t('chatHandoff',l))+'</button>':'')+'</div><div class="lb-preview-handoff"><b>'+esc(t('contactCapture',l))+'</b><span>'+esc(t(s.handoff?'teamFollowup':'inbox',l))+'</span></div></div>';
    else if(p.group==='automation')body='<div class="lb-personal-workflow"><span class="lb-preview-subheading">'+esc(t('flowTitle',l))+'</span><div>'+p.flow.map((k,i)=>'<article class="'+(s.progress?'is-complete':'')+'"><span>0'+(i+1)+'</span><b>'+esc(t(k,l))+'</b><i aria-hidden="true">'+(i<3?'→':'✓')+'</i></article>').join('')+'</div><p>'+esc(d.features[p.id==='automation-business'?'manualApproval':'emailAlert'][l])+'</p><button type="button" data-preview-action="workflow">'+esc(t('runWorkflow',l))+' →</button></div>'+table(p,l,s);
    else if(p.group==='hosting'){
      const cells=p.id==='hosting-web'?[['storage','5 GB NVMe'],['websites','1'],['email','5']]:p.id==='hosting-wordpress'?[['storage','10 GB NVMe'],['websites','1 WordPress']]:p.id==='hosting-email'?[['storage','2 GB'],['email','1']]:p.id==='hosting-domains'?[['domain',domain(s)]]:[['websites','1 App / Bot']];
      body='<div class="lb-preview-server"><div class="lb-preview-domain"><span aria-hidden="true">◎</span><b>'+esc(domain(s))+'</b><span>'+esc(t(p.live?'demo':'soon',l))+'</span></div><div class="lb-preview-resource-grid">'+cells.map(([k,v])=>'<div><span>'+esc(t(k,l))+'</span><strong><bdi>'+esc(v)+'</bdi></strong></div>').join('')+'</div><ol>'+p.flow.map(k=>'<li>'+esc(t(k,l))+'</li>').join('')+'</ol><p>'+esc(t(p.live?'hostingDemoCopy':'soonNote',l))+'</p></div>';
    }else{
      const tabs=p.group==='company'?['inbox','appointments','services']:['inbox'];
      body='<div class="lb-preview-os-tabs">'+tabs.map(k=>'<button type="button" data-preview-tab="'+k+'" aria-pressed="'+(k===s.tab)+'">'+esc(t(k,l))+'</button>').join('')+'</div><h3 class="lb-preview-subheading">'+esc(t(s.tab,l))+'</h3>'+table(p,l,s)+(s.tab!=='services'?'<button type="button" class="lb-preview-progress" data-preview-action="progress">'+esc(t('markProgress',l))+' →</button>':'')+'<p class="lb-preview-workspace-note">'+esc(t('sampleSent',l))+'</p>';
    }
    return '<div class="lb-personal-workspace"><div class="lb-preview-workspace-bar"><b>'+esc(s.name)+'</b><span>'+esc(p.name)+'</span><span class="lb-demo-mark">'+esc(t('demo',l))+'</span></div><div class="lb-preview-workspace-body">'+body+'</div></div>';
  }
  function panel(p,l,raw){
    const s=clean(raw,p);
    const views=viewsFor(p);
    const websiteView=s.view!=='workspace';
    // A hosting service supplies infrastructure; it does not include a newly designed website.
    const site=p.group==='web'?website(p,l,s):workspace(p,l,s);
    return '<div class="lb-personal-preview" style="--preview-accent:'+s.color+'"><div class="lb-preview-top"><b>'+esc(t('previewReady',l))+'</b><div role="group" aria-label="'+esc(t('example',l))+'">'+views.map(v=>'<button type="button" data-preview-view="'+v+'" aria-pressed="'+(s.view===v)+'">'+esc(t(v==='desktop'?'previewDesktop':v==='phone'?'previewPhone':'previewWorkspace',l))+'</button>').join('')+'</div></div><div class="lb-preview-device '+(s.view==='phone'?'is-phone':'')+'"><div class="lb-browser-bar"><span aria-hidden="true">● ● ●</span><bdi>'+esc(domain(s))+'</bdi><span>'+esc(t('demo',l))+'</span></div>'+(websiteView?site:workspace(p,l,s))+'</div><p class="lb-preview-result" role="status" aria-live="polite">'+esc(t(s.progress?(p.group==='automation'?'workflowDone':'demoNote'):s.handoff?'handoffReply':s.chat?'demoNote':'personalDemoNote',l))+'</p></div>';
  }
  function builder(p,l){
    const s=clean(states.get(p.id),p);
    return '<section class="lb-personalizer lb-container" id="demo"><div class="lb-section-head"><div><span class="lb-kicker">'+esc(t('demo',l))+'</span><h2>'+esc(t('demoBuilderTitle',l))+'</h2></div><p>'+esc(t('demoBuilderCopy',l))+'</p></div><div class="lb-personalizer-grid" data-preview-package="'+p.id+'"><div class="lb-preview-settings"><form data-preview-form><label>'+esc(t('businessName',l))+'<input name="name" type="text" value="'+esc(s.name==='Example Studio'?'':s.name)+'" placeholder="Hotel Adria" maxlength="80" required autocomplete="organization"></label><label>'+esc(t('businessType',l))+'<select name="type">'+types.map(type=>'<option value="'+type+'" '+(type===s.type?'selected':'')+'>'+esc(t(type,l))+'</option>').join('')+'</select></label><label>'+esc(t('businessCity',l))+'<input name="city" type="text" value="'+esc(s.city)+'" placeholder="Berlin" maxlength="80" autocomplete="address-level2"></label><label class="lb-color-label">'+esc(t('accentColor',l))+'<input name="color" type="color" value="'+s.color+'"></label><button type="submit" class="lb-button lb-button-primary">'+esc(t('buildDemo',l))+' <span aria-hidden="true">↗</span></button></form><p>'+esc(t('personalDemoNote',l))+'</p><div class="lb-preview-included"><b>'+esc(t('designIncluded',l))+'</b><ul>'+p.features.slice(0,4).map(k=>'<li>'+esc(d.features[k][l]||d.features[k].de)+'</li>').join('')+'</ul></div></div><div class="lb-preview-mount">'+panel(p,l,s)+'</div></div><p class="lb-preview-custom-note">'+esc(t('previewTip',l))+'</p></section>';
  }
  root.LB_PREVIEW={clean,panel,builder,domain};
  if(typeof document==='undefined')return;
  const language=()=>document.documentElement.lang||'de';
  function owner(el){const holder=el.closest('[data-preview-package]');return holder?{holder,p:d.packages.find(p=>p.id===holder.dataset.previewPackage)}:null;}
  function update(o,state){states.set(o.p.id,state);o.holder.querySelector('.lb-preview-mount').innerHTML=panel(o.p,language(),state);}
  document.addEventListener('submit',e=>{
    if(!e.target.matches('[data-preview-form]'))return;
    e.preventDefault();const o=owner(e.target),values=Object.fromEntries(new FormData(e.target));
    const previous=clean(states.get(o.p.id),o.p);update(o,clean({...previous,...values,progress:false,chat:false,handoff:false},o.p));
    o.holder.querySelector('.lb-preview-result').textContent=t('previewChanged',language());
  });
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-preview-view],[data-preview-tab],[data-preview-action]');if(!button)return;
    const o=owner(button);if(!o)return;
    const state=clean(states.get(o.p.id),o.p);
    if(button.dataset.previewView)state.view=button.dataset.previewView;
    if(button.dataset.previewTab)state.tab=button.dataset.previewTab;
    const action=button.dataset.previewAction;
    if(action==='progress'||action==='workflow')state.progress=true;
    if(action==='chat')state.chat=true;
    if(action==='handoff')state.handoff=true;
    update(o,state);
    if(action==='request')o.holder.querySelector('.lb-preview-result').textContent=t(o.p.id==='digital-start'?'sampleContactSent':'sampleSent',language());
    if(button.dataset.previewView)o.holder.querySelector('[data-preview-view="'+state.view+'"]')?.focus();
    else if(button.dataset.previewTab)o.holder.querySelector('[data-preview-tab="'+state.tab+'"]')?.focus();
    else if(action)o.holder.querySelector('[data-preview-action="'+action+'"]')?.focus();
  });
})(typeof window!=='undefined'?window:globalThis);
