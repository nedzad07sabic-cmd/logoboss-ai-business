import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const allowedOrigins = new Set(["https://logobossweb-ai.eu","https://www.logobossweb-ai.eu","https://nedzad07sabic-cmd.github.io"]);
const json = (body: unknown, status = 200, origin: string | null = null, extra: Record<string,string> = {}) =>
  new Response(JSON.stringify(body), {status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Vary":"Origin",...(origin && allowedOrigins.has(origin) ? {"Access-Control-Allow-Origin":origin} : {}),...extra}});
const esc = (v: unknown) => String(v ?? "-").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const trim = (v: unknown, max: number) => String(v ?? "").trim().slice(0,max);
const digest = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,"0")).join("");

Deno.serve(async (req: Request) => {
  const origin=req.headers.get("origin");
  if(origin && !allowedOrigins.has(origin)) return json({success:false,error:"Origin not allowed"},403);
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:{
    ...(origin?{"Access-Control-Allow-Origin":origin}:{}),
    "Access-Control-Allow-Methods":"POST, OPTIONS",
    "Access-Control-Allow-Headers":"content-type, authorization, apikey, x-client-info",
    "Access-Control-Max-Age":"86400","Vary":"Origin"}});
  if(req.method!=="POST") return json({success:false,error:"Method not allowed"},405,origin,{"Allow":"POST, OPTIONS"});
  try{
    const ct=req.headers.get("content-type")||"";
    const length=Number(req.headers.get("content-length")||"0");
    if(length>16384) return json({success:false,error:"Request too large"},413,origin);
    let b: Record<string,unknown>={};
    if(ct.includes("application/json")||ct.includes("application/x-www-form-urlencoded")){
      const raw=await req.text();
      if(raw.length>16384) return json({success:false,error:"Request too large"},413,origin);
      if(ct.includes("application/json")){
        let value;
        try{value=JSON.parse(raw);}catch{return json({success:false,error:"Invalid JSON"},400,origin);}
        if(!value||typeof value!=="object"||Array.isArray(value)) return json({success:false,error:"Invalid request"},400,origin);
        b=value as Record<string,unknown>;
      }else{
        for(const [k,v] of new URLSearchParams(raw)) b[k]=v;
      }
    }else if(ct.includes("multipart/form-data")){
      const form=await req.formData();
      for(const [k,v] of form.entries()) b[k]=String(v);
    }else return json({success:false,error:"Unsupported content type"},415,origin);

    if(trim(b.website_url,500)) return json({success:true},200,origin);

    const customer_name=trim(b.customer_name,150);
    const email=trim(b.email,250);
    const package_name=trim(b.package_name,200);
    const company_name=trim(b.company_name,150);
    const phone_whatsapp=trim(b.phone_whatsapp,80);
    const country=trim(b.country,100);
    const note=trim(b.note,3000);
    const language=trim(b.jezik||b.language,2).toLowerCase()==="de"?"de":"en";
    let total=Number(b.total_eur||0);
    const emailValid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const phoneValid=/^\+?[0-9\s().-]{6,30}$/.test(phone_whatsapp)&&phone_whatsapp.replace(/\D/g,"").length>=6;
    if(!customer_name||!package_name||!(emailValid||phoneValid)
       ||!Number.isFinite(total)||total<0||total>100000){
      return json({success:false,error:"Please enter a valid name, contact and package."},400,origin);
    }

    const url=Deno.env.get("SUPABASE_URL");
    const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!url||!key) throw new Error("Backend configuration unavailable");
    // Require a confirmed, signed-in user. The browser may not claim another customer's email.
    const auth=req.headers.get("authorization")||"";
    if(!/^Bearer [A-Za-z0-9._~-]+$/.test(auth))
      return json({success:false,error:"Please sign in to your verified LogoBoss account."},401,origin);
    const userResponse=await fetch(url+"/auth/v1/user",{headers:{apikey:key,Authorization:auth}});
    if(!userResponse.ok)return json({success:false,error:"Session expired. Please sign in again."},401,origin);
    const user=await userResponse.json();
    if(!user?.id||!user?.email_confirmed_at)
      return json({success:false,error:"Please verify your email address before sending a request."},403,origin);
    if(String(user.email||"").trim().toLowerCase()!==email.toLowerCase())
      return json({success:false,error:"Order email must match your signed-in account."},403,origin);

    // A client's hidden total_eur field is never an authoritative price.
    const listedPrices: Record<string,number>={
      "Digital Start":1190,"Web Business":2320,"Web Pro":3920,
      "Business AI":790,"Pro AI":2320,
      "Automation Start":720,"Automation Business":2000,
      "Company OS Start":3990
    };
    const chosenName=package_name.split(/\s+[—–]\s+/)[0].trim();
    if(!Object.prototype.hasOwnProperty.call(listedPrices,chosenName))
      return json({success:false,error:"This package is not part of our standardized eight-package offer."},400,origin);
    total=listedPrices[chosenName];
    const headers={"Content-Type":"application/json",apikey:key,Authorization:"Bearer "+key};
    const salt=key.slice(0,20);
    const ip=trim(req.headers.get("cf-connecting-ip")||req.headers.get("x-real-ip")||req.headers.get("x-forwarded-for")?.split(",")[0]||"",100);
    const checks: Array<{id:string,limit:number}>=[];
    if(ip) checks.push({id:await digest("ip:"+salt+":"+ip),limit:8});
    checks.push({id:await digest("contact:"+salt+":"+email.toLowerCase()),limit:4});
    for(const check of checks){
      const response=await fetch(url+"/rest/v1/rpc/lb_check_order_rate_limit",{
        method:"POST",headers,body:JSON.stringify({p_key:check.id,p_limit:check.limit,p_window_seconds:3600}),
      });
      if(!response.ok) throw new Error("Rate limit service unavailable");
      const allowed=await response.json();
      if(allowed!==true) return json({success:false,error:"Too many requests. Please try again later."},429,origin,{"Retry-After":"3600"});
    }

    const payload={customer_name,company_name:company_name||null,email,phone_whatsapp:phone_whatsapp||null,country:country||null,package_name,total_eur:total,note:note||null,language,status:"new",is_test:false,customer_user_id:user.id};
    const orderResponse=await fetch(url+"/rest/v1/orders",{
      method:"POST",headers:{...headers,Prefer:"return=representation"},body:JSON.stringify(payload),
    });
    if(!orderResponse.ok){console.error("Order storage failed",orderResponse.status);throw new Error("Could not save request");}
    const saved=await orderResponse.json();
    const orderId=Array.isArray(saved)?saved[0]?.id:null;
    if(!orderId)throw new Error("Missing saved request ID");

    let notification_sent=false;
    const resendApiKey=Deno.env.get("RESEND_API_KEY");
    if(resendApiKey){
      const emailHtml=[
        '<div style="font:15px/1.65 Arial,sans-serif;max-width:650px;margin:auto;color:#17213c">',
        '<h2 style="color:#397fff">Nova LogoBoss narudžba</h2>',
        '<p><b>Ime:</b> ',esc(customer_name),'</p>',
        '<p><b>Firma:</b> ',esc(company_name||"-"),'</p>',
        '<p><b>Kontakt:</b> ',esc(email),'</p>',
        '<p><b>Telefon / WhatsApp:</b> ',esc(phone_whatsapp||"-"),'</p>',
        '<p><b>Država:</b> ',esc(country||"-"),'</p>',
        '<p><b>Paket:</b> ',esc(package_name),'</p>',
        '<p><b>Iznos:</b> ',String(total),' €</p>',
        '<p><b>Jezik:</b> ',esc(language),'</p>',
        '<p><b>Napomena:</b><br>',esc(note||"-"),'</p>',
        '<hr><p>Zahtjev je spremljen u Supabase. ID: ',esc(orderId||"-"),'</p>',
        '<p><a href="https://logobossweb-ai.eu/admin.html">Otvori administraciju</a></p></div>'
      ].join("");
      try{
        const mail=await fetch("https://api.resend.com/emails",{
          method:"POST",headers:{"Authorization":"Bearer "+resendApiKey,"Content-Type":"application/json","Idempotency-Key":"order-admin-"+orderId},signal:AbortSignal.timeout(10000),
          body:JSON.stringify({from:"LogoBoss AI <notifications@logobossweb-ai.eu>",to:["nedzad07sabic@gmail.com"],reply_to:email,subject:"LogoBoss Anfrage – "+package_name,html:emailHtml}),
        });
        notification_sent=mail.ok;
        if(!mail.ok) console.error("Notification email failed",mail.status);
      }catch(e){console.error("Notification email exception",String(e));}
    }else console.error("RESEND_API_KEY not configured");


    // Customer receipt is informational: no payment and no confirmed appointment.
    // The sender domain is verified. Receipts do not assert payment or product activation.
    let customer_confirmation_sent=false;
    if(resendApiKey && emailValid){
      const de=language==="de";
      const title=de?"Wir haben Ihre Anfrage erhalten":"We received your request";
      const subtitle=de?"Vielen Dank für Ihre Anfrage bei LogoBoss Web AI. Wir prüfen die Angaben und melden uns persönlich bei Ihnen.":"Thank you for contacting LogoBoss Web AI. We will review your request and contact you personally.";
      const paymentNote=de?"Dies ist eine Eingangsbestätigung, keine verbindliche Buchung oder Zahlungsbestätigung. Es wurde keine Online-Zahlung vorgenommen.":"This is an acknowledgment, not a confirmed booking or payment receipt. No online payment has been taken.";
      const packageLabel=de?"Gewähltes Paket":"Selected package";
      const amountLabel=de?"Angefragter Paketpreis":"Requested package price";
      const greeting=de?"Hallo":"Hello";
      const amountText=new Intl.NumberFormat(de?"de-DE":"en-US",{style:"currency",currency:"EUR"}).format(total);
      const html=[
        '<div style="background:#060b1d;padding:36px 12px;font-family:Arial,Helvetica,sans-serif">',
        '<div style="max-width:580px;margin:auto;border:1px solid #355ba8;border-radius:20px;overflow:hidden;background:#0d1a36;color:#eaf4ff">',
        '<div style="background:linear-gradient(110deg,#147ec5,#397fff,#7c53d9);padding:28px 32px">',
        '<div style="font-size:25px;font-weight:800;color:white">LogoBoss <span style="color:#b8f4ff">Web AI</span></div>',
        '<div style="font-size:13px;color:#d9e9ff;margin-top:5px">WEB · AUTOMATION · AI</div></div>',
        '<div style="padding:30px 32px"><h1 style="font-size:24px;line-height:1.3;color:#fff;margin:0 0 16px">',esc(title),'</h1>',
        '<p style="color:#c3d7f4;line-height:1.65">',esc(greeting),' ',esc(customer_name),',</p>',
        '<p style="color:#c3d7f4;line-height:1.65">',esc(subtitle),'</p>',
        '<div style="background:#102448;border:1px solid #355ba8;border-radius:12px;padding:18px;margin:24px 0">',
        '<div style="font-size:13px;color:#a8c8f0">',esc(packageLabel),'</div>',
        '<div style="font-size:18px;font-weight:bold;color:#fff">',esc(package_name),'</div>',
        '<div style="font-size:13px;color:#a8c8f0;margin-top:10px">',esc(amountLabel),': ',esc(amountText),'</div></div>',
        '<p style="font-size:13px;color:#9fb4d8;line-height:1.6">',esc(paymentNote),'</p>',
        '<p style="font-size:13px"><a href="https://logobossweb-ai.eu/" style="color:#81dbff">logobossweb-ai.eu</a></p>',
        '</div></div></div>'
      ].join("");
      try{
        const response=await fetch("https://api.resend.com/emails",{
          method:"POST",headers:{"Authorization":"Bearer "+resendApiKey,"Content-Type":"application/json","Idempotency-Key":"order-customer-"+orderId},signal:AbortSignal.timeout(10000),
          body:JSON.stringify({
            from:"LogoBoss Web AI <notifications@logobossweb-ai.eu>",
            to:[email],
            reply_to:"info.logobossai@gmail.com",
            subject:(de?"LogoBoss – Anfrage erhalten: ":"LogoBoss – Request received: ")+package_name,
            html,
          }),
        });
        customer_confirmation_sent=response.ok;
        if(!response.ok) console.error("Customer confirmation rejected",response.status);
      }catch(e){console.error("Customer confirmation error",String(e));}
    }

    if(!ct.includes("application/json"))
      return Response.redirect("https://logobossweb-ai.eu/thank-you.html",303);
    return json({success:true,order:{id:orderId},is_test:false,total_eur:total,notification_sent,customer_confirmation_sent},200,origin);
  }catch(error){
    console.error("submit-order error",error instanceof Error?error.message:String(error));
    return json({success:false,error:"Request could not be processed. Please try again."},500,origin);
  }
});

