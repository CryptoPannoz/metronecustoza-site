// Il Metrone — calendario disponibilità e richiesta di prenotazione.
// GET  endpoint -> [{from:'YYYY-MM-DD', to:'YYYY-MM-DD'}] notti occupate (to = giorno di partenza, libero)
// POST endpoint -> registra la richiesta nel foglio [MASTER] e invia le email (risposta opaca, mode no-cors)
(() => {
  const root = document.querySelector('[data-booking]');
  const cfgEl = document.getElementById('booking-config');
  if (!root || !cfgEl) return;

  const cfg = JSON.parse(cfgEl.textContent);
  const t = cfg.t;
  const fill = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  /* date come stringhe 'YYYY-MM-DD'; i calcoli in UTC evitano sorprese con l'ora legale */
  const iso = (y, m, d) => new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const addDays = (s, n) => { const d = parse(s); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const diff = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const now = new Date();
  const today = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const maxDate = addDays(today, 730);

  const fmt = (opts) => new Intl.DateTimeFormat(cfg.locale, { timeZone: 'UTC', ...opts });
  const fmtShort = fmt({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const fmtMonth = fmt({ month: 'long', year: 'numeric' });
  const fmtLabel = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtWd = fmt({ weekday: 'short' });
  const weekdays = Array.from({ length: 7 }, (_, i) => fmtWd.format(new Date(Date.UTC(2024, 0, 1 + i)))); // 1/1/2024 = lunedì
  const human = (s) => fmtShort.format(parse(s));
  const sheetDate = (s) => s.split('-').reverse().join('/');
  const nightsLabel = (n) => `${n} ${n === 1 ? t.night : t.nights}`;

  const $ = (sel) => root.querySelector(sel);
  const monthsEl = $('[data-cal-months]');
  const noticeEl = $('[data-cal-notice]');
  const prevBtn = $('[data-cal-prev]');
  const nextBtn = $('[data-cal-next]');
  const outIn = $('[data-out-checkin]');
  const outOut = $('[data-out-checkout]');
  const hint = $('[data-hint]');
  const clearBtn = $('[data-clear]');
  const contBtn = $('[data-continue]');
  const form = $('form[data-step="guests"]');
  const chosen = $('[data-chosen]');
  const guestsError = $('[data-guests-error]');
  const sendError = $('[data-send-error]');
  const submitBtn = $('[data-submit]');
  const doneText = $('[data-done-text]');
  const panels = { dates: $('[data-step="dates"]'), guests: form, done: $('[data-step="done"]') };
  const stepLabels = root.querySelectorAll('[data-step-label]');
  const double = window.matchMedia('(min-width: 720px)');

  const state = {
    booked: new Set(),
    loaded: false,
    checkIn: null,
    checkOut: null,
    limit: null, // ultimo giorno di partenza possibile dopo il check-in scelto
    hover: null,
    view: { y: now.getFullYear(), m: now.getMonth() },
  };

  /* ---------- regole ---------- */

  const canCheckIn = (date) => {
    if (date < today || date > maxDate) return false;
    for (let i = 0; i < cfg.minNights; i++) if (state.booked.has(addDays(date, i))) return false;
    return true;
  };

  const checkoutLimit = (start) => {
    for (let d = addDays(start, 1); d <= maxDate; d = addDays(d, 1)) if (state.booked.has(d)) return d;
    return maxDate;
  };

  const picking = () => Boolean(state.checkIn && !state.checkOut);

  /* ---------- disegno del calendario ---------- */

  function dayCell(date) {
    const past = date < today;
    const booked = state.booked.has(date);
    const prevBooked = state.booked.has(addDays(date, -1));
    const cls = ['cal-day'];
    let enabled = false;

    if (date === today) cls.push('is-today');
    if (!past) {
      if (booked && !prevBooked) cls.push('is-turn-in');
      else if (booked) cls.push('is-booked');
      else if (prevBooked) cls.push('is-turn-out');

      if (picking()) {
        if (date === state.checkIn) enabled = true;
        else if (date > state.checkIn) enabled = date <= state.limit;
        else enabled = canCheckIn(date);
      } else {
        enabled = canCheckIn(date);
      }
      if (!enabled && !booked) cls.push('is-short');
    }

    let selected = false;
    if (state.checkIn) {
      if (date === state.checkIn) {
        cls.push('is-start');
        selected = true;
        if (state.checkOut) cls.push('has-range');
      } else if (state.checkOut && date === state.checkOut) {
        cls.push('is-end');
        selected = true;
      } else if (state.checkOut && date > state.checkIn && date < state.checkOut) {
        cls.push('is-range');
      }
    }

    const label = fmtLabel.format(parse(date)) + (enabled || selected ? '' : `, ${t.unavailable}`);
    return `<button type="button" class="${cls.join(' ')}" data-date="${date}" aria-label="${label}"${selected ? ' aria-pressed="true"' : ''}${enabled ? '' : ' disabled'}><span>${Number(date.slice(8))}</span></button>`;
  }

  function monthHtml(y, m) {
    const first = new Date(Date.UTC(y, m, 1));
    const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const offset = (first.getUTCDay() + 6) % 7; // settimana da lunedì
    const title = fmtMonth.format(first);
    let cells = weekdays.map((w) => `<span class="cal-wd" aria-hidden="true">${w}</span>`).join('');
    for (let i = 0; i < offset; i++) cells += '<span class="cal-day is-empty" aria-hidden="true"></span>';
    for (let d = 1; d <= days; d++) cells += dayCell(iso(y, m, d));
    return `<div class="cal-month"><h3>${title}</h3><div class="cal-grid" role="group" aria-label="${title}">${cells}</div></div>`;
  }

  function render() {
    if (!state.loaded) return;
    const count = double.matches ? 2 : 1;
    let html = '';
    for (let k = 0; k < count; k++) {
      const d = new Date(Date.UTC(state.view.y, state.view.m + k, 1));
      html += monthHtml(d.getUTCFullYear(), d.getUTCMonth());
    }
    monthsEl.innerHTML = html;
    monthsEl.classList.toggle('is-double', count === 2);

    const lastShown = new Date(Date.UTC(state.view.y, state.view.m + count - 1, 1)).toISOString().slice(0, 7);
    prevBtn.disabled = state.view.y === now.getFullYear() && state.view.m === now.getMonth();
    nextBtn.disabled = lastShown >= maxDate.slice(0, 7);

    outIn.textContent = state.checkIn ? human(state.checkIn) : '—';
    outOut.textContent = state.checkOut ? human(state.checkOut) : '—';
    contBtn.disabled = !(state.checkIn && state.checkOut);
    clearBtn.hidden = !state.checkIn;
  }

  function paintHover() {
    const h = picking() && state.hover && state.hover > state.checkIn && state.hover <= state.limit ? state.hover : null;
    monthsEl.querySelectorAll('.cal-day[data-date]').forEach((btn) => {
      const d = btn.dataset.date;
      btn.classList.toggle('is-hover', Boolean(h) && d > state.checkIn && d < h);
      btn.classList.toggle('is-end', Boolean(h) && d === h);
      if (d === state.checkIn) btn.classList.toggle('has-range', Boolean(h));
    });
  }

  function setHint(error = '') {
    hint.classList.toggle('is-error', Boolean(error));
    if (error) hint.textContent = error;
    else if (!state.checkIn) hint.textContent = t.hintCheckin;
    else if (!state.checkOut) hint.textContent = fill(t.hintCheckout, { n: cfg.minNights });
    else hint.textContent = `${nightsLabel(diff(state.checkIn, state.checkOut))} · ${t.hintReady}`;
  }

  /* ---------- interazione ---------- */

  function pick(date) {
    let error = '';
    if (picking() && date === state.checkIn) {
      state.checkIn = null;
    } else if (picking() && date > state.checkIn) {
      if (diff(state.checkIn, date) < cfg.minNights) error = fill(t.errMin, { n: cfg.minNights });
      else if (date > state.limit) error = t.errBlocked;
      else state.checkOut = date;
    } else {
      state.checkIn = date;
      state.checkOut = null;
      state.limit = checkoutLimit(date);
    }
    state.hover = null;
    render();
    setHint(error);
    const again = monthsEl.querySelector(`[data-date="${date}"]`);
    if (again && !again.disabled) again.focus({ preventScroll: true });
  }

  monthsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.cal-day[data-date]');
    if (btn && !btn.disabled) pick(btn.dataset.date);
  });

  monthsEl.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse' || !picking()) return;
    const btn = e.target.closest('.cal-day[data-date]');
    const date = btn && !btn.disabled ? btn.dataset.date : null;
    if (date !== state.hover) { state.hover = date; paintHover(); }
  });
  monthsEl.addEventListener('pointerleave', () => { if (state.hover) { state.hover = null; paintHover(); } });

  // frecce della tastiera tra i giorni visibili
  monthsEl.addEventListener('keydown', (e) => {
    const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const btn = e.target.closest('.cal-day[data-date]');
    if (!btn || !(e.key in steps)) return;
    e.preventDefault();
    let d = btn.dataset.date;
    for (let i = 0; i < 62; i++) {
      d = addDays(d, steps[e.key]);
      const target = monthsEl.querySelector(`[data-date="${d}"]`);
      if (!target) return;
      if (!target.disabled) { target.focus(); return; }
    }
  });

  const shiftMonth = (n) => {
    const d = new Date(Date.UTC(state.view.y, state.view.m + n, 1));
    state.view = { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    render();
  };
  prevBtn.addEventListener('click', () => shiftMonth(-1));
  nextBtn.addEventListener('click', () => shiftMonth(1));
  double.addEventListener('change', render);

  clearBtn.addEventListener('click', () => {
    state.checkIn = null;
    state.checkOut = null;
    render();
    setHint();
  });

  /* ---------- passi ---------- */

  function go(step) {
    Object.entries(panels).forEach(([key, el]) => { el.hidden = key !== step; });
    stepLabels.forEach((li) => {
      const key = li.dataset.stepLabel;
      li.classList.toggle('is-current', key === step || (step === 'done' && key === 'guests'));
      li.classList.toggle('is-done', (key === 'dates' && step !== 'dates') || (key === 'guests' && step === 'done'));
    });
    const top = root.getBoundingClientRect().top;
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 96, behavior: 'smooth' });
  }

  contBtn.addEventListener('click', () => {
    if (!(state.checkIn && state.checkOut)) return;
    chosen.textContent = `${human(state.checkIn)} → ${human(state.checkOut)} · ${nightsLabel(diff(state.checkIn, state.checkOut))}`;
    go('guests');
    form.elements.name.focus({ preventScroll: true });
  });
  $('[data-back]').addEventListener('click', () => go('dates'));

  const totalGuests = () => Number(form.elements.adults.value) + Number(form.elements.children.value);
  const checkGuests = () => {
    const ok = totalGuests() <= cfg.maxGuests;
    guestsError.hidden = ok;
    return ok;
  };
  form.elements.adults.addEventListener('change', checkGuests);
  form.elements.children.addEventListener('change', checkGuests);

  function mailtoHref(payload) {
    const body = [
      `${t.checkin}: ${payload.checkIn}`,
      `${t.checkout}: ${payload.checkOut}`,
      `${t.adults}: ${payload.adults} · ${t.children}: ${payload.children}`,
      `${t.name}: ${payload.guestName}`,
      `${t.phone}: ${payload.guestPhone}`,
      '',
      payload.specialRequests,
    ].join('\n');
    return `mailto:${cfg.email}?subject=${encodeURIComponent(`Il Metrone · ${payload.checkIn} – ${payload.checkOut}`)}&body=${encodeURIComponent(body)}`;
  }

  function showDone(email) {
    doneText.innerHTML = fill(t.doneText, { email: `<strong>${escapeHtml(email)}</strong>` });
    go('done');
    panels.done.focus({ preventScroll: true });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    sendError.hidden = true;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!checkGuests()) return;

    const data = new FormData(form);
    const email = String(data.get('email')).trim();
    if (data.get('website')) { showDone(email); return; } // campo trappola compilato: è un bot

    const adults = Number(data.get('adults'));
    const children = Number(data.get('children'));
    let notes = String(data.get('message') || '').trim();
    if (cfg.lang !== 'it') notes += `${notes ? '\n\n' : ''}[${cfg.langName}]`;
    const payload = {
      guestName: String(data.get('name')).trim(),
      guestEmail: email,
      guestPhone: String(data.get('phone')).trim(),
      checkIn: sheetDate(state.checkIn),
      checkOut: sheetDate(state.checkOut),
      nights: diff(state.checkIn, state.checkOut),
      adults,
      children,
      totalGuests: adults + children,
      pets: 'no',
      specialRequests: notes,
      language: cfg.lang,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = t.sending;
    try {
      await fetch(cfg.endpoint, {
        method: 'POST',
        mode: 'no-cors', // Apps Script non espone CORS sul POST: la risposta è opaca
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      showDone(email);
    } catch {
      sendError.innerHTML = fill(t.sendError, { email: `<a href="${mailtoHref(payload)}">${cfg.email}</a>` });
      sendError.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t.send;
    }
  });

  $('[data-again]').addEventListener('click', () => {
    form.reset();
    state.checkIn = null;
    state.checkOut = null;
    render();
    setHint();
    go('dates');
  });

  /* ---------- disponibilità ---------- */

  function start(ranges, failed) {
    ranges.forEach(({ from, to } = {}) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return;
      for (let d = from; d < to; d = addDays(d, 1)) state.booked.add(d);
    });
    if (failed) {
      noticeEl.innerHTML = fill(t.loadError, { email: `<a href="mailto:${cfg.email}">${cfg.email}</a>` });
      noticeEl.hidden = false;
    }
    state.loaded = true;
    render();
    setHint();
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  fetch(cfg.endpoint, { signal: controller.signal })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((ranges) => start(Array.isArray(ranges) ? ranges : [], !Array.isArray(ranges)))
    .catch(() => start([], true))
    .finally(() => clearTimeout(timer));
})();
