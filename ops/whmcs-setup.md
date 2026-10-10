# LogoBossAI hosting portal setup

Updated 2026-10-10. This is a deployment draft, not an active checkout.

## Verified

- WHMCS Plus service is active and the license is ready to bind to its first installation.
- The member area recommends stable WHMCS 9.0.9.
- Verpex Reseller 15 is active in Frankfurt.
- The existing LogoBossAI live Stripe account has charges and payouts enabled.
- Current site source was retrieved from `nedzad07sabic-cmd/logoboss-ai-business/main`.
- WHM and cPanel access were observed. The three existing WHM packages are `logoboss_Web_5GB`, `logoboss_WordPress_10GB` and `logoboss_Email_2GB`. Their actual resource limits and provisioning have not yet been tested.
- `portal.logobossweb-ai.eu` was created in cPanel with its own document root. STRATO confirmed that its A record was saved as `65.98.48.188`. The main site's A record and mail records were left unchanged. Public DNS propagation to that exact address has not been independently verified.
- The public HTTPS check failed with `Certificate verify failed: self-signed certificate`. A valid portal certificate is still required. The reseller WHM menu did not expose Manage AutoSSL.
- cPanel showed native PHP 8.2. Required PHP extensions, ionCube compatibility and database access remain unverified.
- The Softaculous WHMCS 9.0.9 form was prepared for HTTPS on the portal, an empty installation directory, a private data directory outside the public web root, a five-minute cron schedule, LogoBossAI company details and German client language. This is an unsubmitted form, not an installation. Recreate it after a fresh authenticated session if necessary.
- cPanel subsequently rejected the session and still showed a missing security token after a secure sign-in submission. Successful renewed authentication has not been verified. No WHMCS installation, gateway connection, provisioning change or public checkout activation has been applied.

## Install and configure

1. Restore a valid authenticated cPanel session. The three WHM package names above are verified; inspect their actual quotas before mapping them to products. Use the reseller account's cPanel account for the billing installation; do not share its login with customers.
2. Verify public DNS propagation for the existing `portal.logobossweb-ai.eu` A record and issue a valid TLS certificate through the host's free certificate service. The cPanel 136 unified SSL Status tab hides AutoSSL actions; inspect the Wizard's available certificate options or obtain host assistance. Keep the main site running until its separate migration is verified.
3. Install the supported stable version with PHP 8.2/8.3, appropriate ionCube and a dedicated database. Put the WHMCS license in the private server-side configuration only. The owner must complete new administrator credential setup and confirm the EULA where required.
4. Secure configuration and writable directories, remove the installer, configure cron every five minutes using the installed portal's exact command and matching PHP binary, and configure the existing company contact `info.logobossai@gmail.com`. Verify successful cron execution in the administrator area.
5. Set EUR as the billing currency. Match the website's displayed totals and billing periods. Configure tax according to the account's actual registration/settings; do not silently add taxes or enable automatic tax without registration.
6. Connect the existing Stripe account via the supported WHMCS gateway, including its required webhook. Keep credentials on the server only. Test in sandbox without making a real payment or subscription.
7. Connect the cPanel server with a dedicated least-privilege credential. Verify the connection and match the existing WHM package names exactly.

| Product | Total shown | Cycle | Required provisioning |
| --- | ---: | --- | --- |
| Web Hosting | €8.99 | Monthly | Map `logoboss_Web_5GB`; verify intended 5 GB / 100 GB traffic limits; provision only after confirmed payment |
| WordPress & Care | €50.76 | Monthly | Map `logoboss_WordPress_10GB`; verify intended 10 GB / 200 GB traffic limits, WordPress installation and maintenance workflow |
| Apps & Bots | €23.89 | Monthly | Verify runtime/resources and actual deployment before enabling sales; shared hosting is not assumed to support every persistent bot |
| Business Email | €16.20 | Annually | Map `logoboss_Email_2GB`; verify intended 2 GB allocation, one mailbox and DNS authentication; domain separate |
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
- https://docs.whmcs.com/9-0/system/automation/cron-tutorials/configure-the-system-cron-job/
- https://docs.cpanel.net/cpanel/security/ssl-tls-certificates/
- https://www.strato.de/faq/domains/wie-kann-ich-bei-strato-meine-dns-eintraege-verwalten/

## Resume

Restore and verify a fresh cPanel session, confirm DNS and valid HTTPS, then re-prepare the installer. The owner must enter and submit new administrator credentials and approve any required EULA. After installation, finish the gateway, server and product configuration above. Public checkout remains disabled until actual product/order IDs and functioning fulfillment have been verified. Keep license keys, passwords, API credentials and private administrator routes out of this repository.
