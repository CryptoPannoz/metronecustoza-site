import { icon } from './icons.mjs';
import { photos, gallery } from './photos.mjs';

// Sostituisce i segnaposto {chiave} con i valori dati.
export const fill = (str, vars) => str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripTags = (s) => s.replace(/<[^>]+>/g, '');

// <img> responsive da photos.mjs
function img(c, key, { sizes = '100vw', cls = '', eager = false } = {}) {
  const p = photos[key];
  const largest = p.widths[p.widths.length - 1];
  const srcset = p.widths.map((w) => `${c.rel(`assets/img/${key}-${w}.webp`)} ${w}w`).join(', ');
  return `<img${cls ? ` class="${cls}"` : ''} src="${c.rel(`assets/img/${key}-${largest}.webp`)}" srcset="${srcset}" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(p.alt[c.lang])}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
}

function mailLink(c) {
  return `<a href="mailto:${c.site.email}">${c.site.email}</a>`;
}

/* ---------- layout ---------- */

function head(c, { title, description, extraHead = '' }) {
  const alternates = c.languages
    .map((l) => `<link rel="alternate" hreflang="${l.code}" href="${c.abs(c.routes[l.code][c.pageKey])}">`)
    .join('\n  ');
  const ogLocales = { it: 'it_IT', en: 'en_GB', de: 'de_DE' };
  return `<!doctype html>
<html lang="${c.lang}" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${c.site.indexable ? '' : '<meta name="robots" content="noindex, nofollow">'}
  ${c.pageKey === 'notFound' ? `<base href="${c.basePath}">` : `<link rel="canonical" href="${c.abs(c.route)}">
  ${alternates}
  <link rel="alternate" hreflang="x-default" href="${c.abs(c.routes.it[c.pageKey])}">`}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Il Metrone">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${c.abs(c.route)}">
  <meta property="og:image" content="${c.abs('assets/img/og-facciata.jpg')}">
  <meta property="og:image:width" content="800">
  <meta property="og:image:height" content="533">
  <meta property="og:locale" content="${ogLocales[c.lang]}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#2e4a3b">
  <link rel="icon" href="${c.rel('assets/favicon.svg')}" type="image/svg+xml">
  <link rel="preload" href="${c.rel('assets/fonts/cormorant-garamond-normal.woff2')}" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${c.rel('assets/fonts/manrope.woff2')}" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${c.asset('assets/css/site.css')}">
  <script>document.documentElement.classList.replace('no-js','js')</script>
  ${extraHead}
</head>`;
}

function header(c) {
  const t = c.t.nav;
  const home = c.rel(c.routes[c.lang].home);
  const anchor = (id) => (c.pageKey === 'home' ? `#${id}` : `${home}#${id}`);
  const langLinks = c.languages
    .map((l) => {
      const current = l.code === c.lang;
      const target = c.routes[l.code][c.pageKey] ?? c.routes[l.code].home;
      return `<a href="${c.rel(target)}" hreflang="${l.code}" lang="${l.code}" title="${l.label}"${current ? ' aria-current="true"' : ''}>${l.short}</a>`;
    })
    .join('');
  const link = (href, label, key) => `<li><a href="${href}"${c.pageKey === key ? ' aria-current="page"' : ''}>${label}</a></li>`;
  return `
<a class="skip-link" href="#main">${c.t.skip}</a>
<header class="site-header" data-header>
  <div class="wrap header-inner">
    <a class="brand" href="${home}">
      <span class="brand-name">Il Metrone</span>
      <span class="brand-place">Custoza · Verona</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
      <span class="nav-toggle-bars" aria-hidden="true"></span>
      <span class="nav-toggle-label" data-open="${t.menu}" data-close="${t.close}">${t.menu}</span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Menu">
      <ul class="nav-list">
        ${link(anchor('house'), t.house)}
        ${link(anchor('rooms'), t.rooms)}
        ${link(anchor('amenities'), t.amenities)}
        ${link(anchor('area'), t.area)}
        ${link(c.rel(c.routes[c.lang].faq), t.faq, 'faq')}
      </ul>
      <div class="nav-lang" role="group" aria-label="${t.language}">${langLinks}</div>
      <a class="btn btn--small nav-cta" href="${c.rel(c.routes[c.lang].book)}"${c.pageKey === 'book' ? ' aria-current="page"' : ''}>${t.book}</a>
    </nav>
  </div>
</header>`;
}

function footer(c) {
  const t = c.t.footer;
  const r = c.routes[c.lang];
  const a = c.site.address;
  return `
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <p class="brand-name">Il Metrone</p>
      <p>${t.tagline}</p>
    </div>
    <div>
      <h2 class="footer-title">${t.contact}</h2>
      <address>
        ${a.street}<br>${a.postalCode} ${a.locality} (${a.region})<br>
        <a href="mailto:${c.site.email}">${c.site.email}</a><br>
        <a href="${c.site.instagram}" rel="noopener">Instagram</a>
      </address>
    </div>
    <div>
      <h2 class="footer-title">${t.explore}</h2>
      <ul class="footer-links">
        <li><a href="${c.rel(r.book)}">${c.t.nav.book}</a></li>
        <li><a href="${c.rel(r.faq)}">${c.t.nav.faq}</a></li>
        <li><a href="${c.rel(r.privacy)}">${t.privacy}</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <p>© ${c.year} Il Metrone. ${t.rights}</p>
    <p>${t.cin} ${c.site.cin}</p>
  </div>
</footer>`;
}

function langHintData(c) {
  // Testi dell'avviso lingua, nella lingua suggerita (letti da main.js).
  const data = Object.fromEntries(c.languages.map((l) => [l.code, c.all[l.code].langHint]));
  return `<script type="application/json" id="lang-hint">${JSON.stringify(data)}</script>`;
}

function page(c, { title, description, body, extraHead = '', scripts = '' }) {
  return `${head(c, { title, description, extraHead })}
<body class="page-${c.pageKey}">
${header(c)}
<main id="main">
${body}
</main>
${footer(c)}
${langHintData(c)}
<script src="${c.asset('assets/js/main.js')}" defer></script>
${scripts}
</body>
</html>
`;
}

/* ---------- pagine ---------- */

export function home(c) {
  const t = c.t.home;
  const r = c.routes[c.lang];
  const a = c.site.address;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Il Metrone',
    description: t.description,
    url: c.abs(c.route),
    image: c.abs('assets/img/og-facciata.jpg'),
    email: c.site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.street,
      postalCode: a.postalCode,
      addressLocality: a.locality,
      addressRegion: a.region,
      addressCountry: a.country,
    },
    numberOfRooms: 6,
    checkinTime: '17:00',
    checkoutTime: '10:00',
    petsAllowed: false,
    amenityFeature: t.amenities.items.map(([, name]) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
    sameAs: [c.site.instagram],
  };

  const facts = t.facts.map(([n, label]) => `<li><span class="fact-n">${n}</span><span class="fact-l">${label}</span></li>`).join('');

  const galleryItems = gallery.map((key, i) => {
    const p = photos[key];
    const largest = p.widths[p.widths.length - 1];
    const hidden = i >= 9 ? ' hidden' : '';
    const sizes = i === 0 ? '(min-width: 900px) 560px, 100vw' : '(min-width: 900px) 280px, 50vw';
    return `<li class="gallery-item${i === 0 ? ' gallery-item--big' : ''}"${hidden}>
          <a href="${c.rel(`assets/img/${key}-${largest}.webp`)}" data-lightbox="${i}" aria-label="${esc(t.rooms.open)}: ${esc(p.alt[c.lang])}">
            ${img(c, key, { sizes })}
          </a>
        </li>`;
  }).join('\n        ');

  const lightboxData = gallery.map((key) => {
    const p = photos[key];
    return {
      src: c.rel(`assets/img/${key}-${p.widths[p.widths.length - 1]}.webp`),
      srcset: p.widths.map((w) => `${c.rel(`assets/img/${key}-${w}.webp`)} ${w}w`).join(', '),
      w: p.w, h: p.h, alt: p.alt[c.lang],
    };
  });

  const amenities = t.amenities.items.map(([ic, name, text]) => `
        <li class="amenity" data-reveal>
          <span class="amenity-icon">${icon(ic)}</span>
          <h3>${name}</h3>
          <p>${text}</p>
        </li>`).join('');

  const places = t.area.places.map(([name, dist]) => `<li><span>${name}</span><span class="place-dist">${dist}</span></li>`).join('\n            ');

  const body = `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-text">
      <p class="eyebrow">${t.hero.eyebrow}</p>
      <h1 class="hero-title">${t.hero.title}<span class="hero-tagline">${t.hero.tagline}</span></h1>
      <p class="lead">${t.hero.lead}</p>
      <div class="hero-actions">
        <a class="btn" href="${c.rel(r.book)}">${t.hero.cta}</a>
        <a class="btn btn--ghost" href="#house">${t.hero.cta2}</a>
      </div>
    </div>
    <figure class="hero-media">
      ${img(c, 'facciata', { sizes: '(min-width: 900px) 640px, 100vw', eager: true })}
    </figure>
  </div>
  <div class="wrap">
    <ul class="facts">${facts}</ul>
  </div>
</section>

<section id="house" class="section house">
  <div class="wrap house-grid">
    <div class="house-text" data-reveal>
      <p class="eyebrow">${t.house.eyebrow}</p>
      <h2>${t.house.title}</h2>
      ${t.house.paragraphs.map((p) => `<p>${p}</p>`).join('\n      ')}
    </div>
    <figure class="house-media" data-reveal>
      <a href="${c.rel('assets/img/corridoio-1000.webp')}" data-lightbox="${gallery.indexOf('corridoio')}" aria-label="${esc(t.rooms.open)}: ${esc(photos.corridoio.alt[c.lang])}">
        ${img(c, 'corridoio', { sizes: '(min-width: 900px) 480px, 100vw' })}
      </a>
    </figure>
  </div>
</section>

<section id="rooms" class="section rooms">
  <div class="wrap">
    <header class="section-head" data-reveal>
      <p class="eyebrow">${t.rooms.eyebrow}</p>
      <h2>${t.rooms.title}</h2>
      <p>${t.rooms.text}</p>
    </header>
    <ul class="gallery">
        ${galleryItems}
    </ul>
    <p class="gallery-more"><button class="link-btn" type="button" data-lightbox-open="0">${t.rooms.all} (${gallery.length}) ${icon('arrow')}</button></p>
  </div>
</section>

<section id="amenities" class="section amenities">
  <div class="wrap">
    <header class="section-head" data-reveal>
      <p class="eyebrow">${t.amenities.eyebrow}</p>
      <h2>${t.amenities.title}</h2>
    </header>
    <ul class="amenity-grid">${amenities}
    </ul>
  </div>
</section>

<section id="area" class="section area">
  <div class="wrap area-grid">
    <div class="area-text" data-reveal>
      <p class="eyebrow">${t.area.eyebrow}</p>
      <h2>${t.area.title}</h2>
      <p>${t.area.text}</p>
      <ul class="area-links">
        <li><a href="${c.site.activitiesMapUrl}" rel="noopener" target="_blank">${icon('pin')}<span>${t.area.map}</span></a></li>
        <li><a href="${c.site.mapsUrl}" rel="noopener" target="_blank">${icon('external')}<span>${t.area.directions}</span></a></li>
      </ul>
    </div>
    <div class="area-places" data-reveal>
      <ol class="places">
            ${places}
      </ol>
      <p class="note">${t.area.note}</p>
    </div>
  </div>
</section>

<section class="section welcome">
  <div class="wrap welcome-inner" data-reveal>
    <p class="eyebrow">${t.welcome.eyebrow}</p>
    <h2>${t.welcome.title}</h2>
    <p class="welcome-text">${t.welcome.text}</p>
    <p class="signature">${t.welcome.signature}</p>
  </div>
</section>

<section class="section cta">
  <div class="wrap cta-inner" data-reveal>
    <h2>${t.cta.title}</h2>
    <p>${t.cta.text}</p>
    <a class="btn btn--light" href="${c.rel(r.book)}">${t.cta.button}</a>
  </div>
</section>

<dialog class="lightbox" data-lightbox-dialog aria-label="${esc(t.rooms.eyebrow)}">
  <figure class="lightbox-figure">
    <img class="lightbox-img" alt="" data-lightbox-img>
    <figcaption class="lightbox-caption"><span data-lightbox-caption></span> <span class="lightbox-count" data-lightbox-count></span></figcaption>
  </figure>
  <button class="lightbox-btn lightbox-close" type="button" data-lightbox-close aria-label="${c.t.lightbox.close}">${icon('close')}</button>
  <button class="lightbox-btn lightbox-prev" type="button" data-lightbox-prev aria-label="${c.t.lightbox.prev}">${icon('chevronLeft')}</button>
  <button class="lightbox-btn lightbox-next" type="button" data-lightbox-next aria-label="${c.t.lightbox.next}">${icon('chevronRight')}</button>
</dialog>
<script type="application/json" id="lightbox-data">${JSON.stringify({ of: c.t.lightbox.of, items: lightboxData })}</script>`;

  return page(c, {
    title: t.title,
    description: t.description,
    extraHead: `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
    body,
  });
}

export function book(c) {
  const t = c.t.book;
  const w = t.widget;
  const r = c.routes[c.lang];
  const config = {
    endpoint: c.site.booking.endpoint,
    minNights: c.site.booking.minNights,
    maxGuests: c.site.booking.maxGuests,
    email: c.site.email,
    lang: c.lang,
    langName: c.t.langName,
    locale: c.languages.find((l) => l.code === c.lang).locale,
    t: w,
  };
  const options = (from, to, selected) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
    .map((n) => `<option value="${n}"${n === selected ? ' selected' : ''}>${n}</option>`).join('');
  const privacyLabel = fill(w.privacy, { privacy: `<a href="${c.rel(r.privacy)}" target="_blank">${w.privacyLink}</a>` });

  const body = `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">${t.eyebrow}</p>
    <h1>${t.h1}</h1>
    <p class="lead">${t.lead}</p>
  </div>
</section>

<section class="section section--tight">
  <div class="wrap book-grid">
    <div class="booking" data-booking>
      <ol class="booking-steps">
        <li class="is-current" data-step-label="dates"><span>1</span> ${w.stepDates}</li>
        <li data-step-label="guests"><span>2</span> ${w.stepGuests}</li>
      </ol>

      <div class="booking-panel" data-step="dates">
        <p class="cal-notice" data-cal-notice hidden></p>
        <div class="cal" data-cal>
          <div class="cal-nav">
            <button class="cal-arrow" type="button" data-cal-prev aria-label="${w.prev}">${icon('chevronLeft')}</button>
            <button class="cal-arrow" type="button" data-cal-next aria-label="${w.next}">${icon('chevronRight')}</button>
          </div>
          <div class="cal-months" data-cal-months>
            <p class="cal-status">${w.loading}</p>
          </div>
        </div>
        <ul class="cal-legend" aria-hidden="true">
          <li><span class="swatch swatch--free"></span>${w.legendFree}</li>
          <li><span class="swatch swatch--booked"></span>${w.legendBooked}</li>
          <li><span class="swatch swatch--selected"></span>${w.legendSelected}</li>
        </ul>
        <div class="booking-summary">
          <div class="date-boxes">
            <div class="date-box"><span class="date-label">${w.checkin}</span><span class="date-value" data-out-checkin>—</span></div>
            <div class="date-box"><span class="date-label">${w.checkout}</span><span class="date-value" data-out-checkout>—</span></div>
          </div>
          <p class="booking-hint" data-hint aria-live="polite">${fill(w.hintCheckin, { n: c.site.booking.minNights })}</p>
          <div class="booking-actions">
            <button class="link-btn" type="button" data-clear hidden>${w.clear}</button>
            <button class="btn" type="button" data-continue disabled>${w.continue}</button>
          </div>
        </div>
      </div>

      <form class="booking-panel booking-form" data-step="guests" hidden novalidate>
        <div class="chosen-dates">
          <p data-chosen></p>
          <button class="link-btn" type="button" data-back>${w.edit}</button>
        </div>
        <div class="field">
          <label for="f-name">${w.name} <abbr title="${w.required}">*</abbr></label>
          <input id="f-name" name="name" type="text" autocomplete="name" required>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="f-email">${w.email} <abbr title="${w.required}">*</abbr></label>
            <input id="f-email" name="email" type="email" autocomplete="email" required>
          </div>
          <div class="field">
            <label for="f-phone">${w.phone} <abbr title="${w.required}">*</abbr></label>
            <input id="f-phone" name="phone" type="tel" autocomplete="tel" placeholder="${w.phonePh}" required>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="f-adults">${w.adults}</label>
            <select id="f-adults" name="adults">${options(1, c.site.booking.maxGuests, 2)}</select>
          </div>
          <div class="field">
            <label for="f-children">${w.children}</label>
            <select id="f-children" name="children">${options(0, c.site.booking.maxGuests - 1, 0)}</select>
          </div>
        </div>
        <p class="field-error" data-guests-error hidden>${fill(w.maxGuests, { n: c.site.booking.maxGuests })}</p>
        <div class="field">
          <label for="f-message">${w.message}</label>
          <textarea id="f-message" name="message" rows="4" placeholder="${w.messagePh}"></textarea>
        </div>
        <div class="field field--hp" aria-hidden="true">
          <label for="f-website">Website</label>
          <input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off">
        </div>
        <label class="check">
          <input type="checkbox" name="privacy" required>
          <span>${privacyLabel}</span>
        </label>
        <p class="field-error" data-send-error hidden></p>
        <button class="btn btn--block" type="submit" data-submit>${w.send}</button>
      </form>

      <div class="booking-panel booking-done" data-step="done" hidden tabindex="-1">
        <span class="done-icon">${icon('check')}</span>
        <h2>${w.doneTitle}</h2>
        <p data-done-text></p>
        <button class="link-btn" type="button" data-again>${w.again}</button>
      </div>

      <noscript><p class="cal-status">${fill(c.t.book.contact, { email: mailLink(c) })}</p></noscript>
    </div>

    <aside class="book-aside">
      <div class="aside-block">
        <h2>${t.how.title}</h2>
        <ol class="how-list">${t.how.steps.map((s) => `<li>${s}</li>`).join('')}</ol>
      </div>
      <div class="aside-block">
        <h2>${t.rules.title}</h2>
        <ul class="rules-list">${t.rules.items.map((s) => `<li>${s}</li>`).join('')}</ul>
        <p class="aside-more"><a href="${c.rel(r.faq)}">${c.t.nav.faq} ${icon('arrow')}</a></p>
      </div>
      <p class="aside-contact">${fill(t.contact, { email: mailLink(c) })}</p>
    </aside>
  </div>
</section>
<script type="application/json" id="booking-config">${JSON.stringify(config)}</script>`;

  return page(c, {
    title: t.title,
    description: t.description,
    body,
    scripts: `<script src="${c.asset('assets/js/booking.js')}" defer></script>`,
  });
}

export function faq(c) {
  const t = c.t.faq;
  const r = c.routes[c.lang];
  const vars = {
    email: mailLink(c),
    map: `<a href="${c.site.activitiesMapUrl}" rel="noopener" target="_blank">${t.mapLabel}</a>`,
    book: c.rel(r.book),
  };
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.groups.flatMap((g) => g.items.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: stripTags(fill(a, { ...vars, map: t.mapLabel })) },
    }))),
  };
  const slug = (i) => `faq-${i + 1}`;
  const body = `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">${t.eyebrow}</p>
    <h1>${t.h1}</h1>
    <p class="lead">${fill(t.lead, vars)}</p>
  </div>
</section>

<section class="section section--tight">
  <div class="wrap faq-grid">
    <nav class="faq-toc" aria-label="${t.h1}">
      <ul>${t.groups.map((g, i) => `<li><a href="#${slug(i)}">${g.title}</a></li>`).join('')}</ul>
    </nav>
    <div class="faq-groups">
      ${t.groups.map((g, i) => `
      <section class="faq-group" id="${slug(i)}">
        <h2>${g.title}</h2>
        ${g.items.map(([q, a]) => `
        <details class="faq-item">
          <summary>${q}</summary>
          <div class="faq-answer"><p>${fill(a, vars)}</p></div>
        </details>`).join('')}
      </section>`).join('')}
    </div>
  </div>
</section>

<section class="section cta cta--compact">
  <div class="wrap cta-inner">
    <h2>${c.t.home.cta.title}</h2>
    <p>${c.t.home.cta.text}</p>
    <a class="btn btn--light" href="${c.rel(r.book)}">${c.t.home.cta.button}</a>
  </div>
</section>`;

  return page(c, {
    title: t.title,
    description: t.description,
    extraHead: `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
    body,
  });
}

export function privacy(c) {
  const t = c.t.privacy;
  const vars = { email: mailLink(c) };
  const body = `
<section class="page-hero">
  <div class="wrap">
    <h1>${t.h1}</h1>
    <p class="lead">${t.updated}</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap prose">
    ${t.sections.map(([h, p]) => `<h2>${h}</h2>\n    <p>${fill(p, vars)}</p>`).join('\n    ')}
  </div>
</section>`;
  return page(c, { title: t.title, description: t.description, body });
}

export function notFound(c) {
  const t = c.t.notFound;
  const body = `
<section class="page-hero page-hero--center">
  <div class="wrap">
    <p class="eyebrow">404</p>
    <h1>${t.h1}</h1>
    <p class="lead">${t.text}</p>
    <p><a class="btn" href="${c.rel(c.routes[c.lang].home)}">${t.home}</a></p>
  </div>
</section>`;
  return page(c, { title: t.title, description: t.text, body });
}
