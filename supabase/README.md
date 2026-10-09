# LogoBoss AI backend

The public website is hosted by GitHub Pages. Supabase functions and database migrations are deployed separately; publishing this repository does not deploy the backend.

## Live combined checkout

Function: `bright-action`. It accepts Stripe-signed **live** events only, validates the two-item setup + monthly catalog, and saves the verified payment and customer order atomically. It does not send customer or admin emails. Customer portal access stays disabled until the project is reviewed and configured.

Required server environment variables:
- `STRIPE_LIVE_SECRET_KEY`: an existing live Stripe secret/restricted key with permission to read checkout sessions, subscriptions and their invoices.
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

## Database migrations

The migrations in this directory were applied during the audit. Treat them as the source record; check the project's migration history before applying them again. Customer ownership uses a confirmed Supabase email and database row policies. Public clients never receive a service-role credential.

## Search

The sitemap contains the home page and eight DE/EN service pages. Account, checkout-return and demonstration pages have `noindex`. The logo and favicon URLs must remain public and stable. Search indexing and favicon display are controlled by search engines.

