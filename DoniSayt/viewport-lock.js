(() => {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) return;
  const normal = viewport.getAttribute('content');
  const locked = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
  const modals = ['orderModal', 'bookingModal'].map(id => document.getElementById(id)).filter(Boolean);
  const touch = matchMedia('(hover: none)').matches;
  const sync = () => viewport.setAttribute('content', touch || modals.some(modal => modal.classList.contains('show')) ? locked : normal);
  const observer = new MutationObserver(sync);
  modals.forEach(modal => observer.observe(modal, {attributes: true, attributeFilter: ['class']}));
  sync();
  if (touch) {
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(type => document.addEventListener(type, e => e.preventDefault()));
    document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, {passive: false});
  }
})();
