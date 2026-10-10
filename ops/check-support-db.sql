-- Run inside a transaction after loading the schema, then ROLLBACK.
-- All auth fixtures and tickets are temporary; no emails or live customer changes.
insert into auth.users(id,email,email_confirmed_at) values
 ('10000000-0000-4000-8000-000000000001','lb-support-fixture-one@example.invalid',now()),
 ('10000000-0000-4000-8000-000000000002','lb-support-fixture-two@example.invalid',now());
create temporary table lb_support_test(ticket uuid,admin_id uuid);
insert into lb_support_test(admin_id) select id from auth.users where lower(email)='nedzad07sabic@gmail.com' and email_confirmed_at is not null limit 1;
grant select,update on lb_support_test to authenticated,service_role;
set local role service_role;
do $$ declare r jsonb; replay jsonb; t uuid; a uuid; denied boolean:=false; begin
 r:=public.lb_support_write('10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','create',null,
 '{"subject":"Transactional fixture","category":"hosting","body":"Fixture only","language":"en"}'::jsonb);
 t:=(r->'ticket'->>'id')::uuid;
 replay:=public.lb_support_write('10000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','create',null,
 '{"subject":"Transactional fixture","category":"hosting","body":"Fixture only","language":"en"}'::jsonb);
 if replay->>'replayed'<>'true' or (select count(*) from public.support_messages where ticket_id=t)<>1 then raise exception 'Idempotency failed'; end if;
 begin perform public.lb_support_write('10000000-0000-4000-8000-000000000002','40000000-0000-4000-8000-000000000002','reply',t,'{"body":"Forbidden"}'::jsonb);
 exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'Cross-customer write was allowed'; end if;
 select admin_id into a from lb_support_test;
 if a is null then raise exception 'Existing confirmed administrator missing'; end if;
 r:=public.lb_support_write(a,'40000000-0000-4000-8000-000000000003','reply',t,'{"body":"Support reply"}'::jsonb);
 if r->'message'->>'author_role'<>'support' or r->'ticket'->>'status'<>'waiting_customer' then raise exception 'Support role/status failed'; end if;
 r:=public.lb_support_write('10000000-0000-4000-8000-000000000001',null,'status',t,'{"status":"closed"}'::jsonb);
 if r->'ticket'->>'status'<>'closed' then raise exception 'Customer close failed'; end if;
 r:=public.lb_support_write('10000000-0000-4000-8000-000000000001',null,'status',t,'{"status":"open"}'::jsonb);
 update lb_support_test set ticket=t;
end $$;
reset role;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$ declare denied boolean:=false; begin
 if (select count(*) from public.support_tickets)<>1 or (select count(*) from public.support_messages)<>2 then raise exception 'Owner read failed'; end if;
 begin perform public.lb_support_write('10000000-0000-4000-8000-000000000001',null,'status',(select ticket from lb_support_test),'{}'::jsonb);
 exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'Client RPC access allowed'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.support_tickets)<>0 or (select count(*) from public.support_messages)<>0 then raise exception 'Cross-customer read allowed'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select admin_id::text from lb_support_test),true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.support_tickets)<>1 or (select count(*) from public.support_messages)<>2 then raise exception 'Administrator read failed'; end if;
end $$;
reset role;
set local role anon;
do $$ declare denied boolean:=false; begin
 begin perform count(*) from public.support_tickets; exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'Anonymous ticket access allowed'; end if;
end $$;
reset role;
select jsonb_build_object('passed',true,'transactional_fixtures_only',true,'checks',array['atomic creation','duplicate replay','cross-customer writes blocked','customer close/reopen','support author and status','owner RLS','other customer RLS','admin RLS','client RPC denied','anonymous read denied']) as validation;
