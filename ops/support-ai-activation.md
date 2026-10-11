# LogoBoss text support AI

## Release status — 2026-10-11

The German/English interface and real model integration are prepared. **AI generation is disabled.** No OpenAI key or approved inference budget was available, and no paid model call was made. The existing authenticated support-ticket service remains the customer handoff.

Public route: `https://logobossweb-ai.eu/#ai-support`.

Backend route: `https://ppmefffjhqpmrjnlewoq.supabase.co/functions/v1/ai-chat?scope=logoboss-support`.

The original business-scoped FAQ demo remains separate. The new route cannot select a tenant, read orders/tickets, create bookings or send email.

## Activation

1. The owner selects and approves OpenAI API usage. This is usage-based API billing, not an App Store or phone subscription. Check the owner's actual API account and credits; a ChatGPT login alone is not evidence of usable API credit.
2. The owner creates a dedicated server API key and enters it in Supabase **Edge Function secrets** as `OPENAI_API_KEY`. Do not put the key in GitHub, chat messages, frontend code, logs, test fixtures or a screenshot.
3. Set `LB_SUPPORT_AI_DAILY_LIMIT` to the approved number of requests (1–50; default 20). Set `LB_SUPPORT_AI_ENABLED=true` only when API usage is approved and controlled DE/EN live checks can be performed. Adding a key alone does not enable the model.
4. Confirm a real DE and EN response, then check Soon availability, private-account handoff, language selection and the published data notice. Model-output quality cannot be established by mocked tests. Disable the flag if any activation check fails.

The currently pinned model is `gpt-4.1-mini-2025-04-14` through the Responses API. The public status response only reports configuration readiness; it does not verify API credit, provider health or model access. Therefore a positive status is not a substitute for the controlled live checks.

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
