// Icone lineari 24x24 (stroke = currentColor).
const paths = {
  pool: '<path d="M8 13V5.5a2 2 0 0 1 4 0M14 13V5.5a2 2 0 0 1 4 0M8 8.5h6M8 11.5h6"/><path d="M2 16c1.7 0 1.7 1.3 3.3 1.3S7 16 8.7 16s1.6 1.3 3.3 1.3S13.7 16 15.3 16s1.7 1.3 3.4 1.3S20.3 16 22 16"/><path d="M2 20c1.7 0 1.7 1.3 3.3 1.3S7 20 8.7 20s1.6 1.3 3.3 1.3S13.7 20 15.3 20s1.7 1.3 3.4 1.3S20.3 20 22 20"/>',
  garden: '<path d="M12 21v-7"/><path d="M12 14c-3.9 0-6-2.4-6-5.4S8.6 3.6 12 3c3.4.6 6 2.6 6 5.6S15.9 14 12 14z"/><path d="M12 10.5 9.5 8M12 12l2.5-2.5M7.5 21h9"/>',
  bbq: '<path d="M4 9.5h16a8 8 0 0 1-16 0z"/><path d="M8.5 16.5 6.5 21M15.5 16.5l2 4.5M12 17.5V21"/><path d="M9 3c-.8 1 .8 2 0 3.5M12 3c-.8 1 .8 2 0 3.5M15 3c-.8 1 .8 2 0 3.5"/>',
  parking: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M10 17V7h3.2a3 3 0 0 1 0 6H10"/>',
  ev: '<path d="M13.5 2.5 5.5 13h6l-1 8.5 8-10.5h-6z"/>',
  cleaning: '<path d="M11 3l1.7 4.6L17.3 9.3l-4.6 1.7L11 15.6 9.3 11 4.7 9.3l4.6-1.7z"/><path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  kitchen: '<path d="M4.5 10.5h15v5.5a4 4 0 0 1-4 4h-7a4 4 0 0 1-4-4z"/><path d="M2.5 10.5h19M9.5 7c0-1.2 1.2-1.2 1.2-2.5M13.5 7c0-1.2 1.2-1.2 1.2-2.5"/>',
  wifi: '<path d="M2.5 9.2a14 14 0 0 1 19 0"/><path d="M5.5 12.7a9.5 9.5 0 0 1 13 0"/><path d="M8.6 16.1a5 5 0 0 1 6.8 0"/><circle cx="12" cy="19.5" r=".9" fill="currentColor"/>',
  ac: '<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6"/><path d="M9.5 4.2 12 6l2.5-1.8M9.5 19.8 12 18l2.5 1.8"/>',
  washer: '<rect x="4.5" y="2.5" width="15" height="19" rx="2"/><circle cx="12" cy="13.5" r="4.5"/><path d="M7.5 6h.01M10.5 6h3"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  chevronLeft: '<path d="M15 5l-7 7 7 7"/>',
  chevronRight: '<path d="M9 5l7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M4.5 12.5l5 5 10-11"/>',
};

export function icon(name, cls = 'icon') {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}
