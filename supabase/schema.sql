create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'user_role'
  ) then
    create type public.user_role as enum ('citizen', 'admin');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'complaint_status'
  ) then
    create type public.complaint_status as enum ('pending', 'under_investigation', 'resolved');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.sync_complaint_state()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());

  if new.status = 'resolved' and new.resolved_at is null then
    new.resolved_at = timezone('utc', now());
  elsif new.status <> 'resolved' then
    new.resolved_at = null;
  end if;

  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique check (position('@' in email) > 1),
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  role public.user_role not null default 'citizen',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid not null references public.users (id) on delete cascade,
  title varchar(160) not null check (char_length(trim(title)) between 4 and 160),
  category varchar(80) not null check (char_length(trim(category)) between 3 and 80),
  description text not null check (char_length(trim(description)) between 20 and 5000),
  incident_date date not null,
  status public.complaint_status not null default 'pending',
  evidence_bucket text not null default 'complaint-evidence',
  evidence_path text,
  reviewed_by uuid references public.users (id) on delete set null,
  submitted_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  constraint complaints_resolution_consistency check (
    (status = 'resolved' and resolved_at is not null)
    or (status <> 'resolved' and resolved_at is null)
  )
);

create table if not exists public.complaint_notes (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints (id) on delete cascade,
  author_id uuid not null references public.users (id) on delete cascade,
  note text not null check (char_length(trim(note)) between 4 and 4000),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_users_role on public.users (role);
create index if not exists idx_complaints_citizen_id on public.complaints (citizen_id);
create index if not exists idx_complaints_status on public.complaints (status);
create index if not exists idx_complaints_submitted_at on public.complaints (submitted_at desc);
create index if not exists idx_complaint_notes_complaint_id on public.complaint_notes (complaint_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Citizen'
    )
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

drop trigger if exists sync_complaints_state on public.complaints;
create trigger sync_complaints_state
  before update on public.complaints
  for each row execute procedure public.sync_complaint_state();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-evidence',
  'complaint-evidence',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table public.users enable row level security;
alter table public.users force row level security;

alter table public.complaints enable row level security;
alter table public.complaints force row level security;

alter table public.complaint_notes enable row level security;
alter table public.complaint_notes force row level security;

revoke all on public.users from anon, authenticated;
revoke all on public.complaints from anon, authenticated;
revoke all on public.complaint_notes from anon, authenticated;

grant usage on schema public to service_role;
grant all on public.users to service_role;
grant all on public.complaints to service_role;
grant all on public.complaint_notes to service_role;

grant select on public.users to authenticated;
grant update (full_name) on public.users to authenticated;

grant select, insert on public.complaints to authenticated;

grant select, insert on public.complaint_notes to authenticated;

drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
  on public.users
  for select
  using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.users;
create policy "Admins can view all profiles"
  on public.users
  for select
  using (public.is_admin());

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins can update all profiles" on public.users;
create policy "Admins can update all profiles"
  on public.users
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Citizens can view their own complaints" on public.complaints;
create policy "Citizens can view their own complaints"
  on public.complaints
  for select
  using (citizen_id = auth.uid());

drop policy if exists "Admins can view all complaints" on public.complaints;
create policy "Admins can view all complaints"
  on public.complaints
  for select
  using (public.is_admin());

drop policy if exists "Citizens can create complaints" on public.complaints;
create policy "Citizens can create complaints"
  on public.complaints
  for insert
  with check (citizen_id = auth.uid());

drop policy if exists "Admins can update complaints" on public.complaints;
create policy "Admins can update complaints"
  on public.complaints
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view notes" on public.complaint_notes;
create policy "Admins can view notes"
  on public.complaint_notes
  for select
  using (public.is_admin());

drop policy if exists "Admins can create notes" on public.complaint_notes;
create policy "Admins can create notes"
  on public.complaint_notes
  for insert
  with check (public.is_admin() and author_id = auth.uid());

drop policy if exists "Users can read their own evidence" on storage.objects;
create policy "Users can read their own evidence"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'complaint-evidence'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

drop policy if exists "Users can upload their own evidence" on storage.objects;
create policy "Users can upload their own evidence"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'complaint-evidence'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

drop policy if exists "Users can update their own evidence" on storage.objects;
create policy "Users can update their own evidence"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'complaint-evidence'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  )
  with check (
    bucket_id = 'complaint-evidence'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

drop policy if exists "Users can delete their own evidence" on storage.objects;
create policy "Users can delete their own evidence"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'complaint-evidence'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );
