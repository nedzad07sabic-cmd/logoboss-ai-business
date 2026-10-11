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
    document.querySelectorAll('[data-hosting-portal]').forEach(link => {
      const url = new URL('clientarea.php', 'https://portal.logobossweb-ai.eu/');
      url.searchParams.set('language', lang() === 'en' ? 'English' : 'German');
      link.href = url.href;
    });
    document.querySelectorAll('.lb-hosting-card').forEach(card => {
      const id = card.id.replace('offer-', '');
      let link = card.querySelector('.lb-hosting-request');
      if (!link) return;
      const url = checkout(id), stage = card.querySelector('.lb-safe-stage'), status = card.querySelector('.lb-hosting-status');
      const tag = url ? 'A' : 'BUTTON';
      if (link.tagName !== tag) {
        const replacement = document.createElement(tag.toLowerCase());
        for (const { name, value } of [...link.attributes]) replacement.setAttribute(name, value);
        link.replaceWith(replacement);
        link = replacement;
      }
      for (const element of [card, link]) {
        for (const { name } of [...element.attributes]) {
          if (name.startsWith('data-inquiry-')) element.removeAttribute(name);
        }
      }
      if (!url) {
        for (const name of ['href', 'target', 'rel', 'download', 'ping', 'referrerpolicy', 'data-hosting-checkout', 'aria-label', 'aria-labelledby']) link.removeAttribute(name);
        link.type = 'button'; link.disabled = true; link.setAttribute('aria-disabled', 'true');
        translate(link, 'Soon', 'Soon');
        translate(stage, 'Soon', 'Soon');
        translate(status, '', '');
        if (status) status.hidden = true;
        return;
      }
      link.removeAttribute('type'); link.removeAttribute('disabled'); link.removeAttribute('aria-disabled');
      link.href = url; link.dataset.hostingCheckout = id;
      translate(stage, 'ONLINE BESTELLEN', 'ORDER ONLINE');
      translate(link, id === 'hosting-domains' ? 'Domain prüfen & bestellen →' : 'Paket kaufen →', id === 'hosting-domains' ? 'Check & order a domain →' : 'Buy this package →');
      if (status) status.hidden = false;
      const annual = id === 'hosting-email';
      const manual = id === 'hosting-apps';
      translate(status,
        annual ? '16,20 € jährlich. Bestellung und sichere Zahlung im Kundenportal; Postfach und DNS werden nach Zahlung eingerichtet. Domain separat.' : manual ? 'Nur nach technischer Freigabe bestellen. Bereitstellung nach bestätigter Zahlung.' : 'Bestehende Domain erforderlich. Sicher im Kundenportal bezahlen; Einrichtung nach bestätigter Zahlung.',
        annual ? '€16.20 billed annually. Pay securely in the client portal; mailbox and DNS setup follow payment. Domain separate.' : manual ? 'Order only after technical approval. Deployment follows confirmed payment.' : 'An existing domain is required. Pay securely in the client portal; setup follows confirmed payment.');
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
      body: text('Pakete mit „Paket kaufen“ können Sie sicher im Kundenportal bezahlen. Bestehende Domain erforderlich; Einrichtung nach Zahlung. Noch nicht verfügbare Pakete sind mit „Soon“ gekennzeichnet und können noch nicht bestellt werden. Domains und AI/API-Verbrauch sind separat.', 'Pay securely in the client portal for packages marked “Buy this package”. An existing domain is required; setup follows payment. Unavailable packages are marked “Soon” and cannot be ordered yet. Domains and AI/API usage are separate.')
    };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, { once: true }); else refresh();
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('storage', refresh);
})();
