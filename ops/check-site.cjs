const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {JSDOM, VirtualConsole} = require(process.env.LOGOBOSS_JSDOM_PATH || 'jsdom');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
async function check() {
  const errors = [], calls = [], requests = [];
  const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!e.message.includes('navigation')) errors.push(e.message); });
  const dom = new JSDOM(html, {url:'https://logobossweb-ai.eu/', runScripts:'outside-only', pretendToBeVisual:true, virtualConsole:vc});
  const w = dom.window, d = w.document;
  w.matchMedia = () => ({matches:true, addEventListener(){}, removeEventListener(){}});
  w.IntersectionObserver = class {observe(){} unobserve(){}};
  w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
  w.alert = () => {}; w.confirm = () => true;
  w.addEventListener('error', e => errors.push(e.message));
  w.fetch = async (url, options) => { requests.push({url,options}); return {ok:true,json:async()=>({success:true,is_test:false,order:{id:'audit-request'}})}; };
  let session = null;
  const orders = [{id:'audit-order',created_at:'2026-10-10T10:00:00Z',package_name:'Digital Start',status:'new',is_test:false,portal_enabled:false,company_name:'Audit fixture',payments:[]}];
  const sb = {
    auth:{getSession:async()=>({data:{session},error:null}),onAuthStateChange(){},
      signUp:async(...args)=>{calls.push(['signup',...args]); return {data:{session:null},error:null};},
      signInWithPassword:async(...args)=>{calls.push(['login',...args]); session={access_token:'mock-session-token',user:{id:'audit-user',email:'audit@example.test',email_confirmed_at:'2026-10-10T10:00:00Z',user_metadata:{}}};return {data:{session},error:null};},
      resetPasswordForEmail:async(...args)=>{calls.push(['recovery',...args]);return {error:null};},
      updateUser:async(...args)=>{calls.push(['update',...args]);return {data:{user:session.user},error:null};},
      resend:async(...args)=>{calls.push(['resend',...args]);return {error:null};},signOut:async()=>{session=null;return {error:null};}},
    rpc:async name=>{calls.push(['rpc',name]);return {data:0,error:null};},
    from(name){const result={data:name==='orders'?orders:[],error:null};const query={select(){return this;},order(){return this;},limit(){return this;},eq(){return this;},maybeSingle(){return Promise.resolve({data:null,error:null});},then(resolve,reject){return Promise.resolve(result).then(resolve,reject);}};return query;}
  };
  w.__auditClient = sb;
  for (const script of d.querySelectorAll('script:not([src])')) if (!['module','application/ld+json'].includes(script.type)) w.eval(script.textContent);
  for (const file of ['immersive-3d.js','stripe-options.js']) w.eval(fs.readFileSync(path.join(root,file),'utf8'));
  const auth = d.getElementById('lb-client-auth-script').textContent.replace(/^\s*import[^\n]+\n/gm, '').replace('const lbClient=createClient(', 'const lbClient=window.__auditCreateClient(');
  w.__auditCreateClient = () => sb;
  w.initSupport = () => {}; // The real support module is tested separately.
  w.eval('(function(){'+auth+'\n})();');
  await tick(); await tick();
  const click = selector => {const el=d.querySelector(selector);assert.ok(el,selector);el.click();};
  let scenes=0;
  for(const [category,count] of [['web',3],['ai',2],['automation',2],['company',1],['hosting',5]]) {
    click('#motion-tab-'+category);
    assert.equal(d.querySelectorAll('.lb-safe-card:not([hidden])').length,count);
    const packages=[...d.querySelectorAll('#motionPackagePicker button')].map(x=>x.dataset.package);
    assert.equal(packages.length,count);
    for(const id of packages){click('[data-package="'+id+'"]');const length=d.querySelectorAll('#motionStepList button').length;
      assert.ok(length>0);for(let i=0;i<length;i++){click('[data-feature="'+i+'"]');assert.equal(d.querySelector('.motion-track').dataset.step,String(i));assert.ok(d.querySelector('.fx-visual'));scenes++;}}
  }
  click('[data-motion-all]');assert.equal(d.querySelectorAll('.lb-safe-card:not([hidden])').length,13);
  assert.equal(d.querySelectorAll('.lb-live-buy').length,8);
  for(const link of d.querySelectorAll('.lb-live-buy')) {assert.equal(link.dataset.paymentKind,'setup_plus_monthly');assert.equal(new URL(link.href).origin,'https://buy.stripe.com');}
  for(const link of d.querySelectorAll('.lb-hosting-request')) assert.equal(new URL(link.href).protocol,'mailto:');
  click('#motion-tab-web');d.getElementById('motion-tab-web').focus();
  d.getElementById('motion-tab-web').dispatchEvent(new w.KeyboardEvent('keydown',{key:'End',bubbles:true}));
  assert.equal(d.querySelector('#motion-tab-hosting').getAttribute('aria-selected'),'true');
  for(const hash of ['#system-web','#system-hosting','#package-ai-pro','#offer-company-os-start','#services']){w.history.replaceState(null,'',hash);w.dispatchEvent(new w.HashChangeEvent('hashchange'));await tick();assert.equal(d.getElementById('homeView').classList.contains('hidden'),false);}
  click('.lb-safe-request[data-order-name="Digital Start"]');
  assert.equal(d.getElementById('orderTotalField').value,'1190');
  d.getElementById('newOrderForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await tick();
  assert.equal(d.getElementById('lbClientLayer').hidden,false);assert.ok(w.localStorage.getItem('lb_pending_package_v1'));
  assert.equal(requests.length,0,'anonymous inquiries never reach the backend');
  d.getElementById('lbClientPassword').value='audit-password';d.getElementById('lbClientConfirm').value='different-password';d.getElementById('lbClientEmail').value='audit@example.test';
  d.getElementById('lbAccountForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await tick();
  assert.equal(calls.some(x=>x[0]==='signup'),false,'mismatched passwords never send email');
  click('#enBtn');await tick();
  assert.equal(d.documentElement.lang,'en');
  assert.equal(d.getElementById('lbAccountOpen').textContent,'Log in / Register');
  assert.equal(d.getElementById('lbClientHeading').textContent,'Create account');
  assert.equal(d.querySelector('.lb-live-disclosure').textContent.includes('Preise für Unternehmen'),false);
  click('[data-lb-auth="login"]');
  d.getElementById('lbAccountForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await tick();await tick();
  assert.equal(d.getElementById('lbAccountOpen').textContent,'My account');
  assert.equal(d.getElementById('orderEmail').readOnly,true);
  d.getElementById('orderName').value='Audit fixture';
  d.getElementById('newOrderForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  d.getElementById('newOrderForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await tick();await tick();
  assert.equal(requests.length,1,'double submission creates only one request');const request=requests[0];assert.ok(request.url.endsWith('/functions/v1/submit-order'));
  assert.equal(request.options.headers.Authorization,'Bearer mock-session-token');
  const body=JSON.parse(request.options.body);assert.equal(body.email,'audit@example.test');assert.equal(body.language,'en');
  assert.equal(w.localStorage.getItem('lb_pending_package_v1'),null);
  click('#lbAccountOpen');await tick();await tick();
  assert.match(d.getElementById('lbClientOrders').textContent,/No confirmed Stripe payment/);
  assert.match(d.getElementById('lbClientOrders').textContent,/Activation pending/);
  click('#deBtn');await tick();assert.equal(d.getElementById('lbAccountOpen').textContent,'Mein Konto');
  assert.equal(d.getElementById('lbClientHeading').textContent,'Mein Kundenportal');
  click('#lbClientLogout');await tick();assert.equal(d.getElementById('orderEmail').readOnly,false);
  assert.equal(d.getElementById('lbClientPassword').value,'');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({result:'passed',packages:13,categories:5,featureScenes:scenes,paymentLinks:8,checked:['3D selections','keyboard navigation','deep links','DE/EN portal','anonymous request protection','password validation','signed-in request','unpaid portal gating','logout']}));
  dom.window.close();
}
check().catch(error=>{console.error(error);process.exit(1);});
