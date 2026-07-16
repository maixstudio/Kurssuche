# Kurssuche — fertiger Build (PROJ-1)

Das ist die fertig gebaute App (statischer Export, kein Server nötig).
Kein Node.js, kein npm, keine Installation auf deiner Seite erforderlich.

## So richtest du es ein

1. Diesen kompletten `dist/`-Ordner (alle Dateien darin) in euren geteilten
   SharePoint-Ordner kopieren — dort, wo auch die Ordner `courses/` und
   `source-pdfs/` liegen (aus `data/courses/` bzw. `docs/source-pdfs/` in
   diesem Repo). Endstruktur z. B.:

   ```
   Kurssuche/
     courses/          <- die Kurs-JSONs
     source-pdfs/       <- die Original-PDFs
     index.html          <- diese Datei (und alle weiteren aus dist/) öffnen
     _next/               ...
     ...
   ```

2. `index.html` per Doppelklick in **Microsoft Edge** öffnen.
3. Auf "Alle Kurse laden" klicken und den übergeordneten Ordner auswählen
   (den, der `courses/` und `source-pdfs/` enthält — nicht einen der beiden
   Unterordner selbst).

Danach merkt sich der Browser die Freigabe — beim nächsten Öffnen von
`index.html` werden die Kurse automatisch geladen.

## Neue Version einspielen

Wird die App weiterentwickelt, einfach den Inhalt dieses Ordners durch den
neuen Build-Stand ersetzen (die Kursdaten in `courses/`/`source-pdfs/`
bleiben davon unberührt).
