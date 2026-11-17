-- Após 01-schema.sql: executar em SQL Editor > New query > Run.
-- Pode executar novamente. Não armazena perguntas, respostas nem dados de participantes.
begin;
create table if not exists public.semad_chat_budget(day date primary key,used integer not null default 0 check(used>=0));
alter table public.semad_chat_budget enable row level security;
revoke all on table public.semad_chat_budget from public,anon,authenticated;
grant all on table public.semad_chat_budget to service_role;
create or replace function public.semad_chat_reserve(p_limit integer) returns boolean language plpgsql set search_path='' as $$
declare n integer;
begin
 if p_limit<1 or p_limit>5000 then return false;end if;
 insert into public.semad_chat_budget(day,used) values((now() at time zone 'America/Sao_Paulo')::date,1)
 on conflict(day) do update set used=public.semad_chat_budget.used+1 where public.semad_chat_budget.used<p_limit
 returning used into n;
 return n is not null;
end $$;
revoke all on function public.semad_chat_reserve(integer) from public,anon,authenticated;
grant execute on function public.semad_chat_reserve(integer) to service_role;
commit;
