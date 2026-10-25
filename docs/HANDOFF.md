# Passaggio di consegne

## Cos'è
Grammar Desk era un artefatto claude.ai; ora è una PWA indipendente (stesso codice di esercizi, esame, piano, SRS) con account Supabase, sync di dati e file, AI con chiavi dell'utente. Nessun riferimento a `window.claude` resta nel codice.

## Punti da conoscere
- **Store** (`js/app.js`): documenti in IndexedDB (`docs`), `dirty` persistito, sync verso `gd_docs`. Le cancellazioni sono tombstone (`{_del:true}`), mai righe cancellate. `mergeDoc()` riconcilia: progressi `P*` per esercizio (tentativo più recente), `meta` (libri, giorni, `gone`), il resto last-write-wins su `_u`. `canon()` confronta documenti ignorando l'ordine delle chiavi (jsonb lo cambia).
- **Practice Paper**: i dati letti dai PDF sono documenti `QM<n>` (scritto) e `QS<n>` (speaking); i file binari sono in `files` (`pp<n>/EP|Ls|Ms|A<k>`, `sp<n>/S`). Il testo estratto dal PDF per calibrare le prove è solo cache locale (`kv`, `pptext:*`).
- **File** (`js/files.js`): registro `F~<kind>/<key>` (documenti sincronizzati) + oggetti in `gd-files/<uid>/…`. `Files.reconcile()` carica ciò che manca nel cloud, scarica ciò che manca qui (se automatico), elimina ciò che altrove è stato eliminato. `Files.ensure()` scarica a richiesta (usata da `getPdf`, `getBook`, `ppFile`).
- **AI** (`js/ai.js`): `SAMPLE(prompt, opts)` e `SAMPLE.json(...)` come prima; `SAMPLE` è `null` se non c'è nessun servizio. Le chiavi stanno nel documento `AIK` (sincronizzato) o in `localStorage` (`gd.aiLocal`).
- Stessa origine di altre app su `github.io`: le chiavi di localStorage di questa app iniziano con `gd`. Cache dello SW: `gd-*`. Un'altra app che cancella le cache altrui può svuotare quelle di Grammar Desk: la pagina chiede allo SW di ripristinarle (`warm`) a ogni apertura.

## Test
`cd tests && npm run verify`: sync a due dispositivi (con modifiche offline), file, catena AI (fallback, JSON, streaming), PWA offline e lettore PDF, smoke su 3 viewport. Per le modifiche grafiche guarda sempre telefono (390), tablet (820) e desktop (1440).

## Da fare / idee
- Realtime Supabase non è coperto dai test (sono simulati solo i pull); in produzione si aggiunge ai pull su focus e ogni minuto.
- Reimpostazione password dal login.
- Voci TTS dei provider AI per il Listening (ora voci del browser).
- Il parser dei PDF (`gg-core.js`) non ha test con PDF reali (non ci sono fixture): provare con i libri veri dopo ogni modifica.
