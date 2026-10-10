/* Public checkout routing only. Never put license keys, API tokens or passwords here. */
window.LOGOBOSS_HOSTING_CONFIG = {
  enabled: false,
  portalBaseUrl: '',
  verifiedAt: '',
  currencyId: null,
  products: {
    'hosting-web': { enabled: false, productId: null, billingCycle: 'monthly', activation: 'after-payment' },
    'hosting-wordpress': { enabled: false, productId: null, billingCycle: 'monthly', activation: 'after-payment' },
    'hosting-apps': { enabled: false, productId: null, billingCycle: 'monthly', activation: 'review' },
    'hosting-email': { enabled: false, productId: null, billingCycle: 'annually', activation: 'after-payment' }
  },
  domains: { enabled: false, orderUrl: '', lookupVerified: false, registrationVerified: false }
};
