# LogoBoss support centre

The public Support button and the customer portal open a branded modal with a CSS 3D globe, two animated orbits and twelve colour-changing light nodes. Motion is disabled when the visitor requests reduced motion. The customer interface follows the site's German/English language; the administrator interface uses Bosnian.

Customers with confirmed accounts can create a ticket, link one of their orders, add one PNG/JPG/WebP/PDF attachment (maximum 2 MB), read replies, reply, and close/reopen their own ticket. Visitors can contact the business by email before buying. The existing administrator opens Support / Tiketi from admin.html, reads conversations and the customer contact, replies, and manages statuses.

## Deployed data model

- Migration `20261010170300_add_private_support_tickets.sql` is the actual migration version returned by the project.
- `support_tickets` and `support_messages` use RLS. Authenticated customers have SELECT access only to their own records; the existing confirmed administrator can read all tickets. Direct browser writes and calls to the write RPC are denied.
- `lb_support_write` is a service-role-only, SECURITY INVOKER transaction. Restricted private helpers check confirmed accounts against Auth without exposing the Auth table to the service role or public Data API. Ticket creation, replies, statuses and idempotency are checked again in the transaction.
- The private `support-attachments` bucket has a 2 MB limit and a MIME allowlist. The server validates ownership, file headers, type and size. Clients have no direct bucket access. Authorized downloads use signed URLs expiring after 60 seconds.
- The Edge Function `support-tickets` validates the actual JWT with Auth on every request. Gateway JWT verification is disabled because custom Auth verification supports the project's modern publishable key; requests without a verified account are rejected.
- Per-account rate limits and duplicate request IDs protect writes. Replays do not create another message or re-upload an attachment. Notification requests use deterministic provider idempotency keys and recorded success flags.
- Customer and administrator email notifications use the existing verified notifications domain and Resend secret. Notifications contain a ticket reference and authenticated portal link, not private message bodies or attachments. Reply-To is info.logobossai@gmail.com; replies belong in the ticket. Delivery failure does not lose the ticket. The UI explicitly reports an unconfirmed email notification; stored success flags are retried on an identical request within 23 hours, not by a background worker.

## Validation

- 24 mocked backend scenarios: verified JWT, user ownership, administrator role, malformed input, origin restriction, rate limiting, idempotency, signed downloads, upload signatures/size, customer receipts and provider errors. No real emails or purchases sent by tests.
- UI tests: guest login, German/English switching, draft preservation, escaping of ticket subjects/messages, duplicate submission guard, email failure feedback, animated nodes and clearing private data at logout.
- Transactional database validation: actual service-role calls, RLS as two different customers and the confirmed administrator, anonymous read denial, restricted RPC, atomic ticket/message creation, idempotent replay and customer close/reopen. All fixtures were rolled back. Live counts of fixture users, tickets and messages were zero after validation.
- Actual anonymous HTTP probes reject the ticket endpoint, table and write RPC with 401/permission-denied responses.
- The existing site regression suite still passes its 13-package, 5-category, 59-feature and 8-payment-link checks. Existing order backend scenarios pass.
- Security advisors show no findings for the new support tables or functions; the project's previously documented unrelated findings remain unchanged.

## Limits

The local headless browser runtime could not download its executable, so rendered desktop/mobile screenshots could not be produced. Responsive layout rules are implemented and DOM behavior is tested; actual device rendering is not claimed as verified. Live authenticated ticket/email delivery and a real file upload were not exercised using customer credentials. No hosting provisioning, WHMCS setup, prices, payments or identity details were changed. This support centre works independently of the unfinished WHMCS hosting checkout.
