-- Private support centre. Writes are atomic and only callable by the server.
create schema if not exists lb_support_private;
revoke all on schema lb_support_private from public;
grant usage on schema lb_support_private to authenticated, service_role;
create function lb_support_private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and exists(select 1 from auth.users
 where id=auth.uid() and lower(email)='nedzad07sabic@gmail.com' and email_confirmed_at is not null)
$$;
revoke all on function lb_support_private.is_admin() from public;
grant execute on function lb_support_private.is_admin() to authenticated, service_role;
create function lb_support_private.actor_is_admin(p_actor uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select case when email_confirmed_at is not null then lower(email)='nedzad07sabic@gmail.com' else null end
 from auth.users where id=p_actor
$$;
revoke all on function lb_support_private.actor_is_admin(uuid) from public,anon,authenticated;
grant execute on function lb_support_private.actor_is_admin(uuid) to service_role;

create table public.support_tickets (
 id uuid primary key default gen_random_uuid(),
 number bigint generated always as identity unique,
 customer_user_id uuid not null references auth.users(id) on delete cascade,
 subject text not null check(length(subject) between 3 and 160),
 category text not null check(category in ('website','ai','automation','company','hosting','billing','other')),
 order_id text references public.orders(id) on delete set null,
 language text not null default 'de' check(language in ('de','en')),
 status text not null default 'open' check(status in ('open','in_progress','waiting_customer','closed')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index support_tickets_customer_updated on public.support_tickets(customer_user_id,updated_at desc,id);
create index support_tickets_status_updated on public.support_tickets(status,updated_at desc,id);
create table public.support_messages (
 id uuid primary key default gen_random_uuid(),
 ticket_id uuid not null references public.support_tickets(id) on delete cascade,
 author_id uuid not null references auth.users(id) on delete cascade,
 author_role text not null check(author_role in ('customer','support')),
 request_id uuid not null,
 body text not null check(length(body) between 1 and 6000),
 attachment_path text,
 attachment_name text,
 attachment_type text,
 attachment_size integer check(attachment_size between 1 and 2097152),
 admin_notified boolean not null default false,
 customer_notified boolean not null default false,
 created_at timestamptz not null default now(),
 unique(author_id,request_id)
);
create index support_messages_ticket_created on public.support_messages(ticket_id,created_at,id);
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
revoke all on public.support_tickets,public.support_messages from public,anon,authenticated;
grant select on public.support_tickets,public.support_messages to authenticated;
grant all on public.support_tickets,public.support_messages to service_role;
grant usage,select on sequence public.support_tickets_number_seq to service_role;
create policy support_ticket_read on public.support_tickets for select to authenticated
 using(customer_user_id=(select auth.uid()) or (select lb_support_private.is_admin()));
create policy support_message_read on public.support_messages for select to authenticated
 using(exists(select 1 from public.support_tickets t where t.id=ticket_id
 and (t.customer_user_id=(select auth.uid()) or (select lb_support_private.is_admin()))));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('support-attachments','support-attachments',false,2097152,array['image/png','image/jpeg','image/webp','application/pdf']);
-- No client Storage policies: upload and short-lived download URLs are authorized on the server.

create function public.lb_support_write(p_actor uuid,p_request uuid,p_action text,p_ticket uuid,p_data jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_admin boolean; v_ticket public.support_tickets%rowtype;
 v_message public.support_messages%rowtype; v_order text; v_status text;
begin
 v_admin:=lb_support_private.actor_is_admin(p_actor);
 if v_admin is null then raise exception 'Verified account required' using errcode='42501'; end if;
 if p_action not in ('create','reply','status') then raise exception 'Invalid action'; end if;
 if p_action in ('create','reply') then
   if p_request is null then raise exception 'Missing request ID'; end if;
   perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor::text||p_request::text,0));
   select * into v_message from public.support_messages where author_id=p_actor and request_id=p_request;
   if found then
     if p_action='reply' and v_message.ticket_id is distinct from p_ticket then raise exception 'Request ID already used'; end if;
     select * into v_ticket from public.support_tickets where id=v_message.ticket_id;
     return jsonb_build_object('ticket',to_jsonb(v_ticket),'message',to_jsonb(v_message),'replayed',true);
   end if;
   if length(btrim(coalesce(p_data->>'body',''))) not between 1 and 6000 then raise exception 'Invalid message'; end if;
 end if;
 if p_action='create' then
   if v_admin then raise exception 'Open customer tickets from a customer account'; end if;
   v_order:=nullif(p_data->>'order_id','');
   if v_order is not null and not exists(select 1 from public.orders where id=v_order and customer_user_id=p_actor)
   then raise exception 'Order not found' using errcode='42501'; end if;
   insert into public.support_tickets(customer_user_id,subject,category,order_id,language)
   values(p_actor,btrim(p_data->>'subject'),p_data->>'category',v_order,coalesce(p_data->>'language','de')) returning * into v_ticket;
 else
   select * into v_ticket from public.support_tickets where id=p_ticket for update;
   if not found or (not v_admin and v_ticket.customer_user_id<>p_actor)
   then raise exception 'Ticket not found' using errcode='42501'; end if;
 end if;
 if p_action='status' then
   v_status:=p_data->>'status';
   if v_status not in ('open','in_progress','waiting_customer','closed') or v_status is null
     or (not v_admin and v_status not in ('open','closed')) then raise exception 'Invalid status' using errcode='42501'; end if;
   update public.support_tickets set status=v_status,updated_at=now() where id=v_ticket.id returning * into v_ticket;
   return jsonb_build_object('ticket',to_jsonb(v_ticket));
 end if;
 if p_action='reply' then
   if v_ticket.status='closed' then raise exception 'Reopen this ticket before replying'; end if;
   update public.support_tickets set status=case when v_admin then 'waiting_customer' else 'open' end,updated_at=now()
   where id=v_ticket.id returning * into v_ticket;
 end if;
 insert into public.support_messages(ticket_id,author_id,author_role,request_id,body,attachment_path,attachment_name,attachment_type,attachment_size)
 values(v_ticket.id,p_actor,case when v_admin then 'support' else 'customer' end,p_request,btrim(p_data->>'body'),
 p_data->>'attachment_path',p_data->>'attachment_name',p_data->>'attachment_type',(p_data->>'attachment_size')::integer)
 returning * into v_message;
 return jsonb_build_object('ticket',to_jsonb(v_ticket),'message',to_jsonb(v_message),'replayed',false);
end $$;
revoke all on function public.lb_support_write(uuid,uuid,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.lb_support_write(uuid,uuid,text,uuid,jsonb) to service_role;
