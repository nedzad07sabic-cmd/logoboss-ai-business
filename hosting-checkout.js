/* LogoBossAI -> WHMCS. WHMCS owns billing, payment confirmation and provisioning. */
(() => {
  'use strict';
  const cycles = { 'hosting-web': 'monthly', 'hosting-wordpress': 'monthly', 'hosting-apps': 'monthly', 'hosting-email': 'annually' };
  const allowedOrigins = new Set(['https://portal.logobossweb-ai.eu', 'https://logobossweb-ai.eu']);
  const lang = () => localStorage.getItem('lb_lang') === 'en' ? 'en' : 'de';
  const text = (de, en) => lang() === 'en' ? en : de;
  function portal() {
    const config = window.LOGOBOSS_HOSTING_CONFIG;
    if (!config || config.enabled !== true || !Number.isFinite(Date.parse(config.verifiedAt))) return null;
    try {
      const url = new URL(config.portalBaseUrl);
      if (!allowedOrigins.has(url.origin) || url.username || url.password || url.search || url.hash) return null;
      if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(url.pathname)) return null;
      return url;
    } catch (_) { return null; }
  }
  function checkout(id) {
    const base = portal(), config = window.LOGOBOSS_HOSTING_CONFIG;
    if (!base) return null;
    let url;
    if (id === 'hosting-domains') {
      const domains = config.domains;
      if (!domains || !domains.enabled || !domains.lookupVerified || !domains.registrationVerified) return null;
      try { url = new URL(domains.orderUrl); } catch (_) { return null; }
      if (url.origin !== base.origin || url.pathname !== base.pathname + 'cart.php' || url.username || url.password || url.hash) return null;
      const allowed = new Set(['a', 'domain']);
      if ([...url.searchParams.keys()].some(key => !allowed.has(key))) return null;
      if (url.searchParams.get('a') !== 'add' || url.searchParams.get('domain') !== 'register') return null;
    } else {
      if (!Object.prototype.hasOwnProperty.call(cycles, id)) return null;
      const product = config.products && config.products[id];
      if (!product || !product.enabled || !Number.isSafeInteger(product.productId) || product.productId < 1 || product.billingCycle !== cycles[id]) return null;
      if (!['after-payment', 'review'].includes(product.activation)) return null;
      url = new URL('cart.php', base);
      url.searchParams.set('a', 'add');
      url.searchParams.set('pid', String(product.productId));
      url.searchParams.set('billingcycle', cycles[id]);
    }
    url.searchParams.set('language', lang() === 'en' ? 'English' : 'German');
    if (Number.isSafeInteger(config.currencyId) && config.currencyId > 0) url.searchParams.set('currency', String(config.currencyId));
    return url.href;
  }
  function translate(element, de, en) {
    if (!element) return;
    element.dataset.lbDe = de; element.dataset.lbEn = en; element.textContent = text(de, en);
  }
  function refresh() {
    document.querySelectorAll('.lb-hosting-card').forEach(card => {
      const id = card.id.replace('offer-', ''), link = card.querySelector('.lb-hosting-request');
      if (!link) return;
      if (!link.dataset.inquiryHref) {
        link.dataset.inquiryHref = link.getAttribute('href');
        link.dataset.inquiryDe = link.dataset.lbDe; link.dataset.inquiryEn = link.dataset.lbEn;
        const status = card.querySelector('.lb-hosting-status'), stage = card.querySelector('.lb-safe-stage');
        card.dataset.inquiryStatusDe = status.dataset.lbDe; card.dataset.inquiryStatusEn = status.dataset.lbEn;
        card.dataset.inquiryStageDe = stage.dataset.lbDe; card.dataset.inquiryStageEn = stage.dataset.lbEn;
      }
      const url = checkout(id), stage = card.querySelector('.lb-safe-stage'), status = card.querySelector('.lb-hosting-status');
      if (!url) {
        link.href = link.dataset.inquiryHref;
        translate(link, link.dataset.inquiryDe, link.dataset.inquiryEn);
        translate(stage, card.dataset.inquiryStageDe, card.dataset.inquiryStageEn);
        translate(status, card.dataset.inquiryStatusDe, card.dataset.inquiryStatusEn);
        delete link.dataset.hostingCheckout;
        return;
      }
      link.href = url; link.dataset.hostingCheckout = id;
      translate(stage, 'ONLINE BESTELLEN', 'ORDER ONLINE');
      translate(link, id === 'hosting-domains' ? 'Domain prüfen & bestellen →' : 'Paket kaufen →', id === 'hosting-domains' ? 'Check & order a domain →' : 'Buy this package →');
      const annual = id === 'hosting-email';
      const manual = id === 'hosting-apps';
      translate(status,
        annual ? '16,20 € jährlich. Bestellung und sichere Zahlung im Kundenportal; Domain separat.' : manual ? 'Bestellung und sichere Zahlung im Kundenportal. Bereitstellung nach technischer Freigabe.' : 'Bestellung und sichere Zahlung im Kundenportal. Die Aktivierung erfolgt nach bestätigter Zahlung.',
        annual ? '€16.20 billed annually. Order and pay securely in the client portal; domain separate.' : manual ? 'Order and pay securely in the client portal. Deployment follows technical approval.' : 'Order and pay securely in the client portal. Activation follows confirmed payment.');
    });
  }
  window.lbHostingCheckoutUrl = checkout;
  window.lbHostingReady = id => Boolean(checkout(id));
  window.lbRefreshHostingLinks = refresh;
  window.lbHostingCheckoutSummary = () => {
    const available = [...Object.keys(cycles), 'hosting-domains'].filter(window.lbHostingReady);
    if (!available.length) return null;
    return {
      title: text('HOSTING · SICHER BESTELLEN', 'HOSTING · SECURE CHECKOUT'),
      body: text('Verfügbare Pakete können Sie im Kundenportal bestellen und bezahlen. Domains und AI/API-Verbrauch sind separat, sofern nicht ausdrücklich enthalten.', 'Order and pay for available packages in the client portal. Domains and AI/API usage are separate unless explicitly included.')
    };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, { once: true }); else refresh();
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('storage', refresh);
})();
