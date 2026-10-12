// Configurazione globale del sito.
// Al passaggio del dominio metronecustoza.com da Weebly a GitHub Pages:
// url -> 'https://www.metronecustoza.com', cname -> 'www.metronecustoza.com', indexable -> true.
export const site = {
  name: 'Il Metrone',
  url: 'https://cryptopannoz.github.io/metronecustoza-site',
  cname: null,
  indexable: false,
  email: 'metronecustoza@gmail.com',
  instagram: 'https://www.instagram.com/ilmetrone/',
  cin: 'IT023082B4YKN6EM7Q',
  address: {
    street: 'Via Chiesa 8',
    postalCode: '37066',
    locality: 'Custoza di Sommacampagna',
    region: 'VR',
    country: 'IT',
  },
  mapsUrl: 'https://maps.google.com/?q=Via+Chiesa+8,+37066+Custoza+VR+Italy',
  activitiesMapUrl: 'https://www.google.com/maps/d/viewer?mid=1TXfHE9xqCvdrKpANKe0-AMWlmjGmskM',
  booking: {
    // Web app Apps Script "Il Metrone - Complete Booking System" (account metronecustoza@gmail.com):
    // GET restituisce le notti occupate dal foglio [MASTER], POST registra la richiesta e invia le email.
    endpoint: 'https://script.google.com/macros/s/AKfycbwSxb4vDEStHjj1CthAA7OU1yFTRUvtgbjTbs-jY7INvnV65G68nRgg8ruJzKhDSQ6Z9g/exec',
    minNights: 2,
    maxGuests: 12,
  },
};

export const languages = [
  { code: 'it', label: 'Italiano', short: 'IT', locale: 'it-IT' },
  { code: 'en', label: 'English', short: 'EN', locale: 'en-GB' },
  { code: 'de', label: 'Deutsch', short: 'DE', locale: 'de-DE' },
];

// Percorsi di ogni pagina per lingua (cartelle con index.html).
export const routes = {
  it: { home: '', book: 'prenota/', faq: 'faq/', privacy: 'privacy/' },
  en: { home: 'en/', book: 'en/book/', faq: 'en/faq/', privacy: 'en/privacy/' },
  de: { home: 'de/', book: 'de/buchen/', faq: 'de/faq/', privacy: 'de/datenschutz/' },
};
