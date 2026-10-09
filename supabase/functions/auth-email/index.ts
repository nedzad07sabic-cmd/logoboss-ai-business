import { Webhook } from "npm:standardwebhooks@1.0.0";
import { createHandler } from "./auth-email.mjs";

const hookSecret = Deno.env.get("LB_AUTH_EMAIL_HOOK_SECRET")?.replace(/^v1,whsec_/, "");
const webhook = hookSecret ? new Webhook(hookSecret) : null;
Deno.serve(createHandler({
  verify: webhook ? (body, headers) => webhook.verify(body, headers) : null,
  apiKey: Deno.env.get("RESEND_API_KEY")
}));
