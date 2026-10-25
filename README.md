# Grammar Desk

Esercizi di grammatica inglese dai tuoi libri in PDF ("in Use"), piano di studio, allenamento d'esame LanguageCert B1 (Reading, Listening, Writing, Speaking), flashcard con ripasso a intervalli e progressi.

App statica (PWA): nessun backend proprio, nessun build. Si pubblica con GitHub Pages, si installa su telefono e computer e funziona offline.

## Come funziona
- **Dati** (progressi, serie, piano, parole, risultati): salvati sul dispositivo e copiati nel tuo account Supabase (una tabella, Row Level Security: ogni riga è leggibile solo dal proprietario). Due dispositivi che lavorano offline vengono uniti al ritorno online.
- **File** (PDF dei libri, Practice Paper con audio, libri già letti): si caricano una volta sola in una cartella privata del tuo account e gli altri dispositivi li scaricano da soli (o a richiesta, in Impostazioni → Libri e file).
- **AI**: la chiave di uno o più servizi (Gemini, Claude, OpenAI, Groq, OpenRouter, Mistral, Hugging Face, Cerebras o qualsiasi servizio compatibile OpenAI) si inserisce in Impostazioni → AI. I servizi si provano nell'ordine scelto: se uno fallisce o risponde fuori formato, si passa al successivo. La chiave va dal browser direttamente al servizio.
- **Offline**: dopo la prima visita l'app, il lettore PDF e i font sono in cache.

## Pubblicare (una volta)
1. Repo pubblico su GitHub, poi Settings → Pages → Deploy from a branch → `main` / root.
2. In Supabase (puoi usare lo stesso progetto di altre tue app): SQL Editor → incolla `supabase/schema.sql` → Run. Crea la tabella `gd_docs` e la cartella privata `gd-files`.
3. `config.js`: URL del progetto e chiave *publishable* (pubblica per costruzione).
4. Authentication → URL Configuration: aggiungi l'indirizzo del sito, per il link di conferma email.

Limite file: il piano gratuito di Supabase accetta file fino a 50 MB. Un PDF più grande si può caricare dopo aver alzato il limite in Storage → Settings; fino ad allora resta sul dispositivo dove l'hai letto e l'app lo segnala.

## Struttura
```
index.html, app.css, manifest.webmanifest, sw.js, config.js
js/cloud.js      account, tabella, Storage
js/ai.js         catena dei servizi AI
js/gg-core.js    lettura dei PDF e correzione delle risposte (browser e Node)
js/app.js        l'app (viste, store con merge, esercizi, esame, SRS)
js/files.js      sincronizzazione dei file tra dispositivi
js/settings.js   Impostazioni, backup
js/boot.js       avvio
vendor/          pdf.js 3.11.174, jszip, supabase-js
fonts/ icons/ supabase/schema.sql tests/
```
Nessun passaggio di build: i file serviti sono quelli del repo.

## Test
```
cd tests && npm i && npx playwright install chromium   # una volta
npm run verify
```
I test usano un finto Supabase in memoria (`tests/lib/mock-supabase.js`) e provider AI simulati: non toccano mai servizi reali. Vedi `docs/HANDOFF.md`.
