-- Server-only atomic persistence: a verified payment and its customer order.
alter table public.stripe_payments drop constraint lb_payment_kind_valid;
alter table public.stripe_payments add constraint lb_payment_kind_valid check (payment_kind is null or payment_kind in ('one_time','monthly','setup_plus_monthly'));
alter table public.stripe_payments add column if not exists order_id text references public.orders(id) on delete set null;
alter table public.stripe_payments add column if not exists subscription_status text;
alter table public.stripe_payments add column if not exists cancel_at_period_end boolean not null default false;
alter table public.stripe_payments add column if not exists last_invoice_status text;
alter table public.stripe_payments add column if not exists last_invoice_id text;
alter table public.stripe_payments add column if not exists billing_event_created bigint not null default 0;
create index if not exists lb_payment_order_idx on public.stripe_payments(order_id);
create index if not exists lb_payment_subscription_idx on public.stripe_payments(stripe_subscription_id);
create or replace function public.lb_record_stripe_checkout(p_payment jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v public.stripe_payments%rowtype; v_order text;
begin
 if p_payment->>'stripe_session_id' not like 'cs_live_%' or p_payment->>'payment_kind' <> 'setup_plus_monthly' or p_payment->>'payment_status' <> 'paid' or p_payment->>'customer_email' is null then
  raise exception 'Invalid verified payment';
 end if;
 insert into public.stripe_payments(stripe_session_id,stripe_customer_id,stripe_subscription_id,stripe_payment_intent_id,stripe_payment_link_id,package_id,package_name,payment_kind,customer_email,customer_name,company_name,setup_eur,monthly_eur,amount_paid_eur,currency,payment_status,is_test)
 values(p_payment->>'stripe_session_id',p_payment->>'stripe_customer_id',p_payment->>'stripe_subscription_id',p_payment->>'stripe_payment_intent_id',p_payment->>'stripe_payment_link_id',p_payment->>'package_id',p_payment->>'package_name','setup_plus_monthly',p_payment->>'customer_email',p_payment->>'customer_name',p_payment->>'company_name',(p_payment->>'setup_eur')::numeric,(p_payment->>'monthly_eur')::numeric,(p_payment->>'amount_paid_eur')::numeric,'eur','paid',false)
 on conflict(stripe_session_id) do nothing;
 select * into v from public.stripe_payments where stripe_session_id=p_payment->>'stripe_session_id' for update;
 if v.order_id is null then
  insert into public.orders(customer_name,company_name,email,package_name,total_eur,note,language,status,is_test,portal_enabled)
  values(coalesce(v.customer_name,v.customer_email),v.company_name,v.customer_email,v.package_name,v.amount_paid_eur,
   'Verified Stripe checkout: '||v.stripe_session_id||'. Setup: '||v.setup_eur||' EUR. Monthly: '||v.monthly_eur||' EUR. Access after review and setup.',
   'de','new',false,false) returning id into v_order;
  update public.stripe_payments set order_id=v_order,updated_at=now() where id=v.id returning * into v;
 end if;
 return to_jsonb(v);
end;
$$;
revoke all on function public.lb_record_stripe_checkout(jsonb) from public,anon,authenticated;
grant execute on function public.lb_record_stripe_checkout(jsonb) to service_role;
create policy lb_customer_read_own_payments on public.stripe_payments for select to authenticated
 using (exists(select 1 from public.orders o where o.id=order_id and o.customer_user_id=(select auth.uid())));
grant select on public.stripe_payments to authenticated;
notify pgrst, 'reload schema';
