const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require(process.env.LOGOBOSS_JSDOM_PATH || 'jsdom');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'https://logobossweb-ai.eu/', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window, d = w.document;
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
w.IntersectionObserver = class { observe() {} unobserve() {} };
w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
w.fetch = async () => ({ ok: false, json: async () => ({}) }); w.alert = () => {};
const errors = []; w.addEventListener('error', e => errors.push(e.message));
for (const script of d.querySelectorAll('script:not([src])')) {
  if (script.type !== 'module' && script.type !== 'application/ld+json') w.eval(script.textContent);
}
for (const file of ['hosting-checkout-config.js', 'hosting-checkout.js', 'immersive-3d.js']) w.eval(fs.readFileSync(path.join(root, file), 'utf8'));
const click = selector => { assert.ok(d.querySelector(selector), selector); d.querySelector(selector).click(); };
const ids = ['hosting-web', 'hosting-wordpress', 'hosting-apps', 'hosting-domains', 'hosting-email'];
const config = w.LOGOBOSS_HOSTING_CONFIG;
for (const [id, pid] of [['hosting-web', '1'], ['hosting-wordpress', '2']]) {
  const url = new URL(w.lbHostingCheckoutUrl(id));
  assert.equal(url.origin, 'https://portal.logobossweb-ai.eu');
  assert.equal(url.searchParams.get('pid'), pid);
  assert.equal(url.searchParams.get('billingcycle'), 'monthly');
  assert.equal(url.searchParams.get('currency'), '1');
  assert.equal(url.searchParams.get('language'), 'German');
  assert.equal(new URL(d.querySelector(`#offer-${id} .lb-hosting-request`).href).search, url.search, 'no-JS links use the verified checkout');
}
for (const id of ['hosting-apps', 'hosting-domains', 'hosting-email']) assert.equal(w.lbHostingCheckoutUrl(id), null, 'unready products stay on request');
assert.equal(d.querySelector('#offer-hosting-email').dataset.price, '16.20');
assert.equal(d.querySelector('#offer-hosting-email').dataset.period, 'year');
config.enabled = false;
w.lbRefreshHostingLinks();
for (const link of d.querySelectorAll('.lb-hosting-request')) assert.ok(link.href.startsWith('mailto:'));
config.enabled = true; w.lbRefreshHostingLinks();
assert.equal(d.querySelectorAll('[data-hosting-checkout]').length, 2);
click('.node-hosting'); assert.equal(d.querySelectorAll('#motionPackagePicker button').length, 5);
assert.equal(d.getElementById('lbHostingPortal').hidden, false);
for (const link of d.querySelectorAll('[data-hosting-portal]')) {
  const url = new URL(link.href); assert.equal(url.origin, 'https://portal.logobossweb-ai.eu');
  assert.equal(url.pathname, '/clientarea.php'); assert.equal(url.searchParams.get('language'), 'German');
}
let scenes = 0;
for (const id of ids) {
  click(`[data-package="${id}"]`);
  assert.deepEqual(Array.from(d.querySelectorAll('.lb-safe-card:not([hidden])'), card => card.id), ['offer-' + id]);
  const count = d.querySelectorAll('#motionStepList button').length;
  for (let i = 0; i < count; i++) { click(`#motionStepList button[data-feature="${i}"]`); assert.ok(d.querySelector('.fx-visual')); scenes++; }
}
// Test fixtures only. These IDs and portal URL are not deployed configuration.
config.enabled = true; config.portalBaseUrl = 'https://portal.logobossweb-ai.eu/';
config.verifiedAt = '2026-10-10T12:00:00Z'; config.currencyId = 2;
for (const [index, id] of ['hosting-web', 'hosting-wordpress', 'hosting-apps', 'hosting-email'].entries()) {
  config.products[id].enabled = true; config.products[id].productId = 101 + index;
}
config.domains = { enabled: true, lookupVerified: true, registrationVerified: true, orderUrl: 'https://portal.logobossweb-ai.eu/cart.php?a=add&domain=register' };
w.localStorage.setItem('lb_lang', 'en'); w.lbRefreshHostingLinks();
for (const link of d.querySelectorAll('[data-hosting-portal]')) assert.equal(new URL(link.href).searchParams.get('language'), 'English');
for (const id of ids) {
  const url = new URL(w.lbHostingCheckoutUrl(id)); assert.equal(url.origin, 'https://portal.logobossweb-ai.eu');
  assert.equal(url.searchParams.get('language'), 'English'); assert.equal(url.searchParams.get('currency'), '2');
  if (id !== 'hosting-domains') assert.equal(url.searchParams.get('billingcycle'), id === 'hosting-email' ? 'annually' : 'monthly');
  assert.equal(d.querySelector(`#offer-${id} .lb-safe-stage`).textContent, 'ORDER ONLINE');
}
assert.match(d.querySelector('#offer-hosting-email .lb-hosting-status').textContent, /16\.20 billed annually/);
click('[data-package="hosting-web"]'); assert.match(d.querySelector('#motionSelectedOffer').textContent, /purchase/);
w.localStorage.setItem('lb_lang', 'de'); w.lbRefreshHostingLinks();
assert.equal(new URL(w.lbHostingCheckoutUrl('hosting-web')).searchParams.get('language'), 'German');
for (const bad of ['https://example.net/', 'http://portal.logobossweb-ai.eu/', 'https://user:password@portal.logobossweb-ai.eu/', 'https://portal.logobossweb-ai.eu/?key=secret', 'https://portal.logobossweb-ai.eu/#key', 'https://portal.logobossweb-ai.eu:444/']) {
  config.portalBaseUrl = bad; assert.equal(w.lbHostingCheckoutUrl('hosting-web'), null);
}
config.portalBaseUrl = 'https://portal.logobossweb-ai.eu/';
assert.equal(w.lbHostingCheckoutUrl('__proto__'), null);
config.products['hosting-email'].billingCycle = 'monthly'; assert.equal(w.lbHostingCheckoutUrl('hosting-email'), null);
config.products['hosting-email'].billingCycle = 'annually';
config.products['hosting-web'].productId = '101'; assert.equal(w.lbHostingCheckoutUrl('hosting-web'), null);
config.products['hosting-web'].productId = 101;
config.domains.registrationVerified = false; assert.equal(w.lbHostingCheckoutUrl('hosting-domains'), null);
config.domains.registrationVerified = true;
config.domains.orderUrl += '&key=secret'; assert.equal(w.lbHostingCheckoutUrl('hosting-domains'), null);
config.enabled = false; w.lbRefreshHostingLinks();
for (const link of d.querySelectorAll('.lb-hosting-request')) assert.ok(link.href.startsWith('mailto:'));
for (const [category, count] of [['web', 3], ['ai', 2], ['hosting', 1]]) { click(`#motion-tab-${category}`); assert.equal(d.querySelectorAll('.lb-safe-card:not([hidden])').length, count); assert.equal(d.getElementById('lbHostingPortal').hidden, category !== 'hosting'); }
click('[data-motion-all]'); assert.equal(d.querySelectorAll('.lb-safe-card:not([hidden])').length, 13);
assert.equal(d.getElementById('lbHostingPortal').hidden, false);
assert.doesNotMatch(d.querySelector('.lb-safe-alert').textContent, /email inquiries only|nur unverbindlich per E-Mail/i);
click('[data-home]'); assert.equal(d.querySelector('#homeView').classList.contains('hidden'), false);
assert.deepEqual(errors, []);
for (const file of ['index.html', 'hosting-checkout-config.js', 'hosting-checkout.js', 'immersive-3d.js']) {
  assert.doesNotMatch(fs.readFileSync(path.join(root, file), 'utf8'), /WHMCS-[a-zA-Z0-9]{8,}|\b(?:sk|rk)_(?:live|test)_[a-zA-Z0-9]+/);
}
console.log(JSON.stringify({ result: 'passed', liveCheckoutProducts: 2, hostingProducts: 5, featureScenes: scenes, packageCards: 13, checked: ['verified product IDs and EUR', 'static purchase links', 'disabled fallback', 'DE/EN checkout and client portal', 'portal category visibility', 'annual email price', 'monthly/annual cycles', 'portal URL validation', 'domain readiness', 'rollback', '3D navigation', 'public secret scan'] }));
dom.window.close();
