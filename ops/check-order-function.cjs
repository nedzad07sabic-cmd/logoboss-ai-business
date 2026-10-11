const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {stripTypeScriptTypes} = require('node:module');
const {webcrypto} = require('node:crypto');
const source = fs.readFileSync(path.resolve(__dirname,'../supabase/functions/submit-order/index.ts'),'utf8').replace(/^import[^\n]+\n/,'');
const script = stripTypeScriptTypes(source);
const fixture = {customer_name:'Audit <fixture>',company_name:'Example',email:'audit@example.test',package_name:'Digital Start — display only',total_eur:'1',language:'en',note:'Unit test only'};
async function run({body=fixture,auth=true,confirmed=true,userEmail=fixture.email,rate=true,storage=true,provider=true,origin='https://logobossweb-ai.eu',raw}={}) {
  const writes=[],emails=[];let handler;
  const json=(data,status=200)=>new Response(JSON.stringify(data),{status});
  const env={SUPABASE_URL:'https://backend.example.test',SUPABASE_SERVICE_ROLE_KEY:'mock-service-role-for-unit-tests',RESEND_API_KEY:'mock-email-provider-for-unit-tests'};
  const fetcher=async(url,opts={})=>{
    if(url.endsWith('/auth/v1/user'))return json({id:'unit-user',email:userEmail,email_confirmed_at:confirmed?'2026-10-10T00:00:00Z':null});
    if(url.endsWith('/rpc/lb_check_order_rate_limit'))return json(rate);
    if(url.endsWith('/rest/v1/orders')){writes.push(JSON.parse(opts.body));return json(storage?[{id:'unit-order-id'}]:{},storage?201:500);}
    if(url==='https://api.resend.com/emails'){emails.push({body:JSON.parse(opts.body),headers:opts.headers,signal:opts.signal});return json({},provider?200:503);}
    throw Error('Unexpected mock request: '+url);
  };
  vm.runInNewContext(script,{Deno:{env:{get:k=>env[k]},serve:fn=>handler=fn},fetch:fetcher,Response,URLSearchParams,TextEncoder,AbortSignal,crypto:webcrypto,console:{error(){}}});
  const response=await handler(new Request('https://backend.example.test/functions/v1/submit-order',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(auth?{Authorization:'Bearer mock-user-token'}:{})},body:raw===undefined?JSON.stringify(body):raw}));
  return {status:response.status,data:await response.json(),writes,emails};
}
async function check(){
  let result=await run();assert.equal(result.status,200);assert.equal(result.data.is_test,false);assert.equal(result.writes[0].is_test,false);
  assert.equal(result.writes[0].total_eur,1190,'hidden browser price is never authoritative');
  assert.equal(result.writes[0].customer_user_id,'unit-user');assert.equal(result.emails.length,2);
  assert.equal(result.emails[0].headers['Idempotency-Key'],'order-admin-unit-order-id');
  assert.equal(result.emails[1].headers['Idempotency-Key'],'order-customer-unit-order-id');
  assert.equal(result.emails[1].body.reply_to,'info.logobossai@gmail.com');
  assert.ok(result.emails[1].body.html.includes('No online payment has been taken.'));
  assert.ok(result.emails[1].body.html.includes('Audit &lt;fixture&gt;'));
  assert.ok(result.emails[0].body.html.includes('https://logobossweb-ai.eu/admin.html'));
  assert.ok(!result.emails[0].body.subject.includes('[TEST]'));
  for(const [options,status]of [[{auth:false},401],[{confirmed:false},403],[{userEmail:'other@example.test'},403],[{rate:false},429],[{storage:false},500],[{origin:'https://untrusted.example.test'},403],[{raw:'{'},400],[{body:{...fixture,package_name:'Unknown'}},400]]){
    result=await run(options);assert.equal(result.status,status);assert.equal(result.emails.length,0);
    if(!('storage'in options))assert.equal(result.writes.length,0);
  }
  result=await run({body:{...fixture,website_url:'spam'}});assert.equal(result.status,200);assert.equal(result.writes.length,0);assert.equal(result.emails.length,0);
  result=await run({provider:false});assert.equal(result.status,200);assert.equal(result.data.notification_sent,false);assert.equal(result.data.customer_confirmation_sent,false);assert.equal(result.writes.length,1);
  result=await run({body:{...fixture,language:'de'}});assert.ok(result.emails[1].body.html.includes('Es wurde keine Online-Zahlung vorgenommen.'));
  console.log(JSON.stringify({result:'passed',scenarios:12,externalEmailsSent:0,liveOrdersCreated:0,checked:['verified account','email ownership','server prices','production request flag','DE/EN informational receipt','escaped HTML','idempotency','invalid JSON','rate limit','storage failure','provider failure','origin restriction']}));
}
check().catch(error=>{console.error(error);process.exit(1);});
