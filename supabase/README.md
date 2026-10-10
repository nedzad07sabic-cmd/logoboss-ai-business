# LogoBoss AI backend

The public website is hosted by GitHub Pages. Supabase functions and database migrations are deployed separately; publishing this repository does not deploy the backend.

## Authentication emails

Function: `auth-email`. Supabase Auth's **Send Email Hook** is enabled for this project's signed HTTPS endpoint. Authentication emails use the existing server-side `RESEND_API_KEY`; the default Supabase SMTP sender is not used while the hook is enabled. Email confirmation and secure email changes remain required.

- From: **LogoBoss AI <account@logobossweb-ai.eu>**, using the verified domain.
- Reply-To and support: **info.logobossai@gmail.com**, the site's contact address selected by the owner.
- Resend cannot use the public Gmail domain as a verified From domain. Replies go to Gmail; sending uses the owned domain.
- Templates include the LogoBoss icon, brand colors, German and English instructions, a confirmation/reset link and a plain-text fallback.
- Supported actions: signup, password recovery, magic-link sign-in, invitations, email changes and reauthentication. Security-notification flags remain disabled; add supported notification templates before enabling them.
- The raw request body is verified with Standard Webhooks, including timestamp validity, before any provider request. JWT verification is disabled specifically because Supabase Auth signs these requests with the hook secret.
- `LB_AUTH_EMAIL_HOOK_SECRET` is stored only in the project's Edge Function secrets and the matching Auth Hook configuration. Do not commit or display its value. To rotate it, update both secure settings together.
- Verification links point only to this Supabase project's `/auth/v1/verify` endpoint. Redirects are restricted to the exact home, index and admin callbacks on the owned HTTPS origin.
- Resend idempotency keys prevent duplicate sends during retries. Failed sends return an error rather than silently confirming a user's account.
- Signed `POST /functions/v1/auth-email/health` with a `{"check":"sender"}` body verifies the fixed sending-domain record without sending email. It returns only readiness and never returns credentials or provider response details.

Validation on 10 October 2026 (Europe/Berlin):
- 11 automated security and template tests passed, including real Standard Webhooks signatures, expired/modified signatures, unsafe redirects, secure email-change token mapping, provider errors and idempotency.
- Deployed endpoint: unauthenticated POST 401, GET 405, signed sender check 200.
- Signup and recovery emails sent only to Resend's official labelled `delivered@resend.dev` simulation addresses both reached `delivered`. A duplicate signup request did not increase the send count.
- Usage after all tests: 4/100 daily and 8/3,000 monthly. No plan upgrade or real charge was made.
- A disposable account at an official Resend simulation address exercised the actual Supabase Auth service and configured hook: signup 200 without a pre-confirmation session; confirmation 303 to the exact owned callback; password login 200.
- Password recovery returned 200 and delivered its email; its verification link returned 303 with the recovery flow. Password update returned 200; the old password was rejected (400) and the new password signed in (200).
- Only that disposable account was deleted after the checks, using its exact user ID and test address. No customer account was modified.
- All four test emails were delivered to the provider simulation service. Real Gmail inbox placement and the browser UI were not retested in this step.

To run the tests in an isolated checkout:
```sh
npm install --no-save --ignore-scripts --package-lock=false standardwebhooks@1.0.0
node --test supabase/functions/auth-email/auth-email.test.mjs
```

## Live combined checkout

Function: `bright-action`. It accepts Stripe-signed **live** events only, validates the two-item setup + monthly catalog, and saves the verified payment and customer order atomically. It does not send customer or admin emails. Customer portal access stays disabled until the project is reviewed and configured.

Required server environment variables:
- `STRIPE_LIVE_SECRET_KEY`: an existing live Stripe secret/restricted key with permission to read checkout sessions, subscriptions and their invoices. The legacy `STRIPE_SECRET_KEY` is accepted only when its value is explicitly a live key; a sandbox key never enables this handler.
- `STRIPE_LIVE_WEBHOOK_SECRET`: the signing secret of the **same live webhook endpoint**.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: supplied by Supabase.

Enter credentials only in Supabase's secure Edge Function secrets settings. Never commit them, place them in frontend JavaScript, or send them in chat. The handler returns 503 until its live configuration is complete. A sandbox key is never accepted as a live key.

The existing live webhook endpoint routes to `/functions/v1/bright-action` and accepts checkout completion, asynchronous payment success/failure, invoice payment success/failure, and subscription updates/deletions. JWT verification remains disabled for this existing external webhook; the raw Stripe signature is verified before any database write.

Run the pure catalog validation tests:
```sh
node --test supabase/functions/bright-action/checkout-validation.test.mjs
```

After configuring the server, use Stripe's signed endpoint test/delivery tools. An unsigned request must fail with 400. A full paid checkout test requires a separately authorized test workflow; do not create a real charge simply to verify the site. A successful return-page visit alone never proves payment.

## Public booking and chat pages

`lb_public_business` returns only the approved business name, slug, ID and active service catalog, gated by the configured booking/text-chat module. Anonymous visitors cannot select private business rows, service tables or appointment/customer records. Booking submissions create a future **request**, not a confirmed appointment.

`ai-chat` is an explicitly labelled FAQ **demo with predefined answers**. It checks that the business and its text-chat module are enabled. It does not call a paid language model and does not send emails. A production customer assistant requires that customer's approved content and configuration.

The 10 October audit removed direct anonymous inserts into conversations/messages and anonymous reads of private assistant instructions. The server chat endpoint still writes with its server role; signed-in tenant members retain their scoped read/manage policies.

## Non-binding package requests

Function: `submit-order`, deployed version 24 on 10 October 2026. It requires a confirmed signed-in account, checks that the request email belongs to that account, applies rate limits and uses the server's eight-package price catalog. A request is stored as `is_test=false`; it does not confirm a Stripe payment or enable product access.

The verified sender domain supplies an admin notification and an informational German/English customer acknowledgment. Reply-to for the customer message is `info.logobossai@gmail.com`. Resend requests use separate event-specific idempotency keys and ten-second timeouts. Notification failures leave the saved inquiry available and return explicit delivery flags; delivery to a real inbox was not exercised in this audit.

Reproducible checks: `node ops/check-order-function.cjs` and `NODE_PATH=<jsdom dependency directory> node ops/check-site.cjs`. Both mock external requests and do not create real accounts, orders, emails or payments. Remaining release limitations are recorded in `ops/final-audit-20261010.md`.

## Database migrations

The migrations in this directory were applied during the audit. Treat them as the source record; check the project's migration history before applying them again. Customer ownership uses a confirmed Supabase email and database row policies. Public clients never receive a service-role credential.

## Search

The sitemap contains the home page and eight DE/EN service pages. Account, checkout-return and demonstration pages have `noindex`. The logo and favicon URLs must remain public and stable. Search indexing and favicon display are controlled by search engines.

# Support centre (10 October 2026)

The `support-tickets` Edge Function and migration `20261010170300_add_private_support_tickets.sql` add private customer tickets, administrator replies, linked order selection, statuses and private attachments. See `../ops/support-release-20261010.md` for the authorization model, notifications, tests and limitations. Deploy the migration before enabling the frontend. The function uses custom JWT verification against Auth and the existing Resend secret; no server keys belong in browser files.

