-- Execute este arquivo inteiro em Supabase > projeto > SQL Editor > New query > Run.
-- Migração inicial idempotente. Não remove nem altera dados do Site antigo.
begin;
create table if not exists public.semad_activities(id text primary key,title text not null,day integer not null check(day between 15 and 19));
create table if not exists public.semad_registrations(
 id uuid primary key default gen_random_uuid(),edition text not null default '2027' check(edition='2027'),
 name text not null check(length(name) between 3 and 120),email text not null check(email=lower(btrim(email)) and length(email)<=254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 profile text not null check(profile in ('Estudante da UFRRJ','Estudante de outra instituição','Profissional','Docente','Outro')),
 course text not null default '' check(length(course)<=160),institution text not null default '' check(length(institution)<=160),
 interests jsonb not null default '[]' check(jsonb_typeof(interests)='array' and jsonb_array_length(interests)<=4),
 privacy_at timestamptz not null default now(),marketing boolean not null default false,created_at timestamptz not null default now(),unique(edition,email));
create table if not exists public.semad_attendance(
 registration_id uuid not null references public.semad_registrations(id),activity_id text not null references public.semad_activities(id),
 status text not null check(status in ('present','absent','unchecked')),checked_at timestamptz not null default now(),checked_by text not null,
 primary key(registration_id,activity_id));
create table if not exists public.semad_activity_settings(
 activity_id text primary key references public.semad_activities(id),confirmed boolean not null default false,hours numeric not null default 0 check(hours between 0 and 24),issuer text not null default '' check(length(issuer)<=160),check(not confirmed or (hours>0 and length(btrim(issuer))>=3)));
create table if not exists public.semad_certificates(
 id uuid primary key default gen_random_uuid(),registration_id uuid not null references public.semad_registrations(id),activity_id text not null references public.semad_activities(id),
 issued_at timestamptz not null default now(),issued_by text not null,issuer text not null,hours numeric not null check(hours>0 and hours<=24),
 email_state text not null default 'not_sent' check(email_state in ('not_sent','accepted','failed')),email_error text,revoked boolean not null default false,unique(registration_id,activity_id));
create table if not exists public.semad_audit(id uuid primary key default gen_random_uuid(),action text not null,subject text not null,actor text not null,created_at timestamptz not null default now());
create index if not exists semad_audit_date_idx on public.semad_audit(created_at desc);
create table if not exists public.semad_rate_limits(key text primary key,count integer not null,expires timestamptz not null);
create index if not exists semad_rate_expires_idx on public.semad_rate_limits(expires);

-- Rate limit compartilhado por todas as instâncias serverless, sem IP em claro.
create or replace function public.semad_rate(p_key text,p_limit integer) returns boolean language plpgsql set search_path='' as $$
declare n integer;
begin
 delete from public.semad_rate_limits where expires<now();
 insert into public.semad_rate_limits(key,count,expires) values(p_key,1,now()+interval '2 minutes')
 on conflict(key) do update set count=public.semad_rate_limits.count+1 returning count into n;
 return n<=p_limit;
end $$;

create or replace function public.semad_register(p_data jsonb) returns jsonb language plpgsql set search_path='' as $$
declare r public.semad_registrations;
begin
 if p_data->>'privacy' is distinct from 'true' then raise exception 'privacy_required'; end if;
 insert into public.semad_registrations(name,email,profile,course,institution,interests,marketing)
 values(p_data->>'name',lower(btrim(p_data->>'email')),p_data->>'profile',coalesce(p_data->>'course',''),coalesce(p_data->>'institution',''),coalesce(p_data->'interests','[]'::jsonb),coalesce((p_data->>'marketing')::boolean,false))
 on conflict(edition,email) do nothing returning * into r;
 if r.id is null then
  insert into public.semad_audit(action,subject,actor) values('duplicate_blocked','edition:2027','form');
  return jsonb_build_object('duplicate',true);
 end if;
 return jsonb_build_object('id',r.id,'name',r.name,'createdAt',r.created_at);
end $$;

create or replace function public.semad_overview() returns jsonb language sql set search_path='' as $$
 select jsonb_build_object('total',(select count(*) from public.semad_registrations),'duplicates',(select count(*) from public.semad_audit where action='duplicate_blocked'),'settings',coalesce((select jsonb_agg(to_jsonb(s)) from public.semad_activity_settings s),'[]'::jsonb));
$$;

create or replace function public.semad_list(p_activity text,p_query text,p_status text,p_page integer) returns jsonb language sql set search_path='' as $$
 with listing as (
 select r.id,r.name,r.email,r.profile,r.created_at,coalesce(a.status,'unchecked') status,a.checked_at,a.checked_by,c.id certificate_id,c.revoked,c.email_state
 from public.semad_registrations r
 left join public.semad_attendance a on a.registration_id=r.id and a.activity_id=p_activity
 left join public.semad_certificates c on c.registration_id=r.id and c.activity_id=p_activity
 ),filtered as (
 select * from listing where (strpos(lower(name),lower(p_query))>0 or strpos(email,lower(p_query))>0 or id::text=p_query) and (p_status='all' or status=p_status)
 ),paged as (select * from filtered order by name,id limit 50 offset greatest(0,least(p_page,10000))*50),
 summary as (select status,count(*) count from listing group by status)
 select jsonb_build_object('rows',coalesce((select jsonb_agg(to_jsonb(p)) from paged p),'[]'::jsonb),'summary',coalesce((select jsonb_agg(to_jsonb(s)) from summary s),'[]'::jsonb),'total',(select count(*) from filtered),'page',p_page);
$$;

create or replace function public.semad_set_settings(p_activity text,p_confirmed boolean,p_hours numeric,p_issuer text,p_actor text) returns void language plpgsql set search_path='' as $$
begin
 insert into public.semad_activity_settings(activity_id,confirmed,hours,issuer) values(p_activity,p_confirmed,p_hours,btrim(p_issuer))
 on conflict(activity_id) do update set confirmed=excluded.confirmed,hours=excluded.hours,issuer=excluded.issuer;
 insert into public.semad_audit(action,subject,actor) values('settings',p_activity,p_actor);
end $$;

create or replace function public.semad_set_attendance(p_id uuid,p_activity text,p_status text,p_actor text) returns void language plpgsql set search_path='' as $$
begin
 -- O registro de presença e sua eventual revogação são uma única transação.
 insert into public.semad_attendance(registration_id,activity_id,status,checked_by) values(p_id,p_activity,p_status,p_actor)
 on conflict(registration_id,activity_id) do update set status=excluded.status,checked_at=now(),checked_by=excluded.checked_by;
 if p_status<>'present' then update public.semad_certificates set revoked=true where registration_id=p_id and activity_id=p_activity; end if;
 insert into public.semad_audit(action,subject,actor) values('attendance:'||p_status,p_id::text||':'||p_activity,p_actor);
end $$;

create or replace function public.semad_issue(p_id uuid,p_activity text,p_actor text) returns jsonb language plpgsql set search_path='' as $$
declare s public.semad_activity_settings;a public.semad_attendance;c public.semad_certificates;r public.semad_registrations;
begin
 select * into a from public.semad_attendance where registration_id=p_id and activity_id=p_activity for update;
 if a.status is distinct from 'present' then raise exception 'presence_required';end if;
 select * into s from public.semad_activity_settings where activity_id=p_activity for share;
 if s.confirmed is distinct from true or s.hours<=0 or length(btrim(s.issuer))<3 then raise exception 'settings_required';end if;
 select * into c from public.semad_certificates where registration_id=p_id and activity_id=p_activity for update;
 if c.id is null then
  insert into public.semad_certificates(registration_id,activity_id,issued_by,issuer,hours) values(p_id,p_activity,p_actor,s.issuer,s.hours) returning * into c;
 elsif c.revoked then
  update public.semad_certificates set id=gen_random_uuid(),revoked=false,issued_at=now(),issued_by=p_actor,issuer=s.issuer,hours=s.hours,email_state='not_sent',email_error=null where id=c.id returning * into c;
 end if;
 select * into r from public.semad_registrations where id=p_id;
 insert into public.semad_audit(action,subject,actor) values('certificate:issue',p_id::text||':'||p_activity,p_actor);
 return to_jsonb(c)||jsonb_build_object('name',r.name,'email',r.email);
end $$;

create or replace function public.semad_get_certificate(p_id uuid) returns jsonb language sql set search_path='' as $$
 select to_jsonb(c)||jsonb_build_object('name',r.name)
 from public.semad_certificates c join public.semad_registrations r on r.id=c.registration_id
 join public.semad_attendance a on a.registration_id=c.registration_id and a.activity_id=c.activity_id
 where c.id=p_id and not c.revoked and a.status='present';
$$;

create or replace function public.semad_email_result(p_id uuid,p_state text,p_error text,p_actor text) returns void language plpgsql set search_path='' as $$
begin
 update public.semad_certificates set email_state=p_state,email_error=p_error where id=p_id;
 insert into public.semad_audit(action,subject,actor) values('certificate:send:'||p_state,p_id::text,p_actor);
end $$;

-- Sem leitura ou escrita direta pelo navegador, mesmo com um usuário autenticado.
-- Apenas o backend com a chave secreta pode acessar estes objetos.
do $$ declare t record;f record;begin
 for t in select tablename from pg_tables where schemaname='public' and tablename like 'semad\_%' escape '\' loop
  execute format('alter table public.%I enable row level security',t.tablename);
  execute format('revoke all on table public.%I from public, anon, authenticated',t.tablename);
  execute format('grant all on table public.%I to service_role',t.tablename);
 end loop;
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'semad\_%' escape '\' loop
  execute format('revoke all on function %s from public, anon, authenticated',f.signature);
  execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;

-- Prévia temática fornecida para a edição. Não confirma palestrantes, horas ou local.
insert into public.semad_activities(id,title,day) values
('dia15-1','A Administração na era da Inteligência Artificial',15),
('dia15-2','Da transformação digital à transformação das decisões',15),
('dia16-1','Liderança e competências em organizações orientadas por IA',16),
('dia16-2','O futuro do trabalho e o papel do administrador',16),
('dia17-1','Automação de processos: da rotina à geração de valor',17),
('dia17-2','Dados e inteligência artificial na tomada de decisão',17),
('dia18-1','IA, experiência do cliente e novas estratégias de negócio',18),
('dia18-2','Inovação e empreendedorismo na economia da inteligência',18),
('dia19-1','Ética, governança e responsabilidade no uso da IA',19),
('dia19-2','Conexões que transformam: perspectivas para o futuro da gestão',19)
on conflict(id) do nothing;
commit;
