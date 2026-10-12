// Foto del sito. Le versioni WebP si generano con `python3 tools/images.py`
// (larghezze disponibili: quelle in WIDTHS minori dell'originale + l'originale).
export const photos = {
  facciata: {
    w: 800, h: 533, widths: [480, 800],
    caption: { it: 'La facciata, vista dal prato', en: 'The façade, seen from the lawn', de: 'Die Fassade, vom Rasen aus' },
    alt: {
      it: 'La facciata in pietra del Metrone con le persiane verdi, vista dal prato con la tavola apparecchiata',
      en: 'The stone façade of Il Metrone with its green shutters, seen from the lawn with a laid table',
      de: 'Die Steinfassade von Il Metrone mit grünen Fensterläden, vom Rasen mit gedecktem Tisch aus gesehen',
    },
  },
  'camera-01': {
    w: 1000, h: 667, widths: [480, 800, 1000],
    caption: { it: 'Matrimoniale, testiera a quadri', en: 'Double, check headboard', de: 'Doppelzimmer, kariertes Kopfteil' },
    alt: {
      it: 'Camera matrimoniale con testiera a quadri verdi, cassettone antico e due finestre',
      en: 'Double bedroom with a green check headboard, antique chest of drawers and two windows',
      de: 'Doppelzimmer mit grün kariertem Kopfteil, antiker Kommode und zwei Fenstern',
    },
  },
  'camera-02': {
    w: 1000, h: 665, widths: [480, 800, 1000],
    caption: { it: 'Mansarda, copriletti rossi', en: 'Attic room, red bedspreads', de: 'Dachzimmer, rote Tagesdecken' },
    alt: {
      it: 'Camera mansardata con trave a vista e copriletti rossi',
      en: 'Attic bedroom with an exposed beam and red bedspreads',
      de: 'Dachzimmer mit sichtbarem Holzbalken und roten Tagesdecken',
    },
  },
  'camera-03': {
    w: 1000, h: 667, widths: [480, 800, 1000],
    caption: { it: 'Matrimoniale con kilim', en: 'Double with kilim', de: 'Doppelzimmer mit Kelim' },
    alt: {
      it: 'Camera matrimoniale con soffitto a travi bianche, armadio dipinto e tappeto kilim',
      en: 'Double bedroom with a white beamed ceiling, painted wardrobe and kilim rug',
      de: 'Doppelzimmer mit weißer Balkendecke, bemaltem Schrank und Kelim-Teppich',
    },
  },
  'camera-04': {
    w: 1000, h: 667, widths: [480, 800, 1000],
    caption: { it: 'Singola, armadio antico', en: 'Single, antique wardrobe', de: 'Einzelzimmer, antiker Schrank' },
    alt: {
      it: 'Camera singola con armadio antico in legno e finestra sul verde',
      en: 'Single bedroom with an antique wooden wardrobe and a window onto the garden',
      de: 'Einzelzimmer mit antikem Holzschrank und Fenster ins Grüne',
    },
  },
  'camera-05': {
    w: 1000, h: 667, widths: [480, 800, 1000],
    caption: { it: 'Matrimoniale con arazzo', en: 'Double with tapestry', de: 'Doppelzimmer mit Wandteppich' },
    alt: {
      it: 'Grande camera matrimoniale con divano, travi a vista e arazzo alla parete',
      en: 'Large double bedroom with a sofa, exposed beams and a tapestry on the wall',
      de: 'Großes Doppelzimmer mit Sofa, Holzbalken und Wandteppich',
    },
  },
  'camera-06': {
    w: 1000, h: 667, widths: [480, 800, 1000],
    caption: { it: 'Doppia a righe', en: 'Striped twin', de: 'Gestreiftes Zweibettzimmer' },
    alt: {
      it: 'Camera con due letti singoli a righe e soffitto a travi bianche',
      en: 'Twin bedroom with striped beds and a white beamed ceiling',
      de: 'Zweibettzimmer mit gestreiften Betten und weißer Balkendecke',
    },
  },
  'camera-07': {
    w: 1000, h: 667, widths: [480, 800, 1000],
    caption: { it: 'Mansarda doppia', en: 'Attic twin', de: 'Zweibett-Dachzimmer' },
    alt: {
      it: 'Camera doppia mansardata con trave a vista e lampada rossa',
      en: 'Attic twin room with an exposed beam and a red lamp',
      de: 'Zweibett-Dachzimmer mit Holzbalken und roter Lampe',
    },
  },
  'camera-08': {
    w: 1000, h: 667, widths: [480, 800, 1000],
    caption: { it: 'Doppia azzurra', en: 'Blue twin', de: 'Blaues Zweibettzimmer' },
    alt: {
      it: 'Camera con due letti singoli azzurri e scrittoio sotto la finestra',
      en: 'Room with two blue single beds and a desk under the window',
      de: 'Zimmer mit zwei blauen Einzelbetten und Schreibtisch unter dem Fenster',
    },
  },
  'camera-09': {
    w: 1000, h: 667, widths: [480, 800, 1000],
    caption: { it: 'Matrimoniale, stampe antiche', en: 'Double, antique prints', de: 'Doppelzimmer, alte Stiche' },
    alt: {
      it: 'Camera matrimoniale con stampe antiche e secrétaire in legno',
      en: 'Double bedroom with antique prints and a wooden secretaire',
      de: 'Doppelzimmer mit alten Stichen und hölzernem Sekretär',
    },
  },
  corridoio: {
    w: 1000, h: 667, widths: [480, 800, 1000],
    caption: { it: 'Il corridoio delle camere', en: 'The bedroom corridor', de: 'Der Flur der Schlafzimmer' },
    alt: {
      it: 'Il corridoio del piano delle camere, con parquet e quadri alle pareti',
      en: 'The bedroom corridor, with wooden floors and pictures on the walls',
      de: 'Der Flur im Schlafzimmergeschoss mit Parkett und Bildern',
    },
  },
};

// Ordine delle tavole nella sezione "Le stanze" (e nella lightbox).
export const gallery = [
  'camera-05', 'camera-01', 'camera-03', 'camera-06', 'camera-02',
  'camera-09', 'camera-08', 'camera-07', 'camera-04', 'corridoio',
];
