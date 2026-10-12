// Icone e ornamenti in SVG inline.
const r1 = (n) => Math.round(n * 100) / 100;

const paths = {
  arrow: '<path d="M1 6h36M31.5 1 37 6l-5.5 5"/>',
  arrowLeft: '<path d="M39 6H3M8.5 1 3 6l5.5 5"/>',
  arrowDown: '<path d="M6 1v26M1 21.5 6 27l5-5.5"/>',
  close: '<path d="M4 4l16 16M20 4 4 20"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
};
const boxes = { arrow: '0 0 38 12', arrowLeft: '0 0 40 12', arrowDown: '0 0 12 28', close: '0 0 24 24', external: '0 0 24 24', pin: '0 0 24 24' };

export function icon(name, cls = 'icon') {
  return `<svg class="${cls} ${cls}--${name}" viewBox="${boxes[name]}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}

// Bordo irregolare della ceralacca
function waxPath(R = 30) {
  let d = '';
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = R + 1.5 * Math.sin(a * 9) + 0.9 * Math.sin(a * 23 + 1.3) + 0.6 * Math.cos(a * 5 + 0.4);
    d += `${i ? 'L' : 'M'}${r1(r * Math.cos(a))} ${r1(r * Math.sin(a))}`;
  }
  return `${d}Z`;
}
const WAX = waxPath();

// Sigillo di ceralacca con la M; ring = testo circolare facoltativo
export function seal({ cls = 'seal', ring = '', id = '' } = {}) {
  const ringText = ring
    ? `<defs><path id="${id}" d="M0 -40 a40 40 0 1 1 -0.01 0"/></defs>
    <text class="seal-ring-text"><textPath href="#${id}" textLength="248">${ring}</textPath></text>`
    : '';
  const view = ring ? '-50 -50 100 100' : '-34 -34 68 68';
  return `<svg class="${cls}" viewBox="${view}" aria-hidden="true" focusable="false">
    ${ringText}
    <path class="seal-wax" d="${WAX}"/>
    <path class="seal-shine" d="M-21 -12a24 24 0 0 1 17-12" fill="none"/>
    <circle class="seal-line" r="22.5"/>
    <circle class="seal-line seal-line--thin" r="19.6"/>
    <text class="seal-m seal-m--light" x=".7" y="9.6" text-anchor="middle">M</text>
    <text class="seal-m" y="9" text-anchor="middle">M</text>
  </svg>`;
}

// Fregio tipografico: foglia di vite tra due filetti
export function fleuron(cls = 'fleuron') {
  return `<svg class="${cls}" viewBox="0 0 180 22" aria-hidden="true" focusable="false">
    <path class="fl-line" d="M0 11h64M116 11h64"/>
    <circle class="fl-dot" cx="69" cy="11" r="1.7"/><circle class="fl-dot" cx="111" cy="11" r="1.7"/>
    <path class="fl-leaf" d="M90 1.5c-5.6 4.6-5.6 14.4 0 19 5.6-4.6 5.6-14.4 0-19z"/>
    <path class="fl-leaf" d="M85.5 11c-3.2-4.8-9.6-6.3-13.2-3 3 3.4 8.6 4.2 13.2 3zM94.5 11c3.2-4.8 9.6-6.3 13.2-3-3 3.4-8.6 4.2-13.2 3z"/>
  </svg>`;
}

// Numeri romani per tavole e capitoli
export function roman(n) {
  const map = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}
