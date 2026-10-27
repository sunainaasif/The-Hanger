-- Run in the Supabase SQL Editor (safe to re-run).
-- Creates a profiles row whenever a user signs up (e.g. with Google).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (profile_id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (profile_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users who signed up before the trigger existed.
insert into public.profiles (profile_id, full_name)
select id, raw_user_meta_data ->> 'full_name' from auth.users
on conflict (profile_id) do nothing;

-- Let signed-in users read and update only their own profile.
alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated using (profile_id = (select auth.uid()));

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
