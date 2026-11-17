begin;

do $$
begin
  if not exists (
    select 1
    from public.menu_items
    where category = 'Плов'
      and replace(lower(trim(name)), ' ', '') in (
        'самаркандскийплов·2в1',
        'самаркандскийплов·2порции'
      )
  ) then
    raise exception 'Не найдена существующая позиция «Самаркандский плов · 2в1» или «Самаркандский плов · 2 порции». Изменения не сохранены.';
  end if;
end
$$;

update public.menu_items
set price = 500, sort_order = 0
where category = 'Плов'
  and lower(trim(name)) = lower('Самаркандский плов');

update public.menu_items
set price = 1000,
    image_url = 'assets/optimized/samarkand-plov-2-dark.webp',
    photo = true,
    sort_order = 1
where category = 'Плов'
  and replace(lower(trim(name)), ' ', '') in (
    'самаркандскийплов·2в1',
    'самаркандскийплов·2порции'
  );

update public.menu_items
set sort_order = 4
where category = 'Плов'
  and lower(trim(name)) = lower('Плов от «Дони»');

with plov_portions (name, price, weight, description, image_url, sort_order) as (
  values
    ('Самаркандский плов · 3 порции', 1500, '3 порции', 'Самаркандский плов с мясом и восточными специями — на 3 порции', 'assets/optimized/samarkand-plov-3-dark.webp', 2),
    ('Самаркандский плов · 4 порции', 2000, '4 порции', 'Самаркандский плов с мясом и восточными специями — на 4 порции', 'assets/optimized/samarkand-plov-4-dark.webp', 3),
    ('Плов от «Дони» · 2 порции', 1200, '2 порции', 'Фирменный плов от «Дони» с мясом и восточными специями — на 2 порции', 'assets/optimized/doni-plov-2-dark.webp', 5),
    ('Плов от «Дони» · 3 порции', 1800, '3 порции', 'Фирменный плов от «Дони» с мясом и восточными специями — на 3 порции', 'assets/optimized/doni-plov-3-dark.webp', 6),
    ('Плов от «Дони» · 4 порции', 2400, '4 порции', 'Фирменный плов от «Дони» с мясом и восточными специями — на 4 порции', 'assets/optimized/doni-plov-4-dark.webp', 7)
)
update public.menu_items as existing
set price = portion.price,
    weight = portion.weight,
    description = portion.description,
    image_url = portion.image_url,
    photo = true,
    sort_order = portion.sort_order
from plov_portions as portion
where existing.category = 'Плов'
  and lower(trim(existing.name)) = lower(trim(portion.name));

with plov_portions (name, price, weight, description, image_url, sort_order) as (
  values
    ('Самаркандский плов · 3 порции', 1500, '3 порции', 'Самаркандский плов с мясом и восточными специями — на 3 порции', 'assets/optimized/samarkand-plov-3-dark.webp', 2),
    ('Самаркандский плов · 4 порции', 2000, '4 порции', 'Самаркандский плов с мясом и восточными специями — на 4 порции', 'assets/optimized/samarkand-plov-4-dark.webp', 3),
    ('Плов от «Дони» · 2 порции', 1200, '2 порции', 'Фирменный плов от «Дони» с мясом и восточными специями — на 2 порции', 'assets/optimized/doni-plov-2-dark.webp', 5),
    ('Плов от «Дони» · 3 порции', 1800, '3 порции', 'Фирменный плов от «Дони» с мясом и восточными специями — на 3 порции', 'assets/optimized/doni-plov-3-dark.webp', 6),
    ('Плов от «Дони» · 4 порции', 2400, '4 порции', 'Фирменный плов от «Дони» с мясом и восточными специями — на 4 порции', 'assets/optimized/doni-plov-4-dark.webp', 7)
)
insert into public.menu_items (name, category, price, weight, description, image_url, photo, sort_order)
select portion.name, 'Плов', portion.price, portion.weight, portion.description, portion.image_url, true, portion.sort_order
from plov_portions as portion
where not exists (
  select 1
  from public.menu_items as existing
  where existing.category = 'Плов'
    and lower(trim(existing.name)) = lower(trim(portion.name))
);

commit;
