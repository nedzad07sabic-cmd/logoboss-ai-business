const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'../supabase/functions/support-tickets/index.ts'),'utf8').replace('export async function handler','async function handler');
const uid='10000000-0000-4000-8000-000000000001',other='10000000-0000-4000-8000-000000000002',tid='20000000-0000-4000-8000-000000000001',mid='30000000-0000-4000-8000-000000000001',rid='40000000-0000-4000-8000-000000000001';
const fixture={action:'create',request_id:rid,subject:'Support fixture',category:'website',body:'Please help',language:'en'};
async function run({body=fixture,auth=true,confirmed=true,admin=false,own=true,provider=true,rate=true,replay=false,raw,file,origin='https://logobossweb-ai.eu'}={}){
 let handler;const writes=[],emails=[],uploads=[];
 const ticket={id:tid,number:1,customer_user_id:uid,subject:'Support fixture',category:'website',status:'open',language:body.language==='de'?'de':'en'};
 const message={id:mid,ticket_id:tid,author_id:uid,request_id:rid,body:'Please help',created_at:new Date().toISOString(),admin_notified:replay,customer_notified:replay,attachment_path:'private/file.pdf',attachment_name:'file.pdf'};
 const json=(x,status=200)=>new Response(JSON.stringify(x),{status});
 const fetcher=async(url,opts={})=>{
  if(url.endsWith('/auth/v1/user'))return json({id:uid,email:admin?'nedzad07sabic@gmail.com':'customer@example.invalid',email_confirmed_at:confirmed?new Date().toISOString():null});
  if(url.includes('/auth/v1/admin/users/'))return json({email:'customer@example.invalid',email_confirmed_at:new Date().toISOString()});
  if(url.includes('/rest/v1/orders?'))return json(own?[{id:'order1',package_name:'Digital Start'}]:[]);
  if(url.includes('/rest/v1/support_tickets?')){assert.ok(admin||url.includes('customer_user_id=eq.'+uid),'customer read is scoped');return json(own?[ticket]:[]);}
  if(url.includes('/rest/v1/support_messages?')){if(opts.method==='PATCH')return json({});return json(url.includes('request_id=')?(replay?[message]:[]):[message]);}
  if(url.endsWith('/rpc/lb_check_order_rate_limit'))return json(rate);
  if(url.endsWith('/rpc/lb_support_write')){const data=JSON.parse(opts.body);writes.push(data);return json(data.p_action==='status'?{ticket}:{ticket,message,replayed:false});}
  if(url.includes('/storage/v1/object/sign/'))return json({signedURL:'/object/sign/support-attachments/private/file.pdf?token=fixture'});
  if(url.includes('/storage/v1/object/support-attachments/')){uploads.push(opts);return json({});}
  if(url==='https://api.resend.com/emails'){emails.push({body:JSON.parse(opts.body),headers:opts.headers});return json({},provider?200:503);}
  throw Error('Unexpected mock call '+url);
 };
 const env={SUPABASE_URL:'https://backend.example.invalid',SUPABASE_SERVICE_ROLE_KEY:'fixture-service',RESEND_API_KEY:'fixture-resend'};
 vm.runInNewContext(source,{Deno:{env:{get:k=>env[k]},serve:fn=>handler=fn},fetch:fetcher,Response,File,TextEncoder,TextDecoder,Uint8Array,AbortSignal,crypto:webcrypto,console:{error(){}}});
 let payload=raw===undefined?JSON.stringify(body):raw,ct='application/json';
 if(file){payload=new FormData();payload.set('payload',JSON.stringify(body));payload.set('attachment',file);ct=null;}
 const req=new Request('https://backend.example.invalid/functions/v1/support-tickets',{method:'POST',headers:{Origin:origin,...(ct?{'Content-Type':ct}:{}),...(auth?{Authorization:'Bearer fixture-jwt'}:{})},body:payload});
 const r=await handler(req);return{status:r.status,data:await r.json(),writes,emails,uploads};
}
(async()=>{
 let r=await run();assert.equal(r.status,200);assert.equal(r.writes.length,1);assert.equal(r.emails.length,2);assert.equal(r.data.notification_pending,false);
 assert.equal(r.writes[0].p_actor,uid);assert.equal(r.emails[0].headers['Idempotency-Key'],'support-'+mid+'-admin_notified');assert.ok(!r.emails[0].body.html.includes('Please help'),'notification excludes private message contents');
 for(const [options,status]of [[{auth:false},401],[{confirmed:false},403],[{origin:'https://evil.example.invalid'},403],[{raw:'{'},400],[{body:{...fixture,category:'bad'}},400],[{body:{...fixture,body:''}},400],[{rate:false},429],[{admin:true},400],[{body:{...fixture,order_id:'other-order'},own:false},403],[{body:{action:'detail',ticket_id:tid},own:false},404],[{body:{action:'status',ticket_id:tid,status:'waiting_customer'}},403],[{body:{action:'attachment',message_id:mid},own:false},404]]){
  r=await run(options);assert.equal(r.status,status,JSON.stringify(options));assert.equal(r.writes.length,0);assert.equal(r.emails.length,0);
 }
 r=await run({provider:false});assert.equal(r.status,200);assert.equal(r.data.notification_pending,true);assert.equal(r.writes.length,1);
 r=await run({replay:true});assert.equal(r.status,200);assert.equal(r.writes.length,0);assert.equal(r.emails.length,0);assert.equal(r.data.replayed,true);
 r=await run({body:{action:'list'}});assert.equal(r.status,200);assert.equal(r.data.orders[0].package_name,'Digital Start');
 r=await run({body:{action:'detail',ticket_id:tid}});assert.equal(r.status,200);assert.equal(r.data.messages[0].id,mid);
 r=await run({body:{action:'attachment',message_id:mid}});assert.equal(r.status,200);assert.match(r.data.url,/object\/sign\//);
 r=await run({body:{action:'reply',ticket_id:tid,request_id:rid,body:'Reply'},admin:true});assert.equal(r.status,200);assert.equal(r.writes[0].p_action,'reply');
 r=await run({body:{action:'status',ticket_id:tid,status:'in_progress'},admin:true});assert.equal(r.status,200);assert.equal(r.emails.length,0);
 r=await run({file:new File(['<html>fake</html>'],'fake.png',{type:'image/png'})});assert.equal(r.status,400);assert.equal(r.uploads.length,0);
 r=await run({file:new File(['%PDF-1.4\nFixture'], 'fixture.pdf',{type:'application/pdf'})});assert.equal(r.status,200);assert.equal(r.uploads.length,1);assert.equal(r.writes[0].p_data.attachment_type,'application/pdf');
 r=await run({file:new File([new Uint8Array(2097153)],'large.pdf',{type:'application/pdf'})});assert.equal(r.status,400);assert.equal(r.uploads.length,0);
 r=await run({body:{...fixture,language:'de'}});assert.ok(r.emails[1].body.html.includes('Ticket öffnen'));
 console.log(JSON.stringify({result:'passed',scenarios:24,externalEmailsSent:0,liveTicketsCreated:0,checks:['verified JWT','ownership','admin status','private attachment URLs','file size and signature','duplicate request replay','server rate limit','notification failures','DE/EN receipts']}));
})().catch(e=>{console.error(e);process.exit(1)});
