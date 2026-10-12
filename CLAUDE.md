# Il Metrone — sito (metronecustoza-site)

Sito della casa vacanze **Il Metrone**, Custoza (VR), rifatto da zero a ottobre 2026 per sostituire il vecchio sito Weebly su metronecustoza.com.
- **Repo:** github.com/CryptoPannoz/metronecustoza-site — **GitHub Pages** da `main` / cartella `docs/`
- **Anteprima:** https://cryptopannoz.github.io/metronecustoza-site/ (noindex finché non si passa il dominio)
- **Build:** `node build.mjs` rigenera `docs/` — va lanciata e committata prima di ogni push (non c'è CI).
- Testi in `src/content/{it,en,de}.mjs`, layout in `src/templates.mjs`, configurazione in `src/site.mjs`.
- Booking: usa la web app Apps Script del repo `metroni-custoza-calendar` (account metronecustoza@gmail.com). **Mai fare POST di prova verso l'endpoint vero**: manda email a Francesca e all'ospite e scrive nel foglio [MASTER]. Per collaudare il form intercettare `fetch` nel browser.
- Il cellulare di Francesca è privato (solo per urgenze degli ospiti in casa): non va pubblicato sul sito.
---
*Workspace multi-progetto — vedi `PROJECTS.md` nella radice. GitHub: gh=CryptoPannoz. 🔒 Niente credenziali nei file.*
