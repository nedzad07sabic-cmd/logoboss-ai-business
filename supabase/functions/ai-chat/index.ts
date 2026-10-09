import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const origins=new Set(["https://logobossweb-ai.eu","https://www.logobossweb-ai.eu","https://nedzad07sabic-cmd.github.io"]);
const respond=(body:unknown,status=200,origin:string|null=null)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store",...(origin&&origins.has(origin)?{"Access-Control-Allow-Origin":origin}:{})}});
const cut=(x:unknown,n:number)=>String(x??"").trim().slice(0,n);
const hash=async(x:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(x)))).map(n=>n.toString(16).padStart(2,"0")).join("");
const esc=(x:unknown)=>String(x??"-").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function replyFor(message:string,lang:string){
 const q=message.toLowerCase(),de=lang==="de";
 if(/preis|price|cost|paket|package/.test(q))return de?"LogoBoss AI: Digital Start 1.190 € + 59 €/Monat, Web Business 2.320 € + 99 €/Monat, Web Pro 3.920 € + 149 €/Monat. Business AI 790 € + 79 €/Monat, Pro AI 2.320 € + 149 €/Monat. Automation Start 720 € + 49 €/Monat, Automation Business 2.000 € + 149 €/Monat. Company OS Start 3.990 € + 199 €/Monat. Einrichtung einmalig; die erste Zahlung enthält zusätzlich den ersten Monat. Details und endgültiger Zahlbetrag: https://logobossweb-ai.eu/#services":"LogoBoss AI: Digital Start €1,190 + €59/month, Web Business €2,320 + €99/month, Web Pro €3,920 + €149/month. Business AI €790 + €79/month, Pro AI €2,320 + €149/month. Automation Start €720 + €49/month, Automation Business €2,000 + €149/month. Company OS Start €3,990 + €199/month. Setup is charged once; the first payment also includes the first month. Details and final checkout total: https://logobossweb-ai.eu/#services";
 if(/termin|appointment|booking|reserv|buchung/.test(q))return de?"LogoBoss AI unterstützt Terminanfragen in den vereinbarten Web- und Company-OS-Modulen. Eine Anfrage ist noch keine bestätigte Buchung. Dies ist eine FAQ-Demo und bucht keine Termine.":"LogoBoss AI supports appointment requests in agreed web and Company OS modules. A request is not a confirmed booking. This FAQ demo does not book appointments.";
 if(/telefon|phone|anruf|voice|call/.test(q))return de?"Die Standardpakete enthalten keine Telefon- oder Sprach-KI. Größere Integrationen benötigen eine separate technische Prüfung und ein Angebot.":"Phone and voice AI are not included in the standard packages. Larger integrations need a separate technical review and offer.";
 if(/abo|subscription|rechnung|invoice|cancel|kündig/.test(q))return de?"Rechnungen und Ihr monatliches Abonnement verwalten Sie im Stripe-Rechnungsportal über https://logobossweb-ai.eu/#account. Verwenden Sie die E-Mail-Adresse Ihres Kaufs.":"Manage invoices and your monthly subscription through the Stripe billing portal linked at https://logobossweb-ai.eu/#account. Use your checkout email address.";
 if(/kontakt|contact|angebot|quote|email/.test(q))return de?"Kontaktieren Sie LogoBoss AI unter info.logobossai@gmail.com. Kundenzugang: https://logobossweb-ai.eu/#account. Diese Demo sendet keine Nachrichten an das Team.":"Contact LogoBoss AI at info.logobossai@gmail.com. Customer area: https://logobossweb-ai.eu/#account. This demo does not send messages to the team.";
 return de?"Dies ist eine Demo mit vordefinierten LogoBoss-AI-Antworten zu Websites, Textchat, Automatisierung und Company OS. Ein Assistent für Ihr Unternehmen benötigt eigene freigegebene Inhalte und Einrichtung.":"This demo uses predefined LogoBoss AI answers about websites, text chat, automation and Company OS. An assistant for your business needs its own approved content and setup.";
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");
 if(origin&&!origins.has(origin))return respond({error:"Origin not allowed"},403);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin||"https://logobossweb-ai.eu","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST,OPTIONS"}});
 if(req.method!=="POST")return respond({error:"Method not allowed"},405,origin);
 try{
  if(Number(req.headers.get("content-length")||0)>8000)return respond({error:"Request too large"},413,origin);
  const raw=await req.text();
  if(raw.length>8000)return respond({error:"Request too large"},413,origin);
  let b;try{b=JSON.parse(raw)}catch{return respond({error:"Invalid JSON"},400,origin);}
  const business_id=cut(b.business_id,40),message=cut(b.message,1000);
  const language=cut(b.language,2).toLowerCase()==="de"?"de":"en";
  if(!uuid.test(business_id)||!message)return respond({error:"Invalid business or message"},400,origin);
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key)throw new Error("Missing backend configuration");
  const headers={"Content-Type":"application/json",apikey:key,Authorization:"Bearer "+key};
  const ip=cut(req.headers.get("cf-connecting-ip")||req.headers.get("x-real-ip")||req.headers.get("x-forwarded-for")?.split(",")[0]||"",100);
  if(ip){
   const keyHash=await hash("chat:"+key.slice(0,20)+":"+ip);
   const rate=await fetch(url+"/rest/v1/rpc/lb_check_order_rate_limit",{method:"POST",headers,body:JSON.stringify({p_key:keyHash,p_limit:25,p_window_seconds:3600})});
   if(!rate.ok)throw new Error("Rate check unavailable");
   if(await rate.json()!==true)return respond({error:"Too many requests"},429,origin);
  }
  const business=await fetch(url+"/rest/v1/businesses?id=eq."+encodeURIComponent(business_id)+"&select=id,active&limit=1",{headers});
  if(!business.ok)throw new Error("Business lookup unavailable");
  const bs=await business.json();
  if(!Array.isArray(bs)||!bs[0]?.active)return respond({error:"Unknown business"},404,origin);
  const moduleResponse=await fetch(url+"/rest/v1/business_modules?business_id=eq."+encodeURIComponent(business_id)+"&select=ai_chat&limit=1",{headers});
  if(!moduleResponse.ok)throw new Error("Module lookup unavailable");
  if(!(await moduleResponse.json())?.[0]?.ai_chat)return respond({error:"Assistant not enabled"},403,origin);
  let conversation_id=cut(b.conversation_id,40);
  if(conversation_id){
   if(!uuid.test(conversation_id))return respond({error:"Invalid conversation"},400,origin);
   const check=await fetch(url+"/rest/v1/conversations?id=eq."+encodeURIComponent(conversation_id)+"&business_id=eq."+encodeURIComponent(business_id)+"&select=id&limit=1",{headers});
   if(!check.ok||!(await check.json())?.length)return respond({error:"Unknown conversation"},404,origin);
  }else{
   const create=await fetch(url+"/rest/v1/conversations",{method:"POST",headers:{...headers,Prefer:"return=representation"},body:JSON.stringify({
    business_id,channel:"chat",customer_name:cut(b.customer_name,100)||null,customer_contact:cut(b.customer_contact,160)||null,status:"open"
   })});
   if(!create.ok)throw new Error("Conversation could not be created");
   conversation_id=(await create.json())?.[0]?.id;
   if(!conversation_id)throw new Error("Missing conversation ID");
  }
  const userMessage=await fetch(url+"/rest/v1/messages",{method:"POST",headers,body:JSON.stringify({conversation_id,sender:"customer",body:message})});
  if(!userMessage.ok)throw new Error("Could not store message");
  const reply=replyFor(message,language);
  const botMessage=await fetch(url+"/rest/v1/messages",{method:"POST",headers,body:JSON.stringify({conversation_id,sender:"assistant",body:reply})});
  if(!botMessage.ok)throw new Error("Could not store response");
  if(b.save_lead===true&&cut(b.customer_contact,160)){
   const contact=cut(b.customer_contact,160);
   const lead={business_id,customer_name:cut(b.customer_name,100)||null,email:contact.includes("@")?contact:null,phone:contact.includes("@")?null:contact,source:"ai_chat",message,status:"new"};
   const saved=await fetch(url+"/rest/v1/leads",{method:"POST",headers,body:JSON.stringify(lead)});
   // Lead storage only. No customer or admin email is sent by this demo.

  }
  return respond({conversation_id,reply,demo:true},200,origin);
 }catch(e){console.error("ai-chat error",e instanceof Error?e.message:String(e));return respond({error:"unavailable"},500,origin);}
});

