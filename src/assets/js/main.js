// Il Metrone — indice, testata, titolo corrente, tavole, carta, lightbox, avviso lingua.
(() => {
  const doc = document.documentElement;
  const body = document.body;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* indice (menu a tutto schermo) */
  const index = document.querySelector('[data-index]');
  const indexBtn = document.querySelector('[data-index-open]');
  if (index && indexBtn && typeof index.showModal === 'function') {
    indexBtn.addEventListener('click', () => index.showModal());
    index.querySelector('[data-index-close]').addEventListener('click', () => index.close());
    index.addEventListener('click', (e) => {
      if (e.target.closest('a')) index.close();
    });
    index.addEventListener('close', () => indexBtn.focus({ preventScroll: true }));
  }

  /* filetto sotto la testata dopo lo scroll */
  const header = document.querySelector('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* comparsa allo scroll */
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* titolo corrente sul margine (come la testatina di un libro) */
  const running = document.querySelector('[data-running]');
  const chapters = document.querySelectorAll('[data-chapter]');
  if (running && chapters.length && 'IntersectionObserver' in window) {
    const box = running.parentElement;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        running.textContent = entry.target.dataset.chapter;
        box.classList.toggle('is-dark', entry.target.dataset.tone === 'dark');
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    chapters.forEach((el) => io.observe(el));
    const foot = document.querySelector('.colophon');
    if (foot) { foot.dataset.chapter = 'Colophon'; io.observe(foot); }
  }

  /* tavole delle camere: frecce, contatore, trascinamento col mouse */
  const track = document.querySelector('[data-strip-track]');
  if (track) {
    const plates = [...track.children];
    const prev = document.querySelector('[data-strip-prev]');
    const next = document.querySelector('[data-strip-next]');
    const current = document.querySelector('[data-strip-current]');
    const label = current.textContent.split(' ')[0];
    const progress = document.createElement('div');
    progress.className = 'strip-progress';
    progress.innerHTML = '<span></span>';
    track.parentElement.appendChild(progress);
    const bar = progress.firstElementChild;
    bar.style.width = `${100 / plates.length}%`;

    const startPad = () => parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
    const nearest = () => {
      const x = track.scrollLeft + startPad();
      let best = 0;
      plates.forEach((p, i) => { if (Math.abs(p.offsetLeft - x) < Math.abs(plates[best].offsetLeft - x)) best = i; });
      return best;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const i = track.scrollLeft >= max - 4 ? plates.length - 1 : nearest();
      current.textContent = `${label} ${plates[i].dataset.plate}`;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max - 4;
      bar.style.left = `${(max > 0 ? track.scrollLeft / max : 0) * (100 - 100 / plates.length)}%`;
    };
    const go = (dir) => {
      const i = Math.max(0, Math.min(plates.length - 1, nearest() + dir));
      track.scrollTo({ left: plates[i].offsetLeft - startPad(), behavior: reduced ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    update();

    // trascinamento col mouse (su touch lo scroll è nativo)
    let drag = null;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, left: track.scrollLeft, moved: false };
    });
    window.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; track.classList.add('is-dragging'); }
      if (drag.moved) track.scrollLeft = drag.left - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      track.classList.remove('is-dragging');
      if (moved) { go(0); track.addEventListener('click', (ev) => ev.preventDefault(), { capture: true, once: true }); }
    });
  }

  /* carta dei dintorni: elenco e segnaposti si illuminano insieme */
  const itinerary = document.querySelector('[data-itinerary]');
  const map = document.querySelector('[data-map]');
  if (itinerary && map) {
    const setActive = (key) => {
      itinerary.querySelectorAll('[data-place]').forEach((li) => li.classList.toggle('is-active', li.dataset.place === key));
      map.querySelectorAll('.mk[data-place]').forEach((g) => g.classList.toggle('is-active', g.dataset.place === key));
    };
    const handler = (e) => {
      const el = e.target.closest('[data-place]');
      setActive(el ? el.dataset.place : null);
    };
    itinerary.addEventListener('pointerover', handler);
    itinerary.addEventListener('focusin', handler);
    itinerary.addEventListener('pointerleave', () => setActive(null));
    itinerary.addEventListener('focusout', () => setActive(null));
    map.addEventListener('pointerover', handler);
    map.addEventListener('pointerleave', () => setActive(null));
    // su schermi stretti la carta scorre: parte centrata su Custoza
    const scroller = map.querySelector('[data-map-scroll]');
    const home = map.querySelector('.mk--home');
    if (scroller && home && scroller.scrollWidth > scroller.clientWidth) {
      const s = scroller.getBoundingClientRect();
      const h = home.getBoundingClientRect();
      scroller.scrollLeft = h.left - s.left - s.width / 2 + h.width / 2;
    }
  }

  /* lightbox */
  const dialog = document.querySelector('[data-lightbox-dialog]');
  const dataEl = document.getElementById('lightbox-data');
  if (dialog && dataEl && typeof dialog.showModal === 'function') {
    const { of, items } = JSON.parse(dataEl.textContent);
    const imgEl = dialog.querySelector('[data-lightbox-img]');
    const caption = dialog.querySelector('[data-lightbox-caption]');
    const count = dialog.querySelector('[data-lightbox-count]');
    let i = 0;
    let opener = null;
    const show = (n) => {
      i = (n + items.length) % items.length;
      const it = items[i];
      Object.assign(imgEl, { src: it.src, srcset: it.srcset, sizes: '(min-width: 1000px) 1000px, 92vw', width: it.w, height: it.h, alt: it.alt });
      caption.textContent = it.caption;
      count.textContent = `${i + 1} ${of} ${items.length}`;
      new Image().src = items[(i + 1) % items.length].src;
    };
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-lightbox]');
      if (!link || e.defaultPrevented) return;
      e.preventDefault();
      opener = link;
      show(Number(link.dataset.lightbox));
      dialog.showModal();
      body.style.overflow = 'hidden';
    });
    dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(i - 1));
    dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(i + 1));
    dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { body.style.overflow = ''; if (opener) opener.focus({ preventScroll: true }); });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
    let tx = null;
    dialog.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener('touchend', (e) => {
      if (tx === null) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
      tx = null;
    });
  }

  /* avviso lingua: propone la versione nella lingua del browser */
  const hintData = document.getElementById('lang-hint');
  const KEY = 'metrone-lang-hint-dismissed';
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch { return '1'; } },
    set() { try { localStorage.setItem(KEY, '1'); } catch { /* storage non disponibile */ } },
  };
  if (hintData && !store.get()) {
    const alternates = new Map(
      [...document.querySelectorAll('link[rel="alternate"][hreflang]')]
        .filter((l) => l.hreflang !== 'x-default')
        .map((l) => [l.hreflang, l.href]),
    );
    const preferred = (navigator.languages || [navigator.language || ''])
      .map((l) => l.slice(0, 2).toLowerCase())
      .find((l) => alternates.has(l));
    if (preferred && preferred !== doc.lang) {
      const texts = JSON.parse(hintData.textContent)[preferred];
      const box = document.createElement('div');
      box.className = 'lang-hint';
      box.lang = preferred;
      box.setAttribute('role', 'region');
      box.setAttribute('aria-label', texts.text);
      box.innerHTML = `<p>${texts.text} <a href="${alternates.get(preferred)}" hreflang="${preferred}">${texts.go}</a></p>
        <button type="button" aria-label="${texts.dismiss}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M4 4l16 16M20 4 4 20"/></svg></button>`;
      box.querySelector('button').addEventListener('click', () => { store.set(); box.remove(); });
      box.querySelector('a').addEventListener('click', () => store.set());
      body.appendChild(box);
    }
  }
})();
