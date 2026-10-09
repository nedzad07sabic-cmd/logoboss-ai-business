/* LogoBoss AI: setup + first month now, monthly subscription thereafter. */
(() => {
  'use strict';
  const packages = {
    'web-digital-start': ['Digital Start',1190,59,'00wbJ15ybdVk4mK7pp3ZK00'],
    'web-business': ['Web Business',2320,99,'bJe4gz7Gj6sScTg4dd3ZK01'],
    'web-pro': ['Web Pro',3920,149,'3cI6oH8KnaJ82eC1113ZK02'],
    'ai-business': ['Business AI',790,79,'bJebJ18Kn18ybPcbFF3ZK03'],
    'ai-pro': ['Pro AI',2320,149,'eVq28rgcPeZog5seRR3ZK04'],
    'automation-start': ['Automation Start',720,49,'dRm8wP0dR18y6uS1113ZK05'],
    'automation-business': ['Automation Business',2000,149,'8x25kD6Cf5oO2eCgZZ3ZK06'],
    'company-os-start': ['Company OS Start',3990,199,'4gMcN57Gj04u8D03993ZK07']
  };
  const euro = (amount, lang) => amount.toLocaleString(lang === 'en' ? 'en-US' : 'de-DE') + ' €';
  function update() {
    const lang = document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'de';
    Object.entries(packages).forEach(([id, [name, setup, monthly, code]]) => {
      const links = document.querySelectorAll('a.lb-live-buy[data-stripe-package="' + id + '"]');
      const roots = new Set(Array.from(links, link => link.closest('.lb-stripe-two-options') || link));
      roots.forEach(old => {
        const a = document.createElement('a');
        a.className = 'lb-live-buy';
        a.href = 'https://buy.stripe.com/' + code;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.dataset.stripePackage = id;
        a.dataset.paymentKind = 'setup_plus_monthly';
        a.setAttribute('aria-label', lang === 'en'
          ? name + ': today ' + euro(setup + monthly, 'en') + ', then ' + euro(monthly, 'en') + ' per month'
          : name + ': heute ' + euro(setup + monthly, 'de') + ', danach ' + euro(monthly, 'de') + ' monatlich');
        const title = document.createElement('span');
        title.dataset.lbDe = 'Paket + Abo kaufen';
        title.dataset.lbEn = 'Buy package + subscription';
        title.textContent = lang === 'en' ? title.dataset.lbEn : title.dataset.lbDe;
        const price = document.createElement('small');
        price.dataset.lbDe = 'Heute: ' + euro(setup + monthly, 'de') + ' · danach ' + euro(monthly, 'de') + ' / Monat';
        price.dataset.lbEn = 'Today: ' + euro(setup + monthly, 'en') + ' · then ' + euro(monthly, 'en') + ' / month';
        price.textContent = lang === 'en' ? price.dataset.lbEn : price.dataset.lbDe;
        a.append(title, price);
        old.replaceWith(a);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', update, {once:true});
  else update();
})();
