
create schema if not exists lb_internal;
revoke all on schema lb_internal from public;
grant usage on schema lb_internal to anon, authenticated;

create or replace function lb_internal.public_business_catalog(p_slug text,p_module text)
returns jsonb language sql stable security definer set search_path=''
as $$
select jsonb_build_object('id',b.id,'name',b.name,'slug',b.slug,
 'services',case when p_module='booking' then
  coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,
   'duration_minutes',s.duration_minutes,'price_eur',s.price_eur) order by s.name)
   from public.business_services s where s.business_id=b.id and s.active=true
    and s.duration_minutes between 15 and 480),'[]'::jsonb)
  else '[]'::jsonb end)
from public.businesses b join public.business_modules m on m.business_id=b.id
where b.slug=p_slug and b.active=true
 and length(p_slug) between 1 and 150
 and ((p_module='booking' and m.booking=true) or (p_module='ai_chat' and m.ai_chat=true))
limit 1;
$$;
revoke all on function lb_internal.public_business_catalog(text,text) from public;
grant execute on function lb_internal.public_business_catalog(text,text) to anon, authenticated;
create or replace function public.lb_public_business(p_slug text,p_module text)
returns jsonb language sql stable security invoker set search_path=''
as $$ select lb_internal.public_business_catalog(p_slug,p_module); $$;
revoke all on function public.lb_public_business(text,text) from public;
grant execute on function public.lb_public_business(text,text) to anon, authenticated;

-- Public pages need only the approved catalog, never private customer details or appointments.
drop policy if exists booking_catalog_businesses on public.businesses;
drop policy if exists booking_catalog_services on public.business_services;
drop policy if exists booking_read_busy_slots on public.appointments;
drop policy if exists booking_create_appointment on public.appointments;
create policy booking_create_appointment on public.appointments for insert to anon, authenticated
with check (
 status='new' and public.lb_booking_enabled(business_id)
 and char_length(customer_name) between 1 and 200
 and char_length(service) between 1 and 200
 and (customer_email is null or char_length(customer_email) between 3 and 254)
 and (customer_phone is null or char_length(customer_phone) between 1 and 100)
 and (note is null or char_length(note)<=2000)
 and starts_at>now() and starts_at<now()+interval '2 years'
 and duration_minutes between 15 and 480
 and end_at=starts_at+make_interval(mins=>duration_minutes)
);
notify pgrst,'reload schema';

