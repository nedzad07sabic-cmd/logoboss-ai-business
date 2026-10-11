# LogoBoss AI website audit — 10 October 2026

Source examined: `fec804e1ef726228bd028457b8f5e14e09e051de` from `main`.
Public site: https://logobossweb-ai.eu/

## Verified

- All 28 HTML pages: no missing internal files and no duplicate element IDs. Public icons, manifest, service-page canonicals and sitemap are present.
- DOM behavior: five categories, 13 package cards, 59 individual feature scenes, package filters, deep links, keyboard category navigation and Home navigation.
- Eight active live Stripe Payment Links match the public catalog. Each contains exactly one setup price and one monthly price, quantity one, EUR. The 16 old separate setup/monthly links are inactive.
- Stripe billing portal is active, with invoice history, payment-method updates and cancellation at the end of the billing period. The public login URL matches the live configuration.
- The enabled Stripe webhook points to `bright-action` and includes checkout completion, asynchronous payment outcomes, invoice outcomes and subscription updates/deletion.
- Supabase project is active. Confirmed customer ownership is required to claim orders. Administrative functions check the confirmed administrator in Auth; tenant data uses membership checks.
- Sending domain is verified and enabled in Resend. No actual customer emails, purchases or paid tests were sent during this audit.

## Fixed

- German/English customer portal labels, messages, dates, prices and accessibility labels now follow the selected language.
- Purchase disclosures and checkout link accessibility labels follow the selected language.
- Saved package selections retain the monthly price.
- A rapid double submission is blocked before asynchronous session lookup.
- Removed the stale asynchronous checkout guard; Stripe-hosted checkout remains available, while order requests and order ownership require a verified account.
- `submit-order` now records genuine non-binding inquiries with `is_test=false`, retains server-authoritative prices and verified email ownership, and prepares informational DE/EN customer receipts. Receipts explicitly state that no payment has been taken. Provider failures do not falsely report receipt delivery.
- Notification emails link to the current admin page and use event-specific idempotency keys and request timeouts.
- Removed direct anonymous chat/message inserts and anonymous reading of private assistant instructions. Server chat writes and tenant member access remain available.

Backend changes deployed: `submit-order` version 24 and migration `20261010151852_close_direct_public_chat_writes_and_private_ai_settings`. Deployed source was fetched back and matched the prepared source.

## Validation

- `NODE_PATH=/tmp/logoboss-test/node_modules node ops/check-site.cjs`: passed.
- `node ops/check-order-function.cjs`: 12 mocked scenarios passed, including auth, forged email, price tampering, language, rate limiting, invalid JSON and provider/storage failure.
- `node --test supabase/functions/bright-action/checkout-validation.test.mjs`: 23 passed.
- `node --test supabase/functions/auth-email/auth-email.test.mjs`: 11 passed.
- Database post-check: RLS stays enabled, anonymous INSERT on conversations/messages and SELECT on assistant settings are denied, server writes and member policies remain.

The DOM tests use a mocked Supabase client and mocked fetch. They verify frontend behavior without generating real accounts, orders, emails or charges.

## Remaining before final release

1. Hosting checkout: valid portal HTTPS, cPanel access, WHMCS installation, gateway configuration, actual product/currency IDs, provisioning and checkout verification. The separate hosting preparation PR remains disabled and unmerged.
2. `impressum.html` and `datenschutz.html` currently contain placeholders. Complete provider information with a confirmed business address and prepare the privacy notice for the providers actually used. No invoice/home address was copied to the public website.
3. Real browser/mobile interaction was blocked by native browser protection after a successful public-page read. Visual layout, GPU rendering and mobile interactions cannot be certified by DOM tests.
4. No live charge, renewal or refund was run. Enabled Stripe configuration and validation tests do not replace a controlled payment lifecycle test.

Do not describe the site as fully verified or commercially final until these items are resolved. No prices, hosting billing periods, domain records or purchased services were changed by this audit.
