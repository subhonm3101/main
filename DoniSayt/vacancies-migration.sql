create table if not exists public.vacancies (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 120),
  salary text not null default '' check (char_length(salary) <= 120),
  description text not null check (char_length(trim(description)) between 1 and 2000),
  address text not null default '' check (char_length(address) <= 200),
  created_at timestamptz not null default now()
);

alter table public.vacancies enable row level security;
alter table public.vacancies add column if not exists address text not null default '' check (char_length(address) <= 200);

drop policy if exists "Public can read vacancies" on public.vacancies;
create policy "Public can read vacancies" on public.vacancies
  for select to anon, authenticated using (true);

drop policy if exists "Admins add vacancies" on public.vacancies;
create policy "Admins add vacancies" on public.vacancies
  for insert to authenticated with check (public.is_donishef_admin());

drop policy if exists "Admins update vacancy address" on public.vacancies;
create policy "Admins update vacancy address" on public.vacancies
  for update to authenticated using (public.is_donishef_admin()) with check (public.is_donishef_admin());

drop policy if exists "Admins delete vacancies" on public.vacancies;
create policy "Admins delete vacancies" on public.vacancies
  for delete to authenticated using (public.is_donishef_admin());

revoke all on table public.vacancies from public, anon, authenticated;
grant select on public.vacancies to anon, authenticated;
grant insert, delete on public.vacancies to authenticated;
grant update (address) on public.vacancies to authenticated;
