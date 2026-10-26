# Passaggio di consegne

## Cos'è
Grammar Desk era un artefatto claude.ai; ora è una PWA indipendente (stesso codice di esercizi, esame, piano, SRS) con account Supabase, sync di dati e file, AI con chiavi dell'utente. Nessun riferimento a `window.claude` resta nel codice.

## Punti da conoscere
- **Store** (`js/app.js`): documenti in IndexedDB (`docs`), `dirty` persistito, sync verso `gd_docs`. Le cancellazioni sono tombstone (`{_del:true}`), mai righe cancellate. `mergeDoc()` riconcilia: progressi `P*` per esercizio (tentativo più recente), `meta` (libri, giorni, `gone`), il resto last-write-wins su `_u`. `canon()` confronta documenti ignorando l'ordine delle chiavi (jsonb lo cambia). `noNul()` toglie i caratteri NUL (testo dei PDF) che jsonb rifiuta; se la sync si ferma, `Cloud.why()` mette il motivo in `Store.lastErr` e nell'etichetta "Sincronizzazione in pausa: …".
- **Practice Paper**: i dati letti dai PDF sono documenti `QM<n>` (scritto) e `QS<n>` (speaking); i file binari sono in `files` (`pp<n>/EP|Ls|Ms|A<k>`, `sp<n>/S`). Il testo estratto dal PDF per calibrare le prove è solo cache locale (`kv`, `pptext:*`).
- **File** (`js/files.js`): registro `F~<kind>/<key>` (documenti sincronizzati) + oggetti in `gd-files/<uid>/…`. `Files.reconcile()` carica ciò che manca nel cloud, scarica ciò che manca qui (se automatico), elimina ciò che altrove è stato eliminato. `Files.ensure()` scarica a richiesta (usata da `getPdf`, `getBook`, `ppFile`).
- **AI** (`js/ai.js`): `SAMPLE(prompt, opts)` e `SAMPLE.json(...)` come prima; `SAMPLE` è `null` se non c'è nessun servizio. Le chiavi stanno nel documento `AIK` (sincronizzato) o in `localStorage` (`gd.aiLocal`).
- Stessa origine di altre app su `github.io`: le chiavi di localStorage di questa app iniziano con `gd`. Cache dello SW: `gd-*`. Un'altra app che cancella le cache altrui può svuotare quelle di Grammar Desk: la pagina chiede allo SW di ripristinarle (`warm`) a ogni apertura.

- **Progetto Supabase**: `kjfwreeiskfwayewiufh`, solo per Grammar Desk (Engine usa `fvzqaygfqeanlabflhkx`). Il login salvato ha la chiave `gd-auth-<id progetto>`: se si cambia progetto in `config.js` l'app chiede di accedere di nuovo e carica nel nuovo progetto i documenti e i file che ha sul dispositivo.

## Design (Material 3 Expressive)
- `app.css` parte dai **token di colore** `--md-*` (superfici tonali, primary / secondary / warm / error / success, chiaro e scuro) e li espone con i nomi storici (`--sheet`, `--blue`, `--line`…): il codice JS usa solo questi.
- Forme grandi (card 24, hero 32, pulsanti a pillola), pulsanti pieno / tonale (default) / testo, gruppo di pulsanti collegati per le scelte (`.seg`: quello scelto diventa pillola), liste segmentate (`.list > .li`), navigazione: barra in basso con indicatore a pillola (<600 px), rail (≥600), drawer (≥1200).
- Font: Google Sans Flex (variabile, in `fonts/`), niente CDN. Movimento con `--ease` / `--spring`; `prefers-reduced-motion` spegne tutto.
- Regola: **compatto**. Margini e padding piccoli (card 14/18, wrap 12/16, gap 8–12); niente testo che sborda, nessuna sovrapposizione. `tests/layout.test.js` controlla su 320, 360, 390, 600, 820, 1024 e 1440 px che nessuna schermata scorra di lato, nessun elemento esca dal viewport o dalla sua card e nessun testo sia tagliato.

## Test
`cd tests && npm run verify`: sync a due dispositivi (con modifiche offline), file, catena AI (fallback, JSON, streaming), PWA offline e lettore PDF, smoke su 3 viewport. Per le modifiche grafiche guarda sempre telefono (390), tablet (820) e desktop (1440).

## Da fare / idee
- Realtime Supabase non è coperto dai test (sono simulati solo i pull); in produzione si aggiunge ai pull su focus e ogni minuto.
- Reimpostazione password dal login.
- Voci TTS dei provider AI per il Listening (ora voci del browser).
- Il parser dei PDF (`gg-core.js`) non ha test con PDF reali (non ci sono fixture): provare con i libri veri dopo ogni modifica.
