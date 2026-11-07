alter table public.orders enable row level security;

drop policy if exists "Admins delete orders" on public.orders;
create policy "Admins delete orders" on public.orders
  for delete to authenticated
  using (public.is_donishef_admin());

grant delete on public.orders to authenticated;
