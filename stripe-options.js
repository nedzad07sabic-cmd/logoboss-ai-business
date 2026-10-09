/* LogoBoss AI: 16 separate Stripe Live checkout options, 2026-10. */
(() => {
  'use strict';
  const packages = {
    'web-digital-start': ['Digital Start',1190,59,'28E3cv2lZeZof1odNN3ZK08','cNiaEX7GjeZo1ay3993ZK0f'],
    'web-business': ['Web Business',2320,99,'3cIdR91hVaJ8cTg5hh3ZK09','00w14naSv8B06uS3993ZK0a'],
    'web-pro': ['Web Pro',3920,149,'9B6aEX7Gj6sS06u8tt3ZK0n','7sY6oH7Gj8B0dXk2553ZK0g'],
    'ai-business': ['Business AI',790,79,'cNiaEXaSv6sS3iG2553ZK0b','bJe5kD3q3cRgcTg8tt3ZK0h'],
    'ai-pro': ['Pro AI',2320,149,'3cI9ATf8LbNcdXk9xx3ZK0c','5kQ00j2lZ7wW2eCfVV3ZK0i'],
    'automation-start': ['Automation Start',720,49,'7sY7sLd0DcRgdXk3993ZK0j','cNi6oH4u7dVk3iG9xx3ZK0d'],
    'automation-business': ['Automation Business',2000,149,'5kQcN55ybcRg06u8tt3ZK0k','3cI00j3q304u7yWeRR3ZK0l'],
    'company-os-start': ['Company OS Start',3990,199,'3cI6oHd0D8B006u9xx3ZK0e','dRm5kD1hV9F4dXk3993ZK0m']
  };
  const euro = n => new Intl.NumberFormat('de-DE').format(n) + ' €';
  function update() {
    Object.entries(packages).forEach(([id, [name, once, monthly, onceCode, monthlyCode]]) => {
      const old = document.querySelector(`a.lb-live-buy[data-stripe-package="${id}"]`);
      if (!old || old.closest('.lb-stripe-two-options')) return;
      const wrap = document.createElement('div');
      wrap.className = 'lb-stripe-two-options';
      wrap.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:12px';
      [[onceCode,'one_time',once,'Einmalig bezahlen','Pay one time'],[monthlyCode,'monthly',monthly,'Monatlich abonnieren','Subscribe monthly']].forEach(([code,kind,amount,de,en]) => {
        const a = document.createElement('a');
        a.className = 'lb-live-buy';
        a.href = 'https://buy.stripe.com/' + code;
        a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.dataset.stripePackage = id;
        a.dataset.paymentKind = kind;
        a.setAttribute('aria-label', `${name}: ${de}`);
        const title = document.createElement('span');
        title.dataset.lbDe = de; title.dataset.lbEn = en;
        title.textContent = document.documentElement.lang.toLowerCase().startsWith('en') ? en : de;
        const small = document.createElement('small');
        const priceDe = euro(amount) + (kind === 'monthly' ? ' / Monat' : '');
        const priceEn = amount.toLocaleString('en-US') + ' €' + (kind === 'monthly' ? ' / month' : '');
        small.dataset.lbDe = priceDe; small.dataset.lbEn = priceEn;
        small.textContent = document.documentElement.lang.toLowerCase().startsWith('en') ? priceEn : priceDe;
        a.append(title, small); wrap.append(a);
      });
      old.replaceWith(wrap);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', update, {once:true});
  else update();
})();
