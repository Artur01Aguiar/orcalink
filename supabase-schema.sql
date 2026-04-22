-- ================================================
-- OrcaLink — Schema Supabase
-- Cole este SQL no SQL Editor do seu projeto Supabase
-- ================================================

-- Estende auth.users com perfil do prestador
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  profession text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  created_at timestamptz default now()
);

-- Formulários criados pelo prestador
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text unique not null,
  title text not null,
  description text,
  active boolean default true,
  show_badge boolean default true,
  created_at timestamptz default now()
);

-- Perguntas de cada formulário
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  order_index int not null default 0,
  type text not null check (type in ('single', 'multi', 'number')),
  label text not null,
  required boolean default false,
  options jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Orçamentos enviados pelos clientes
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  client_name text,
  client_contact text,
  answers jsonb not null default '{}'::jsonb,
  total_price numeric not null default 0,
  created_at timestamptz default now()
);

-- ================================================
-- RLS (Row Level Security)
-- ================================================

alter table public.profiles enable row level security;
alter table public.forms enable row level security;
alter table public.questions enable row level security;
alter table public.submissions enable row level security;

-- Profiles: cada usuário vê e edita apenas o próprio
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

-- Profile criado automaticamente ao signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Forms: dono gerencia tudo, público lê se ativo
create policy "forms_owner_all" on public.forms
  for all using (auth.uid() = user_id);

create policy "forms_public_read" on public.forms
  for select using (active = true);

-- Questions: dono gerencia, público lê se form ativo
create policy "questions_owner_all" on public.questions
  for all using (
    exists (
      select 1 from public.forms
      where forms.id = form_id and forms.user_id = auth.uid()
    )
  );

create policy "questions_public_read" on public.questions
  for select using (
    exists (
      select 1 from public.forms
      where forms.id = form_id and forms.active = true
    )
  );

-- Submissions: dono lê, qualquer um insere (cliente envia)
create policy "submissions_owner_read" on public.submissions
  for select using (
    exists (
      select 1 from public.forms
      where forms.id = form_id and forms.user_id = auth.uid()
    )
  );

create policy "submissions_public_insert" on public.submissions
  for insert with check (true);
