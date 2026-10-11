# LogoBossAI hosting checkout

Updated 2026-10-11. The owner authorized publishing prices and purchase links.

## Published routing

WHMCS runs at https://portal.logobossweb-ai.eu/. EUR is currency ID 1. The existing website, eight Stripe package-plus-subscription links, customer accounts and 3D support centre are retained.

| Website package | Price | Billing cycle | WHMCS product ID | Website action |
| --- | ---: | --- | ---: | --- |
| Web Hosting | €8.99 | Monthly | 1 | Buy in WHMCS |
| WordPress & Care | €50.76 | Monthly | 2 | Buy in WHMCS |
| Apps & Bots | €23.89 | Monthly | 4 | Request technical review |
| Business Email | €16.20 | Annually | 3 | Request; annual price needs correction |
| Domains .de | €14.04 | Annually | — | Request; registrar not connected |
| Domains .com | €21.60 | Annually | — | Request; registrar not connected |

Business Email displays the actual agreed annual total, including in the 3D selector. It is not linked to the incorrect WHMCS monthly charge.

The hosting category and all-packages view show a matching blue/violet client-portal panel. It directs customers to the account created during hosting checkout for orders, invoices and services, with DE/EN portal links. The general package notice accurately distinguishes online purchase buttons from inquiry offers. Inquiry-only cards explain their respective setup/availability steps without exposing backend configuration details.

The website-package Stripe setup-plus-monthly disclosure is hidden in the hosting-only category, where it does not describe these WHMCS offers. It remains visible for the relevant website packages and the combined catalog.

## Fresh verification

- Public HTTPS requests to the portal and product routes succeed.
- WHMCS product feeds return €8.99 monthly for product 1 and €50.76 monthly for product 2 in currency 1.
- Product 4's anonymous basket shows €23.89 monthly in EUR. Its server module is absent and automatic setup is Off. Its deployment/runtime requires review before sales.
- Product 3's feed returns €16.20 MONTHLY and -1.00 annually (annual cycle disabled). This contradicts the agreed €16.20 yearly price. Leave its website checkout disabled until corrected.
- Web, WordPress and Email are recurring cPanel products set to After First Payment. The user reported a successful server connection test. Actual account provisioning has not been tested end to end.
- Existing WHM packages: logoboss_Web_5GB, logoboss_WordPress_10GB, logoboss_Email_2GB. Website setup copy does not promise immediate automatic fulfillment; WordPress care and email/DNS work include manual setup.
- The existing live Stripe account has charges and payouts enabled, active card payments and no currently due requirements.
- Its live WHMCS Stripe webhook is enabled with the supported payment-method/card update events. The separate website Stripe webhook is retained. No real payment, subscription or customer order was submitted for testing.
- WHMCS 9.0.9 and the Plus license are visible in the authenticated dashboard. Cron tasks have run; the dashboard has not yet recorded a daily automation run. Verify the daily job before relying on automated renewals.
- Portal public DNS now uses A 65.98.48.188 and MX 10 portal.logobossweb-ai.eu. with no AAAA. The main domain's prior mail routing is restored. SMTP configuration testing succeeded previously, but actual WHMCS-to-Gmail delivery still needs confirmation after the DNS correction.

## Remaining setup

1. In Business Email pricing, enable the annual EUR cycle at 16.20 with a zero setup fee and disable the erroneous 16.20 monthly cycle. Verify the public annual product feed and a fresh anonymous order summary. Then enable hosting-email in hosting-checkout-config.js and publish the matching annual static checkout link. Secure sign-in and a subsequent manual sign-in/password-confirmation attempt succeeded, but browser credential protection continued to block editing. The owner deferred manual correction and authorized publishing everything currently ready; no WHMCS pricing change was made.
2. Confirm Apps & Bots runtime, resources and a working deployment before enabling direct paid checkout. Keep AI/API consumption separate.
3. Configure and test domain availability, registrar fulfillment and annual prices before enabling domain checkout. No domain registrations, transfers, renewals or paid add-ons were activated.
4. Verify a disposable hosting account can actually be provisioned, then validate failed/pending/successful payment handling in an isolated test environment. A gateway form or connection test does not establish payment/provisioning correctness.
5. Check mail delivery, daily cron execution, renewal invoices and cancellation handling. Verify reseller capacity limits, installer removal, backups and administrator protection.

Public checkout routing contains only product IDs and URLs. Keep Stripe credentials, hosting credentials and the WHMCS license on the server. Setting enabled to false restores inquiry links when JavaScript runs; it does not disable a product in WHMCS. Static purchase links must also be updated for a full website rollback.

## Local checks

Use jsdom or set NODE_PATH to the directory containing the installed jsdom module, then run:

- node ops/check-hosting-checkout.cjs
- node ops/check-site.cjs
- node ops/check-support-ui.cjs

These verify checkout IDs/currency/cycles, fallback links, annual email display, DE/EN translation, all 13 cards and 3D scenes, existing Stripe links and support navigation. They do not make live payments or provision hosting.

## Primary references

- https://docs.whmcs.com/9-0/clients/the-client-area/linking-to-whmcs/
- https://docs.whmcs.com/8-13/payments/payment-gateway-modules/stripe/
- https://docs.whmcs.com/9-0/system/automation/cron-tutorials/configure-the-system-cron-job/
- https://docs.stripe.com/testing/overview
