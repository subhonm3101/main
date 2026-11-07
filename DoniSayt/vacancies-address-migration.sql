alter table public.vacancies
  add column if not exists address text not null default '' check (char_length(address) <= 200);

drop policy if exists "Admins update vacancy address" on public.vacancies;
create policy "Admins update vacancy address" on public.vacancies
  for update to authenticated
  using (public.is_donishef_admin())
  with check (public.is_donishef_admin());

grant update (address) on public.vacancies to authenticated;
