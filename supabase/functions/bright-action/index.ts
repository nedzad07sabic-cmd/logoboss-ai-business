import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@23.0.0";
import { validateCheckout, idOf } from "./checkout-validation.mjs";

// Accept an existing legacy key only when it is explicitly a live key; never promote a sandbox key.
const explicitKey = Deno.env.get("STRIPE_LIVE_SECRET_KEY") || "";
const legacyKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const key = explicitKey || (/^(sk|rk)_live_/.test(legacyKey) ? legacyKey : "");
const secret = Deno.env.get("STRIPE_LIVE_WEBHOOK_SECRET") || "";
const base = Deno.env.get("SUPABASE_URL") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
// Existing Stripe endpoint has verify_jwt=false; authenticate its raw signed body below.
// A missing server configuration fails closed, without exposing any credentials.
const configured = /^(sk|rk)_live_/.test(key) && secret.startsWith("whsec_") && !!base && !!serviceKey;
const stripe = configured ? new Stripe(key, {httpClient: Stripe.createFetchHttpClient()}) : null;
const headers = {apikey:serviceKey, Authorization:"Bearer "+serviceKey, "Content-Type":"application/json"};
const json = (body:unknown, status=200) => new Response(JSON.stringify(body), {status, headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
const accepted = new Set(["checkout.session.completed","checkout.session.async_payment_succeeded","checkout.session.async_payment_failed","invoice.paid","invoice.payment_failed","customer.subscription.updated","customer.subscription.deleted"]);
async function db(path:string, method="GET", body?:unknown, prefer?:string) {
 const response = await fetch(base+"/rest/v1/"+path, {method, headers:{...headers,...(prefer?{Prefer:prefer}:{})}, body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 if (!response.ok) throw new Error("Database request failed: "+response.status);
 return response.status===204 ? null : response.json();
}
async function syncSubscription(subId:string, created:number) {
 if(!stripe) throw new Error("Live webhook configuration is incomplete");
 const sub = await stripe.subscriptions.retrieve(subId,{expand:["latest_invoice"]});
 if (!sub.livemode) throw new Error("Unexpected sandbox subscription");
 const invoice = typeof sub.latest_invoice === "object" ? sub.latest_invoice : null;
 await db("stripe_payments?stripe_subscription_id=eq."+encodeURIComponent(subId)+"&billing_event_created=lte."+created, "PATCH", {
  subscription_status:sub.status,cancel_at_period_end:sub.cancel_at_period_end,
  last_invoice_status:invoice?.status || null,last_invoice_id:idOf(sub.latest_invoice),
  billing_event_created:created,updated_at:new Date().toISOString()
 }, "return=minimal");
}
Deno.serve(async req => {
 if(req.method!=="POST") return json({received:false},405);
 if(!stripe) return json({received:false,error:"Live webhook server configuration is incomplete"},503);
 const signature=req.headers.get("stripe-signature");
 if(!signature) return json({received:false,error:"Missing signature"},400);
 const raw=await req.text();
 if(raw.length>2000000) return json({received:false},413);
 let event:Stripe.Event;
 try {event=await stripe.webhooks.constructEventAsync(raw,signature,secret,300,Stripe.createSubtleCryptoProvider());}
 catch {return json({received:false,error:"Invalid signature"},400);}
 if(!event.livemode) return json({received:false,error:"Live events only"},400);
 if(!accepted.has(event.type)) return json({received:true,ignored:true});
 try {
  const obj=event.data.object as any;
  let sessionId:string|null=null;
  if(event.type==="checkout.session.completed" || event.type==="checkout.session.async_payment_succeeded") {
   const session=await stripe.checkout.sessions.retrieve(obj.id,{expand:["line_items"]});
   const payment=validateCheckout(session);
   if(payment) {
    const row=await db("rpc/lb_record_stripe_checkout","POST",{p_payment:payment});
    await syncSubscription(payment.stripe_subscription_id,event.created);
    // Persist the verified purchase. No customer/admin messages are sent by this handler.
    sessionId=session.id;
   }
  } else if(event.type.startsWith("customer.subscription.")) {
   await syncSubscription(obj.id,event.created);
  } else if(event.type.startsWith("invoice.")) {
   const subId=idOf(obj.subscription)||idOf(obj.parent?.subscription_details?.subscription);
   if(subId) await syncSubscription(subId,event.created);
  }
  await db("stripe_webhook_events?on_conflict=stripe_event_id","POST",{stripe_event_id:event.id,event_type:event.type,stripe_session_id:sessionId},"resolution=ignore-duplicates,return=minimal");
  return json({received:true});
 } catch(err) {
  console.error("Stripe webhook processing failed",event.id,err instanceof Error?err.message:"Unknown failure");
  return json({received:false,error:"Processing failed"},500);
 }
});
