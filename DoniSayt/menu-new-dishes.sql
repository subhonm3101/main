begin;

update public.menu_items
set price = 250, image_url = 'assets/optimized/new-medovik.webp', photo = true
where name = 'Медовик'
  and category = 'Торты'
  and price = 300
  and image_url = 'assets/optimized/medovik.webp';

with new_dishes (name, category, price, weight, description, image_url, sort_order) as (
  values
    ('Медовик', 'Торты', 250, 'Кусочек', 'Медовый торт с нежным кремом', 'assets/optimized/new-medovik.webp', 200),
    ('Соленья', 'Салаты', 150, 'Порция', 'Закуска — соленья', 'assets/optimized/new-pickles.webp', 201),
    ('Кимчи', 'Салаты', 100, 'Порция', 'Закуска — кимчи', 'assets/optimized/new-kimchi.webp', 202),
    ('Сузма', 'Салаты', 100, 'Порция', 'Закуска — сузма', 'assets/optimized/new-suzma.webp', 203),
    ('Овощи в томате', 'Салаты', 150, 'Порция', 'Закуска — овощи в томате', 'assets/optimized/new-tomato-vegetables.webp', 204),
    ('Морковь по-корейски', 'Салаты', 100, 'Порция', 'Закуска — морковь по-корейски', 'assets/optimized/new-korean-carrot.webp', 205),
    ('Ягодный пирог', 'Торты', 250, 'Кусочек', 'Ягодный пирог', 'assets/optimized/new-berry-pie.webp', 206),
    ('Орео', 'Торты', 250, 'Кусочек', 'Торт «Орео»', 'assets/optimized/new-oreo.webp', 207),
    ('Красный бархат', 'Торты', 250, 'Кусочек', 'Торт «Красный бархат»', 'assets/optimized/new-red-velvet.webp', 208),
    ('Пахлава · рулетики', 'Торты', 200, 'Порция', 'Восточная сладость — пахлава', 'assets/optimized/new-baklava-rolls.webp', 209),
    ('Пахлава · кусочек', 'Торты', 250, 'Кусочек', 'Восточная сладость — пахлава', 'assets/optimized/new-baklava-slice.webp', 210)
)
insert into public.menu_items (name, category, price, weight, description, image_url, photo, sort_order)
select name, category, price, weight, description, image_url, true, sort_order
from new_dishes dish
where not exists (
  select 1 from public.menu_items existing
  where lower(trim(existing.name)) = lower(trim(dish.name))
    and lower(trim(existing.category)) = lower(trim(dish.category))
);

commit;
