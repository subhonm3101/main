const asset = name => `assets/optimized/${name.replace(/\.jpg$/i, '.webp')}`;
const RESTAURANT_WHATSAPP = '79373231005';
const menu = [
  {id:1,name:'Самаркандский плов',cat:'Плов',price:550,weight:'450 г',desc:'Рассыпчатый рис с мясом, морковью и восточными специями',servingNote:'К ПЛОВУ БЕСПЛАТНО: ЛЕПЁШКА И САЛАТ ИЗ КАПУСТЫ (50 Г)',tag:'ХИТ',image:asset('restaurant-plov-hero.webp'),photo:true},
  {id:2,name:'Баранья ножка',cat:'Вторые блюда',price:700,weight:'350 г',desc:'Томлёная баранья ножка с нежным пюре',image:asset('codex-clipboard-4f0581d2-d360-43f4-b783-721bb5d96eea.jpg')},
  {id:3,name:'Курутоб',cat:'Вторые блюда',price:600,weight:'600 г',desc:'Таджикское блюдо из лепёшки фатир с курутом, зеленью, овощами и мясом',recipe:'Курут — сушёный солёный кисломолочный сыр — размачивают в воде до соуса. Им пропитывают кусочки лепёшки фатир и добавляют зелень и овощи. В версии DoniШеф блюдо подают с мясом.',image:asset('codex-clipboard-93cab4db-966f-4519-8c7b-c31c1e08551d.jpg')},
  {id:4,name:'Форель с фри',cat:'Вторые блюда',price:800,weight:'350 г',desc:'Форель на гриле, картофель и свежий салат',image:asset('codex-clipboard-9942fb19-acb9-433f-9987-922204aa2484.jpg')},
  {id:5,name:'Лагман',cat:'Первые блюда',price:500,weight:'400 г',desc:'Сытный суп с лапшой и мясом',image:asset('restaurant-lagman.webp'),photo:true},
  {id:6,name:'Наггетсы с фри',cat:'Детское меню',price:500,weight:'250 г',desc:'Куриные наггетсы с картофелем фри',image:asset('restaurant-kids.webp'),photo:true},
  {id:7,name:'Казан-кебаб · говядина',cat:'Вторые блюда',price:600,weight:'400 г',desc:'Нежная говядина с картофелем по-восточному',image:asset('codex-clipboard-212eb699-02ea-4007-a619-1a4bea8b73d0.jpg')},
  {id:8,name:'Казан-кебаб · баранина',cat:'Вторые блюда',price:650,weight:'400 г',desc:'Баранина, картофель и ароматный лук',image:asset('codex-clipboard-b499d369-0ca4-49ef-a07e-b6d30f356a8c.jpg')},
  {id:9,name:'Манты',cat:'Вторые блюда',price:550,weight:'300 г',desc:'Домашние манты со сметаной',tag:'ПОПУЛЯРНОЕ',image:asset('codex-clipboard-1ba49306-bbdf-42a0-9c37-b2e30605f665.jpg')},
  {id:10,name:'Чахохбили с пюре',cat:'Вторые блюда',price:550,weight:'400 г',desc:'Курица в насыщенном соусе с пюре',image:asset('codex-clipboard-5c6b655c-e1c6-4541-98d1-32a0fc8fefa6.jpg')},
  {id:11,name:'Котлеты с пюре',cat:'Вторые блюда',price:550,weight:'350 г',desc:'Домашние котлеты и картофельное пюре',image:asset('codex-clipboard-7227da99-1517-4677-8ea2-65a518cf4061.jpg')},
  {id:12,name:'Мастава',cat:'Первые блюда',price:500,weight:'400 г',desc:'Ароматный томатный суп с мясом',image:asset('restaurant-shurpa.webp'),photo:true},
  {id:15,name:'Пельмени',cat:'Первые блюда',price:500,weight:'350 г',desc:'Пельмени в прозрачном бульоне',image:asset('codex-clipboard-812e52f6-a1bb-4226-adb6-409bc1cd29c4.jpg')},
  {id:16,name:'Чечевичный суп',cat:'Первые блюда',price:300,weight:'300 г',desc:'Нежный крем-суп с хрустящими гренками',image:asset('codex-clipboard-cdbfd1aa-65ed-4d00-858f-ddca54f41f9d.jpg')},
  {id:17,name:'Плов от «Дони»',cat:'Плов',price:600,weight:'450 г',desc:'Фирменный плов DoniШеф с мясом и восточными специями',servingNote:'К ПЛОВУ БЕСПЛАТНО: ЛЕПЁШКА И САЛАТ ИЗ КАПУСТЫ (50 Г)',tag:'ФИРМЕННОЕ',image:asset('codex-clipboard-d1e7e094-41d7-4c46-91b1-37643d621b62.jpg')},
  {id:27,name:'Самаркандский плов · 2 порции',cat:'Плов',price:1200,weight:'2 порции',desc:'Фирменный плов DoniШеф с мясом и восточными специями — две порции',servingNote:'К ПЛОВУ БЕСПЛАТНО: ЛЕПЁШКА И САЛАТ ИЗ КАПУСТЫ (50 Г)',image:asset('restaurant-plov-bowl.webp'),photo:true},
  {id:20,name:'Картофель фри',cat:'Гарниры',price:150,weight:'150 г',desc:'Хрустящий золотистый картофель',image:asset('codex-clipboard-76e1df82-704e-49ea-90e4-d75cc3bba09b.jpg')},
  {id:21,name:'Салат с баклажанами',cat:'Салаты',price:550,weight:'250 г',desc:'Овощи, баклажаны и хрустящий сыр',image:asset('restaurant-salad.webp'),photo:true},
  {id:22,name:'Цезарь с курицей',cat:'Салаты',price:450,weight:'250 г',desc:'Куриное филе, салат, томаты и пармезан',image:asset('codex-clipboard-13c0ebca-21fc-4387-b8a7-fe8ab47c74d5.jpg')},
  {id:23,name:'Самаркандский плов · полпорции',cat:'Полпорции',price:350,weight:'½ порции',desc:'Половина порции Самаркандского плова с мясом и восточными специями',servingNote:'К ПЛОВУ БЕСПЛАТНО: ЛЕПЁШКА И САЛАТ ИЗ КАПУСТЫ (50 Г)',image:asset('half-samarkand-plov.webp'),photo:true},
  {id:24,name:'Бешбармак',cat:'Вторые блюда',price:800,weight:'Порция',desc:'Бешбармак с мясом, домашней лапшой и луком',image:asset('beshbarmak.webp'),photo:true},
  {id:25,name:'Кёфта с фри',cat:'Вторые блюда',price:700,weight:'Порция',desc:'Кёфта на гриле с картофелем фри, зеленью и соусом',image:asset('kofta-fries.webp'),photo:true},
  {id:26,name:'Шурпа · говядина',cat:'Первые блюда',price:500,weight:'400 г',desc:'Наваристый бульон с говядиной и овощами',image:asset('beef-shurpa.webp'),photo:true},
  {id:28,name:'Лагман · полпорции',cat:'Полпорции',price:350,weight:'½ порции',desc:'Половина порции лагмана с лапшой и мясом',image:asset('restaurant-lagman.webp'),photo:true},
  {id:29,name:'Мастава · полпорции',cat:'Полпорции',price:350,weight:'½ порции',desc:'Половина порции ароматной маставы с мясом',image:asset('restaurant-shurpa.webp'),photo:true},
  {id:30,name:'Пельмени · полпорции',cat:'Полпорции',price:350,weight:'½ порции',desc:'Половина порции пельменей в прозрачном бульоне',image:asset('codex-clipboard-812e52f6-a1bb-4226-adb6-409bc1cd29c4.jpg')},
  {id:31,name:'Шурпа · говядина · полпорции',cat:'Полпорции',price:350,weight:'½ порции',desc:'Половина порции наваристой шурпы с говядиной и овощами',image:asset('beef-shurpa.webp'),photo:true},
  {id:32,name:'Жареный лагман',cat:'Вторые блюда',price:600,weight:'Порция',desc:'Лапша, обжаренная с мясом и овощами',image:asset('fried-lagman.webp'),photo:true},
  {id:33,name:'Куриные крылышки на мангале',cat:'Мангал',price:450,weight:'Порция',desc:'Куриные крылышки, приготовленные на мангале',image:asset('shashlik-chicken-wings.webp'),photo:true},
  {id:34,name:'Шашлык на мангале',cat:'Мангал',price:500,weight:'Порция',desc:'Шашлык с луком и соусом',image:asset('shashlik-meat.webp'),photo:true},
  {id:35,name:'Картофель на мангале',cat:'Мангал',price:300,weight:'Порция',desc:'Картофель, приготовленный на мангале',image:asset('grill-potatoes.webp'),photo:true},
  {id:36,name:'Бараньи рёбрышки',cat:'Мангал',price:500,weight:'Порция',desc:'Бараньи рёбрышки с овощами и соусом',image:asset('lamb-ribs.webp'),photo:true},
  {id:37,name:'Куриный шашлык',cat:'Мангал',price:400,weight:'Порция',desc:'Куриное мясо, приготовленное на мангале',image:asset('chicken-shashlik.webp'),photo:true},
  {id:38,name:'Шашлык с овощами',cat:'Мангал',price:450,weight:'Порция',desc:'Шашлык с овощами, приготовленный на мангале',image:asset('beef-shashlik.webp'),photo:true},
  {id:39,name:'Люля-кебаб',cat:'Мангал',price:400,weight:'Порция',desc:'Люля-кебаб на мангале с овощами и соусом',image:asset('lula-kebab.webp'),photo:true},
  {id:40,name:'RC Cola',cat:'Напитки',price:200,weight:'1 л',desc:'Газированный напиток',image:asset('rc-cola.webp'),photo:true},
  {id:41,name:'Натахтари · вкус на выбор',cat:'Напитки',price:150,weight:'Бутылка',desc:'Лимонад Натахтари. Вкус уточняйте при заказе',image:asset('natakhtari.webp'),photo:true},
  {id:42,name:'Ассорти тортов',cat:'Торты',price:300,weight:'Кусочек',desc:'Выбор тортов уточняйте при заказе',image:asset('assorted-cakes.webp'),photo:true},
  {id:43,name:'Медовик',cat:'Торты',price:300,weight:'Кусочек',desc:'Медовый торт с нежным кремом',image:asset('medovik.webp'),photo:true},
  {id:44,name:'Турецкая пахлава',cat:'Торты',price:300,weight:'Порция',desc:'Турецкая пахлава',image:asset('owner-desserts.webp'),photo:true}
];

const fmt = value => `${value.toLocaleString('ru-RU')} ₽`;
const complimentaryLavash = 'ЛЕПЁШКА В ПОДАРОК К КАЖДОМУ БЛЮДУ';
const servingNoteFor = item => item.servingNote || (['Напитки', 'Торты', 'Салаты', 'Гарниры', 'Детское меню'].includes(item.cat) ? '' : complimentaryLavash);
document.documentElement.classList.add('js');
document.querySelectorAll('.logo').forEach(logo => {
  const name = logo.querySelector('.logo-name');
  const tagline = logo.querySelector('small');
  const copy = document.createElement('span');
  const mark = document.createElement('img');
  copy.className = 'brand-copy';
  mark.className = 'brand-mark';
  mark.src = 'assets/brand-logo.webp';
  mark.alt = '';
  mark.setAttribute('aria-hidden', 'true');
  name.replaceWith(copy);
  copy.append(name, tagline);
  logo.prepend(mark);
});
const heroPhoto = document.querySelector('.hero-image img');
heroPhoto.src = asset('restaurant-plov-bowl.webp');
heroPhoto.alt = 'Фирменный плов от «Дони» на традиционном блюде';
heroPhoto.classList.add('photo-real');
const aboutPhoto = document.querySelector('.about-art img');
aboutPhoto.src = asset('restaurant-feast.webp');
aboutPhoto.alt = 'Восточные блюда DoniШеф, поданные к общему столу';
aboutPhoto.classList.add('photo-real');
const deliveryPhoto = document.querySelector('.delivery-photo');
deliveryPhoto.src = asset('restaurant-plov-bowl.webp');
deliveryPhoto.alt = 'Плов DoniШеф на традиционном блюде';
deliveryPhoto.classList.add('photo-real');
const categoryNames = {'Плов': 'Пловы', 'Первые блюда': 'Супы', Мангал: 'Шашлыки'};
const inquiryCategories = ['Выпечка'];
const inquiryCards = {
  'Выпечка': {
    cards: [
      {
        title: 'Самса с говядиной',
        description: 'Самса с говядиной из галереи владельца в 2ГИС.',
        image: asset('owner-beef-samsa.webp'),
        alt: 'Самса с говядиной из галереи владельца в 2ГИС',
        price: '120 ₽'
      },
      
    ]
  }
};
const categoryOrder = ['Плов', 'Первые блюда', 'Вторые блюда', 'Мангал', 'Гарниры', 'Детское меню', 'Салаты', 'Полпорции', ...inquiryCategories, 'Торты', 'Напитки'];
const categoryRank = new Map(categoryOrder.map((category, index) => [category, index]));
const secondCourseOrder = new Map([24, 3, 4, 25, 32, 2, 7, 8, 9, 10, 11].map((id, index) => [id, index]));
const availableCategories = new Set([...menu.map(item => item.cat), ...inquiryCategories]);
const cats = ['Все', ...categoryOrder.filter(category => availableCategories.delete(category)), ...availableCategories];
const grid = document.getElementById('menuGrid');
const categories = document.getElementById('categories');
const search = document.getElementById('search');
const empty = document.getElementById('empty');
let activeCat = 'Все';
let cart = [];
try {
  const savedCart = JSON.parse(localStorage.getItem('donishef-cart') || '[]');
  if (!Array.isArray(savedCart)) throw new TypeError('Сохранённая корзина должна быть списком.');
  cart = savedCart.filter(row => row && Number.isInteger(row.id) && Number.isSafeInteger(row.qty) && row.qty > 0 && menu.some(item => item.id === row.id));
} catch (error) {
  console.error('Не удалось загрузить сохранённую корзину.', error);
}

categories.innerHTML = cats.map(cat => `<button type="button" class="category ${cat === 'Все' ? 'active' : ''}" data-cat="${cat}" aria-pressed="${cat === 'Все'}">${categoryNames[cat] || cat}</button>`).join('');
search.setAttribute('aria-label', 'Найти блюдо в меню');
empty.setAttribute('role', 'status');
categories.addEventListener('click', event => { const button = event.target.closest('.category'); if (!button) return; activeCat = button.dataset.cat; document.querySelectorAll('.category').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); }); renderMenu(); });
search.addEventListener('input', renderMenu);

function renderMenu() {
  const query = search.value.trim().toLowerCase();
  if (inquiryCategories.includes(activeCat)) {
    document.getElementById('portionNote').hidden = true;
    grid.classList.add('inquiry-grid');
    const cards = inquiryCards[activeCat].cards.filter(card => !query || `${activeCat} ${card.title} ${card.description}`.toLowerCase().includes(query));
    grid.innerHTML = cards.map(card => `<article class="menu-card inquiry-card${card.image ? ' inquiry-card-photo' : ''}">${card.image ? `<img src="${card.image}" alt="${card.alt}" loading="lazy">` : '<div class="inquiry-card-art" aria-hidden="true"><span>К ПРАЗДНИЧНОМУ СТОЛУ</span></div>'}<div class="menu-info"><h3>${card.title}</h3><p>${card.description}</p>${card.price ? `<span class="inquiry-price">${card.price}</span>` : ''}<a class="inquiry-phone" href="tel:+79373231005">Уточнить по телефону <span>→</span></a></div></article>`).join('');
    empty.style.display = cards.length ? 'none' : 'block';
    empty.textContent = 'Ничего не найдено. Попробуйте другое название.';
    return;
  }
  grid.classList.remove('inquiry-grid');
  const items = menu.filter(item => (activeCat === 'Все' || item.cat === activeCat) && (!query || `${item.name} ${item.cat} ${item.desc}`.toLowerCase().includes(query)));
  if (activeCat === 'Все' || activeCat === 'Вторые блюда') {
    items.sort((first, second) => {
      const categoryDifference = activeCat === 'Все' ? categoryRank.get(first.cat) - categoryRank.get(second.cat) : 0;
      if (categoryDifference) return categoryDifference;
      if (first.cat !== 'Вторые блюда') return 0;
      return secondCourseOrder.get(first.id) - secondCourseOrder.get(second.id);
    });
  }
  const portionNote = document.getElementById('portionNote');
  portionNote.hidden = activeCat !== 'Полпорции' || items.length === 0;
  empty.style.display = items.length ? 'none' : 'block';
  empty.textContent = 'Не нашли такое блюдо. Попробуйте другое название.';
 grid.innerHTML = items.map(item => `<article class="menu-card reveal visible">${item.tag ? `<span class="tag">${item.tag}</span>` : ''}<div class="food-image${item.photo ? ' real-photo' : ''}"><button class="food-photo-trigger" type="button" data-detail-id="${item.id}" aria-label="Подробнее о блюде «${item.name}»"><img class="${item.photo ? 'photo-real' : ''}" src="${item.image}" alt="${item.name}" loading="lazy"></button></div><div class="menu-info"><h3>${item.name}</h3>${servingNoteFor(item) ? `<p class="menu-included">${servingNoteFor(item)}</p>` : ''}<p>${item.desc} · ${item.weight}</p> <div class="menu-bottom"><span class="price">${fmt(item.price)}</span><button class="add" data-id="${item.id}" aria-label="Добавить одну порцию ${item.name} в корзину">+</button></div></div></article>`).join('');
}
const dishModal = document.createElement('div');
dishModal.className = 'modal dish-modal';
dishModal.setAttribute('role', 'dialog');
dishModal.setAttribute('aria-modal', 'true');
dishModal.setAttribute('aria-labelledby', 'dishModalTitle');
dishModal.innerHTML = '<div class="modal-box dish-modal-box"><button class="modal-close" type="button" aria-label="Закрыть">×</button><img class="dish-modal-image" alt=""><div class="dish-modal-copy"><p class="eyebrow">ИЗ МЕНЮ DONIШЕФ</p><h2 id="dishModalTitle"></h2><p class="dish-modal-included" hidden></p><p class="dish-modal-description"></p><section class="dish-modal-recipe" hidden><h3>Основа блюда</h3><p></p></section><span class="dish-modal-weight"></span><div class="dish-modal-actions"><b class="dish-modal-price"></b><button class="btn btn-primary" type="button">Добавить 1 порцию</button></div></div></div>';
document.body.append(dishModal);
let dishReturnFocus;
let selectedDish;
const dishImage = dishModal.querySelector('.dish-modal-image');
function closeDishModal() {
 dishModal.classList.remove('show');
 if (dishReturnFocus instanceof HTMLElement) dishReturnFocus.focus();
}
function openDishModal(id, trigger) {
 selectedDish = menu.find(item => item.id === id);
 if (!selectedDish) throw new Error(`Не найдено блюдо с id ${id}.`);
 dishReturnFocus = trigger;
 dishImage.src = selectedDish.image;
 dishImage.alt = selectedDish.name;
 dishImage.classList.toggle('photo-real', Boolean(selectedDish.photo));
 dishModal.querySelector('#dishModalTitle').textContent = selectedDish.name;
 const included = dishModal.querySelector('.dish-modal-included');
 included.textContent = servingNoteFor(selectedDish);
 included.hidden = !included.textContent;
 dishModal.querySelector('.dish-modal-description').textContent = selectedDish.desc;
 const recipe = dishModal.querySelector('.dish-modal-recipe');
 recipe.hidden = !selectedDish.recipe;
 recipe.querySelector('p').textContent = selectedDish.recipe || '';
 dishModal.querySelector('.dish-modal-weight').textContent = selectedDish.weight;
 dishModal.querySelector('.dish-modal-price').textContent = fmt(selectedDish.price);
 dishModal.classList.add('show');
 dishModal.querySelector('.modal-close').focus();
}

const branchMap = document.getElementById('branchMap');
if (!branchMap) throw new Error('Не найдена область карты филиалов.');
branchMap.setAttribute('aria-label', 'Карта филиалов DoniШеф в Уфе на 2ГИС');

const mapOptions = {
 pos: {lat: 54.747514055472074, lon: 55.944442749023445, zoom: 13},
 opt: {city: 'ufa'},
 org: '70000001096901951,70000001081850665,70000001038941933'
};
const mapFrame = document.createElement('iframe');
mapFrame.className = 'branch-map-frame';
mapFrame.title = 'Карта филиалов DoniШеф в Уфе на 2ГИС';
mapFrame.loading = 'lazy';
mapFrame.referrerPolicy = 'strict-origin-when-cross-origin';
mapFrame.src = `https://widgets.2gis.com/widget?type=firmsonmap&options=${encodeURIComponent(JSON.stringify(mapOptions))}`;

const mapFallback = document.createElement('a');
mapFallback.className = 'map-fallback-link';
mapFallback.href = 'https://2gis.ru/ufa/profiles/70000001096901951,70000001081850665,70000001038941933/center/55.944442749023445,54.747514055472074/zoom/13';
mapFallback.target = '_blank';
mapFallback.rel = 'noopener';
mapFallback.textContent = 'Не открывается карта? Открыть филиалы в 2ГИС ↗';

branchMap.replaceChildren(mapFrame, mapFallback);

dishModal.querySelector('.modal-close').addEventListener('click', closeDishModal);
dishModal.addEventListener('click', event => {
 if (event.target === dishModal) closeDishModal();
});
 dishModal.querySelector('.dish-modal-actions button').addEventListener('click', () => {
 const id = selectedDish.id;
 closeDishModal();
 addToCart(id);
});
dishModal.addEventListener('keydown', event => {
 if (event.key !== 'Tab') return;
 const focusable = [...dishModal.querySelectorAll('button:not([disabled])')];
 const first = focusable[0];
 const last = focusable[focusable.length - 1];
 if (event.shiftKey && document.activeElement === first) {
   event.preventDefault();
   last.focus();
 } else if (!event.shiftKey && document.activeElement === last) {
   event.preventDefault();
   first.focus();
 }
});
const videoSources = [
 ['atmosphere-lounge.mp4', 'atmosphere-lounge-poster.webp'],
 ['atmosphere-hall.mp4', 'atmosphere-hall-poster.webp'],
 ['atmosphere-grill.mp4', 'atmosphere-grill-poster.webp']
];
document.querySelectorAll('.video-card video').forEach((video, index) => {
 const source = video.querySelector('source');
 if (!videoSources[index]) throw new Error(`Не настроено видео с индексом ${index}.`);
 source.src = asset(videoSources[index][0]);
 video.poster = asset(videoSources[index][1]);
 video.muted = true;
 video.loop = true;
 video.playsInline = true;
 video.preload = 'none';
 video.load();
});
grid.addEventListener('click', event => {
  const trigger = event.target.closest('[data-detail-id]');
  if (trigger) {
    openDishModal(Number(trigger.dataset.detailId), trigger);
    return;
  }
  const button = event.target.closest('.add');
  if (button) addToCart(Number(button.dataset.id));
});
function addToCart(id) { const row = cart.find(item => item.id === id); row ? row.qty++ : cart.push({id, qty: 1}); saveCart(); }
function saveCart() {
  try {
    localStorage.setItem('donishef-cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Не удалось сохранить корзину в этом браузере.', error);
  }
  renderCart();
}

const cartEl = document.getElementById('cart'); const overlay = document.getElementById('overlay');
const cartButton = document.getElementById('openCart');
const closeCartButton = document.getElementById('closeCart');
let cartReturnFocus;
cartEl.setAttribute('role', 'dialog');
cartEl.setAttribute('aria-modal', 'true');
cartEl.setAttribute('aria-hidden', 'true');
cartButton.setAttribute('aria-controls', 'cart');
cartButton.setAttribute('aria-expanded', 'false');
document.getElementById('cartCount').setAttribute('aria-live', 'polite');
function openCart() {
  if (cartEl.classList.contains('open')) return;
  cartReturnFocus = document.activeElement;
  cartEl.classList.add('open');
  cartEl.setAttribute('aria-hidden', 'false');
  cartButton.setAttribute('aria-expanded', 'true');
  overlay.classList.add('show');
  renderCart();
  closeCartButton.focus();
}
function closeCart() {
  cartEl.classList.remove('open');
  cartEl.setAttribute('aria-hidden', 'true');
  cartButton.setAttribute('aria-expanded', 'false');
  overlay.classList.remove('show');
  if (cartReturnFocus instanceof HTMLElement) cartReturnFocus.focus();
}
cartEl.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const focusable = [...cartEl.querySelectorAll('button:not([disabled])')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
overlay.setAttribute('aria-hidden', 'true');
document.getElementById('openCart').onclick = openCart; document.getElementById('closeCart').onclick = closeCart; overlay.onclick = closeCart;
function renderCart() {
  const itemsEl = document.getElementById('cartItems'); const count = cart.reduce((total, row) => total + row.qty, 0); document.getElementById('cartCount').textContent = count;
  const mobileOrder = document.getElementById('mobileOrder');
  mobileOrder.textContent = count ? `Корзина · ${fmt(cart.reduce((sum, row) => sum + menu.find(item => item.id === row.id).price * row.qty, 0))}` : 'Заказать';
  mobileOrder.setAttribute('aria-label', count ? `Открыть корзину, ${count} товаров` : 'Перейти к меню');
  if (!cart.length) { itemsEl.innerHTML = '<div style="text-align:center;padding:65px 15px;color:#756961"><div style="font-size:42px">✦</div><h3>Корзина пуста</h3><p>Добавьте что-нибудь вкусное из меню.</p></div>'; document.getElementById('cartTotal').textContent = '0 ₽'; return; }
  let total = 0;
  itemsEl.innerHTML = cart.map(row => { const item = menu.find(entry => entry.id === row.id); total += item.price * row.qty; return `<div class="cart-row"><div class="cart-icon"><img src="${item.image}" alt=""></div><div><h4>${item.name}</h4><small>${fmt(item.price)}</small><div class="qty"><button data-act="minus" data-id="${item.id}" aria-label="Убрать">−</button><b>${row.qty}</b><button data-act="plus" data-id="${item.id}" aria-label="Добавить">+</button></div></div><div class="cart-price">${fmt(item.price * row.qty)}</div></div>`; }).join('');
  document.getElementById('cartTotal').textContent = fmt(total);
}
document.getElementById('cartItems').addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; const row = cart.find(item => item.id === Number(button.dataset.id)); if (!row) return; button.dataset.act === 'plus' ? row.qty++ : row.qty--; if (row.qty <= 0) cart = cart.filter(item => item !== row); saveCart(); });
document.getElementById('clearCart').onclick = () => { cart = []; saveCart(); };

const modal = document.getElementById('orderModal');
const checkoutButton = document.getElementById('checkout');
const phoneInput = document.querySelector('[name="phone"]');
const deliveryNote = document.getElementById('deliveryNote');
phoneInput.placeholder = '+7 (___) ___-__-__';
phoneInput.value = '+7 (';
phoneInput.inputMode = 'tel';
phoneInput.maxLength = 18;
function formatRussianPhone(value, selectionStart) {
  const digits = value.replace(/\D/g, '');
  const explicitPrefix = /^\s*\+7/.test(value);
  let localNumber = explicitPrefix ? digits.slice(1) : digits;
  let removeExtraPrefix = false;
  if (localNumber.length === 11 && /^[78]/.test(localNumber)) {
    localNumber = localNumber.slice(1);
    removeExtraPrefix = true;
  }
  localNumber = localNumber.slice(0, 10);
  let digitsBeforeCaret = value.slice(0, selectionStart).replace(/\D/g, '').length;
  if ((explicitPrefix || removeExtraPrefix) && digitsBeforeCaret > 0) digitsBeforeCaret--;
  if (explicitPrefix && removeExtraPrefix && digitsBeforeCaret > 0) digitsBeforeCaret--;
  digitsBeforeCaret = Math.min(digitsBeforeCaret, localNumber.length);

  let formatted = `+7 (${localNumber.slice(0, 3)}`;
  if (localNumber.length >= 3) formatted += ')';
  if (localNumber.length > 3) formatted += ` ${localNumber.slice(3, 6)}`;
  if (localNumber.length > 6) formatted += `-${localNumber.slice(6, 8)}`;
  if (localNumber.length > 8) formatted += `-${localNumber.slice(8, 10)}`;

  let caret = 4;
  if (digitsBeforeCaret > 0) {
    let digitsSeen = 0;
    for (let index = 4; index < formatted.length; index++) {
      if (/\d/.test(formatted[index])) digitsSeen++;
      if (digitsSeen === digitsBeforeCaret) {
        caret = index + 1;
        while (formatted[caret] === ')' || formatted[caret] === ' ' || formatted[caret] === '-') caret++;
        break;
      }
    }
  }
  return {formatted, caret};
}
function updatePhoneValidity() {
  const valid = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phoneInput.value);
  phoneInput.setCustomValidity(valid ? '' : 'Введите 10 цифр номера после +7.');
}
phoneInput.addEventListener('input', () => {
  const {formatted, caret} = formatRussianPhone(phoneInput.value, phoneInput.selectionStart ?? phoneInput.value.length);
  phoneInput.value = formatted;
  phoneInput.setSelectionRange(caret, caret);
  updatePhoneValidity();
});
updatePhoneValidity();
modal.setAttribute('role', 'dialog');
modal.setAttribute('aria-modal', 'true');
modal.setAttribute('aria-labelledby', 'orderModalTitle');
modal.querySelector('h2').id = 'orderModalTitle';
function closeOrderModal() {
  modal.classList.remove('show');
  checkoutButton.focus();
}
checkoutButton.onclick = () => {
  if (!cart.length) return alert('Сначала добавьте блюда в корзину.');
  modal.classList.add('show');
  modal.querySelector('input').focus();
};
document.getElementById('closeModal').onclick = closeOrderModal;
modal.addEventListener('click', event => { if (event.target === modal) closeOrderModal(); });
modal.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const focusable = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])')].filter(element => !element.closest('[hidden]'));
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
document.getElementById('orderForm').addEventListener('submit', event => {
  if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phoneInput.value)) {
    event.preventDefault();
    updatePhoneValidity();
    phoneInput.reportValidity();
    phoneInput.focus();
    return;
  }
  event.preventDefault();
  const data = new FormData(event.target);
  const order = cart.map(row => {
    const item = menu.find(entry => entry.id === row.id);
    const servingNote = servingNoteFor(item);
    return `• ${item.name} × ${row.qty} — ${fmt(item.price * row.qty)}${servingNote ? `\n  ${servingNote}` : ''}`;
  }).join('\n');
  const total = cart.reduce((sum, row) => sum + menu.find(item => item.id === row.id).price * row.qty, 0);
  const details = [
    `Получение: ${data.get('orderType')}`,
    `Филиал: ${data.get('branch')}`,
    data.get('orderType') === 'Доставка' ? `Адрес: ${data.get('address')}` : null,
    data.get('orderType') === 'Доставка' ? 'Доставка: Яндекс Доставка, оплачивается клиентом отдельно; стоимость уточняется перед подтверждением.' : null,
    `Комментарий: ${data.get('comment') || '—'}`
  ].filter(Boolean).join('\n');
  const message = `Новый заказ с сайта «DoniШеф»\n\n${order}\n\nСумма блюд: ${fmt(total)}\n\nИмя: ${data.get('name')}\nТелефон: ${data.get('phone')}\n${details}\n\nПожалуйста, перезвоните клиенту для подтверждения.`;
  window.location.href = `https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  cart = [];
  saveCart();
  modal.classList.remove('show');
  closeCart();
  event.target.reset();
  phoneInput.value = '+7 (';
  updatePhoneValidity();
  updateAddressRequirement();
});
const maxOrderButton = document.getElementById('orderViaMax');
maxOrderButton.addEventListener('click', async () => {
  const orderForm = document.getElementById('orderForm');
  if (!orderForm.reportValidity()) return;
  const data = new FormData(orderForm);
  const order = cart.map(row => {
    const item = menu.find(entry => entry.id === row.id);
    const servingNote = servingNoteFor(item);
    return `• ${item.name} × ${row.qty} — ${fmt(item.price * row.qty)}${servingNote ? `\n  ${servingNote}` : ''}`;
  }).join('\n');
  const total = cart.reduce((sum, row) => sum + menu.find(item => item.id === row.id).price * row.qty, 0);
  const details = [
    `Получение: ${data.get('orderType')}`,
    `Филиал: ${data.get('branch')}`,
    data.get('orderType') === 'Доставка' ? `Адрес: ${data.get('address')}` : null,
    data.get('orderType') === 'Доставка' ? 'Доставка: Яндекс Доставка, оплачивается клиентом отдельно; стоимость уточняется перед подтверждением.' : null,
    `Комментарий: ${data.get('comment') || '—'}`
  ].filter(Boolean).join('\n');
  const message = `Новый заказ с сайта «DoniШеф»\n\n${order}\n\nСумма блюд: ${fmt(total)}\n\nИмя: ${data.get('name')}\nТелефон: ${data.get('phone')}\n${details}\n\nПожалуйста, перезвоните клиенту для подтверждения.`;
  const maxWindow = window.open('https://max.ru/', '_blank', 'noopener,noreferrer');
  try {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(message);
      } catch (error) {
        console.warn('Буфер обмена браузера отклонил запись; используем резервный способ.', error);
        copyOrderWithSelection(message);
      }
    } else {
      copyOrderWithSelection(message);
    }
    const status = document.getElementById('maxOrderStatus');
    status.textContent = maxWindow
      ? 'Заказ скопирован. Найдите в MAX номер +7 919 154-52-32 и отправьте текст.'
      : 'Заказ скопирован. Откройте MAX, найдите номер +7 919 154-52-32 и отправьте текст.';
    status.hidden = false;
  } catch (error) {
    console.error('Не удалось скопировать заказ для MAX.', error);
    window.alert('Не удалось скопировать заказ. Проверьте разрешение на буфер обмена и попробуйте ещё раз.');
  }
});
function copyOrderWithSelection(message) {
  const textarea = document.createElement('textarea');
  textarea.value = message;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Браузер не разрешил скопировать текст заказа.');
}
const bookingModal = document.getElementById('bookingModal');
const bookingForm = document.getElementById('bookingForm');
const bookingPhoneInput = bookingForm.elements.phone;
const closeBookingButton = document.getElementById('closeBookingModal');
let bookingReturnFocus;
bookingPhoneInput.value = '+7 (';
function updateBookingPhoneValidity() {
  const valid = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(bookingPhoneInput.value);
  bookingPhoneInput.setCustomValidity(valid ? '' : 'Введите 10 цифр номера после +7.');
}
bookingPhoneInput.addEventListener('input', () => {
  const {formatted, caret} = formatRussianPhone(bookingPhoneInput.value, bookingPhoneInput.selectionStart ?? bookingPhoneInput.value.length);
  bookingPhoneInput.value = formatted;
  bookingPhoneInput.setSelectionRange(caret, caret);
  updateBookingPhoneValidity();
});
updateBookingPhoneValidity();
bookingModal.setAttribute('role', 'dialog');
bookingModal.setAttribute('aria-modal', 'true');
bookingModal.setAttribute('aria-labelledby', 'bookingModalTitle');
bookingModal.querySelector('h2').id = 'bookingModalTitle';
function closeBookingModal() {
  bookingModal.classList.remove('show');
  if (bookingReturnFocus instanceof HTMLElement) bookingReturnFocus.focus();
}
document.querySelectorAll('[data-open-booking]').forEach(button => button.addEventListener('click', () => {
  bookingReturnFocus = button;
  bookingModal.classList.add('show');
  closeBookingButton.focus();
}));
closeBookingButton.addEventListener('click', closeBookingModal);
bookingModal.addEventListener('click', event => {
  if (event.target === bookingModal) closeBookingModal();
});
bookingModal.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const focusable = [...bookingModal.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled])')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
function buildBookingMessage() {
  const data = new FormData(bookingForm);
  const guests = Number(data.get('guests'));
  if (!Number.isInteger(guests) || guests < 1 || guests > 100) throw new RangeError('Количество гостей должно быть от 1 до 100.');
  return [
    'Здравствуйте! Хочу забронировать отдельный зал для безалкогольного банкета.',
    `Имя: ${data.get('name')}`,
    `Телефон: ${data.get('phone')}`,
    `Количество гостей: ${guests}`,
    `Дата: ${data.get('date')}`,
    `Время начала: ${data.get('time')}`,
    `Пожелания: ${data.get('comment') || '—'}`
  ].join('\n');
}
document.getElementById('bookingViaWhatsApp').addEventListener('click', () => {
  if (!bookingForm.reportValidity()) return;
  const message = buildBookingMessage();
  const target = `https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(target, '_blank', 'noopener,noreferrer');
});
document.getElementById('bookingViaMax').addEventListener('click', async () => {
  if (!bookingForm.reportValidity()) return;
  const message = buildBookingMessage();
  const maxWindow = window.open('https://max.ru/', '_blank', 'noopener,noreferrer');
  try {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(message);
      } catch (error) {
        console.warn('Буфер обмена браузера отклонил запись; используем резервный способ.', error);
        copyOrderWithSelection(message);
      }
    } else {
      copyOrderWithSelection(message);
    }
    const status = document.getElementById('bookingMaxStatus');
    status.textContent = maxWindow
      ? 'Заявка скопирована. Найдите в MAX номер +7 919 154-52-32 и отправьте текст.'
      : 'Заявка скопирована. Откройте MAX, найдите номер +7 919 154-52-32 и отправьте текст.';
    status.hidden = false;
  } catch (error) {
    console.error('Не удалось скопировать заявку на бронирование для MAX.', error);
    window.alert('Не удалось скопировать заявку. Проверьте разрешение на буфер обмена и попробуйте ещё раз.');
  }
});
const orderType = document.getElementById('orderType');
const addressField = document.getElementById('addressField');
const addressInput = addressField.querySelector('input');
function updateAddressRequirement() {
  const needsAddress = orderType.value === 'Доставка';
  addressField.hidden = !needsAddress;
  addressInput.required = needsAddress;
  deliveryNote.hidden = !needsAddress;
}
orderType.addEventListener('change', updateAddressRequirement);
updateAddressRequirement();

const burger = document.getElementById('burger');
const siteNav = document.getElementById('siteNav');
burger.setAttribute('aria-controls', 'siteNav');
burger.setAttribute('aria-expanded', 'false');
function setMenuOpen(isOpen) {
  siteNav.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', String(isOpen));
  burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
}
burger.addEventListener('click', () => setMenuOpen(!siteNav.classList.contains('open')));
siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
document.querySelectorAll('[data-open-order]').forEach(button => button.addEventListener('click', () => {
  if (!cart.length) {
    document.getElementById('menu').scrollIntoView({behavior: 'smooth'});
    return;
  }
  openCart();
  checkoutButton.click();
}));
document.getElementById('mobileOrder').addEventListener('click', () => {
  if (cart.length) openCart();
  else document.getElementById('menu').scrollIntoView({behavior: 'smooth'});
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (dishModal.classList.contains('show')) closeDishModal();
  else if (modal.classList.contains('show')) closeOrderModal();
  else if (bookingModal.classList.contains('show')) closeBookingModal();
  else if (cartEl.classList.contains('open')) closeCart();
  setMenuOpen(false);
});
const hoursLabel = document.querySelector('.hours span');
const hoursStatus = document.querySelector('.hours b');
hoursStatus.setAttribute('aria-live', 'polite');
function updateOpeningHours() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Yekaterinburg',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const hour = Number(parts.find(part => part.type === 'hour').value);
  const weekday = parts.find(part => part.type === 'weekday').value;
  const closingHour = weekday === 'Sun' ? 20 : 22;
  const isOpen = hour >= 11 && hour < closingHour;
  const statusText = isOpen ? `Открыто · до ${closingHour}:00` : `Закрыто · откроемся ${hour < 11 ? 'сегодня' : 'завтра'} в 11:00`;
  if (hoursLabel.textContent !== 'Сейчас') hoursLabel.textContent = 'Сейчас';
  hoursStatus.dataset.open = String(isOpen);
  if (hoursStatus.textContent !== statusText) hoursStatus.textContent = statusText;
}
updateOpeningHours();
window.setInterval(updateOpeningHours, 60_000);
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), {threshold:.12});
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const videoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  const video = entry.target;
  if (entry.isIntersecting && !prefersReducedMotion.matches) {
    video.autoplay = true;
    video.play().catch(error => {
      if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') console.error('Не удалось запустить фоновое видео.', error);
    });
  } else {
    video.autoplay = false;
    video.pause();
  }
}), {threshold: 0.25});
document.querySelectorAll('.video-card video').forEach(video => {
  video.addEventListener('play', () => video.closest('.video-card').classList.add('is-playing'));
  video.addEventListener('pause', () => video.closest('.video-card').classList.remove('is-playing'));
  videoObserver.observe(video);
});
document.getElementById('mobileOrder').textContent = cart.length ? 'Корзина' : 'Заказать';
renderMenu(); renderCart();
