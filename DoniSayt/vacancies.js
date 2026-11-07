const status = document.getElementById('vacanciesStatus');
const contactStatus = document.getElementById('vacanciesContactStatus');
const list = document.getElementById('vacanciesList');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
let client = null;
let callPhone = null;
const burger = document.getElementById('burger');
const siteNav = document.getElementById('siteNav');

function setMenuOpen(isOpen) {
  siteNav.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', String(isOpen));
  burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
}
burger.addEventListener('click', () => setMenuOpen(!siteNav.classList.contains('open')));
siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));

try {
  client = window.createDoniSupabaseClient?.() || null;
} catch (error) {
  console.error('Не удалось подключить онлайн-базу ДониШеф.', error);
}

async function loadVacancies() {
  if (!client) {
    status.textContent = 'Не удалось загрузить вакансии. Контакты чайханы можно найти на главной странице.';
    status.hidden = false;
    return;
  }
  try {
    const vacancies = [];
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const {data, error} = await client.from('vacancies').select('id,title,salary,description,address').order('created_at', {ascending: false}).order('id').range(offset, offset + pageSize - 1);
      if (error) throw error;
      vacancies.push(...data);
      if (data.length < pageSize) break;
    }
    list.innerHTML = vacancies.map(vacancy => `<article class="vacancy-card"><h2>${escapeHtml(vacancy.title)}</h2>${vacancy.salary ? `<div class="vacancy-salary">${escapeHtml(vacancy.salary)}</div>` : ''}<p class="vacancy-address"><strong>Адрес работы:</strong> ${escapeHtml(vacancy.address || 'уточняйте по телефону')}</p><p class="vacancy-description">${escapeHtml(vacancy.description)}</p>${callPhone ? `<a class="btn btn-outline" href="tel:${escapeHtml(callPhone)}">Позвонить о вакансии</a>` : ''}</article>`).join('');
    status.textContent = vacancies.length ? '' : 'Сейчас открытых вакансий нет. Загляните позже.';
    status.hidden = Boolean(vacancies.length);
  } catch (error) {
    console.error('Не удалось загрузить вакансии.', error);
    list.replaceChildren();
    status.hidden = false;
    status.textContent = 'Не удалось загрузить вакансии. Контакты чайханы можно найти на главной странице.';
  }
}

async function refreshVacancies() {
  if (client) {
    try {
      const {data, error} = await client.from('restaurant_contacts').select('call_phone').eq('id', true).single();
      if (error) throw error;
      if (!data || !/^\+[1-9]\d{7,14}$/.test(data.call_phone)) throw new Error('Неверный номер телефона.');
      callPhone = data.call_phone;
      contactStatus.hidden = true;
    } catch (error) {
      console.error('Не удалось загрузить телефон чайханы.', error);
      callPhone = null;
      contactStatus.textContent = 'Не удалось загрузить телефон. Контакты чайханы можно найти на главной странице.';
      contactStatus.hidden = false;
    }
  }
  await loadVacancies();
}

refreshVacancies();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refreshVacancies();
});
