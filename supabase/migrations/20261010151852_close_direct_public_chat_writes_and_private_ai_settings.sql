drop policy if exists public_create_conversation on public.conversations;
drop policy if exists public_create_message on public.messages;
drop policy if exists public_read_ai_settings on public.business_ai_settings;
revoke insert on public.conversations, public.messages from anon;
revoke select on public.business_ai_settings from anon;
