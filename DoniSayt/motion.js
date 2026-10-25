(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.getElementById('top');
  let frame = null;

  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function stopScroll() {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
  }

  function scrollToY(target) {
    stopScroll();
    const start = window.scrollY;
    const distance = target - start;
    if (reduceMotion.matches || Math.abs(distance) < 2) {
      window.scrollTo(0, target);
      return;
    }
    const duration = Math.min(1500, Math.max(750, Math.abs(distance) * 0.45));
    const startTime = performance.now();
    const step = now => {
      const progress = Math.min(1, (now - startTime) / duration);
      window.scrollTo(0, start + distance * easeInOut(progress));
      frame = progress < 1 ? requestAnimationFrame(step) : null;
    };
    frame = requestAnimationFrame(step);
  }

  ['wheel', 'touchstart', 'keydown'].forEach(name => window.addEventListener(name, stopScroll, {passive: true}));

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
    const id = link.getAttribute('href').slice(1);
    if (id === 'top' || id === '') {
      event.preventDefault();
      scrollToY(0);
      history.replaceState(null, '', location.pathname + location.search);
      return;
    }
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const offset = (header?.offsetHeight || 76) + 8;
    scrollToY(Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset));
    history.replaceState(null, '', `#${id}`);
  });

  let scrolled = false;
  const updateHeader = () => {
    const next = window.scrollY > 12;
    if (next !== scrolled) {
      scrolled = next;
      header?.classList.toggle('is-scrolled', next);
    }
  };
  window.addEventListener('scroll', updateHeader, {passive: true});
  updateHeader();

  document.querySelectorAll('.reveal').forEach((element, index) => {
    if (!element.closest('.menu-grid')) element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 90}ms`);
  });
})();
