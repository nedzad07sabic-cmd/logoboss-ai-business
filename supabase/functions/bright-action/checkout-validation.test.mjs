import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog, validateCheckout} from './checkout-validation.mjs';
function checkout(p) {
 return {id:'cs_live_fixture',livemode:true,status:'complete',payment_status:'paid',mode:'subscription',customer:'cus_fixture',subscription:'sub_fixture',payment_link:p.link,currency:'eur',amount_subtotal:p.setup+p.monthly,amount_total:p.setup+p.monthly,total_details:{amount_tax:0,amount_discount:0},customer_details:{email:'audit@example.invalid',name:'Internal audit'},line_items:{has_more:false,data:[
 {quantity:1,price:{id:p.setupPrice,unit_amount:p.setup,currency:'eur',recurring:null}},
 {quantity:1,price:{id:p.monthlyPrice,unit_amount:p.monthly,currency:'eur',recurring:{interval:'month',interval_count:1}}}
 ]}};
}
for(const p of Object.values(catalog)) test(p.name+' verifies setup and first monthly payment separately',()=>{
 const row=validateCheckout(checkout(p));assert.equal(row.setup_eur,p.setup/100);assert.equal(row.monthly_eur,p.monthly/100);assert.equal(row.amount_paid_eur,(p.setup+p.monthly)/100);assert.equal(row.stripe_customer_id,'cus_fixture');assert.equal(row.payment_kind,'setup_plus_monthly');
});
const pkg=Object.values(catalog)[0];
test('pending payment cannot create a paid order',()=>{const s=checkout(pkg);s.payment_status='unpaid';assert.equal(validateCheckout(s),null);});
for(const [name,change] of [
 ['sandbox data',s=>s.livemode=false],
 ['wrong payment link',s=>s.payment_link='plink_unknown'],
 ['quantity changed',s=>s.line_items.data[0].quantity=2],
 ['mixed packages',s=>s.line_items.data[1].price.id=Object.values(catalog)[1].monthlyPrice],
 ['same price duplicated',s=>s.line_items.data[1]=structuredClone(s.line_items.data[0])],
 ['yearly recurrence',s=>s.line_items.data[1].price.recurring.interval='year'],
 ['wrong currency',s=>s.currency='usd'],
 ['wrong total',s=>s.amount_total=1],
 ['missing customer',s=>s.customer=null],
 ['missing subscription',s=>s.subscription=null],
 ['truncated list',s=>s.line_items.has_more=true],
 ['missing email',s=>s.customer_details.email='invalid'],
 ['unknown price amount',s=>s.line_items.data[0].price.unit_amount=1]
]) test('rejects '+name,()=>{const s=checkout(pkg);change(s);assert.throws(()=>validateCheckout(s));});
test('catalog taxes are separated from setup and monthly prices',()=>{const s=checkout(pkg);s.total_details.amount_tax=123;s.amount_total+=123;assert.equal(validateCheckout(s).amount_paid_eur,s.amount_total/100);});
