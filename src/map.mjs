// Carta dei dintorni in stile incisione, generata in SVG da coordinate reali.
// Proiezione equirettangolare sull'area tra il basso Garda e Verona.

const B = { lngMin: 10.5, lngMax: 11.03, latMin: 45.31, latMax: 45.62 };
const K = 2690; // unità SVG per grado di latitudine (≈ 24,2 unità per km)
const COS = Math.cos((45.465 * Math.PI) / 180);
export const W = Math.round((B.lngMax - B.lngMin) * COS * K);
export const H = Math.round((B.latMax - B.latMin) * K);
const KM = K / 111.2;

const P = (lat, lng) => [(lng - B.lngMin) * COS * K, (B.latMax - lat) * K];
const r1 = (n) => Math.round(n * 10) / 10;

// Curva morbida (Catmull-Rom -> Bézier) attraverso i punti
function smooth(points, closed = false) {
  const pts = points.map(([la, lo]) => P(la, lo));
  const n = pts.length;
  const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return closed ? `${d} Z` : d;
}

// Sponde del basso Garda (lat, lng), in senso orario; la parte nord esce dal margine.
const LAKE = [
  [45.66, 10.515], [45.607, 10.522], [45.59, 10.548], [45.567, 10.562], [45.556, 10.579],
  [45.545, 10.556], [45.53, 10.536], [45.51, 10.516], [45.488, 10.522], [45.47, 10.537],
  [45.463, 10.562], [45.466, 10.590], [45.474, 10.603], [45.495, 10.6045], [45.5055, 10.6075],
  [45.497, 10.6105], [45.474, 10.6125], [45.457, 10.64], [45.446, 10.665], [45.4405, 10.6905],
  [45.456, 10.706], [45.481, 10.719], [45.505, 10.733], [45.527, 10.731], [45.548, 10.722],
  [45.566, 10.714], [45.576, 10.703], [45.579, 10.684], [45.597, 10.68], [45.66, 10.69],
];
const MINCIO = [
  [45.4405, 10.6935], [45.432, 10.694], [45.418, 10.697], [45.403, 10.699], [45.388, 10.694],
  [45.372, 10.705], [45.36, 10.713], [45.351, 10.722], [45.338, 10.728], [45.322, 10.733], [45.3, 10.738],
];
const ADIGE = [
  [45.64, 10.788], [45.6, 10.8], [45.575, 10.812], [45.548, 10.828], [45.52, 10.845], [45.495, 10.862],
  [45.482, 10.89], [45.475, 10.925], [45.468, 10.955], [45.455, 10.975], [45.446, 10.99],
  [45.447, 11.003], [45.44, 11.008], [45.432, 11.0], [45.426, 11.012], [45.418, 11.04],
];
// Anfiteatro morenico: arco di colline attorno alla punta sud del lago
const MORAINE = [
  [45.47, 10.505], [45.43, 10.53], [45.39, 10.56], [45.36, 10.6], [45.345, 10.645], [45.37, 10.69],
  [45.39, 10.75], [45.395, 10.8], [45.415, 10.845], [45.45, 10.86], [45.49, 10.83],
  [45.52, 10.8], [45.55, 10.785], [45.59, 10.79],
];

// Segnaposti: chiave = voce dell'elenco "Dintorni"
const PLACES = {
  custoza: { at: [45.3795, 10.7905] },
  golf: { at: [45.386, 10.828], dx: 13, dy: 6 },
  sigurta: { at: [45.36, 10.7365], dx: -12, dy: 2, end: true },
  villafranca: { at: [45.353, 10.844], dx: 13, dy: 6 },
  valeggio: { at: [45.352, 10.728], dx: 0, dy: 30, mid: true },
  airport: { at: [45.3957, 10.8885], dx: 13, dy: -6 },
  peschiera: { at: [45.439, 10.692], dx: -10, dy: 26, end: true },
  gardaland: { at: [45.455, 10.714], dx: 13, dy: 6 },
  lazise: { at: [45.505, 10.733], dx: 13, dy: 6 },
  verona: { at: [45.439, 10.994], dx: -16, dy: -14, end: true, city: true },
  sirmione: { at: [45.493, 10.6075], dx: 12, dy: -10 },
};
const LABELS = {
  golf: 'Golf Club Verona', sigurta: 'Sigurtà', villafranca: 'Villafranca', valeggio: 'Valeggio',
  peschiera: 'Peschiera', gardaland: 'Gardaland', lazise: 'Lazise', verona: 'Verona', sirmione: 'Sirmione',
};
const MINOR = [
  ['Desenzano', [45.469, 10.54], 0, 28, 'middle'],
  ['Bardolino', [45.548, 10.722], 12, 6, 'start'],
  ['Garda', [45.576, 10.703], 12, 6, 'start'],
  ['Sommacampagna', [45.405, 10.847], 10, -10, 'start'],
];

const inLake = (() => {
  const poly = LAKE.map(([la, lo]) => P(la, lo));
  return ([x, y]) => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
})();

function hills() {
  // Piccoli rilievi a tratteggio lungo l'arco morenico (pseudo-casuali ma stabili)
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pts = MORAINE.map(([la, lo]) => P(la, lo));
  const avoid = Object.values(PLACES).map((p) => P(...p.at));
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    for (let s = 0; s < len; s += 21) {
      for (const row of [-15, 0, 15]) {
        if (rnd() < 0.3) continue;
        const t = s / len;
        const off = row + (rnd() - 0.5) * 9;
        const x = a[0] + (b[0] - a[0]) * t + nx * off + (rnd() - 0.5) * 6;
        const y = a[1] + (b[1] - a[1]) * t + ny * off;
        if (x < 18 || y < 18 || x > W - 18 || y > H - 18 || inLake([x, y])) continue;
        if (avoid.some(([px, py]) => Math.hypot(px - x, py - y) < 26)) continue;
        const w = 6 + rnd() * 4;
        const h = 4 + rnd() * 4;
        out.push(`M${r1(x - w)} ${r1(y)}Q${r1(x)} ${r1(y - h * 2)} ${r1(x + w)} ${r1(y)}`);
        out.push(`M${r1(x - w * 0.35)} ${r1(y - h * 0.5)}l-1.5 3M${r1(x)} ${r1(y - h * 0.7)}l-1.5 3.5`);
      }
    }
  }
  return out.join('');
}

function neatline() {
  // Cornice cartografica con barre alternate di 1 km
  const g = 9;
  let bars = '';
  for (let x = g, k = 0; x < W - g; x += KM, k++) {
    if (k % 2) continue;
    const w = r1(Math.min(KM, W - g - x));
    bars += `M${r1(x)} 0h${w}v${g}h-${w}zM${r1(x)} ${H - g}h${w}v${g}h-${w}z`;
  }
  for (let y = g, k = 0; y < H - g; y += KM, k++) {
    if (k % 2) continue;
    const h = r1(Math.min(KM, H - g - y));
    bars += `M0 ${r1(y)}h${g}v${h}h-${g}zM${W - g} ${r1(y)}h${g}v${h}h-${g}z`;
  }
  return `<rect class="map-frame" x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}"/>
    <rect class="map-frame map-frame--in" x="${g}" y="${g}" width="${W - 2 * g}" height="${H - 2 * g}"/>
    <path class="map-bars" d="${bars}"/>`;
}

function star(cx, cy, R, r) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${r1(cx + rad * Math.cos(a))} ${r1(cy + rad * Math.sin(a))}`;
  }
  return `${d}Z`;
}

export function areaMap(t, lang) {
  const m = t.home.area.map;
  const lake = smooth(LAKE, true);
  const [cx, cy] = P(...PLACES.custoza.at);
  const ripples = [34, 24, 15, 8].map((d) => `
      <use href="#lake-${lang}" class="map-ripple" stroke-width="${2 * d + 1.2}"/>
      <use href="#lake-${lang}" class="map-gap" stroke-width="${2 * d - 1.2}"/>`).join('');

  const markers = Object.entries(PLACES).filter(([k]) => k !== 'custoza').map(([key, p]) => {
    const [x, y] = P(...p.at);
    const anchor = p.end ? 'end' : p.mid ? 'middle' : 'start';
    const label = key === 'airport' ? m.airport : LABELS[key];
    const dot = p.city
      ? '<circle r="8" class="mk-city"/><circle r="3.4" class="mk-dot"/>'
      : '<circle r="4.6" class="mk-dot"/>';
    return `<g class="mk" data-place="${key}" transform="translate(${r1(x)} ${r1(y)})">
      <circle r="15" class="mk-ring"/>${dot}
      <text class="map-lbl${p.city ? ' map-lbl--city' : ''}" x="${p.dx}" y="${p.dy}" text-anchor="${anchor}">${label}</text>
    </g>`;
  }).join('');

  const minor = MINOR.map(([name, at, dx, dy, anchor]) => {
    const [x, y] = P(...at);
    return `<g class="mk-minor" transform="translate(${r1(x)} ${r1(y)})"><circle r="2.6"/><text class="map-lbl map-lbl--minor" x="${dx}" y="${dy}" text-anchor="${anchor}">${name}</text></g>`;
  }).join('');

  const [lx, ly] = P(45.548, 10.632);
  const [hx, hy] = P(45.352, 10.585);
  const scaleX = W - 70 - 5 * KM;
  const scaleY = H - 46;

  return `<svg class="map-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="map-title-${lang} map-desc-${lang}" xmlns="http://www.w3.org/2000/svg">
  <title id="map-title-${lang}">${m.title}</title>
  <desc id="map-desc-${lang}">${m.desc}</desc>
  <defs>
    <path id="lake-${lang}" d="${lake}"/>
    <clipPath id="lake-clip-${lang}"><use href="#lake-${lang}"/></clipPath>
    <clipPath id="map-clip-${lang}"><rect x="9" y="9" width="${W - 18}" height="${H - 18}"/></clipPath>
    <path id="mincio-${lang}" d="${smooth(MINCIO)}"/>
    <path id="adige-${lang}" d="${smooth(ADIGE)}"/>
  </defs>
  <rect class="map-paper" width="${W}" height="${H}"/>
  <g clip-path="url(#map-clip-${lang})">
    <path class="map-hills" d="${hills()}"/>
    <use href="#mincio-${lang}" class="map-river"/>
    <use href="#adige-${lang}" class="map-river map-river--wide"/>
    <use href="#lake-${lang}" class="map-water"/>
    <g clip-path="url(#lake-clip-${lang})">${ripples}
    </g>
    <use href="#lake-${lang}" class="map-shore"/>
    <text class="map-lake" x="${r1(lx)}" y="${r1(ly)}" text-anchor="middle">${m.lake}</text>
    <text class="map-lake map-lake--latin" x="${r1(lx)}" y="${r1(ly + 30)}" text-anchor="middle">Benacus</text>
    <text class="map-river-lbl"><textPath href="#mincio-${lang}" startOffset="55%">Mincio</textPath></text>
    <text class="map-river-lbl"><textPath href="#adige-${lang}" startOffset="22%">${m.adige}</textPath></text>
    <text class="map-hills-lbl" x="${r1(hx)}" y="${r1(hy)}" text-anchor="middle" transform="rotate(-12 ${r1(hx)} ${r1(hy)})">${m.hills}</text>
    ${minor}
    ${markers}
    <g class="mk mk--home" data-place="custoza" transform="translate(${r1(cx)} ${r1(cy)})">
      <circle r="30" class="mk-halo"/>
      <circle r="22" class="mk-ring"/>
      <path class="mk-star" d="${star(0, 0, 14, 6)}"/>
      <text class="map-lbl map-lbl--home" y="-34" text-anchor="middle">Custoza</text>
      <text class="map-lbl map-lbl--house" y="-58" text-anchor="middle">Il Metrone</text>
    </g>
  </g>
  <g class="map-compass" transform="translate(${W - 92} 96)">
    <circle r="44" class="map-compass-ring"/>
    <circle r="36" class="map-compass-ring map-compass-ring--thin"/>
    <path class="map-compass-dark" d="M0 -58 L7 0 L0 0Z M0 58 L-7 0 L0 0Z M-40 0 L0 -5 L0 0Z M40 0 L0 5 L0 0Z"/>
    <path class="map-compass-light" d="M0 -58 L-7 0 L0 0Z M0 58 L7 0 L0 0Z M-40 0 L0 5 L0 0Z M40 0 L0 -5 L0 0Z"/>
    <text class="map-compass-n" y="-66" text-anchor="middle">N</text>
  </g>
  <g class="map-scale" transform="translate(${r1(scaleX)} ${scaleY})">
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${r1(i * KM)}" y="0" width="${r1(KM)}" height="6" class="${i % 2 ? 'map-scale-light' : 'map-scale-dark'}"/>`).join('')}
    <text class="map-scale-lbl" x="0" y="-8" text-anchor="middle">0</text>
    <text class="map-scale-lbl" x="${r1(5 * KM)}" y="-8" text-anchor="middle">5 km</text>
  </g>
  ${neatline()}
</svg>`;
}
