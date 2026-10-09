export const catalog = {
  "company-os-start": {
    "id": "company-os-start",
    "name": "Company OS Start",
    "link": "plink_1UOg6IEfGnrLjlxOcjZiirrr",
    "setupPrice": "price_1UOg35EfGnrLjlxOVLaxhB6r",
    "monthlyPrice": "price_1UOg37EfGnrLjlxOOjczpf8E",
    "setup": 399000,
    "monthly": 19900
  },
  "automation-business": {
    "id": "automation-business",
    "name": "Automation Business",
    "link": "plink_1UOg6EEfGnrLjlxOB3CXqyki",
    "setupPrice": "price_1UOg31EfGnrLjlxOwRiKGVhU",
    "monthlyPrice": "price_1UOg33EfGnrLjlxODUwvbGMI",
    "setup": 200000,
    "monthly": 14900
  },
  "automation-start": {
    "id": "automation-start",
    "name": "Automation Start",
    "link": "plink_1UOg6CEfGnrLjlxO9moHuYbS",
    "setupPrice": "price_1UOg2xEfGnrLjlxOgh2YEDgb",
    "monthlyPrice": "price_1UOg2zEfGnrLjlxOobPDdBfP",
    "setup": 72000,
    "monthly": 4900
  },
  "ai-pro": {
    "id": "ai-pro",
    "name": "Pro AI",
    "link": "plink_1UOg69EfGnrLjlxOC7QA1J2H",
    "setupPrice": "price_1UOg2tEfGnrLjlxOMVxYhxIz",
    "monthlyPrice": "price_1UOg2vEfGnrLjlxOLWIsoNcC",
    "setup": 232000,
    "monthly": 14900
  },
  "ai-business": {
    "id": "ai-business",
    "name": "Business AI",
    "link": "plink_1UOg67EfGnrLjlxOxoczu6Fl",
    "setupPrice": "price_1UOg2pEfGnrLjlxO4OIMMUk5",
    "monthlyPrice": "price_1UOg2rEfGnrLjlxOQtSgkqDN",
    "setup": 79000,
    "monthly": 7900
  },
  "web-pro": {
    "id": "web-pro",
    "name": "Web Pro",
    "link": "plink_1UOg65EfGnrLjlxOk7FYlFq5",
    "setupPrice": "price_1UOg2lEfGnrLjlxOCyUSpx40",
    "monthlyPrice": "price_1UOg2nEfGnrLjlxOdc3S6hJT",
    "setup": 392000,
    "monthly": 14900
  },
  "web-business": {
    "id": "web-business",
    "name": "Web Business",
    "link": "plink_1UOg63EfGnrLjlxOyA5aFMzK",
    "setupPrice": "price_1UOg2MEfGnrLjlxORidyihtE",
    "monthlyPrice": "price_1UOg2OEfGnrLjlxOfwvgfnWq",
    "setup": 232000,
    "monthly": 9900
  },
  "web-digital-start": {
    "id": "web-digital-start",
    "name": "Digital Start",
    "link": "plink_1UOg5kEfGnrLjlxO7sx4AcJU",
    "setupPrice": "price_1UOg2JEfGnrLjlxOQWzMO1cz",
    "monthlyPrice": "price_1UOg2KEfGnrLjlxO1GyLVC4Y",
    "setup": 119000,
    "monthly": 5900
  }
};
export const idOf = value => typeof value === 'string' ? value : value?.id || null;
export function validateCheckout(session) {
  if (!session.livemode || !session.id?.startsWith('cs_live_')) throw new Error('Live checkout required');
  if (session.status !== 'complete' || session.payment_status !== 'paid') return null;
  const pkg = Object.values(catalog).find(p => p.link === idOf(session.payment_link));
  if (!pkg || session.mode !== 'subscription' || !idOf(session.customer) || !idOf(session.subscription)) throw new Error('Unknown checkout');
  const items = session.line_items?.data || [];
  if (session.line_items?.has_more || items.length !== 2) throw new Error('Unexpected checkout items');
  const expected = new Map([[pkg.setupPrice, pkg.setup], [pkg.monthlyPrice, pkg.monthly]]);
  for (const item of items) {
    const amount = expected.get(item.price?.id);
    if (amount === undefined || item.quantity !== 1 || item.price.currency !== 'eur' || item.price.unit_amount !== amount) throw new Error('Price or quantity mismatch');
    const recurring = item.price.id === pkg.monthlyPrice;
    if (recurring ? item.price.recurring?.interval !== 'month' || item.price.recurring?.interval_count !== 1 : item.price.recurring != null) throw new Error('Billing interval mismatch');
    expected.delete(item.price.id);
  }
  if (expected.size || session.currency !== 'eur' || session.amount_subtotal !== pkg.setup + pkg.monthly || !Number.isSafeInteger(session.amount_total) || session.amount_total !== session.amount_subtotal + (session.total_details?.amount_tax || 0) - (session.total_details?.amount_discount || 0)) throw new Error('Checkout amount mismatch');
  const email = String(session.customer_details?.email || session.customer_email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Customer email missing');
  return {
    stripe_session_id: session.id, stripe_customer_id: idOf(session.customer),
    stripe_subscription_id: idOf(session.subscription), stripe_payment_intent_id: idOf(session.payment_intent),
    stripe_payment_link_id: pkg.link, package_id: pkg.id, package_name: pkg.name,
    payment_kind: 'setup_plus_monthly', customer_email: email,
    customer_name: session.customer_details?.name || null, company_name: session.collected_information?.business_name || null,
    setup_eur: pkg.setup / 100, monthly_eur: pkg.monthly / 100,
    amount_paid_eur: session.amount_total / 100, currency: 'eur', payment_status: 'paid', is_test: false
  };
}
