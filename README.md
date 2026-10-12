# Il Metrone — Custoza, Verona

Sito ufficiale di **Il Metrone**, casa di campagna del XVII secolo a Custoza di Sommacampagna (VR): 6 camere, 6 bagni, fino a 12 ospiti.
Statico, in tre lingue (IT · EN · DE), con calendario della disponibilità e richiesta di prenotazione diretta.

Anteprima: https://cryptopannoz.github.io/metronecustoza-site/

## Struttura

```
build.mjs              genera docs/ (nessuna dipendenza, Node 18+)
src/site.mjs           configurazione: URL, contatti, CIN, endpoint booking, percorsi per lingua
src/content/*.mjs      tutti i testi, una lingua per file
src/templates.mjs      HTML delle pagine (home, prenota, faq, privacy, 404)
src/photos.mjs         elenco foto con dimensioni e testi alternativi
src/assets/            css, js, font (self-hosted), immagini WebP generate
photos/                foto originali (sorgente per tools/images.py)
tools/images.py        genera le versioni WebP responsive (richiede Pillow)
docs/                  sito generato, servito da GitHub Pages
```

Pagine per lingua: home, prenotazione, FAQ, privacy.

| | IT | EN | DE |
|---|---|---|---|
| Home | `/` | `/en/` | `/de/` |
| Prenota | `/prenota/` | `/en/book/` | `/de/buchen/` |
| FAQ | `/faq/` | `/en/faq/` | `/de/faq/` |
| Privacy | `/privacy/` | `/en/privacy/` | `/de/datenschutz/` |

`/faq/` è lo stesso indirizzo linkato dall'email automatica di check-in: resta valido dopo il passaggio di dominio.

## Lavorarci

```bash
node build.mjs                      # rigenera docs/
python3 -m http.server 8000 -d docs # anteprima su http://localhost:8000
python3 tools/images.py             # dopo aver aggiunto/cambiato foto in photos/
```

Dopo ogni modifica: build, commit (sorgenti **e** `docs/`), push su `main` → GitHub Pages pubblica in un paio di minuti.

## Prenotazioni

Il calendario usa la web app Apps Script già esistente (`BookingHandler` nel repo `metroni-custoza-calendar`):

- **GET** restituisce le notti occupate lette dal foglio *[MASTER] Il Metrone - Custoza* (`[{from, to}]`, `to` = giorno di partenza, libero).
- **POST** (`mode: no-cors`, corpo JSON in `text/plain`) registra la richiesta nel foglio con stato `REQUEST`, avvisa `metronecustoza@gmail.com` e manda all'ospite l'email di riepilogo. Il form invia gli stessi campi del vecchio widget (`guestName`, `guestEmail`, `guestPhone`, `checkIn`/`checkOut` in `GG/MM/AAAA`, `adults`, `children`, `totalGuests`, `pets`, `specialRequests`) più `language`; per EN e DE la lingua viene aggiunta in coda alle note, così si sa in che lingua rispondere.

Regole nel widget: minimo 2 notti, massimo 12 ospiti, niente animali (da `src/site.mjs`).
Se la disponibilità non si carica, il calendario resta usabile e avvisa che le date verranno verificate a mano.

⚠️ Non fare richieste di prova verso l'endpoint vero: partono email reali. Per collaudare, intercettare `fetch` nel browser.

## Passaggio del dominio (metronecustoza.com, oggi su Weebly)

1. In `src/site.mjs`: `url: 'https://www.metronecustoza.com'`, `cname: 'www.metronecustoza.com'`, `indexable: true`.
2. `node build.mjs`, commit, push.
3. DNS: `www` → CNAME `cryptopannoz.github.io`; apex → record A di GitHub Pages (185.199.108–111.153).
4. GitHub → Settings → Pages: dominio personalizzato + *Enforce HTTPS*.
5. Disattivare il sito Weebly solo dopo che il nuovo risponde in HTTPS.

## Da completare

- **Foto:** le 10 foto degli interni vengono dall'annuncio pubblico (1000 px) e la facciata è a 800 px. Servono gli originali in alta risoluzione, più foto di mini-piscina, giardino, cucina e soggiorno, che oggi mancano.
- **Privacy:** confermare il nome del titolare del trattamento (ora "Il Metrone" con indirizzo ed email).
- **Instagram:** il link punta a `instagram.com/ilmetrone` (come nell'email di check-in); le house rules citano `@ilmetrone_custoza`, va verificato quale sia quello giusto.
- **Prezzi:** il sito non mostra tariffe; il preventivo arriva via email entro 24 ore.
