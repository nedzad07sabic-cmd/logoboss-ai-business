import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { Webhook } from "standardwebhooks";
import { buildMessages, createHandler, idempotencyKey } from "./auth-email.mjs";

const fakeHash = "a".repeat(64);
const otherHash = "b".repeat(64);
const payload = (action = "signup") => ({
  user:{email:"delivered@resend.dev"},
  email_data:{email_action_type:action,token_hash:fakeHash,redirect_to:"https://logobossweb-ai.eu/"}
});
const wh = new Webhook(randomBytes(32).toString("base64"));
const verify = (raw, headers) => wh.verify(raw, headers);
function request(data, {path="",tamper=false,age=0} = {}) {
  const body = JSON.stringify(data);
  const timestamp = new Date(Date.now() + age * 1000);
  const signature = wh.sign("test-request", timestamp, body);
  return new Request("https://ppmefffjhqpmrjnlewoq.supabase.co/functions/v1/auth-email" + path, {
    method:"POST", body:tamper ? body + " " : body,
    headers:{"webhook-id":"test-request","webhook-timestamp":String(Math.floor(timestamp.getTime()/1000)),"webhook-signature":signature}
  });
}
test("signup and recovery links use the project's verification endpoint and exact own callbacks", () => {
  for (const action of ["signup","recovery","magiclink","invite"]) {
    const [message] = buildMessages(payload(action));
    const match = message.email.text.match(/https:\/\/ppmefffjhqpmrjnlewoq[^\s]+/);
    const link = new URL(match[0]);
    assert.equal(link.pathname, "/auth/v1/verify");
    assert.equal(link.searchParams.get("token"), fakeHash);
    assert.equal(link.searchParams.get("type"), action);
    assert.equal(link.searchParams.get("redirect_to"), "https://logobossweb-ai.eu/");
    assert.equal(message.email.from, "LogoBoss AI <account@logobossweb-ai.eu>");
    assert.ok(message.email.html.includes("https://logobossweb-ai.eu/icon-192.png"));
  }
});
test("external, injected and unexpected callbacks never produce email messages", () => {
  for (const redirect of ["https://evil.test/","https://logobossweb-ai.eu.evil.test/","https://user@logobossweb-ai.eu/","https://logobossweb-ai.eu/?next=https://evil.test","https://logobossweb-ai.eu/#x","https://logobossweb-ai.eu/missing.html"]) {
    const data = payload(); data.email_data.redirect_to = redirect;
    assert.throws(() => buildMessages(data));
  }
  for (const path of ["/","/index.html","/admin.html"]) {
    const data = payload(); data.email_data.redirect_to = "https://logobossweb-ai.eu" + path;
    assert.equal(buildMessages(data).length, 1);
  }
});
test("secure email change maps reversed token fields to the correct recipients", () => {
  const data = payload("email_change");
  data.user.new_email = "delivered+new@resend.dev";
  data.email_data.token_hash_new = otherHash;
  const messages = buildMessages(data);
  assert.deepEqual(messages.map(x => [x.email.to[0], x.tokenIdentity]), [
    ["delivered@resend.dev",otherHash],["delivered+new@resend.dev",fakeHash]
  ]);
  delete data.email_data.token_hash_new;
  assert.deepEqual(buildMessages(data).map(x=>x.email.to[0]), ["delivered+new@resend.dev"]);
});
test("reauthentication requires an OTP and never creates a password-reset link", () => {
  const data = payload("reauthentication"); data.email_data.token = "123456";
  const [message] = buildMessages(data);
  assert.ok(message.email.text.includes("123456"));
  assert.ok(!message.email.text.includes("/auth/v1/verify"));
  data.email_data.token = "<script>";
  assert.throws(() => buildMessages(data));
});
test("unsupported actions, missing hashes and malformed recipients are rejected", () => {
  assert.throws(() => buildMessages(payload("newsletter")));
  for (const email of ["x@example.test,another@example.test","x@example.test\nBcc:a@b.test", "<x@example.test>"]) {
    const data = payload(); data.user.email = email; assert.throws(() => buildMessages(data));
  }
  const data = payload(); data.email_data.token_hash = ""; assert.throws(() => buildMessages(data));
});
test("idempotency keys are stable for retries and separate recipients and tokens", async () => {
  const first = buildMessages(payload())[0];
  assert.equal(await idempotencyKey(first), await idempotencyKey(first));
  const second = structuredClone(first); second.email.to = ["delivered+new@resend.dev"];
  assert.notEqual(await idempotencyKey(first), await idempotencyKey(second));
  second.email.to = first.email.to; second.tokenIdentity = otherHash;
  assert.notEqual(await idempotencyKey(first), await idempotencyKey(second));
  assert.ok(!(await idempotencyKey(first)).includes(fakeHash));
});
test("missing, modified and expired signatures never call the provider", async () => {
  let calls = 0;
  const handler = createHandler({verify,apiKey:"re_mock_for_unit_tests",fetcher:async()=>{calls++;}});
  const unsigned = new Request("https://ppmefffjhqpmrjnlewoq.supabase.co/functions/v1/auth-email",{method:"POST",body:JSON.stringify(payload())});
  assert.equal((await handler(unsigned)).status,401);
  assert.equal((await handler(request(payload(),{tamper:true}))).status,401);
  assert.equal((await handler(request(payload(),{age:-601}))).status,401);
  assert.equal(calls,0);
});
test("provider errors fail closed and do not leak its response or key", async () => {
  const key = "re_mock_for_unit_tests";
  const handler = createHandler({verify,apiKey:key,fetcher:async()=>new Response("private provider response",{status:403})});
  const result = await handler(request(payload()));
  assert.equal(result.status,503);
  const body = await result.text();
  assert.ok(!body.includes("private provider")); assert.ok(!body.includes(key));
});
test("verified requests pass only the fixed email request and idempotency key to Resend", async () => {
  const seen = [];
  const handler = createHandler({verify,apiKey:"re_mock_for_unit_tests",fetcher:async(url,options)=>{
    seen.push({url,options}); return Response.json({id:"test-email"});
  }});
  assert.equal((await handler(request(payload()))).status,200);
  assert.equal(seen.length,1);
  assert.equal(seen[0].url,"https://api.resend.com/emails");
  assert.deepEqual(JSON.parse(seen[0].options.body).to,["delivered@resend.dev"]);
  assert.ok(seen[0].options.headers["Idempotency-Key"].startsWith("lb-auth-"));
});
test("signed sender readiness reads only the fixed domain and does not send email", async () => {
  let urlSeen;
  const handler = createHandler({verify,apiKey:"re_mock_for_unit_tests",fetcher:async(url)=>{
    urlSeen=url; return Response.json({id:"16de0449-3e10-453c-8d43-26934a3f936a",name:"logobossweb-ai.eu",status:"verified",capabilities:{sending:"enabled"}});
  }});
  const result = await handler(request({check:"sender"},{path:"/health"}));
  assert.equal(result.status,200); assert.deepEqual(await result.json(),{ready:true});
  assert.equal(urlSeen,"https://api.resend.com/domains/16de0449-3e10-453c-8d43-26934a3f936a");
});
test("wrong-domain provider readiness fails before auth configuration is enabled", async () => {
  const handler = createHandler({verify,apiKey:"re_mock_for_unit_tests",fetcher:async()=>Response.json({id:"another-domain",status:"verified"})});
  assert.equal((await handler(request({check:"sender"},{path:"/health"}))).status,503);
});
