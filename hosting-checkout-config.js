/* Public checkout routing only. Never put license keys, API tokens or passwords here. */
window.LOGOBOSS_HOSTING_CONFIG = {
  enabled: true,
  portalBaseUrl: 'https://portal.logobossweb-ai.eu/',
  verifiedAt: '2026-10-11T08:35:20Z',
  currencyId: 1,
  products: {
    'hosting-web': { enabled: true, productId: 1, billingCycle: 'monthly', activation: 'after-payment' },
    'hosting-wordpress': { enabled: true, productId: 2, billingCycle: 'monthly', activation: 'after-payment' },
    // Technical deployment must be agreed before accepting an Apps & Bots payment.
    'hosting-apps': { enabled: false, productId: 4, billingCycle: 'monthly', activation: 'review' },
    // WHMCS currently has EUR 16.20 MONTHLY, not the agreed EUR 16.20 annually.
    // Enable only after the annual price and order summary are corrected and verified.
    'hosting-email': { enabled: false, productId: 3, billingCycle: 'annually', activation: 'after-payment' }
  },
  domains: { enabled: false, orderUrl: '', lookupVerified: false, registrationVerified: false }
};
