const asset = name => `assets/optimized/${name.replace(/\.jpg$/i, '.webp')}`;
let restaurantContacts = {call_phone: '+79373231005', whatsapp_phone: '+79373231005', max_phone: '+79191545232'};
let contactSettingsPromise = Promise.resolve();
let menu = window.DONISHEF_MENU_SEED.map(item => ({...item}));
let supabaseClient = null;
let serverMenuReady = false;
try {
  supabaseClient = window.createDoniSupabaseClient?.() || null;
} catch (error) {
  console.error('Не удалось подключить онлайн-базу DoniШеф.', error);
}
serverMenuReady = !supabaseClient;

const fmt = value => `${value.toLocaleString('ru-RU')} ₽`;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
const formatContactPhone = phone => phone.replace(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/, '+7 $1 $2-$3-$4');
function applyRestaurantPhone() {
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    if (link.href.endsWith('79373231005')) {
      link.href = `tel:${restaurantContacts.call_phone}`;
      if (link.textContent.includes('937') || link.textContent.includes('323-10-05')) {
        link.textContent = formatContactPhone(restaurantContacts.call_phone);
      }
    }
  });
}
function deduplicateMenuItems(items) {
  const uniqueItems = new Map();
  for (const item of items) {
    const signature = JSON.stringify([
      item.name, item.cat, item.price, item.weight, item.desc,
      item.image, item.photo, item.tag, item.servingNote, item.recipe
    ]);
    if (!uniqueItems.has(signature)) uniqueItems.set(signature, item);
  }
  return [...uniqueItems.values()];
}
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
const secondCourseOrder = new Map(['Бешбармак', 'Курутоб', 'Форель с фри', 'Кёфта с фри', 'Жареный лагман', 'Баранья ножка', 'Казан-кебаб · говядина', 'Казан-кебаб · баранина', 'Манты', 'Чахохбили с пюре', 'Котлеты с пюре'].map((name, index) => [name, index]));
const grid = document.getElementById('menuGrid');
const categories = document.getElementById('categories');
const search = document.getElementById('search');
const empty = document.getElementById('empty');
let activeCat = 'Все';
let cart = [];
let cats = [];
function renderCategories() {
  const availableCategories = new Set([...menu.map(item => item.cat), ...inquiryCategories]);
  cats = ['Все', ...categoryOrder.filter(category => availableCategories.delete(category)), ...availableCategories];
  if (activeCat !== 'Все' && !cats.includes(activeCat)) activeCat = 'Все';
  categories.innerHTML = cats.map(cat => `<button type="button" class="category ${cat === activeCat ? 'active' : ''}" data-cat="${escapeHtml(cat)}" aria-pressed="${cat === activeCat}">${escapeHtml(categoryNames[cat] || cat)}</button>`).join('');
}
try {
  const savedCart = JSON.parse(localStorage.getItem('donishef-cart') || '[]');
  if (!Array.isArray(savedCart)) throw new TypeError('Сохранённая корзина должна быть списком.');
  cart = supabaseClient ? [] : savedCart.filter(row => row && Number.isInteger(row.id) && Number.isSafeInteger(row.qty) && row.qty > 0 && menu.some(item => item.id === row.id));
} catch (error) {
  console.error('Не удалось загрузить сохранённую корзину.', error);
}

renderCategories();
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
    grid.innerHTML = cards.map(card => `<article class="menu-card inquiry-card${card.image ? ' inquiry-card-photo' : ''}">${card.image ? `<img src="${card.image}" alt="${card.alt}" loading="lazy">` : '<div class="inquiry-card-art" aria-hidden="true"><span>К ПРАЗДНИЧНОМУ СТОЛУ</span></div>'}<div class="menu-info"><h3>${card.title}</h3><p>${card.description}</p>${card.price ? `<span class="inquiry-price">${card.price}</span>` : ''}<a class="inquiry-phone" href="tel:${escapeHtml(restaurantContacts.call_phone)}">Уточнить по телефону <span>→</span></a></div></article>`).join('');
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
      return (secondCourseOrder.get(first.name) ?? secondCourseOrder.size) - (secondCourseOrder.get(second.name) ?? secondCourseOrder.size);
    });
  }
  const portionNote = document.getElementById('portionNote');
  portionNote.hidden = activeCat !== 'Полпорции' || items.length === 0;
  empty.style.display = items.length ? 'none' : 'block';
  empty.textContent = 'Не нашли такое блюдо. Попробуйте другое название.';
 grid.innerHTML = items.map(item => `<article class="menu-card reveal visible">${item.tag ? `<span class="tag">${escapeHtml(item.tag)}</span>` : ''}<div class="food-image${item.photo ? ' real-photo' : ''}"><button class="food-photo-trigger" type="button" data-detail-id="${item.id}" aria-label="Подробнее о блюде «${escapeHtml(item.name)}»"><img class="${item.photo ? 'photo-real' : ''}" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy"></button></div><div class="menu-info"><h3>${escapeHtml(item.name)}</h3>${servingNoteFor(item) ? `<p class="menu-included">${escapeHtml(servingNoteFor(item))}</p>` : ''}<p>${escapeHtml(item.desc)} · ${escapeHtml(item.weight)}</p> <div class="menu-bottom"><span class="price">${fmt(item.price)}</span><button class="add" data-id="${item.id}" aria-label="Добавить одну порцию ${escapeHtml(item.name)} в корзину"${serverMenuReady ? '' : ' disabled'}>+</button></div></div></article>`).join('');
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
 dishModal.querySelector('.dish-modal-actions button').disabled = !serverMenuReady;
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
function addToCart(id) { if (!serverMenuReady) return; const row = cart.find(item => item.id === id); row ? row.qty++ : cart.push({id, qty: 1}); saveCart(); }
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
const orderForm = document.getElementById('orderForm');
const phoneInput = orderForm.elements.phone;
const deliveryNote = document.getElementById('deliveryNote');
orderForm.elements.name.maxLength = 120;
orderForm.elements.address.maxLength = 300;
orderForm.elements.comment.maxLength = 1000;
const adminSetupNotice = document.createElement('p');
adminSetupNotice.className = 'form-note admin-setup-notice';
adminSetupNotice.textContent = 'Онлайн-учёт заявок пока не подключён: заказы можно отправить в WhatsApp/MAX, но они не появятся в панели владельца.';
adminSetupNotice.hidden = Boolean(supabaseClient);
modal.querySelector('h2').after(adminSetupNotice);
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
function buildOrderMessage(data, savedOrder) {
  const items = savedOrder?.items?.length
    ? savedOrder.items.map(item => `• ${item.name} × ${item.quantity} — ${fmt(Number(item.price) * Number(item.quantity))}${item.serving_note ? `\n  ${item.serving_note}` : ''}`).join('\n')
    : cart.map(row => {
      const item = menu.find(entry => entry.id === row.id);
      const servingNote = servingNoteFor(item);
      return `• ${item.name} × ${row.qty} — ${fmt(item.price * row.qty)}${servingNote ? `\n  ${servingNote}` : ''}`;
    }).join('\n');
  const total = savedOrder ? Number(savedOrder.total) : cart.reduce((sum, row) => sum + menu.find(item => item.id === row.id).price * row.qty, 0);
  const details = [
    savedOrder?.id ? `Номер заказа: ${savedOrder.id}` : null,
    `Получение: ${data.get('orderType')}`,
    `Филиал: ${data.get('branch')}`,
    data.get('orderType') === 'Доставка' ? `Адрес: ${data.get('address')}` : null,
    data.get('orderType') === 'Доставка' ? 'Доставка: Яндекс Доставка, оплачивается клиентом отдельно; стоимость уточняется перед подтверждением заказа.' : null,
    `Комментарий: ${data.get('comment') || '—'}`
  ].filter(Boolean).join('\n');
  return `Новый заказ с сайта «DoniШеф»\n\n${items}\n\nСумма блюд: ${fmt(total)}\n\nИмя: ${data.get('name')}\nТелефон: ${data.get('phone')}\n${details}\n\nПожалуйста, перезвоните клиенту для подтверждения.`;
}
async function saveRestaurantOrder(data) {
  if (!supabaseClient) {
    console.warn('Онлайн-панель не подключена: заказ не будет сохранён в базе.');
    return null;
  }
  const {data: orderId, error} = await supabaseClient.rpc('create_restaurant_order', {
    p_customer_name: data.get('name'),
    p_phone: data.get('phone'),
    p_order_type: data.get('orderType'),
    p_branch: data.get('branch'),
    p_address: data.get('address') || '',
    p_comment: data.get('comment') || '',
    p_items: cart.map(row => ({id: row.id, quantity: row.qty}))
  });
  if (error) throw error;
  if (!orderId || typeof orderId.id !== 'string' || !Array.isArray(orderId.items) || !Number.isSafeInteger(Number(orderId.total))) {
    throw new Error('База вернула некорректные данные сохранённого заказа.');
  }
  return orderId;
}
document.getElementById('orderForm').addEventListener('submit', async event => {
  if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phoneInput.value)) {
    event.preventDefault();
    updatePhoneValidity();
    phoneInput.reportValidity();
    phoneInput.focus();
    return;
  }
  event.preventDefault();
  const data = new FormData(event.target);
  const submitButton = event.submitter;
  if (submitButton) submitButton.disabled = true;
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
  let savedOrder;
  try {
    await contactSettingsPromise;
    savedOrder = await saveRestaurantOrder(data);
  } catch (error) {
    console.error('Не удалось загрузить контакты или сохранить заказ.', error);
    window.alert('Не удалось загрузить контакты ресторана или сохранить заказ. Заказ не отправлен. Проверьте подключение к интернету и попробуйте снова.');
    if (submitButton) submitButton.disabled = false;
    return;
  }
  const orderMessage = savedOrder ? buildOrderMessage(data, savedOrder) : message;
  window.location.href = `https://wa.me/${restaurantContacts.whatsapp_phone.replace(/\D/g, '')}?text=${encodeURIComponent(orderMessage)}`;
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
  maxOrderButton.disabled = true;
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
    await contactSettingsPromise;
    const savedOrder = await saveRestaurantOrder(data);
    const orderMessage = savedOrder ? buildOrderMessage(data, savedOrder) : message;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(orderMessage);
      } catch (error) {
        console.warn('Буфер обмена браузера отклонил запись; используем резервный способ.', error);
        copyOrderWithSelection(orderMessage);
      }
    } else {
      copyOrderWithSelection(orderMessage);
    }
    const status = document.getElementById('maxOrderStatus');
    status.textContent = maxWindow
      ? `Заказ скопирован. Найдите в MAX номер ${formatContactPhone(restaurantContacts.max_phone)} и отправьте текст.`
      : `Заказ скопирован. Откройте MAX, найдите номер ${formatContactPhone(restaurantContacts.max_phone)} и отправьте текст.`;
    status.hidden = false;
  } catch (error) {
    console.error('Не удалось сохранить заказ или скопировать его для MAX.', error);
    maxWindow?.close();
    window.alert('Не удалось сохранить или скопировать заказ. Проверьте подключение и разрешение на буфер обмена, затем попробуйте ещё раз.');
  } finally {
    maxOrderButton.disabled = false;
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
document.getElementById('bookingViaWhatsApp').addEventListener('click', async () => {
  if (!bookingForm.reportValidity()) return;
  const message = buildBookingMessage();
  const targetWindow = window.open('about:blank', '_blank');
  try {
    await contactSettingsPromise;
    if (!targetWindow) {
      window.location.href = `https://wa.me/${restaurantContacts.whatsapp_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      return;
    }
    targetWindow.opener = null;
    targetWindow.location.href = `https://wa.me/${restaurantContacts.whatsapp_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  } catch (error) {
    console.error('Не удалось загрузить контакты для бронирования.', error);
    targetWindow?.close();
    window.alert('Не удалось загрузить контакты ресторана. Проверьте подключение к интернету и попробуйте снова.');
  }
});
document.getElementById('bookingViaMax').addEventListener('click', async () => {
  if (!bookingForm.reportValidity()) return;
  const message = buildBookingMessage();
  const maxWindow = window.open('https://max.ru/', '_blank', 'noopener,noreferrer');
  try {
    await contactSettingsPromise;
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
      ? `Заявка скопирована. Найдите в MAX номер ${formatContactPhone(restaurantContacts.max_phone)} и отправьте текст.`
      : `Заявка скопирована. Откройте MAX, найдите номер ${formatContactPhone(restaurantContacts.max_phone)} и отправьте текст.`;
    status.hidden = false;
  } catch (error) {
    console.error('Не удалось скопировать заявку на бронирование для MAX.', error);
    window.alert('Не удалось загрузить контакты или скопировать заявку. Проверьте подключение и разрешение на буфер обмена, затем попробуйте ещё раз.');
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
const menuSyncStatus = document.createElement('p');
menuSyncStatus.className = 'form-note menu-sync-status';
menuSyncStatus.setAttribute('role', 'status');
menuSyncStatus.hidden = true;
grid.before(menuSyncStatus);
async function loadMenuFromSupabase() {
  if (!supabaseClient) return;
  const {data, error} = await supabaseClient.from('menu_items').select('*').order('sort_order').order('id');
  if (error) throw error;
  if (!data.length) {
    menu = [];
    cart = [];
    serverMenuReady = true;
    renderCategories();
    renderMenu();
    renderCart();
    empty.textContent = 'Онлайн-меню пока не заполнено. Владелец может загрузить исходный каталог через панель администратора.';
    menuSyncStatus.textContent = 'Онлайн-каталог пока пуст. Владелец может загрузить исходное меню через панель администратора.';
    menuSyncStatus.hidden = false;
    return;
  }
  menu = deduplicateMenuItems(data.map(row => {
    const id = Number(row.id);
    if (!Number.isSafeInteger(id)) throw new Error('В меню обнаружен некорректный идентификатор блюда.');
    return {
      id,
      name: row.name,
      cat: row.category,
      price: row.price,
      weight: row.weight,
      desc: row.description,
      image: row.image_url,
      photo: row.photo,
      tag: row.tag || '',
      servingNote: row.serving_note || '',
      recipe: row.recipe || ''
    };
  }));
  serverMenuReady = true;
  cart = cart.filter(row => menu.some(item => item.id === row.id));
  renderCategories();
  renderMenu();
  saveCart();
  menuSyncStatus.hidden = true;
}
if (supabaseClient) {
  contactSettingsPromise = supabaseClient.from('restaurant_contacts')
    .select('call_phone,whatsapp_phone,max_phone')
    .eq('id', true)
    .single()
    .then(({data, error}) => {
      if (error) throw error;
      if (!data || !/^\+[1-9]\d{7,14}$/.test(data.call_phone) || !/^\+[1-9]\d{7,14}$/.test(data.whatsapp_phone) || !/^\+[1-9]\d{7,14}$/.test(data.max_phone)) {
        throw new Error('Контакты ресторана отсутствуют или имеют неверный формат.');
      }
      restaurantContacts = data;
      applyRestaurantPhone();
    });
  contactSettingsPromise.catch(error => {
    console.error('Не удалось загрузить контакты ресторана из онлайн-базы.', error);
    adminSetupNotice.textContent = 'Не удалось загрузить контакты ресторана. Оформление заказа недоступно до восстановления подключения.';
    adminSetupNotice.hidden = false;
  });
  loadMenuFromSupabase().catch(error => {
    console.error('Не удалось загрузить меню из онлайн-базы.', error);
    menuSyncStatus.textContent = 'Не удалось загрузить актуальное меню. Показан сохранённый каталог; проверьте подключение к онлайн-базе.';
    menuSyncStatus.hidden = false;
  });
}
