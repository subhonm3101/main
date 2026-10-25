if (window.top !== window.self) { document.documentElement.hidden = true; window.top.location = window.self.location; }
const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
const formatPrice = value => `${Number(value).toLocaleString('ru-RU')} ₽`;
const formatDate = value => new Intl.DateTimeFormat('ru-RU', {dateStyle: 'short', timeStyle: 'short'}).format(new Date(value));
let client = null;
let orders = [];
let menuItems = [];
let restaurantContacts = {call_phone: '+79373231005', whatsapp_phone: '+79373231005', max_phone: '+79191545232'};
let editingMenuIds = [];
let failedLogins = 0;
let lockedUntil = 0;
const IDLE_LIMIT_MS = 5 * 60 * 1000;
let idleTimer = null;
const selectedOrders = new Set();
const selectedClients = new Set();
let clientOrderIds = new Map();

function setFeedback(element, message, success = false) {
  element.textContent = message;
  element.classList.toggle('success', success);
  element.hidden = !message;
}

const ACTIVITY_KEY = 'donishef-admin-last-activity';

function clearStoredSessions() {
  try {
    for (const storage of [localStorage, sessionStorage]) {
      Object.keys(storage).filter(key => /^sb-.*-auth-token/.test(key)).forEach(key => storage.removeItem(key));
    }
    sessionStorage.removeItem(ACTIVITY_KEY);
  } catch { /* storage unavailable */ }
}

function sessionExpired() {
  try {
    const last = Number(sessionStorage.getItem(ACTIVITY_KEY));
    return !last || Date.now() - last > IDLE_LIMIT_MS;
  } catch { return true; }
}

function touchActivity() {
  try { sessionStorage.setItem(ACTIVITY_KEY, String(Date.now())); } catch { /* storage unavailable */ }
}

async function expireSession() {
  await client.auth.signOut().catch(() => {});
  clearStoredSessions();
  orders = [];
  menuItems = [];
  renderAll();
  showLogin('Сеанс завершён из-за бездействия. Войдите снова.');
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  if ($('#adminDashboard').hidden) return;
  touchActivity();
  idleTimer = setTimeout(expireSession, IDLE_LIMIT_MS);
}
['click', 'keydown', 'touchstart', 'scroll'].forEach(name => document.addEventListener(name, resetIdleTimer, {passive: true}));
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !$('#adminDashboard').hidden && sessionExpired()) expireSession();
});

function showLogin(message = '') {
  clearTimeout(idleTimer);
  $('#loginScreen').hidden = false;
  $('#adminDashboard').hidden = true;
  $('#logoutButton').hidden = true;
  setFeedback($('#loginFeedback'), message);
}

function showDashboard() {
  $('#loginScreen').hidden = true;
  $('#adminDashboard').hidden = false;
  $('#logoutButton').hidden = false;
  resetIdleTimer();
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
    sort_order: index,
    available: item.available !== false
  };
}

async function refreshDashboard() {
  const feedback = $('#dashboardFeedback');
  setFeedback(feedback, '');
  const results = await Promise.allSettled([
    fetchAllRows(() => client.from('orders').select('id,created_at,customer_name,phone,order_type,branch,address,comment,total,status,personal_data_consent,privacy_policy_version,order_items(item_name,unit_price,quantity)').order('created_at', {ascending: false}).order('id')),
    fetchAllRows(() => client.from('menu_items').select('*').order('sort_order').order('id')),
    loadRestaurantContacts()
  ]);
  const failures = [];
  if (results[0].status === 'fulfilled') orders = results[0].value;
  else {
    console.error('Не удалось загрузить заявки.', results[0].reason);
    failures.push('заказы');
  }
  if (results[1].status === 'fulfilled') {
    const loadedMenu = results[1].value;
    menuItems = deduplicateMenuItems(loadedMenu);
  }
  else {
    console.error('Не удалось загрузить меню.', results[1].reason);
    failures.push('меню');
  }
  if (results[2].status === 'fulfilled') {
    restaurantContacts = results[2].value;
    $('#contactsForm').elements.call_phone.value = restaurantContacts.call_phone;
    $('#contactsForm').elements.whatsapp_phone.value = restaurantContacts.whatsapp_phone;
    $('#contactsForm').elements.max_phone.value = restaurantContacts.max_phone;
    $('#contactsForm').querySelectorAll('input, button').forEach(element => { element.disabled = false; });
    setFeedback($('#contactsFeedback'), '');
  } else {
    console.error('Не удалось загрузить контакты ресторана.', results[2].reason);
    failures.push('контакты');
    $('#contactsForm').querySelectorAll('input, button').forEach(element => { element.disabled = true; });
    setFeedback($('#contactsFeedback'), 'Контакты не загружены. Выполните обновлённый файл supabase-schema.sql в SQL Editor Supabase.');
  }
  renderAll();
  if (failures.length) {
    const message = `Не удалось загрузить: ${failures.join(', ')}. Проверьте подключение и права владельца.`;
    setFeedback(feedback, message);
    return false;
  }
  setFeedback($('#menuFeedback'), '');
  return true;
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

async function loadRestaurantContacts() {
  const {data, error} = await client.from('restaurant_contacts')
    .select('call_phone,whatsapp_phone,max_phone')
    .eq('id', true)
    .single();
  if (error) throw error;
  if (!data) throw new Error('Контакты ресторана не найдены.');
  return data;
}

function deduplicateMenuItems(items) {
  const uniqueItems = new Map();
  for (const item of items) {
    const signature = JSON.stringify([
      item.name, item.category, item.price, item.weight, item.description,
      item.image_url, item.photo, item.tag, item.serving_note, item.recipe, item.sort_order, item.available !== false
    ]);
    const existing = uniqueItems.get(signature);
    if (existing) existing.duplicateIds.push(item.id);
    else uniqueItems.set(signature, {...item, duplicateIds: [item.id]});
  }
  return [...uniqueItems.values()];
}

async function setMenuAvailability(item, available) {
  const buttons = [...$('#menuList').querySelectorAll(`[data-toggle-stock="${Number(item.id)}"]`)];
  buttons.forEach(button => { button.disabled = true; });
  setFeedback($('#menuFeedback'), available ? 'Ставим блюдо на стоп...' : 'Возвращаем блюдо в наличие...');
  try {
    const {data, error} = await client.from('menu_items')
      .update({available})
      .in('id', item.duplicateIds)
      .select('id');
    if (error) throw error;
    if (!data || data.length !== item.duplicateIds.length) {
      throw new Error('Supabase не обновил все копии блюда. Проверьте права владельца и повторите попытку.');
    }
    for (const menuItem of menuItems) {
      if (item.duplicateIds.includes(menuItem.id)) menuItem.available = available;
    }
    renderMenu();
    setFeedback($('#menuFeedback'), available ? `«${item.name}» снова доступно.` : `«${item.name}» поставлено на стоп.`, true);
  } catch (error) {
    console.error('Не удалось изменить наличие блюда.', error);
    const detail = typeof error?.message === 'string' ? ` ${error.message}` : '';
    setFeedback($('#menuFeedback'), `Не удалось изменить наличие.${detail}`);
  }
}

function renderStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  const todayOrders = orders.filter(order => {
    const createdAt = Date.parse(order.created_at);
    return createdAt >= todayStart && createdAt < tomorrowStart;
  });

  const nonCancelled = order => order.status !== 'cancelled';
  const sumOrders = rows => rows.filter(nonCancelled).reduce((sum, order) => sum + Number(order.total), 0);
  $('#adminStats').innerHTML = [
    ['Заявок за всё время', orders.length],
    ['Заявок сегодня', todayOrders.length],
    ['Сумма заказов за всё время', formatPrice(sumOrders(orders))],
    ['Сумма заказов сегодня', formatPrice(sumOrders(todayOrders))]
  ].map(([label, value]) => `<article class="admin-stat"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></article>`).join('');
}

function visibleOrders() {
  const query = $('#orderSearch').value.trim().toLocaleLowerCase('ru-RU');
  return orders.filter(order => {
    const matchesQuery = !query || `${order.customer_name} ${order.phone}`.toLocaleLowerCase('ru-RU').includes(query);
    return matchesQuery;
  });
}

function renderOrders() {
  const rows = visibleOrders();
  $('#ordersTable').innerHTML = rows.map(order => {
    const itemRows = (order.order_items || []).map(item => `<li>${escapeHtml(item.item_name)} × ${Number(item.quantity)} — ${formatPrice(Number(item.unit_price) * Number(item.quantity))}</li>`).join('');
    const phone = order.phone.replace(/\D/g, '');
    const whatsappLink = phone.length >= 10 && phone.length <= 15
      ? `<a class="admin-whatsapp-link" href="https://wa.me/${escapeHtml(phone)}" target="_blank" rel="noopener">WhatsApp</a>`
      : '';
    return `<tr>
      <td class="admin-check"><input type="checkbox" data-order-select="${escapeHtml(order.id)}" aria-label="Выбрать заказ"${selectedOrders.has(order.id) ? ' checked' : ''}></td>
      <td>${escapeHtml(formatDate(order.created_at))}<small>№ ${escapeHtml(order.id.slice(0, 8))}</small></td>
      <td><b>${escapeHtml(order.customer_name)}</b><a href="tel:${escapeHtml(order.phone.replace(/[^\d+]/g, ''))}">${escapeHtml(order.phone)}</a>${whatsappLink}<small>${order.personal_data_consent ? `Согласие получено · ${escapeHtml(order.privacy_policy_version || 'версия не указана')}` : 'Согласие не сохранено'}</small></td>
      <td><ul class="admin-order-items">${itemRows}</ul><small>${escapeHtml(order.branch)}${order.address ? ` · ${escapeHtml(order.address)}` : ''}${order.comment ? ` · ${escapeHtml(order.comment)}` : ''}</small></td>
      <td><b>${formatPrice(order.total)}</b></td>
      <td>${escapeHtml(order.order_type)}</td>
    </tr>`;
  }).join('');
  updateSelectionUi('orders', rows.map(order => order.id));
  $('#ordersEmpty').hidden = rows.length > 0;
  $('#ordersEmpty').textContent = orders.length ? 'Заказы не найдены по запросу.' : 'Заказов пока нет.';
}

function renderClients() {
  const clients = new Map();
  clientOrderIds = new Map();
  for (const order of orders) {
    const key = order.phone.replace(/\D/g, '');
    if (!clientOrderIds.has(key)) clientOrderIds.set(key, []);
    clientOrderIds.get(key).push(order.id);
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
      clients.set(key, {key, name: order.customer_name, phone: order.phone, orders: 1, total: Number(order.total), lastOrder: order.created_at});
    }
  }
  const query = $('#clientSearch').value.trim().toLocaleLowerCase('ru-RU');
  const rows = [...clients.values()].filter(person => `${person.name} ${person.phone}`.toLocaleLowerCase('ru-RU').includes(query));
  $('#clientsTable').innerHTML = rows.map(person => `<tr>
      <td class="admin-check"><input type="checkbox" data-client-select="${escapeHtml(person.key)}" aria-label="Выбрать клиента"${selectedClients.has(person.key) ? ' checked' : ''}></td>
      <td><b>${escapeHtml(person.name)}</b></td>
    <td><a href="tel:${escapeHtml(person.phone.replace(/[^\d+]/g, ''))}">${escapeHtml(person.phone)}</a></td>
    <td>${person.orders}</td>
    <td>${escapeHtml(formatDate(person.lastOrder))}</td>
    <td><b>${formatPrice(person.total)}</b></td>
  </tr>`).join('');
  updateSelectionUi('clients', rows.map(person => person.key));
  $('#clientsEmpty').hidden = rows.length > 0;
  $('#clientsEmpty').textContent = clients.size ? 'Клиенты не найдены по запросу.' : 'Клиентов пока нет.';
}

function renderMenu() {
  const categories = [...new Set(menuItems.map(item => item.category))].sort((a, b) => a.localeCompare(b, 'ru'));
  $('#menuCategories').innerHTML = categories.map(category => `<option value="${escapeHtml(category)}"></option>`).join('');
  const query = $('#menuSearch').value.trim().toLocaleLowerCase('ru-RU');
  const visibleItems = menuItems.filter(item => item.name.toLocaleLowerCase('ru-RU').includes(query));
  $('#menuList').innerHTML = visibleItems.map(item => `<article class="admin-menu-item${item.available === false ? ' is-unavailable' : ''}">
    <img src="${escapeHtml(item.image_url || 'assets/brand-logo.webp')}" alt="" loading="lazy">
    <div><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.category)} · ${escapeHtml(item.weight || 'Вес не указан')}</small></div>
    <b class="admin-menu-price">${formatPrice(item.price)}</b>
    <button class="admin-stock-button" type="button" data-toggle-stock="${Number(item.id)}" aria-pressed="${item.available !== false}" aria-label="${item.available === false ? 'Снять со стопа' : 'Поставить на стоп'}: ${escapeHtml(item.name)}">${item.available === false ? 'Убрать со стопа' : 'Поставить на стоп'}</button>
    <button class="admin-quiet-button" type="button" data-edit-menu="${Number(item.id)}">Изменить</button>
  </article>`).join('');
  $('#menuEmpty').hidden = visibleItems.length > 0;
  $('#menuEmpty').textContent = menuItems.length ? 'Блюда с таким названием не найдены.' : 'Блюд пока нет. Добавьте позицию через кнопку «Добавить блюдо».';
  $('#menuCount').textContent = query ? `Показано: ${visibleItems.length} из ${menuItems.length}.` : `Всего блюд: ${menuItems.length}.`;
}

function updateSelectionUi(kind, visibleKeys) {
  const selected = kind === 'orders' ? selectedOrders : selectedClients;
  const known = new Set(kind === 'orders' ? orders.map(order => order.id) : clientOrderIds.keys());
  [...selected].forEach(key => { if (!known.has(key)) selected.delete(key); });
  const count = selected.size;
  $(`#${kind}SelectedCount`).textContent = count ? `Выбрано: ${count}` : '';
  $(`#${kind}DeleteButton`).disabled = count === 0;
  const all = $(`#${kind}SelectAll`);
  const visibleSelected = visibleKeys.filter(key => selected.has(key)).length;
  all.checked = visibleKeys.length > 0 && visibleSelected === visibleKeys.length;
  all.indeterminate = visibleSelected > 0 && visibleSelected < visibleKeys.length;
}

function bindSelection(kind, selected, attribute, rerender, visibleKeys) {
  $(`#${kind}Table`).addEventListener('change', event => {
    const key = event.target.dataset?.[attribute];
    if (key === undefined) return;
    if (event.target.checked) selected.add(key); else selected.delete(key);
    updateSelectionUi(kind, visibleKeys());
  });
  $(`#${kind}SelectAll`).addEventListener('change', event => {
    for (const key of visibleKeys()) {
      if (event.target.checked) selected.add(key); else selected.delete(key);
    }
    rerender();
  });
}

function visibleClientKeys() {
  return [...$('#clientsTable').querySelectorAll('[data-client-select]')].map(input => input.dataset.clientSelect);
}

async function deleteOrdersByIds(ids) {
  for (let index = 0; index < ids.length; index += 100) {
    const chunk = ids.slice(index, index + 100);
    const {data, error} = await client.from('orders').delete().in('id', chunk).select('id');
    if (error) throw error;
    if ((data?.length || 0) !== chunk.length) throw new Error('База не разрешает удаление. Выполните в Supabase → SQL Editor команду из инструкции (политика Admins delete orders) и повторите.');
  }
}

async function deleteSelected(kind) {
  const ids = kind === 'orders'
    ? [...selectedOrders]
    : [...selectedClients].flatMap(key => clientOrderIds.get(key) || []);
  if (!ids.length) return;
  const text = kind === 'orders'
    ? `Удалить выбранные заказы (${selectedOrders.size}) без возможности восстановления?`
    : `Удалить выбранных клиентов (${selectedClients.size}) вместе со всеми их заказами (${ids.length})? Это нельзя отменить.`;
  if (!window.confirm(text)) return;
  const feedback = $('#dashboardFeedback');
  const button = $(`#${kind}DeleteButton`);
  button.disabled = true;
  try {
    await deleteOrdersByIds(ids);
    selectedOrders.clear();
    selectedClients.clear();
    const refreshed = await refreshDashboard();
    if (refreshed) setFeedback(feedback, 'Удалено.', true);
    feedback.scrollIntoView({block: 'center', behavior: 'smooth'});
  } catch (error) {
    console.error('Не удалось удалить записи.', error);
    setFeedback(feedback, `Не удалось удалить: ${error.message || 'ошибка базы данных'}`);
    await refreshDashboard();
    setFeedback(feedback, `Не удалось удалить: ${error.message || 'ошибка базы данных'}`);
    feedback.scrollIntoView({block: 'center', behavior: 'smooth'});
    window.alert(`Не удалось удалить: ${error.message || 'ошибка базы данных'}`);
  }
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
  editingMenuIds = item?.duplicateIds ?? [];
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
  if (Date.now() < lockedUntil) {
    setFeedback($('#loginFeedback'), `Слишком много попыток. Подождите ${Math.ceil((lockedUntil - Date.now()) / 1000)} сек.`);
    return;
  }
  const button = event.submitter;
  button.disabled = true;
  setFeedback($('#loginFeedback'), 'Выполняется вход...');
  const formData = new FormData(event.currentTarget);
  try {
    const {data, error} = await client.auth.signInWithPassword({email: String(formData.get('email')).trim(), password: formData.get('password')});
    if (error) throw error;
    if (!await verifyOwner(data.session)) return;
    failedLogins = 0;
    event.target.elements.password.value = '';
  } catch (error) {
    console.error('Не удалось войти в панель владельца.', error);
    failedLogins++;
    if (failedLogins >= 5) {
      lockedUntil = Date.now() + 60000 * Math.min(failedLogins - 4, 10);
    }
    showLogin('Не удалось войти. Проверьте email и пароль.');
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
  orders = [];
  menuItems = [];
  selectedOrders.clear();
  selectedClients.clear();
  renderAll();
});

$('#refreshButton').addEventListener('click', refreshDashboard);
$('#menuSearch').addEventListener('input', renderMenu);
document.querySelectorAll('.admin-tab').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    const selected = tab === button;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
  });
  for (const panel of ['orders', 'clients', 'contacts', 'menu']) $(`#${panel}Panel`).hidden = button.dataset.tab !== panel;
}));

$('#orderSearch').addEventListener('input', renderOrders);
$('#clientSearch').addEventListener('input', renderClients);
bindSelection('orders', selectedOrders, 'orderSelect', renderOrders, () => visibleOrders().map(order => order.id));
bindSelection('clients', selectedClients, 'clientSelect', renderClients, visibleClientKeys);
$('#ordersDeleteButton').addEventListener('click', () => deleteSelected('orders'));
$('#clientsDeleteButton').addEventListener('click', () => deleteSelected('clients'));
$('#contactsForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const button = event.submitter;
  button.disabled = true;
  setFeedback($('#contactsFeedback'), '');
  const values = Object.fromEntries(new FormData(form));
  try {
    const {error} = await client.from('restaurant_contacts').update({
      call_phone: String(values.call_phone).trim(),
      whatsapp_phone: String(values.whatsapp_phone).trim(),
      max_phone: String(values.max_phone).trim(),
      updated_at: new Date().toISOString()
    }).eq('id', true).select('id').single();
    if (error) throw error;
    restaurantContacts = {
      call_phone: String(values.call_phone).trim(),
      whatsapp_phone: String(values.whatsapp_phone).trim(),
      max_phone: String(values.max_phone).trim()
    };
    $('#contactsForm').querySelectorAll('input, button').forEach(element => { element.disabled = false; });
    setFeedback($('#contactsFeedback'), 'Контакты сохранены. Новые заказы и заявки будут направляться на эти номера.', true);
  } catch (error) {
    console.error('Не удалось сохранить контакты для заказов.', error);
    setFeedback($('#contactsFeedback'), 'Не удалось сохранить контакты. Проверьте подключение к базе и права владельца.');
  } finally {
    button.disabled = false;
  }
});
$('#addMenuButton').addEventListener('click', () => openMenuEditor());
$('#cancelMenuEdit').addEventListener('click', closeMenuEditor);
$('#menuList').addEventListener('click', event => {
  const stockButton = event.target.closest('[data-toggle-stock]');
  if (stockButton) {
    const item = menuItems.find(row => row.id === Number(stockButton.dataset.toggleStock));
    if (item) void setMenuAvailability(item, item.available === false);
    return;
  }
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
  const itemId = data.get('id');
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
      sort_order: Number(data.get('sort_order')),
      available: itemId ? menuItems.find(item => item.id === Number(itemId))?.available !== false : true
    };
    if (!Number.isSafeInteger(record.price) || record.price < 0 || !Number.isInteger(record.sort_order)) {
      throw new Error('Проверьте цену и порядок показа блюда.');
    }
    const result = itemId
      ? await client.from('menu_items').update(record).in('id', editingMenuIds).select('id')
      : await client.from('menu_items').insert(record).select('id');
    if (result.error) throw result.error;
    const expectedRows = itemId ? editingMenuIds.length : 1;
    if (result.data?.length !== expectedRows) {
      throw new Error(`База обновила ${result.data?.length ?? 0} из ${expectedRows} записей меню.`);
    }
    closeMenuEditor();
    const refreshed = await refreshDashboard();
    setFeedback($('#menuFeedback'), refreshed ? 'Блюдо сохранено. На открытом сайте обновите страницу или вернитесь на её вкладку.' : 'Блюдо сохранено, но список не обновился. Нажмите «Обновить данные».', refreshed);
  } catch (error) {
    console.error('Не удалось сохранить блюдо.', error);
    const message = typeof error?.message === 'string' ? error.message : '';
    setFeedback($('#menuFeedback'), message || 'Не удалось сохранить блюдо. Проверьте введённые данные и подключение к базе.');
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
  const {error} = await client.from('menu_items').delete().in('id', item.duplicateIds);
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

async function initialize() {
  try {
    client = window.createDoniSupabaseClient?.({auth: {persistSession: true, storage: window.sessionStorage, autoRefreshToken: true, detectSessionInUrl: false}}) || null;
  } catch (error) {
    console.error('Не удалось инициализировать Supabase для панели.', error);
    showLogin('Не удалось загрузить клиент Supabase. Проверьте подключение библиотеки и конфигурацию.');
    return;
  }
  if (!client) {
    showLogin('Подключите проект Supabase в файле supabase-config.js, затем выполните шаги из инструкции.');
    return;
  }
  try { localStorage.removeItem(Object.keys(localStorage).find(key => /^sb-.*-auth-token/.test(key)) || ''); } catch { /* storage unavailable */ }
  if (sessionExpired()) {
    await client.auth.signOut().catch(() => {});
    clearStoredSessions();
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
