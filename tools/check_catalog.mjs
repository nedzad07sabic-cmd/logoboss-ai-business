import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(path.join(dir,p),'utf8');
const context={window:{},URL,Intl,Date};vm.createContext(context);
vm.runInContext(read('catalog-data.js'),context);vm.runInContext(read('catalog-experience.js'),context);
const {LB_CATALOG:d,LB_RENDER:r}=context.window;
assert.equal(d.packages.length,13);
assert.equal(d.languages.length,6);
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
 const home=r.home(lang);assert.equal((home.match(/class="lb-package-card"/g)||[]).length,13);assert.equal((home.match(/class="lb-system-tile"/g)||[]).length,5);
 for(const p of d.packages){
  const html=r.packagePage(p,lang);assert.ok(html.includes(esc(p.name)));assert.ok(html.includes(esc(d.limits[p.limit][lang])));assert.ok(html.includes(esc(d.ui.demoNote[lang])));
  for(const key of p.features)assert.ok(html.includes(esc(d.features[key][lang])));
  assert.ok(!html.includes('undefined')&&!html.includes('NaN'));
  if(!p.live)assert.ok(!html.includes('href="https://buy.stripe.com')&&!html.includes('href="https://portal.logobossweb-ai.eu/cart.php'));
  assert.ok(existsSync(path.join(dir,'packages',p.id+'.html')));
 }
}
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
console.log('PASS: 78 localized package views, all prices and checkout links, availability states, translations, and existing integration hooks.');
