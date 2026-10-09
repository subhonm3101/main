const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
const formatPrice = value => `${Number(value).toLocaleString('ru-RU')} ₽`;
const formatDate = value => new Intl.DateTimeFormat('ru-RU', {dateStyle: 'short', timeStyle: 'short'}).format(new Date(value));
const statusNames = {new: 'Новый', confirmed: 'Подтверждён', completed: 'Выполнен', cancelled: 'Отменён'};
let client = null;
let orders = [];
let menuItems = [];

function setFeedback(element, message, success = false) {
  element.textContent = message;
  element.classList.toggle('success', success);
  element.hidden = !message;
}

function showLogin(message = '') {
  $('#loginScreen').hidden = false;
  $('#adminDashboard').hidden = true;
  $('#logoutButton').hidden = true;
  setFeedback($('#loginFeedback'), message);
}

function showDashboard() {
  $('#loginScreen').hidden = true;
  $('#adminDashboard').hidden = false;
  $('#logoutButton').hidden = false;
}

async function verifyOwner(session) {
  if (!session) {
    showLogin();
    return false;
  }
  const {data, error} = await client.rpc('is_donishef_admin');
  if (error) throw error;
  if (data !== true) {
    await client.auth.signOut();
    showLogin('У этой учётной записи нет доступа владельца.');
    return false;
  }
  showDashboard();
  await refreshDashboard();
  return true;
}

function menuRecord(item, index) {
  return {
    name: item.name,
    category: item.cat,
    price: Number(item.price),
    weight: item.weight || '',
    description: item.desc || '',
    image_url: item.image || '',
    photo: Boolean(item.photo),
    tag: item.tag || null,
    serving_note: item.servingNote || null,
    recipe: item.recipe || null,
    sort_order: index
  };
}

async function refreshDashboard() {
  const feedback = $('#dashboardFeedback');
  setFeedback(feedback, '');
  try {
    const [loadedOrders, loadedMenu] = await Promise.all([
      fetchAllRows(() => client.from('orders').select('id,created_at,customer_name,phone,order_type,branch,address,comment,total,status,order_items(item_name,unit_price,quantity)').order('created_at', {ascending: false}).order('id')),
      fetchAllRows(() => client.from('menu_items').select('*').order('sort_order').order('id'))
    ]);
    orders = loadedOrders;
    menuItems = loadedMenu;
    renderAll();
    setFeedback($('#menuFeedback'), '');
    return true;
  } catch (error) {
    console.error('Не удалось загрузить данные панели владельца.', error);
    setFeedback(feedback, 'Не удалось загрузить данные. Проверьте подключение к базе и права владельца.');
    return false;
  }
}

async function fetchAllRows(makeQuery) {
  const pageSize = 500;
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    const {data, error} = await makeQuery().range(offset, offset + pageSize - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}

function renderStats() {
  const newCount = orders.filter(order => order.status === 'new').length;
  $('#adminStats').innerHTML = [
    ['Заказов', orders.length],
    ['Новых заказов', newCount],
    ['Сумма неотменённых заказов', formatPrice(orders.filter(order => order.status !== 'cancelled').reduce((sum, order) => sum + Number(order.total), 0))]
  ].map(([label, value]) => `<article class="admin-stat"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></article>`).join('');
}

function visibleOrders() {
  const query = $('#orderSearch').value.trim().toLocaleLowerCase('ru-RU');
  const status = $('#orderStatusFilter').value;
  return orders.filter(order => {
    const matchesQuery = !query || `${order.customer_name} ${order.phone}`.toLocaleLowerCase('ru-RU').includes(query);
    return matchesQuery && (!status || order.status === status);
  });
}

function renderOrders() {
  const rows = visibleOrders();
  $('#ordersTable').innerHTML = rows.map(order => {
    const itemRows = (order.order_items || []).map(item => `<li>${escapeHtml(item.item_name)} × ${Number(item.quantity)} — ${formatPrice(Number(item.unit_price) * Number(item.quantity))}</li>`).join('');
    return `<tr>
      <td>${escapeHtml(formatDate(order.created_at))}<small>№ ${escapeHtml(order.id.slice(0, 8))}</small></td>
      <td><b>${escapeHtml(order.customer_name)}</b><a href="tel:${escapeHtml(order.phone.replace(/[^\d+]/g, ''))}">${escapeHtml(order.phone)}</a></td>
      <td><ul class="admin-order-items">${itemRows}</ul><small>${escapeHtml(order.branch)}${order.address ? ` · ${escapeHtml(order.address)}` : ''}${order.comment ? ` · ${escapeHtml(order.comment)}` : ''}</small></td>
      <td><b>${formatPrice(order.total)}</b></td>
      <td>${escapeHtml(order.order_type)}</td>
      <td><select class="admin-status-select" data-order-status="${escapeHtml(order.id)}" aria-label="Статус заказа ${escapeHtml(order.id.slice(0, 8))}">${Object.entries(statusNames).map(([value, title]) => `<option value="${value}"${order.status === value ? ' selected' : ''}>${title}</option>`).join('')}</select></td>
    </tr>`;
  }).join('');
  $('#ordersEmpty').hidden = rows.length > 0;
  $('#ordersEmpty').textContent = orders.length ? 'Заказы не найдены по выбранному фильтру.' : 'Заказов пока нет.';
}

function renderClients() {
  const clients = new Map();
  for (const order of orders) {
    const key = order.phone.replace(/\D/g, '');
    const existing = clients.get(key);
    if (existing) {
      existing.orders++;
      existing.total += Number(order.total);
      if (new Date(order.created_at) > new Date(existing.lastOrder)) {
        existing.lastOrder = order.created_at;
        existing.name = order.customer_name;
        existing.phone = order.phone;
      }
    } else {
      clients.set(key, {name: order.customer_name, phone: order.phone, orders: 1, total: Number(order.total), lastOrder: order.created_at});
    }
  }
  const query = $('#clientSearch').value.trim().toLocaleLowerCase('ru-RU');
  const rows = [...clients.values()].filter(person => `${person.name} ${person.phone}`.toLocaleLowerCase('ru-RU').includes(query));
  $('#clientsTable').innerHTML = rows.map(person => `<tr>
    <td><b>${escapeHtml(person.name)}</b></td>
    <td><a href="tel:${escapeHtml(person.phone.replace(/[^\d+]/g, ''))}">${escapeHtml(person.phone)}</a></td>
    <td>${person.orders}</td>
    <td>${escapeHtml(formatDate(person.lastOrder))}</td>
    <td><b>${formatPrice(person.total)}</b></td>
  </tr>`).join('');
  $('#clientsEmpty').hidden = rows.length > 0;
  $('#clientsEmpty').textContent = clients.size ? 'Клиенты не найдены по запросу.' : 'Клиентов пока нет.';
}

function renderMenu() {
  const categories = [...new Set(menuItems.map(item => item.category))].sort((a, b) => a.localeCompare(b, 'ru'));
  $('#menuCategories').innerHTML = categories.map(category => `<option value="${escapeHtml(category)}"></option>`).join('');
  $('#menuList').innerHTML = menuItems.map(item => `<article class="admin-menu-item">
    <img src="${escapeHtml(item.image_url || 'assets/brand-logo.webp')}" alt="" loading="lazy">
    <div><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.category)} · ${escapeHtml(item.weight || 'Вес не указан')}</small></div>
    <b class="admin-menu-price">${formatPrice(item.price)}</b>
    <button class="admin-quiet-button" type="button" data-edit-menu="${Number(item.id)}">Изменить</button>
  </article>`).join('');
  $('#menuEmpty').hidden = menuItems.length > 0;
  $('#importMenuButton').hidden = menuItems.length > 0;
}

function renderAll() {
  renderStats();
  renderOrders();
  renderClients();
  renderMenu();
}

function openMenuEditor(item = null) {
  const form = $('#menuForm');
  form.reset();
  form.elements.id.value = item?.id ?? '';
  form.elements.name.value = item?.name ?? '';
  form.elements.category.value = item?.category ?? '';
  form.elements.price.value = item?.price ?? '';
  form.elements.weight.value = item?.weight ?? '';
  form.elements.description.value = item?.description ?? '';
  form.elements.image_url.value = item?.image_url ?? '';
  form.elements.tag.value = item?.tag ?? '';
  form.elements.sort_order.value = item?.sort_order ?? menuItems.length;
  form.elements.serving_note.value = item?.serving_note ?? '';
  form.elements.recipe.value = item?.recipe ?? '';
  form.elements.photo.checked = Boolean(item?.photo);
  $('#menuFormTitle').textContent = item ? 'Редактировать блюдо' : 'Новое блюдо';
  $('#deleteMenuButton').hidden = !item;
  form.hidden = false;
  form.scrollIntoView({behavior: 'smooth', block: 'start'});
  form.elements.name.focus();
}

function closeMenuEditor() {
  $('#menuForm').hidden = true;
  $('#menuForm').reset();
}

async function uploadMenuImage(file) {
  if (!file || !file.size) return null;
  const extensions = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif'};
  if (!Object.hasOwn(extensions, file.type)) throw new Error('Поддерживаются изображения JPEG, PNG, WebP и AVIF.');
  if (file.size > 8 * 1024 * 1024) throw new Error('Размер фотографии не должен превышать 8 МБ.');
  const extension = extensions[file.type];
  const path = `${crypto.randomUUID()}.${extension}`;
  const {error} = await client.storage.from('menu-photos').upload(path, file, {contentType: file.type, upsert: false});
  if (error) throw error;
  const {data} = client.storage.from('menu-photos').getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('Не удалось получить ссылку на загруженную фотографию.');
  return data.publicUrl;
}

$('#adminLoginForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (!client) {
    setFeedback($('#loginFeedback'), 'Сначала подключите проект Supabase в файле supabase-config.js по инструкции.');
    return;
  }
  const button = event.submitter;
  button.disabled = true;
  setFeedback($('#loginFeedback'), 'Выполняется вход...');
  const formData = new FormData(event.currentTarget);
  try {
    const {data, error} = await client.auth.signInWithPassword({email: formData.get('email'), password: formData.get('password')});
    if (error) throw error;
    if (!await verifyOwner(data.session)) return;
  } catch (error) {
    console.error('Не удалось войти в панель владельца.', error);
    showLogin('Не удалось войти. Проверьте email, пароль и настройку доступа владельца.');
  } finally {
    button.disabled = false;
  }
});

$('#logoutButton').addEventListener('click', async () => {
  const {error} = await client.auth.signOut();
  if (error) {
    console.error('Не удалось завершить сеанс панели.', error);
    setFeedback($('#dashboardFeedback'), 'Не удалось выйти из панели. Попробуйте ещё раз.');
    return;
  }
  showLogin('Вы вышли из панели.');
});

$('#refreshButton').addEventListener('click', refreshDashboard);
document.querySelectorAll('.admin-tab').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    const selected = tab === button;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
  });
  for (const panel of ['orders', 'clients', 'menu']) $(`#${panel}Panel`).hidden = button.dataset.tab !== panel;
}));

$('#orderSearch').addEventListener('input', renderOrders);
$('#orderStatusFilter').addEventListener('change', renderOrders);
$('#clientSearch').addEventListener('input', renderClients);
$('#ordersTable').addEventListener('change', async event => {
  const select = event.target.closest('[data-order-status]');
  if (!select) return;
  select.disabled = true;
  const {error} = await client.from('orders').update({status: select.value}).eq('id', select.dataset.orderStatus);
  select.disabled = false;
  if (error) {
    console.error('Не удалось изменить статус заказа.', error);
    setFeedback($('#dashboardFeedback'), 'Статус заказа не изменён. Проверьте подключение и повторите попытку.');
    await refreshDashboard();
    return;
  }
  const order = orders.find(item => item.id === select.dataset.orderStatus);
  if (order) order.status = select.value;
  renderStats();
  setFeedback($('#dashboardFeedback'), 'Статус заказа обновлён.', true);
});

$('#addMenuButton').addEventListener('click', () => openMenuEditor());
$('#cancelMenuEdit').addEventListener('click', closeMenuEditor);
$('#menuList').addEventListener('click', event => {
  const button = event.target.closest('[data-edit-menu]');
  if (!button) return;
  const item = menuItems.find(row => row.id === Number(button.dataset.editMenu));
  if (item) openMenuEditor(item);
});

$('#menuForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = event.submitter;
  button.disabled = true;
  setFeedback($('#menuFeedback'), '');
  const data = new FormData(form);
  try {
    const uploadedImage = await uploadMenuImage(data.get('image_file'));
    const imageUrl = uploadedImage || String(data.get('image_url')).trim();
    const record = {
      name: String(data.get('name')).trim(),
      category: String(data.get('category')).trim(),
      price: Number(data.get('price')),
      weight: String(data.get('weight')).trim(),
      description: String(data.get('description')).trim(),
      image_url: imageUrl,
      photo: data.get('photo') === 'on',
      tag: String(data.get('tag')).trim() || null,
      serving_note: String(data.get('serving_note')).trim() || null,
      recipe: String(data.get('recipe')).trim() || null,
      sort_order: Number(data.get('sort_order'))
    };
    if (!Number.isSafeInteger(record.price) || record.price < 0 || !Number.isInteger(record.sort_order)) {
      throw new Error('Проверьте цену и порядок показа блюда.');
    }
    const itemId = data.get('id');
    const result = itemId
      ? await client.from('menu_items').update(record).eq('id', Number(itemId))
      : await client.from('menu_items').insert(record);
    if (result.error) throw result.error;
    closeMenuEditor();
    const refreshed = await refreshDashboard();
    setFeedback($('#menuFeedback'), refreshed ? 'Блюдо сохранено; изменения появятся на сайте после обновления страницы.' : 'Блюдо сохранено, но список не обновился. Нажмите «Обновить данные».', refreshed);
  } catch (error) {
    console.error('Не удалось сохранить блюдо.', error);
    const message = typeof error?.message === 'string' ? error.message : '';
    setFeedback($('#menuFeedback'), message === 'Проверьте цену и порядок показа блюда.' || message === 'Поддерживаются изображения JPEG, PNG, WebP и AVIF.' || message === 'Размер фотографии не должен превышать 8 МБ.'
      ? message
      : 'Не удалось сохранить блюдо. Проверьте введённые данные и подключение к базе.');
  } finally {
    button.disabled = false;
  }
});

$('#deleteMenuButton').addEventListener('click', async () => {
  const itemId = Number($('#menuForm').elements.id.value);
  const item = menuItems.find(row => row.id === itemId);
  if (!item || !window.confirm(`Удалить блюдо «${item.name}» из меню?`)) return;
  const button = $('#deleteMenuButton');
  button.disabled = true;
  const {error} = await client.from('menu_items').delete().eq('id', itemId);
  button.disabled = false;
  if (error) {
    console.error('Не удалось удалить блюдо.', error);
    setFeedback($('#menuFeedback'), 'Не удалось удалить блюдо. Проверьте подключение и права владельца.');
    return;
  }
  closeMenuEditor();
  const refreshed = await refreshDashboard();
  setFeedback($('#menuFeedback'), refreshed ? 'Блюдо удалено из меню.' : 'Блюдо удалено, но список не обновился. Нажмите «Обновить данные».', refreshed);
});

$('#importMenuButton').addEventListener('click', async () => {
  if (menuItems.length || !window.confirm('Загрузить все блюда текущего меню в онлайн-базу?')) return;
  const button = $('#importMenuButton');
  button.disabled = true;
  setFeedback($('#menuFeedback'), 'Загружается исходное меню...');
  const records = window.DONISHEF_MENU_SEED.map(menuRecord);
  const {error} = await client.from('menu_items').insert(records);
  button.disabled = false;
  if (error) {
    console.error('Не удалось загрузить начальное меню.', error);
    setFeedback($('#menuFeedback'), 'Не удалось загрузить исходное меню. Проверьте таблицу и права владельца.');
    return;
  }
  const refreshed = await refreshDashboard();
  setFeedback($('#menuFeedback'), refreshed ? 'Исходное меню загружено.' : 'Исходное меню загружено, но список не обновился. Нажмите «Обновить данные».', refreshed);
});

async function initialize() {
  try {
    client = window.createDoniSupabaseClient?.() || null;
  } catch (error) {
    console.error('Не удалось инициализировать Supabase для панели.', error);
    showLogin('Не удалось загрузить клиент Supabase. Проверьте подключение библиотеки и конфигурацию.');
    return;
  }
  if (!client) {
    showLogin('Подключите проект Supabase в файле supabase-config.js, затем выполните шаги из инструкции.');
    return;
  }
  const {data, error} = await client.auth.getSession();
  if (error) {
    console.error('Не удалось восстановить сеанс владельца.', error);
    showLogin('Не удалось проверить сеанс. Попробуйте войти снова.');
    return;
  }
  try {
    await verifyOwner(data.session);
  } catch (error) {
    console.error('Не удалось проверить права владельца.', error);
    await client.auth.signOut();
    showLogin('Не удалось проверить доступ. Проверьте SQL-схему и список владельцев.');
  }
}

initialize();
