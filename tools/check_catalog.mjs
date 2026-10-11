import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(path.join(dir,p),'utf8');
const context={window:{},URL,Intl,Date};vm.createContext(context);
vm.runInContext(read('catalog-data.js'),context);vm.runInContext(read('package-preview.js'),context);vm.runInContext(read('catalog-experience.js'),context);
const {LB_CATALOG:d,LB_RENDER:r}=context.window;
assert.equal(d.packages.length,13);
assert.equal(d.languages.length,8);
const expected={
 'digital-start':[1190,59,'00wbJ15ybdVk4mK7pp3ZK00'],
 'web-business':[2320,99,'bJe4gz7Gj6sScTg4dd3ZK01'],
 'web-pro':[3920,149,'3cI6oH8KnaJ82eC1113ZK02'],
 'ai-business':[790,79,'bJebJ18Kn18ybPcbFF3ZK03'],
 'ai-pro':[2320,149,'eVq28rgcPeZog5seRR3ZK04'],
 'automation-start':[720,49,'dRm8wP0dR18y6uS1113ZK05'],
 'automation-business':[2000,149,'8x25kD6Cf5oO2eCgZZ3ZK06'],
 'company-os-start':[3990,199,'4gMcN57Gj04u8D03993ZK07']
};
for(const [id,[setup,recurring,code]] of Object.entries(expected)){
 const p=d.packages.find(p=>p.id===id);assert.equal(p.setup,setup);assert.equal(p.recurring,recurring);assert.equal(p.pay,'https://buy.stripe.com/'+code);assert.equal(p.live,true);
}
for(const [id,price,period,live] of [['hosting-web',8.99,'month',true],['hosting-wordpress',50.76,'month',true],['hosting-apps',23.89,'month',false],['hosting-domains',14.04,'year',false],['hosting-email',16.20,'year',false]]){
 const p=d.packages.find(p=>p.id===id);assert.equal(p.recurring,price);assert.equal(p.period,period);assert.equal(p.live,live);
 if(!live)assert.equal(r.checkoutUrl(p,'en'),'');
}
for(const set of [d.ui,d.features,d.limits,...Object.values(d.groups).map(g=>({name:g.name,short:g.short,why:g.why})),...d.packages.map(p=>({short:p.short}))]){
 for(const [key,translations] of Object.entries(set))for(const lang of d.languages)assert.ok(translations[lang.code]?.trim(),key+': missing '+lang.code);
}
const esc=value=>String(value).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const uiKeys=[...read('catalog-experience.js').matchAll(/\bt\('([a-zA-Z0-9]+)'\s*,/g)].map(m=>m[1]);
for(const key of uiKeys)assert.ok(d.ui[key],'unknown UI key: '+key);
for(const language of d.languages){
 const lang=language.code;
 const home=r.home(lang);assert.equal((home.match(/data-orbit-package=/g)||[]).length,13);assert.equal((home.match(/class="lb-orbit-group /g)||[]).length,5);
 assert.ok(!home.includes('€')&&!home.includes('lb-card-price')&&!home.includes('lb-package-card')&&!home.includes('assets/workspace'),'home must contain only the brand and linked orbit icons');
 for(const p of d.packages)assert.ok(home.includes('href="'+r.packageUrl(p,lang)+'"'));
 assert.ok(!r.header(lang).includes('lb-language-toggle'));assert.ok(r.header(lang).includes('/logo-boss.svg'));
 assert.equal((r.footer(lang).match(/role="menuitemradio"/g)||[]).length,8);
 for(const g of Object.values(d.groups)){
   const category=r.categoryPage(g,lang);assert.equal((category.match(/class="lb-package-card"/g)||[]).length,d.packages.filter(p=>p.group===g.id).length);assert.ok(existsSync(path.join(dir,'systems',g.id+'.html')));
 }
 for(const p of d.packages){
  const html=r.packagePage(p,lang);assert.ok(html.includes(esc(p.name)));assert.ok(html.includes(esc(d.limits[p.limit][lang])));assert.ok(html.includes(esc(d.ui.personalDemoNote[lang])));
  assert.ok(html.includes(p.visual));assert.ok(existsSync(path.join(dir,p.visual)));assert.ok(html.includes('data-preview-form'));assert.ok(html.includes(esc(d.ui.businessName[lang])));
  for(const k of p.flow)assert.ok(html.includes(esc(d.ui[k][lang])));
  for(const key of p.features)assert.ok(html.includes(esc(d.features[key][lang])));
  assert.ok(!html.includes('undefined')&&!html.includes('NaN'));
  if(!p.live)assert.ok(!html.includes('href="https://buy.stripe.com')&&!html.includes('href="https://portal.logobossweb-ai.eu/cart.php'));
  assert.ok(existsSync(path.join(dir,'packages',p.id+'.html')));
 }
}
const preview=context.window.LB_PREVIEW;
const web=d.packages.find(p=>p.id==='web-business');
const hotel=preview.panel(web,'bs',{name:'Hotel Adria',type:'hotel',city:'Mostar',color:'#8254bf',view:'desktop'});
const clinic=preview.panel(web,'bs',{name:'Ordinacija Mira',type:'clinic',city:'Sarajevo',view:'phone'});
assert.ok(hotel.includes('Hotel Adria')&&hotel.includes('Mostar')&&hotel.includes('/assets/business/hotel.webp'));
assert.ok(clinic.includes('Ordinacija Mira')&&clinic.includes('/assets/business/clinic.webp')&&clinic.includes('is-phone'));
assert.notEqual(hotel,clinic);
const attack=preview.panel(web,'en',{name:'<img src=x onerror=alert(1)>',type:'../../evil',color:'red;position:fixed',city:'<script>alert(1)</script>'});
assert.ok(attack.includes('&lt;img')&&!attack.includes('<script>')&&!attack.includes('red;position')&&!attack.includes('/../../evil'));
assert.equal(preview.clean({name:'x'.repeat(1000)},web).name.length,80);
const start=d.packages.find(p=>p.id==='digital-start');assert.ok(!preview.panel(start,'en',{}).includes('data-preview-view="workspace"'));
assert.ok(preview.panel(d.packages.find(p=>p.id==='ai-business'),'en',{}).includes('data-preview-action="chat"'));
assert.ok(!preview.panel(d.packages.find(p=>p.id==='ai-business'),'en',{}).includes('data-preview-action="handoff"'));
assert.ok(preview.panel(d.packages.find(p=>p.id==='ai-pro'),'en',{}).includes('data-preview-action="handoff"'));
assert.ok(!read('package-preview.js').includes('fetch('));
for(const p of d.packages.filter(p=>p.group!=='web'))assert.ok(!preview.panel(p,'en',{view:'desktop'}).includes('class="lb-custom-site"'),'a workspace or hosting package must not imply an included website');
assert.ok(hotel.includes(esc(d.ui.rooms.bs)));assert.ok(hotel.includes(esc(d.ui.hotelIntro.bs)));
assert.ok(read('globe-3d.js').includes('const r=Math.min(w,h)*.37'),'globe fallback must fit both dimensions');
assert.equal(new Set(d.packages.map(p=>p.visual)).size,13);
assert.ok(read('globe-3d.js').includes('SATELLITE_COUNT=100'));
assert.ok(read('globe-3d.js').includes('speed:[.00044,-.00039,.00050]'));
for(const id of ['hosting-web','hosting-wordpress']){
 const p=d.packages.find(p=>p.id===id);const de=new URL(r.checkoutUrl(p,'de')),en=new URL(r.checkoutUrl(p,'en'));
 assert.equal(de.searchParams.get('language'),'German');assert.equal(en.searchParams.get('language'),'English');assert.equal(de.searchParams.get('pid'),id==='hosting-web'?'1':'2');
}
const root=read('index.html');
for(const id of ['newOrderForm','orderClose','orderSubmit','stripePayBtn','lbAccountOpen','lbClientLayer','lbAiChatOpen','lbSupportOpen','deBtn','enBtn','motionEarth','motionPause'])assert.ok(root.includes('id="'+id+'"'),'integration hook missing: '+id);
for(const [id,,] of Object.entries(expected))assert.ok(root.includes('https://buy.stripe.com/'+expected[id][2]),'legacy payment link lost');
assert.ok(!root.includes('<script src="./immersive-3d.js'));
assert.ok(root.includes('id="homeView" aria-hidden="true" inert'));
assert.ok(read('catalog-experience.js').includes('globe) main.querySelector'));
assert.ok(read('catalog-experience.css').includes('html')&&read('catalog-experience.css').includes('@media(max-width:520px)'));
console.log('PASS: 104 localized package views, 40 category views, no home prices, 13 distinct previews, safe personalized demos, 100 bidirectional globe connections, approved prices/checkout links and existing integration hooks.');
