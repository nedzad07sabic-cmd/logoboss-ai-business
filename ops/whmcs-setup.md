# LogoBossAI hosting portal setup

Prepared 2026-10-10. This is a deployment draft, not an active checkout.

## Verified

- WHMCS Plus service is active and the license is ready to bind to its first installation.
- The member area recommends stable WHMCS 9.0.9.
- Verpex Reseller 15 is active in Frankfurt.
- The existing LogoBossAI live Stripe account has charges and payouts enabled.
- Current site source was retrieved from `nedzad07sabic-cmd/logoboss-ai-business/main`.
- WHM login has not been verified in this session. No installation, DNS change, payment gateway or provisioning change has been applied.

## Install and configure

1. Verify WHM/cPanel access and the three existing WHM package names. Use the reseller account's cPanel account for the billing installation; do not share its login with customers.
2. Create `portal.logobossweb-ai.eu` on the hosting account and configure its DNS and valid TLS certificate. Keep the main site running until its separate migration is verified.
3. Install the supported stable version with PHP 8.2/8.3, appropriate ionCube and a dedicated database. Put the WHMCS license in the private server-side configuration only. The owner must complete new administrator credential setup and confirm the EULA where required.
4. Secure configuration and writable directories, remove the installer, configure cron and the existing company contact `info.logobossai@gmail.com`.
5. Set EUR as the billing currency. Match the website's displayed totals and billing periods. Configure tax according to the account's actual registration/settings; do not silently add taxes or enable automatic tax without registration.
6. Connect the existing Stripe account via the supported WHMCS gateway, including its required webhook. Keep credentials on the server only. Test in sandbox without making a real payment or subscription.
7. Connect the cPanel server with a dedicated least-privilege credential. Verify the connection and match the existing WHM package names exactly.

| Product | Total shown | Cycle | Required provisioning |
| --- | ---: | --- | --- |
| Web Hosting | €8.99 | Monthly | Existing 5 GB / 100 GB traffic WHM package; provision only after confirmed payment |
| WordPress & Care | €50.76 | Monthly | Existing 10 GB / 200 GB traffic WHM package; WordPress installation plus maintenance workflow |
| Apps & Bots | €23.89 | Monthly | Verify runtime/resources and actual deployment before enabling sales; shared hosting is not assumed to support every persistent bot |
| Business Email | €16.20 | Annually | Existing 2 GB package; one mailbox, DNS authentication; domain separate |
| Domains .de | €14.04 | Annually | Verify availability lookup, registrar setup and funding before enabling sales |
| Domains .com | €21.60 | Annually | Same registrar requirements; no promise of immediate registration before verification |

8. Test each order, failed/pending/successful payment, provisioning, account login, invoice/renewal and service cancellation. Configure capacity limits for the reseller account. A successful payment screen alone must not be used to create a hosting account.
9. After tests pass, fill `hosting-checkout-config.js` with the real HTTPS portal URL, actual EUR currency ID, verified product IDs and a verification timestamp. Enable only the products whose fulfillment is verified. Copy the domain order URL from the installed WHMCS portal only after registrar testing.
10. Merge the draft and verify German/English checkout links on the live site. Customers see the client portal and invoices. License keys, administrator URLs and API credentials must not appear in public HTML/JS.

## Sources

- https://docs.whmcs.com/9-0/installation-guide/install-whmcs/
- https://docs.whmcs.com/9-0/installation-guide/system-requirements/
- https://docs.whmcs.com/9-1/servers/server-modules/cpanel/
- https://docs.whmcs.com/9-0/clients/the-client-area/linking-to-whmcs/

## Resume

Restore a verified WHM/cPanel session, install the portal and finish the configuration above. Public checkout remains disabled until actual product/order IDs and functioning fulfillment have been verified.
