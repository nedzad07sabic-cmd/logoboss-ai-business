// Browser JWTs are verified against Auth, never trusted from decoded claims.
const origins=new Set(['https://logobossweb-ai.eu','https://www.logobossweb-ai.eu','https://nedzad07sabic-cmd.github.io']);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const categories=new Set(['website','ai','automation','company','hosting','billing','other']);
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
const json=(data,status,origin)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin}:{})}});
export async function handler(req){
 const origin=req.headers.get('origin');
 if(origin&&!origins.has(origin))return json({error:'Origin not allowed'},403,origin);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...(origins.has(origin)?{'Access-Control-Allow-Origin':origin}:{}),'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization, apikey, content-type','Vary':'Origin'}});
 if(req.method!=='POST')return json({error:'Method not allowed'},405,origin);
 try{
  const base=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!base||!key)throw Error('Configuration unavailable');
  const auth=req.headers.get('authorization')||'';
  if(!/^Bearer [A-Za-z0-9._~-]+$/.test(auth))return json({error:'Please sign in.'},401,origin);
  const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
  const call=async(path,options={})=>fetch(base+path,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(15000)});
  const userResponse=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:auth},signal:AbortSignal.timeout(10000)});
  if(!userResponse.ok)return json({error:'Session expired. Please sign in again.'},401,origin);
  const user=await userResponse.json();
  if(!uuid.test(user.id||'')||!user.email_confirmed_at)return json({error:'Please verify your email address.'},403,origin);
  const admin=String(user.email||'').toLowerCase()==='nedzad07sabic@gmail.com';
  if(Number(req.headers.get('content-length')||0)>2200000)return json({error:'Attachment too large (maximum 2 MB).'},413,origin);
  const bytes=await req.arrayBuffer();
  if(bytes.byteLength>2200000)return json({error:'Request too large.'},413,origin);
  const ct=req.headers.get('content-type')||'';
  let b,file=null;
  try{
   if(ct.includes('multipart/form-data')){
    const form=await new Response(bytes,{headers:{'Content-Type':ct}}).formData();
    const raw=form.get('payload');if(typeof raw!=='string'||raw.length>20000)throw Error();
    b=JSON.parse(raw);const f=form.get('attachment');if(f instanceof File&&f.size)file=f;
   }else if(ct.includes('application/json')){
    if(bytes.byteLength>20000)return json({error:'Request too large.'},413,origin);
    b=JSON.parse(new TextDecoder().decode(bytes));
   }else return json({error:'Unsupported content type'},415,origin);
   if(!b||typeof b!=='object'||Array.isArray(b))throw Error();
  }catch{return json({error:'Invalid request'},400,origin);}
  const action=b.action;
  const rows=async(path)=>{const r=await call('/rest/v1/'+path);if(!r.ok)throw Error('Database read failed');return r.json();};
  const ticketScope=admin?'':'&customer_user_id=eq.'+user.id;
  const getTicket=async id=>{
   if(!uuid.test(id||''))return null;
   const t=await rows('support_tickets?id=eq.'+id+ticketScope+'&select=*&limit=1');return t[0]||null;
  };
  if(action==='list'){
   const offset=Number(b.offset||0);if(!Number.isInteger(offset)||offset<0||offset>10000)return json({error:'Invalid page'},400,origin);
   const tickets=await rows('support_tickets?select=*&order=updated_at.desc,id.desc&limit=101&offset='+offset+ticketScope);
   const orders=admin?[]:await rows('orders?customer_user_id=eq.'+user.id+'&select=id,package_name&order=created_at.desc&limit=100');
   return json({tickets:tickets.slice(0,100),has_more:tickets.length>100,orders,admin},200,origin);
  }
  if(action==='detail'){
   const ticket=await getTicket(b.ticket_id);if(!ticket)return json({error:'Ticket not found'},404,origin);
   const offset=Number(b.offset||0);if(!Number.isInteger(offset)||offset<0||offset>10000)return json({error:'Invalid page'},400,origin);
   const messages=await rows('support_messages?ticket_id=eq.'+ticket.id+'&select=id,author_role,body,attachment_name,attachment_type,attachment_size,created_at&order=created_at.desc,id.desc&limit=101&offset='+offset);
   const order=ticket.order_id?(await rows('orders?id=eq.'+encodeURIComponent(ticket.order_id)+'&customer_user_id=eq.'+ticket.customer_user_id+'&select=id,package_name&limit=1'))[0]:null;
   let customer=null;
   if(admin){try{const r=await fetch(base+'/auth/v1/admin/users/'+ticket.customer_user_id,{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(10000)});if(r.ok){const u=await r.json();customer={email:u.email||null};}}catch{}}
   return json({ticket,messages:messages.slice(0,100).reverse(),has_more:messages.length>100,admin,order,customer},200,origin);
  }
  if(action==='attachment'){
   if(!uuid.test(b.message_id||''))return json({error:'Attachment not found'},404,origin);
   const messages=await rows('support_messages?id=eq.'+b.message_id+'&select=ticket_id,attachment_path,attachment_name&limit=1');
   const message=messages[0];if(!message||!message.attachment_path||!await getTicket(message.ticket_id))return json({error:'Attachment not found'},404,origin);
   const r=await call('/storage/v1/object/sign/support-attachments/'+message.attachment_path,{method:'POST',body:JSON.stringify({expiresIn:60})});
   if(!r.ok)throw Error('Attachment unavailable');const signed=await r.json();
   const path=signed.signedURL||signed.signedUrl;
   if(typeof path!=='string'||!path.startsWith('/object/sign/'))throw Error('Invalid attachment URL');
   return json({url:base+'/storage/v1'+path,name:message.attachment_name},200,origin);
  }
  if(!['create','reply','status'].includes(action))return json({error:'Invalid action'},400,origin);
  if(action==='create'&&admin)return json({error:'Use a customer account to create a ticket'},400,origin);
  if(action!=='create'&&!await getTicket(b.ticket_id))return json({error:'Ticket not found'},404,origin);
  if(action==='status'&&(!['open','in_progress','waiting_customer','closed'].includes(b.status)||(!admin&&!['open','closed'].includes(b.status))))return json({error:'Invalid status'},403,origin);
  if(action!=='status'&&!uuid.test(b.request_id||''))return json({error:'Missing request ID'},400,origin);
  const body=clean(b.body,6001),subject=clean(b.subject,161);
  if(action!=='status'&&(!body||body.length>6000))return json({error:'Message must contain 1–6000 characters'},400,origin);
  if(action==='create'&&(subject.length<3||subject.length>160||!categories.has(b.category)))return json({error:'Choose a category and enter a subject (3–160 characters)'},400,origin);
  const data={body,subject,category:b.category,order_id:clean(b.order_id,200)||null,language:b.language==='en'?'en':'de',status:b.status};
  if(action==='create'&&data.order_id){
   const own=await rows('orders?id=eq.'+encodeURIComponent(data.order_id)+'&customer_user_id=eq.'+user.id+'&select=id&limit=1');
   if(!own.length)return json({error:'Order not found'},403,origin);
  }
  // Replay persisted writes before applying rate limits or uploading another attachment.
  const replay=action==='status'?[]:await rows('support_messages?author_id=eq.'+user.id+'&request_id=eq.'+b.request_id+'&select=*&limit=1');
  let result;
  if(replay.length){
   if(action==='reply'&&replay[0].ticket_id!==b.ticket_id)return json({error:'Request ID already used'},409,origin);
   const ticket=await getTicket(replay[0].ticket_id);if(!ticket)return json({error:'Ticket not found'},404,origin);
   result={ticket,message:replay[0],replayed:true};
  }else{
   const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('support:'+user.id+':'+(action==='create'?'create':'update')));
   const digest=Array.from(new Uint8Array(hash)).map(v=>v.toString(16).padStart(2,'0')).join('');
   const limit=await call('/rest/v1/rpc/lb_check_order_rate_limit',{method:'POST',body:JSON.stringify({p_key:digest,p_limit:admin?50:action==='create'?8:40,p_window_seconds:3600})});
   if(!limit.ok)throw Error('Rate limit unavailable');
   if(await limit.json()!==true)return json({error:'Too many requests. Please try again later.'},429,origin);
   if(file){
    if(action==='status'||file.size>2097152)return json({error:'Attachment too large (maximum 2 MB)'},400,origin);
    const blob=new Uint8Array(await file.arrayBuffer());
    const type=blob[0]===0x89&&blob[1]===0x50&&blob[2]===0x4e&&blob[3]===0x47?'image/png':
     blob[0]===0xff&&blob[1]===0xd8&&blob[2]===0xff?'image/jpeg':
     new TextDecoder().decode(blob.slice(0,4))==='RIFF'&&new TextDecoder().decode(blob.slice(8,12))==='WEBP'?'image/webp':
     new TextDecoder().decode(blob.slice(0,5))==='%PDF-'?'application/pdf':null;
    if(!type||file.type!==type)return json({error:'Use a valid PNG, JPG, WebP or PDF attachment.'},400,origin);
    const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','application/pdf':'pdf'}[type];
    const path=user.id+'/'+crypto.randomUUID()+'.'+ext;
    const upload=await call('/storage/v1/object/support-attachments/'+path,{method:'POST',headers:{'Content-Type':type,'x-upsert':'false'},body:blob});
    if(!upload.ok)throw Error('Attachment could not be stored');
    Object.assign(data,{attachment_path:path,attachment_name:clean(file.name,160).replace(/[\u0000-\u001f\u007f]/g,''),attachment_type:type,attachment_size:file.size});
   }
   const write=await call('/rest/v1/rpc/lb_support_write',{method:'POST',body:JSON.stringify({p_actor:user.id,p_request:b.request_id||null,p_action:action,p_ticket:b.ticket_id||null,p_data:data})});
   if(!write.ok){
    // A completed, rejected transaction cannot reference the uploaded object.
    if(data.attachment_path)await call('/storage/v1/object/support-attachments',{method:'DELETE',body:JSON.stringify({prefixes:[data.attachment_path]})}).catch(()=>{});
    const err=await write.json().catch(()=>({}));return json({error:err.code==='42501'?'Access denied':err.message==='Reopen this ticket before replying'?err.message:'Could not save this change. Refresh the ticket and try again.'},err.code==='42501'?403:409,origin);
   }
   result=await write.json();
   if(result.replayed&&data.attachment_path&&result.message?.attachment_path!==data.attachment_path)
    await call('/storage/v1/object/support-attachments',{method:'DELETE',body:JSON.stringify({prefixes:[data.attachment_path]})}).catch(()=>{});
  }
  // Notifications contain no attachment or private message body. The authenticated portal is the source of truth.
  let notification_pending=false;
  if(result.message){
   const m=result.message,t=result.ticket,de=t.language==='de';
   const resend=Deno.env.get('RESEND_API_KEY');
   const fresh=Date.now()-new Date(m.created_at).getTime()<23*3600000;
   let customer=null;
   try{const customerResponse=await fetch(base+'/auth/v1/admin/users/'+t.customer_user_id,{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(10000)});
    if(customerResponse.ok)customer=await customerResponse.json();
   }catch{notification_pending=true;}
   const recipients=[{flag:'admin_notified',to:'nedzad07sabic@gmail.com',link:'https://logobossweb-ai.eu/admin.html#support-ticket='+t.id,title:'LogoBoss support · LB-'+t.number},
    {flag:'customer_notified',to:customer?.email_confirmed_at?customer.email:null,link:'https://logobossweb-ai.eu/#support-ticket='+t.id,title:(de?'Ihr Support-Ticket · ':'Your support ticket · ')+'LB-'+t.number}];
   for(const recipient of recipients){
    if(m[recipient.flag])continue;
    if(!resend||!recipient.to||!fresh){notification_pending=true;continue;}
    try{
     const isAdmin=recipient.flag==='admin_notified';
     const heading=isAdmin?'Nova poruka podrške':de?'Ihr Ticket wurde aktualisiert':'Your ticket was updated';
     const note=isAdmin?'Prijavi se u administraciju da vidiš poruku i odgovoriš.':de?'Melden Sie sich an, um die Nachricht zu lesen und zu antworten. Antworten Sie bitte im Ticket, nicht auf diese E-Mail.':'Sign in to read the message and reply. Please reply inside the ticket, not to this email.';
     const mail=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+resend,'Content-Type':'application/json','Idempotency-Key':'support-'+m.id+'-'+recipient.flag},signal:AbortSignal.timeout(10000),body:JSON.stringify({from:'LogoBoss AI <notifications@logobossweb-ai.eu>',to:[recipient.to],reply_to:'info.logobossai@gmail.com',subject:recipient.title,html:'<!doctype html><html lang="'+(isAdmin?'bs':de?'de':'en')+'"><body style="background:#081124;color:#eaf6ff;font:16px/1.6 Arial;padding:32px"><h1 style="color:#75dcff">LogoBoss AI · Support</h1><h2>'+escapeHtml(heading)+'</h2><p>LB-'+t.number+'</p><p>'+escapeHtml(note)+'</p><p><a style="color:#95b8ff" href="'+recipient.link+'">'+(isAdmin?'Otvori tiket':de?'Ticket öffnen':'Open ticket')+'</a></p></body></html>'})});
     if(mail.ok){
      const marked=await call('/rest/v1/support_messages?id=eq.'+m.id,{method:'PATCH',body:JSON.stringify({[recipient.flag]:true})});
      if(!marked.ok)notification_pending=true;
     }else notification_pending=true;
    }catch{notification_pending=true;}
   }
  }
  return json({ticket:result.ticket,replayed:Boolean(result.replayed),notification_pending},200,origin);
 }catch(error){console.error('support-tickets request failed',error instanceof Error?error.message:'Unknown error');return json({error:'Support is temporarily unavailable. Please try again.'},503,origin);}
}
Deno.serve(handler);
