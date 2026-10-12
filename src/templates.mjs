import { icon, seal, fleuron, roman } from './icons.mjs';
import { photos, gallery } from './photos.mjs';
import { areaMap } from './map.mjs';

// Sostituisce i segnaposto {chiave} con i valori dati.
export const fill = (str, vars) => str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripTags = (s) => s.replace(/<[^>]+>/g, '');

const CHAPTERS = [
  ['house', 'house'], ['rooms', 'rooms'], ['amenities', 'inventory'],
  ['welcome', 'welcome'], ['area', 'area'], ['stay', 'stay'],
];

// <img> responsive da photos.mjs
function img(c, key, { sizes = '100vw', cls = '', eager = false } = {}) {
  const p = photos[key];
  const largest = p.widths[p.widths.length - 1];
  const srcset = p.widths.map((w) => `${c.rel(`assets/img/${key}-${w}.webp`)} ${w}w`).join(', ');
  return `<img${cls ? ` class="${cls}"` : ''} src="${c.rel(`assets/img/${key}-${largest}.webp`)}" srcset="${srcset}" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(p.alt[c.lang])}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
}
const largestSrc = (c, key) => c.rel(`assets/img/${key}-${photos[key].widths.at(-1)}.webp`);

const mailLink = (c) => `<a href="mailto:${c.site.email}">${c.site.email}</a>`;

function chapterHead(c, n, key) {
  return `<header class="chapter-head">
      <span class="chapter-no" aria-hidden="true">${roman(n)}</span>
      <p class="chapter-name"><span class="sr-only">${roman(n)}. </span>${c.t.chapters[key]}</p>
    </header>`;
}

/* ---------- impaginazione comune ---------- */

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
  <meta name="theme-color" content="#f1ebdf">
  <link rel="icon" href="${c.rel('assets/favicon.svg')}" type="image/svg+xml">
  <link rel="preload" href="${c.rel('assets/fonts/bodoni-moda-normal.woff2')}" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${c.rel('assets/fonts/eb-garamond-normal.woff2')}" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${c.rel('assets/fonts/eb-garamond-italic.woff2')}" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${c.asset('assets/css/site.css')}">
  <script>document.documentElement.classList.replace('no-js','js')</script>
  ${extraHead}
</head>`;
}

function langLinks(c, { full = false } = {}) {
  return c.languages.map((l) => {
    const target = c.routes[l.code][c.pageKey] ?? c.routes[l.code].home;
    const current = l.code === c.lang;
    return `<a href="${c.rel(target)}" hreflang="${l.code}" lang="${l.code}"${current ? ' aria-current="true"' : ''}>${full ? l.label : l.short}</a>`;
  }).join('<span class="sep" aria-hidden="true">·</span>');
}

function masthead(c) {
  const t = c.t.nav;
  const r = c.routes[c.lang];
  return `
<a class="skip-link" href="#main">${c.t.skip}</a>
<header class="masthead" data-header>
  <div class="masthead-inner">
    <button class="index-btn" type="button" data-index-open aria-haspopup="dialog">
      <span class="index-btn-lines" aria-hidden="true"></span><span>${t.index}</span>
    </button>
    <a class="wordmark" href="${c.rel(r.home)}" aria-label="Il Metrone — ${t.home}">
      ${seal({ cls: 'wordmark-seal' })}
      <span class="wordmark-text"><span class="wordmark-name">Il Metrone</span><span class="wordmark-place">Custoza · Verona</span></span>
    </a>
    <div class="masthead-end">
      <nav class="lang-switch" aria-label="${t.language}">${langLinks(c)}</nav>
      <a class="masthead-book" href="${c.rel(r.book)}"${c.pageKey === 'book' ? ' aria-current="page"' : ''}>${t.book}</a>
    </div>
  </div>
</header>
<div class="running-head" aria-hidden="true"><span data-running>Il Metrone</span></div>
${indexPanel(c)}`;
}

function indexPanel(c) {
  const t = c.t.nav;
  const r = c.routes[c.lang];
  const home = c.rel(r.home);
  const items = CHAPTERS.map(([id, key], i) => `
        <li><a href="${c.pageKey === 'home' ? '' : home}#${id}" data-index-link>
          <span class="index-no">${roman(i + 1)}</span>
          <span class="index-name">${c.t.chapters[key]}</span>
          <span class="index-leader" aria-hidden="true"></span>
          ${icon('arrow', 'index-arrow')}
        </a></li>`).join('');
  return `
<dialog class="index-panel" data-index aria-label="${t.index}">
  <div class="index-inner">
    <div class="index-top">
      <p class="kicker">${t.index}</p>
      <button class="index-close" type="button" data-index-close>${t.close} ${icon('close')}</button>
    </div>
    <div class="index-body">
      <nav aria-label="${t.index}">
        <ol class="index-list">${items}
        </ol>
        <ul class="index-extra">
          <li><a href="${c.rel(r.book)}">${t.book}</a></li>
          <li><a href="${c.rel(r.faq)}">${t.faq}</a></li>
          <li><a href="${c.rel(r.privacy)}">${c.t.footer.privacy}</a></li>
        </ul>
      </nav>
      <figure class="index-medallion">
        <div class="medallion">${img(c, 'facciata', { sizes: '320px' })}</div>
        <figcaption>${c.t.plate} I — ${photos.facciata.caption[c.lang]}</figcaption>
      </figure>
    </div>
    <div class="index-bottom">
      <p class="index-langs">${langLinks(c, { full: true })}</p>
      <p class="index-addr">Via Chiesa 8 · 37066 Custoza (VR) · ${mailLink(c)}</p>
    </div>
  </div>
</dialog>`;
}

function colophon(c) {
  const t = c.t.footer;
  const r = c.routes[c.lang];
  const a = c.site.address;
  return `
<footer class="colophon" data-tone="dark">
  <div class="wrap colophon-inner">
    ${seal({ cls: 'colophon-seal' })}
    <p class="colophon-name">Il Metrone</p>
    <p class="colophon-tag">${t.tagline}</p>
    ${fleuron('fleuron fleuron--light')}
    <div class="colophon-cols">
      <div>
        <h2 class="colophon-title">${t.contact}</h2>
        <address>${a.street}<br>${a.postalCode} ${a.locality} (${a.region})<br>
          <a href="mailto:${c.site.email}">${c.site.email}</a><br>
          <a href="${c.site.instagram}" rel="noopener">Instagram</a></address>
      </div>
      <div>
        <h2 class="colophon-title">${t.explore}</h2>
        <ul>
          <li><a href="${c.rel(r.home)}">${c.t.nav.home}</a></li>
          <li><a href="${c.rel(r.book)}">${c.t.nav.book}</a></li>
          <li><a href="${c.rel(r.faq)}">${c.t.nav.faq}</a></li>
          <li><a href="${c.rel(r.privacy)}">${t.privacy}</a></li>
        </ul>
      </div>
      <div>
        <h2 class="colophon-title">${c.t.nav.language}</h2>
        <p class="colophon-langs">${langLinks(c, { full: true })}</p>
      </div>
    </div>
    <p class="colophon-small">${t.cin} ${c.site.cin} <span aria-hidden="true">·</span> © ${c.year} Il Metrone. ${t.rights} <span aria-hidden="true">·</span> <em>${t.colophon}</em></p>
  </div>
</footer>`;
}

function langHintData(c) {
  const data = Object.fromEntries(c.languages.map((l) => [l.code, c.all[l.code].langHint]));
  return `<script type="application/json" id="lang-hint">${JSON.stringify(data)}</script>`;
}

function page(c, { title, description, body, extraHead = '', scripts = '' }) {
  return `${head(c, { title, description, extraHead })}
<body class="page-${c.pageKey}">
${masthead(c)}
<main id="main">
${body}
</main>
${colophon(c)}
${langHintData(c)}
<script src="${c.asset('assets/js/main.js')}" defer></script>
${scripts}
</body>
</html>
`;
}

function pageTitle(c, { kicker, h1, lead }) {
  return `
<section class="page-title">
  <div class="wrap">
    ${kicker ? `<p class="kicker">${kicker}</p>` : ''}
    <h1>${h1}</h1>
    ${fleuron()}
    ${lead ? `<p class="lead">${lead}</p>` : ''}
  </div>
</section>`;
}

/* ---------- home ---------- */

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
      '@type': 'PostalAddress', streetAddress: a.street, postalCode: a.postalCode,
      addressLocality: a.locality, addressRegion: a.region, addressCountry: a.country,
    },
    numberOfRooms: 6,
    checkinTime: '17:00',
    checkoutTime: '10:00',
    petsAllowed: false,
    amenityFeature: t.inventory.items.map(([name]) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
    sameAs: [c.site.instagram],
  };

  const facts = t.facts.map(([roman_, arabic, label]) => `
      <li><span class="fact-n" aria-hidden="true">${roman_}</span><span class="fact-l"><span class="sr-only">${arabic} </span>${label}</span></li>`).join('');

  // Tavole: facciata = I, poi le foto della galleria da II in avanti
  const plateNo = (key) => roman(gallery.indexOf(key) + 2);
  const plates = gallery.map((key, i) => {
    const p = photos[key];
    return `
      <li class="plate plate--strip${i % 2 ? ' plate--low' : ''}" data-plate="${roman(i + 2)}">
        <a href="${largestSrc(c, key)}" data-lightbox="${i}" aria-label="${esc(t.rooms.open)}: ${esc(p.alt[c.lang])}">
          ${img(c, key, { sizes: '(min-width: 900px) 640px, 80vw' })}
        </a>
        <p class="plate-cap"><span class="plate-no">${c.t.plate} ${roman(i + 2)}</span> ${p.caption[c.lang]}</p>
      </li>`;
  }).join('');

  const lightboxData = gallery.map((key, i) => {
    const p = photos[key];
    return {
      src: largestSrc(c, key),
      srcset: p.widths.map((w) => `${c.rel(`assets/img/${key}-${w}.webp`)} ${w}w`).join(', '),
      w: p.w, h: p.h, alt: p.alt[c.lang], caption: `${c.t.plate} ${roman(i + 2)} — ${p.caption[c.lang]}`,
    };
  });

  const ledger = t.inventory.items.map(([name, detail, note], i) => `
        <li class="ledger-item" data-reveal>
          <span class="ledger-no">${i + 1}.</span>
          <span class="ledger-line"><span class="ledger-name">${name}</span>${detail ? `<span class="ledger-leader" aria-hidden="true"></span><span class="ledger-detail">${detail}</span>` : ''}</span>
          <span class="ledger-note">${note}</span>
        </li>`).join('');

  const itinerary = t.area.places.map(([key, name, dist]) => `
            <li data-place="${key}" tabindex="0"><span class="it-name">${name}</span><span class="it-leader" aria-hidden="true"></span><span class="it-dist">${dist}</span></li>`).join('');

  const sealRing = { it: 'IL METRONE · CUSTOZA · VERONA · ', en: 'IL METRONE · CUSTOZA · VERONA · ', de: 'IL METRONE · CUSTOZA · VERONA · ' }[c.lang];

  const body = `
<section class="frontis" data-chapter="Il Metrone">
  <div class="wrap frontis-inner">
    <p class="kicker kicker--center frontis-kicker">${t.hero.kicker}</p>
    <h1 class="frontis-title"><span class="frontis-il">Il</span> Metrone</h1>
    <p class="frontis-tagline">${t.hero.tagline}</p>
    ${fleuron('fleuron frontis-fleuron')}
    <figure class="frontis-plate">
      <div class="arch">
        ${img(c, 'facciata', { sizes: '(min-width: 760px) 640px, 92vw', eager: true })}
      </div>
      <figcaption class="plate-cap plate-cap--center"><span class="plate-no">${c.t.plate} I</span> ${t.hero.caption}</figcaption>
      ${seal({ cls: 'frontis-seal', ring: sealRing, id: `seal-ring-${c.lang}` })}
    </figure>
    <p class="frontis-lead">${t.hero.lead}</p>
    <div class="frontis-actions">
      <a class="ink-link" href="${c.rel(r.book)}">${t.hero.cta} ${icon('arrow')}</a>
      <a class="turn-page" href="#house">${t.hero.more} ${icon('arrowDown')}</a>
    </div>
  </div>
  <div class="wrap">
    <ul class="facts">${facts}
    </ul>
  </div>
</section>

<section class="chapter chapter--house" id="house" data-chapter="I · ${c.t.chapters.house}">
  <div class="wrap house-grid">
    ${chapterHead(c, 1, 'house')}
    <div class="house-text" data-reveal>
      <h2>${t.house.title}</h2>
      <p class="dropcap">${t.house.paragraphs[0]}</p>
      ${t.house.paragraphs.slice(1).map((p) => `<p>${p}</p>`).join('')}
    </div>
    <aside class="marginalia" data-reveal><p>${t.house.margin}</p></aside>
    <figure class="plate plate--house" data-reveal>
      <a class="plate-frame" href="${largestSrc(c, 'corridoio')}" data-lightbox="${gallery.indexOf('corridoio')}" aria-label="${esc(t.rooms.open)}: ${esc(photos.corridoio.alt[c.lang])}">
        ${img(c, 'corridoio', { sizes: '(min-width: 900px) 420px, 90vw' })}
      </a>
      <figcaption class="plate-cap"><span class="plate-no">${c.t.plate} ${plateNo('corridoio')}</span> ${photos.corridoio.caption[c.lang]}</figcaption>
    </figure>
  </div>
</section>

<section class="chapter chapter--rooms" id="rooms" data-chapter="II · ${c.t.chapters.rooms}">
  <div class="wrap rooms-head">
    ${chapterHead(c, 2, 'rooms')}
    <div class="rooms-intro" data-reveal>
      <h2>${t.rooms.title}</h2>
      <p>${t.rooms.text}</p>
    </div>
    <div class="strip-ctrl">
      <button type="button" class="strip-btn" data-strip-prev aria-label="${t.rooms.prev}">${icon('arrowLeft')}</button>
      <span class="strip-count" aria-live="polite"><span data-strip-current>${c.t.plate} II</span> <span class="strip-total">/ ${roman(gallery.length + 1)}</span></span>
      <button type="button" class="strip-btn" data-strip-next aria-label="${t.rooms.next}">${icon('arrow')}</button>
    </div>
  </div>
  <div class="strip" data-strip>
    <ol class="strip-track" data-strip-track aria-label="${t.rooms.label}">${plates}
    </ol>
  </div>
</section>

<section class="chapter chapter--inventory" id="amenities" data-chapter="III · ${c.t.chapters.inventory}">
  <div class="wrap">
    <div class="inventory-head">
      ${chapterHead(c, 3, 'inventory')}
      <h2 data-reveal>${t.inventory.title}</h2>
    </div>
    <ol class="ledger">${ledger}
    </ol>
  </div>
</section>

<section class="chapter chapter--welcome" id="welcome" data-chapter="IV · ${c.t.chapters.welcome}" data-tone="dark">
  <div class="wrap welcome-inner">
    ${chapterHead(c, 4, 'welcome')}
    <blockquote class="welcome-quote" data-reveal>
      <p>${t.welcome.quote}</p>
      <p class="welcome-after">${t.welcome.after}</p>
    </blockquote>
    <p class="welcome-sign" data-reveal><span class="sign-name">${t.welcome.signature}</span><span class="sign-role">${t.welcome.role}</span></p>
  </div>
</section>

<section class="chapter chapter--area" id="area" data-chapter="V · ${c.t.chapters.area}">
  <div class="wrap area-grid">
    ${chapterHead(c, 5, 'area')}
    <div class="area-intro" data-reveal>
      <h2>${t.area.title}</h2>
      <p>${t.area.text}</p>
    </div>
    <figure class="map" data-map>
      <div class="map-scroll" data-map-scroll>${areaMap(c.t, c.lang)}</div>
      <figcaption class="plate-cap"><span class="plate-no">${c.t.plate} ${roman(gallery.length + 2)}</span> ${t.area.map.title}</figcaption>
    </figure>
    <div class="itinerary-wrap" data-reveal>
      <ol class="itinerary" data-itinerary>${itinerary}
      </ol>
      <p class="itinerary-note">${t.area.note}</p>
      <ul class="area-links">
        <li><a href="${c.site.activitiesMapUrl}" rel="noopener" target="_blank">${icon('pin')}<span>${t.area.mapLink}</span></a></li>
        <li><a href="${c.site.mapsUrl}" rel="noopener" target="_blank">${icon('external')}<span>${t.area.directions}</span></a></li>
      </ul>
    </div>
  </div>
</section>

<section class="chapter chapter--stay" id="stay" data-chapter="VI · ${c.t.chapters.stay}" data-tone="dark">
  <div class="wrap">
    <div class="invitation" data-reveal>
      ${seal({ cls: 'invitation-seal' })}
      <p class="kicker kicker--center">VI · ${c.t.chapters.stay}</p>
      <h2>${t.cta.title}</h2>
      ${fleuron()}
      <p>${t.cta.text}</p>
      <a class="ink-link ink-link--boxed" href="${c.rel(r.book)}">${t.cta.button} ${icon('arrow')}</a>
    </div>
  </div>
</section>

<dialog class="lightbox" data-lightbox-dialog aria-label="${esc(t.rooms.label)}">
  <figure class="lightbox-figure">
    <img class="lightbox-img" alt="" data-lightbox-img>
    <figcaption class="lightbox-caption"><span data-lightbox-caption></span> <span class="lightbox-count" data-lightbox-count></span></figcaption>
  </figure>
  <button class="lightbox-btn lightbox-close" type="button" data-lightbox-close aria-label="${c.t.lightbox.close}">${icon('close')}</button>
  <button class="lightbox-btn lightbox-prev" type="button" data-lightbox-prev aria-label="${c.t.lightbox.prev}">${icon('arrowLeft')}</button>
  <button class="lightbox-btn lightbox-next" type="button" data-lightbox-next aria-label="${c.t.lightbox.next}">${icon('arrow')}</button>
</dialog>
<script type="application/json" id="lightbox-data">${JSON.stringify({ of: c.t.lightbox.of, items: lightboxData })}</script>`;

  return page(c, {
    title: t.title,
    description: t.description,
    extraHead: `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
    body,
  });
}

/* ---------- prenotazione ---------- */

export function book(c) {
  const t = c.t.book;
  const w = t.widget;
  const L = t.letter;
  const r = c.routes[c.lang];
  const { minNights, maxGuests } = c.site.booking;
  const config = {
    endpoint: c.site.booking.endpoint,
    minNights, maxGuests,
    email: c.site.email,
    lang: c.lang,
    langName: c.t.langName,
    locale: c.languages.find((l) => l.code === c.lang).locale,
    t: { ...w, ...L },
  };
  const options = (from, to, selected) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
    .map((n) => `<option value="${n}"${n === selected ? ' selected' : ''}>${n}</option>`).join('');
  const word = (name, [one, many], n) => `<span data-word="${name}" data-one="${one}" data-many="${many}">${n === 1 ? one : many}</span>`;

  const fields = {
    name: `<input class="ink-field ink-field--name" id="f-name" name="name" type="text" autocomplete="name" required placeholder="${L.name}" aria-label="${L.name}">`,
    email: `<input class="ink-field ink-field--email" id="f-email" name="email" type="email" autocomplete="email" required placeholder="${L.email}" aria-label="${L.email}">`,
    phone: `<input class="ink-field ink-field--phone" id="f-phone" name="phone" type="tel" autocomplete="tel" required placeholder="${L.phone}" aria-label="${L.phone}">`,
    adults: `<select class="ink-field ink-select" id="f-adults" name="adults" aria-label="${L.adults}">${options(1, maxGuests, 2)}</select>`,
    children: `<select class="ink-field ink-select" id="f-children" name="children" aria-label="${L.children}" title="${L.children}">${options(0, maxGuests - 1, 0)}</select>`,
    adultsWord: word('adults', L.adult, 2),
    childrenWord: word('children', L.child, 0),
    from: '<span class="ink-date" data-letter-from>—</span>',
    to: '<span class="ink-date" data-letter-to>—</span>',
    nights: '<span data-letter-nights>—</span>',
  };
  const privacyLabel = fill(L.privacy, { privacy: `<a href="${c.rel(r.privacy)}" target="_blank">${L.privacyLink}</a>` });

  const body = `
${pageTitle(c, { kicker: t.kicker, h1: t.h1, lead: t.lead })}

<section class="booking-section">
  <div class="wrap book-grid">
    <div class="booking" data-booking>
      <ol class="booking-steps">
        <li class="is-current" data-step-label="dates"><span class="step-no">I</span> ${w.stepDates}</li>
        <li data-step-label="guests"><span class="step-no">II</span> ${w.stepLetter}</li>
      </ol>

      <div class="booking-panel" data-step="dates">
        <p class="cal-notice" data-cal-notice hidden></p>
        <div class="cal">
          <div class="cal-nav">
            <button class="cal-arrow" type="button" data-cal-prev aria-label="${w.prev}">${icon('arrowLeft')}</button>
            <button class="cal-arrow" type="button" data-cal-next aria-label="${w.next}">${icon('arrow')}</button>
          </div>
          <div class="cal-months" data-cal-months>
            <p class="cal-status"><span class="cal-spinner" aria-hidden="true"></span>${w.loading}</p>
          </div>
        </div>
        <ul class="cal-legend" aria-hidden="true">
          <li><span class="swatch swatch--free"></span>${w.legendFree}</li>
          <li><span class="swatch swatch--booked"></span>${w.legendBooked}</li>
          <li><span class="swatch swatch--selected"></span>${w.legendSelected}</li>
        </ul>
        <div class="booking-summary">
          <dl class="date-pair">
            <div><dt>${w.checkin}</dt><dd data-out-checkin>—</dd></div>
            <div><dt>${w.checkout}</dt><dd data-out-checkout>—</dd></div>
          </dl>
          <p class="booking-hint" data-hint aria-live="polite">${w.hintCheckin}</p>
          <div class="booking-actions">
            <button class="text-btn" type="button" data-clear hidden>${w.clear}</button>
            <button class="ink-btn" type="button" data-continue disabled>${w.continue} ${icon('arrow')}</button>
          </div>
        </div>
      </div>

      <form class="booking-panel letter" data-step="guests" hidden novalidate>
        <div class="letter-sheet">
          <p class="letter-dateline">Custoza, <span data-letter-today></span></p>
          <p class="letter-greeting">${L.greeting}</p>
          <p class="letter-body">${fill(L.body, fields)}</p>
          <div class="letter-ps">
            <label for="f-message">${L.ps}</label>
            <textarea id="f-message" name="message" rows="3" placeholder="${L.psPh}"></textarea>
          </div>
          <div class="field--hp" aria-hidden="true">
            <label for="f-website">Website</label>
            <input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off">
          </div>
        </div>
        <p class="field-error" data-guests-error hidden>${fill(w.maxGuests, { n: maxGuests })}</p>
        <label class="check">
          <input type="checkbox" name="privacy" required>
          <span>${privacyLabel}</span>
        </label>
        <p class="field-error" data-send-error hidden></p>
        <div class="letter-actions">
          <button class="text-btn" type="button" data-back>${icon('arrowLeft')} ${L.change}</button>
          <button class="seal-btn" type="submit" data-submit>${seal({ cls: 'seal-btn-seal' })}<span data-submit-label>${L.send}</span></button>
        </div>
      </form>

      <div class="booking-panel booking-done" data-step="done" hidden tabindex="-1">
        ${seal({ cls: 'done-seal' })}
        <h2>${L.doneTitle}</h2>
        <p data-done-text></p>
        <button class="text-btn" type="button" data-again>${L.again}</button>
      </div>

      <noscript><p class="cal-status">${fill(t.contact, { email: mailLink(c) })}</p></noscript>
    </div>

    <aside class="book-aside">
      <div class="aside-block">
        <h2>${t.how.title}</h2>
        <ol class="how-list">${t.how.steps.map((s, i) => `<li><span class="how-no">${roman(i + 1)}</span><span>${s}</span></li>`).join('')}</ol>
      </div>
      <div class="aside-block">
        <h2>${t.rules.title}</h2>
        <ul class="rules-list">${t.rules.items.map((s) => `<li>${s}</li>`).join('')}</ul>
        <p class="aside-more"><a class="ink-link" href="${c.rel(r.faq)}">${c.t.nav.faq} ${icon('arrow')}</a></p>
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

/* ---------- domande frequenti ---------- */

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
  let n = 0;
  const body = `
${pageTitle(c, { kicker: t.kicker, h1: t.h1, lead: fill(t.lead, vars) })}

<section class="faq-section">
  <div class="wrap faq-grid">
    <nav class="faq-toc" aria-label="${t.h1}">
      <ol>${t.groups.map((g, i) => `<li><a href="#faq-${i + 1}"><span class="toc-no">${roman(i + 1)}</span> ${g.title}</a></li>`).join('')}</ol>
    </nav>
    <div class="faq-groups">
      ${t.groups.map((g, i) => `
      <section class="faq-group" id="faq-${i + 1}">
        <h2><span class="faq-group-no">${roman(i + 1)}</span> ${g.title}</h2>
        ${g.items.map(([q, a]) => `
        <details class="faq-item">
          <summary><span class="faq-par">§ ${++n}</span><span class="faq-q">${q}</span></summary>
          <div class="faq-answer"><p>${fill(a, vars)}</p></div>
        </details>`).join('')}
      </section>`).join('')}
    </div>
  </div>
</section>`;

  return page(c, {
    title: t.title,
    description: t.description,
    extraHead: `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
    body,
  });
}

/* ---------- privacy e 404 ---------- */

export function privacy(c) {
  const t = c.t.privacy;
  const vars = { email: mailLink(c) };
  const body = `
${pageTitle(c, { kicker: t.kicker, h1: t.h1, lead: t.updated })}
<section class="prose-section">
  <div class="wrap prose">
    ${t.sections.map(([h, p], i) => `<h2><span class="prose-no">§ ${i + 1}</span> ${h}</h2>\n    <p>${fill(p, vars)}</p>`).join('\n    ')}
  </div>
</section>`;
  return page(c, { title: t.title, description: t.description, body });
}

export function notFound(c) {
  const t = c.t.notFound;
  const body = `
<section class="page-title page-title--404">
  <div class="wrap">
    ${seal({ cls: 'notfound-seal' })}
    <p class="kicker">${t.kicker}</p>
    <h1>${t.h1}</h1>
    ${fleuron()}
    <p class="lead">${t.text}</p>
    <p><a class="ink-link ink-link--boxed" href="${c.rel(c.routes[c.lang].home)}">${t.home} ${icon('arrow')}</a></p>
  </div>
</section>`;
  return page(c, { title: t.title, description: t.text, body });
}
