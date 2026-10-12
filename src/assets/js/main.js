// Il Metrone — interazioni comuni: menu mobile, header, lightbox, avviso lingua, comparsa allo scroll.
(() => {
  const doc = document.documentElement;
  const body = document.body;

  /* menu mobile */
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    const label = toggle.querySelector('.nav-toggle-label');
    const setOpen = (open) => {
      body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? label.dataset.close : label.dataset.open;
    };
    toggle.addEventListener('click', () => setOpen(!body.classList.contains('nav-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && body.classList.contains('nav-open')) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* bordo dell'header dopo lo scroll */
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* comparsa allo scroll */
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* lightbox della galleria */
  const dialog = document.querySelector('[data-lightbox-dialog]');
  const dataEl = document.getElementById('lightbox-data');
  if (dialog && dataEl && typeof dialog.showModal === 'function') {
    const { of, items } = JSON.parse(dataEl.textContent);
    const imgEl = dialog.querySelector('[data-lightbox-img]');
    const caption = dialog.querySelector('[data-lightbox-caption]');
    const count = dialog.querySelector('[data-lightbox-count]');
    let index = 0;
    let opener = null;

    const show = (i) => {
      index = (i + items.length) % items.length;
      const it = items[index];
      imgEl.src = it.src;
      imgEl.srcset = it.srcset;
      imgEl.sizes = '(min-width: 1000px) 1000px, 92vw';
      imgEl.width = it.w;
      imgEl.height = it.h;
      imgEl.alt = it.alt;
      caption.textContent = it.alt;
      count.textContent = `${index + 1} ${of} ${items.length}`;
      // precarica la successiva
      const next = items[(index + 1) % items.length];
      const pre = new Image();
      pre.src = next.src;
    };
    const open = (i, trigger) => {
      opener = trigger || null;
      show(i);
      dialog.showModal();
      body.style.overflow = 'hidden';
    };

    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-lightbox]');
      const btn = e.target.closest('[data-lightbox-open]');
      if (link) { e.preventDefault(); open(Number(link.dataset.lightbox), link); }
      else if (btn) { open(Number(btn.dataset.lightboxOpen), btn); }
    });
    dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
    dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
    dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      body.style.overflow = '';
      if (opener) opener.focus();
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    let touchX = null;
    dialog.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* avviso lingua: propone la versione nella lingua del browser, se esiste */
  const hintData = document.getElementById('lang-hint');
  const KEY = 'metrone-lang-hint-dismissed';
  const storage = {
    get() { try { return localStorage.getItem(KEY); } catch { return '1'; } },
    set() { try { localStorage.setItem(KEY, '1'); } catch { /* storage non disponibile */ } },
  };
  if (hintData && !storage.get()) {
    const current = doc.lang;
    const alternates = new Map(
      [...document.querySelectorAll('link[rel="alternate"][hreflang]')]
        .filter((l) => l.hreflang !== 'x-default')
        .map((l) => [l.hreflang, l.href]),
    );
    const preferred = (navigator.languages || [navigator.language || ''])
      .map((l) => l.slice(0, 2).toLowerCase())
      .find((l) => alternates.has(l));
    if (preferred && preferred !== current) {
      const texts = JSON.parse(hintData.textContent)[preferred];
      const box = document.createElement('div');
      box.className = 'lang-hint';
      box.lang = preferred;
      box.setAttribute('role', 'region');
      box.setAttribute('aria-label', texts.text);
      box.innerHTML = `<p>${texts.text} <a href="${alternates.get(preferred)}" hreflang="${preferred}">${texts.go} →</a></p>
        <button type="button" aria-label="${texts.dismiss}"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
      box.querySelector('button').addEventListener('click', () => { storage.set(); box.remove(); });
      box.querySelector('a').addEventListener('click', () => storage.set());
      body.appendChild(box);
    }
  }
})();
