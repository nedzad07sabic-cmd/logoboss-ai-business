/* LogoBoss AI: setup-only and setup-plus-monthly Stripe Live options, 2026-10. */
(() => {
  'use strict';
  const packages = {
    'web-digital-start': ['Digital Start',1190,59,'28E3cv2lZeZof1odNN3ZK08','00wbJ15ybdVk4mK7pp3ZK00'],
    'web-business': ['Web Business',2320,99,'3cIdR91hVaJ8cTg5hh3ZK09','bJe4gz7Gj6sScTg4dd3ZK01'],
    'web-pro': ['Web Pro',3920,149,'9B6aEX7Gj6sS06u8tt3ZK0n','3cI6oH8KnaJ82eC1113ZK02'],
    'ai-business': ['Business AI',790,79,'cNiaEXaSv6sS3iG2553ZK0b','bJebJ18Kn18ybPcbFF3ZK03'],
    'ai-pro': ['Pro AI',2320,149,'3cI9ATf8LbNcdXk9xx3ZK0c','eVq28rgcPeZog5seRR3ZK04'],
    'automation-start': ['Automation Start',720,49,'7sY7sLd0DcRgdXk3993ZK0j','dRm8wP0dR18y6uS1113ZK05'],
    'automation-business': ['Automation Business',2000,149,'5kQcN55ybcRg06u8tt3ZK0k','8x25kD6Cf5oO2eCgZZ3ZK06'],
    'company-os-start': ['Company OS Start',3990,199,'3cI6oHd0D8B006u9xx3ZK0e','4gMcN57Gj04u8D03993ZK07']
  };
  const euro = n => new Intl.NumberFormat('de-DE').format(n) + ' €';
  const euroEn = n => n.toLocaleString('en-US') + ' €';
  function update() {
    Object.entries(packages).forEach(([id, [name, setup, monthly, oneTimeCode, subscriptionCode]]) => {
      const old = document.querySelector('a.lb-live-buy[data-stripe-package="' + id + '"]');
      if (!old || old.closest('.lb-stripe-two-options')) return;
      const wrap = document.createElement('div');
      wrap.className = 'lb-stripe-two-options';
      wrap.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:12px';
      [
        [oneTimeCode,'one_time',setup,'Einmalig bezahlen','Pay once'],
        [subscriptionCode,'setup_plus_monthly',monthly,'Abo starten','Start subscription']
      ].forEach(([code,kind,amount,de,en]) => {
        const a = document.createElement('a');
        a.className = 'lb-live-buy';
        a.href = 'https://buy.stripe.com/' + code;
        a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.dataset.stripePackage = id;
        a.dataset.paymentKind = kind;
        const recurring = kind === 'setup_plus_monthly';
        a.setAttribute('aria-label', recurring
          ? name + ': heute ' + euro(setup + monthly) + ', danach ' + euro(monthly) + ' monatlich'
          : name + ': ' + euro(setup) + ' einmalig, ohne Abo');
        const title = document.createElement('span');
        title.dataset.lbDe = de; title.dataset.lbEn = en;
        title.textContent = document.documentElement.lang.toLowerCase().startsWith('en') ? en : de;
        const small = document.createElement('small');
        const priceDe = recurring
          ? 'Heute: ' + euro(setup + monthly) + ' · danach ' + euro(monthly) + ' / Monat'
          : euro(setup) + ' einmalig · kein Abo';
        const priceEn = recurring
          ? 'Today: ' + euroEn(setup + monthly) + ' · then ' + euroEn(monthly) + ' / month'
          : euroEn(setup) + ' once · no subscription';
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
