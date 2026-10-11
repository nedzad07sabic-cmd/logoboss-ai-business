# LogoBoss text support AI

## Release status — 2026-10-11

The German/English interface and real model integration are deployed. A dedicated `OPENAI_API_KEY` is now present in Supabase, and the owner approved API usage with a global allowance of 20 requests per fixed 24-hour window. **AI generation is paused pending provider availability and successful DE/EN live checks.** Activation attempts reached the upstream service but did not produce a completed assistant response. The existing authenticated support-ticket service remains the customer handoff.

The existing 20-request approval remains valid; another approval is only needed for a materially different spending scope. Do not copy credentials into this repository or replace a key merely because the provider reports a billing or quota error.

Public route: `https://logobossweb-ai.eu/#ai-support`.

Backend route: `https://ppmefffjhqpmrjnlewoq.supabase.co/functions/v1/ai-chat?scope=logoboss-support`.

The original business-scoped FAQ demo remains separate. The new route cannot select a tenant, read orders/tickets, create bookings or send email.

## Activation

1. The owner selects and approves OpenAI API usage. This is usage-based API billing, not an App Store or phone subscription. Check the owner's actual API account and credits; a ChatGPT login alone is not evidence of usable API credit.
2. The owner creates a dedicated server API key and enters it in Supabase **Edge Function secrets** as `OPENAI_API_KEY`. Do not put the key in GitHub, chat messages, frontend code, logs, test fixtures or a screenshot.
3. Set `LB_SUPPORT_AI_DAILY_LIMIT` to the approved number of requests (1–50; default 20). Set `LB_SUPPORT_AI_ENABLED=true` only when API usage is approved and controlled DE/EN live checks can be performed. Adding a key alone does not enable the model.
4. Confirm a real DE and EN response, then check Soon availability, private-account handoff, language selection and the published data notice. Model-output quality cannot be established by mocked tests. Disable the flag if any activation check fails.

The currently pinned model is `gpt-4.1-mini-2025-04-14` through the Responses API. The public status response only reports configuration readiness; it does not verify API credit, provider health or model access. Therefore a positive status is not a substitute for the controlled live checks. Keep the AI availability badge in `app.html` as Soon until real DE/EN generation succeeds; unrelated hosting Soon badges remain unchanged.

## Provider failures

Only fixed machine codes leave the handler. Raw provider messages, account IDs, keys and customer text are neither returned nor logged. Specific provider error codes take precedence over a broader `insufficient_quota` type.

| Response code | Meaning and next action |
| --- | --- |
| `rate_limited` (429) | The site's atomic request allowance rejected the request. Wait for its existing window; do not reset counters or increase the approved limit to make tests pass. |
| `provider_rate_limited` (429) | The provider explicitly reported a temporary request/ramp-rate limit. Pace requests; do not infer a need to buy credit. |
| `provider_credit_exhausted` (503) | The provider reported an exhausted prepaid credit balance. Review the owner's API billing account before another live attempt. |
| `provider_organization_spend_limit` / `provider_project_spend_limit` (503) | Review the applicable enforced spend limit. Do not automatically raise or remove it. |
| `provider_usage_limit` / `provider_quota_exhausted` (503) | Review the provider usage allowance or billing/credit state. Repeated requests cannot repair this condition. |
| `provider_auth_failed` / `provider_access_denied` (503) | Review the key, project, organization and permitted access without exposing credentials. |
| `provider_unavailable` (503) | Unrecognized or malformed provider 429; no billing/rate cause is inferred. |

Ordinary provider failures and malformed/incomplete model output remain unavailable responses. There is no fake answer or automatic retry. The client preserves the visitor's text and offers the existing Support route. Operational tools may retry HTTP failures independently, so live attempts must remain few and all counters must be preserved.

Official guidance: [OpenAI error codes](https://developers.openai.com/api/docs/guides/error-codes), [API billing](https://platform.openai.com/settings/organization/billing), and [API limits](https://platform.openai.com/settings/organization/limits).

## Limits and data handling

- Existing service-role-only atomic limiter: 10 requests per IP per fixed one-hour window and the configured global total per fixed 24-hour window (default 20). Windows start with the first request; they are not sliding windows. Missing IPs share a conservative bucket. Individual IP reliability depends on gateway headers; the global counter applies regardless. Raw IP addresses are not written by this feature; the rate key is hashed with the full server secret.
- These are **request limits, not a guaranteed euro budget**. API charges depend on input and output tokens, currency, taxes and provider pricing. Provider failures/timeouts still consume the local request allowance; no automatic retry.
- Maximum 1,500 input characters, up to 8 history messages with 6,000 total retained characters, 24,000 request bytes, 500 output tokens, an 18-second backend timeout and a 25-second frontend timeout.
- Text history stays in page memory. The backend passes a shortened history to OpenAI with `store:false`, uses no conversation storage API, and does not log prompts or replies. This does not mean zero provider retention; OpenAI may retain abuse-monitoring logs according to its terms.
- Only public approved offer knowledge is provided. No customer JWT, account record, order, private ticket or attachment is passed to the model. Response links are selected from server-owned offer/account/support links and checked again in the UI.

## Maintenance and validation

Update `supabase/functions/ai-chat/support-knowledge.mjs` whenever public offer cards, prices, availability or support behavior change. Check the visible offer cards, not the old hidden demo catalog in index.html.

Run `node --test ops/check-support-ai.test.mjs` for the request boundary, fail-closed behavior, quota enforcement, model payload, DE/EN contract, link allowlist and current offer-price/availability checks. These tests mock external services and spend no API credits.

Deploy all three function files together (`index.ts`, `support-ai.mjs`, `support-knowledge.mjs`) using the existing ai-chat function setting `verify_jwt=false`; public chat has no access to private operations. Pushing source to GitHub does not deploy the Supabase function.

Disable immediately by setting `LB_SUPPORT_AI_ENABLED=false`; no key deletion or changes to the customer's normal support service are needed.

## Official references

- https://developers.openai.com/api/docs/models/gpt-4.1-mini
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/your-data
- https://supabase.com/docs/guides/functions/secrets

Phone service and native-store publishing are excluded at the owner's request. No telephone resource, store account or paid AI subscription was created for this release.
