(() => {
  const metrikaId = String(window.DONISHEF_METRIKA_ID || '').replace(/\D/g, '');
  const storageKey = 'donishef-cookie-consent';
  const readChoice = () => { try { return localStorage.getItem(storageKey); } catch { return null; } };
  const saveChoice = value => { try { localStorage.setItem(storageKey, value); } catch { /* storage unavailable */ } };

  function loadMetrika() {
    if (!metrikaId || window.ym) return;
    (function(m, e, t, r, i, k, a) {
      m[i] = m[i] || function() { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(Number(metrikaId), 'init', {clickmap: true, trackLinks: true, accurateTrackBounce: true});
  }

  function closeBanner() { document.getElementById('cookieBanner')?.remove(); }

  function showBanner() {
    closeBanner();
    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Использование cookie');
    banner.innerHTML = '<p>Мы используем Яндекс Метрику и cookies для улучшения работы сайта. Продолжая пользоваться сайтом, вы принимаете <a href="privacy-policy.pdf" target="_blank" rel="noopener">условия обработки персональных данных</a>.</p><button type="button" class="cookie-accept" data-cookie="accepted">Принять</button>';
    banner.addEventListener('click', event => {
      const button = event.target.closest('[data-cookie]');
      if (!button) return;
      saveChoice(button.dataset.cookie);
      if (button.dataset.cookie === 'accepted') loadMetrika();
      closeBanner();
    });
    document.body.append(banner);
  }

  const choice = readChoice();
  if (choice === 'accepted') loadMetrika();
  else showBanner();
})();
