# PROJ-1: Kurssuche mit Filtern

## Status: In Progress
**Created:** 2026-07-15
**Last Updated:** 2026-07-15

## Dependencies
- None (liest direkt die JSON-Dateien aus `data/courses/`, die bereits händisch aus den 48 AMS-PDFs erzeugt wurden — siehe `docs/tag-taxonomy.md`)

## User Stories
- Als AMS-Berater:in möchte ich alle verfügbaren Kursangebote auf einen Blick sehen, damit ich nicht jedes PDF einzeln durchsuchen muss.
- Als AMS-Berater:in möchte ich Kurse nach Maßnahmentyp, Region und Themen-/Zielgruppen-Tags filtern, damit ich schnell nur die für meine:n Kund:in relevanten Angebote sehe.
- Als AMS-Berater:in möchte ich mehrere Tags gleichzeitig aktivieren können, damit ich die Suche gezielt eingrenzen kann.
- Als AMS-Berater:in möchte ich zu einem Kurs alle Details (Zielgruppe, Ziel, Inhalt, Kontakt, Termine) direkt in der Liste einsehen können, damit ich im Kundengespräch schnell alle Infos zur Hand habe.
- Als AMS-Berater:in möchte ich vom Kurs-Eintrag direkt zum Original-PDF springen können, damit ich bei Bedarf das offizielle Dokument einsehen oder ausdrucken kann.
- Als AMS-Berater:in möchte ich den Datenordner nur einmalig auswählen müssen, damit ich nicht bei jedem Öffnen der App erneut den Ordner bestätigen muss.

## Out of Scope
- Eigene Detailseite pro Kurs mit URL/Deep-Link — für MVP reicht das Inline-Aufklappen der Kurskarte (kann später als PROJ-3 nachgezogen werden)
- Freitext-/Volltextsuche (nur Tag-/Kategorie-Filter für MVP; explizit abgelehnt)
- Kurs-Erfassung/Import neuer Kurse (PDF-Upload, Formular) — eigene Feature PROJ-2
- Bearbeiten oder Löschen bestehender Kurs-JSONs über die UI (Erfassung/Pflege ist PROJ-2/PROJ-4)
- Mehrbenutzer-Echtzeit-Sync — deferred to PROJ-4
- Unterstützung für Browser außer Microsoft Edge (Chromium-basiert; File System Access API ist Voraussetzung)
- Sortierung nach Starttermin oder Relevanz (nur alphabetisch nach Titel für MVP)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen die App wird zum allerersten Mal geöffnet, wenn der Nutzer auf "Alle Kurse laden" klickt und einen Ordner auswählt, dann werden alle gültigen JSON-Dateien aus diesem Ordner eingelesen und als Kursliste angezeigt
- [ ] Angenommen der Ordnerzugriff wurde bereits einmal erteilt, wenn die App erneut geöffnet wird, dann werden die Kurse automatisch geladen, ohne dass der Nutzer erneut den Ordner auswählen muss
- [ ] Angenommen die Ordnerberechtigung ist abgelaufen oder wurde widerrufen, wenn die App geöffnet wird, dann erscheint wieder der "Alle Kurse laden"-Button
- [ ] Angenommen die Kursliste ist geladen und kein Filter ist aktiv, wenn die Seite angezeigt wird, dann werden alle Kurse alphabetisch nach Titel sortiert angezeigt
- [ ] Angenommen mehrere Kurse mit unterschiedlichen Themen-Tags existieren, wenn der Nutzer zwei Themen-Tags gleichzeitig aktiviert, dann werden Kurse angezeigt, die mindestens einen der beiden Tags haben (ODER innerhalb der Kategorie)
- [ ] Angenommen ein Themen-Tag und eine Region sind gleichzeitig aktiv, wenn beide Filter aktiv sind, dann werden nur Kurse angezeigt, die sowohl den Themen-Tag als auch die Region erfüllen (UND zwischen Kategorien)
- [ ] Angenommen kein Kurs erfüllt die aktive Filterkombination, wenn die Filter angewendet werden, dann wird ein Hinweistext angezeigt (z. B. "Keine Kurse gefunden") statt einer leeren, unerklärten Liste
- [ ] Angenommen eine Kurskarte ist eingeklappt, wenn der Nutzer darauf klickt, dann klappt sie sich auf und zeigt Zielgruppe, Ziel, Inhalt, Form und Dauer, Termine, Veranstaltungsort, Kontakt und Veranstalter an
- [ ] Angenommen eine aufgeklappte Kurskarte hat ein `quelle.dateiname`-Feld, wenn die Karte angezeigt wird, dann gibt es einen Link/Button zum Original-PDF im PDF-Ordner
- [ ] Angenommen eine JSON-Datei im Ordner ist syntaktisch fehlerhaft, wenn die Kurse geladen werden, dann wird diese Datei übersprungen und ein dezenter Hinweis "X Datei(en) konnten nicht geladen werden" angezeigt
- [ ] Angenommen ein Kurs hat fehlende Detailfelder (z. B. keinen Veranstaltungsort), wenn die Karte aufgeklappt wird, dann wird das fehlende Feld als "keine Angabe" dargestellt statt die Karte fehlerhaft anzuzeigen
- [ ] Angenommen ein Kurs hat keine `regionen`, wenn ein Regions-Filter aktiv ist, dann wird dieser Kurs bei aktivem Regionsfilter ausgeblendet, bleibt aber ohne aktiven Filter sichtbar

## Edge Cases
- Ordnerauswahl wird vom Nutzer abgebrochen (Dialog geschlossen ohne Auswahl) → App bleibt im Zustand "Alle Kurse laden"-Button, keine Fehlermeldung nötig
- Ordner enthält keine JSON-Dateien (leer oder falscher Ordner ausgewählt) → Hinweistext "Keine Kursdaten in diesem Ordner gefunden", Möglichkeit den Ordner erneut zu wählen
- Verlinktes PDF (`quelle.dateiname`) existiert nicht im PDF-Ordner → Link wird trotzdem angezeigt, führt aber beim Klick zu einer Fehlermeldung des Browsers/Betriebssystems (kein aktives Abfangen nötig für MVP)
- Sehr viele aktivierte Filter gleichzeitig (z. B. alle Themen-Tags an) → funktional identisch zu keinem Filter, da ODER-Verknüpfung innerhalb der Kategorie
- Kurs mit ungewöhnlich vielen Terminen (z. B. "Clocks" mit 16 Terminen) → alle Termine werden in der aufgeklappten Karte vollständig aufgelistet, kein Abschneiden
- Browser ist nicht Edge/Chromium-basiert (File System Access API nicht verfügbar) → App zeigt eine Fehlermeldung, dass ein unterstützter Browser benötigt wird

## Technical Requirements (optional)
- Browser Support: Microsoft Edge (Chromium-basiert) — File System Access API erforderlich
- Keine Server-Anbindung nötig — rein clientseitiges Lesen lokaler/synchronisierter Dateien

## Open Questions
- [ ] Wie soll mit Duplikaten umgegangen werden (z. B. die drei "KIT"-Einträge, die denselben Kurs beschreiben)? Aktuell werden sie als separate Kurse angezeigt — ggf. später in PROJ-2/Datenpflege bereinigen.
- [ ] Funktioniert der Ordner-Auswahldialog zuverlässig, wenn die App per Doppelklick (statt über `http://`) geöffnet wird? Siehe "Bekanntes technisches Risiko" im Tech Design — wird bei `/frontend` als Erstes getestet.

**Geklärt in `/architecture`:** JSON-Ordner und PDF-Ordner sind Geschwisterordner (liegen nebeneinander im selben übergeordneten SharePoint-Ordner); der PDF-Link in der Kurskarte wird über den relativen Pfad `../<pdf-ordner-name>/<quelle.dateiname>` aufgelöst.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| UND zwischen Filterkategorien, ODER innerhalb einer Kategorie | Verhindert versehentliche 0-Ergebnisse bei mehreren aktiven Tags derselben Kategorie; Standardverhalten bei Filter-UIs | 2026-07-15 |
| Inline-Aufklappen statt eigener Detailseite | MVP soll ohne PROJ-3 (Detailansicht) voll nutzbar sein; Detailseite kann später ergänzt werden | 2026-07-15 |
| Kein Freitext-Suchfeld für MVP | Vom Nutzer explizit abgelehnt — Tag-Filter reichen für den Start | 2026-07-15 |
| Ordnerberechtigung wird vom Browser gemerkt | Vermeidet wiederholte manuelle Ordnerauswahl bei jedem App-Start; unterstützt durch File System Access API in Edge | 2026-07-15 |
| Fehlerhafte JSON-Dateien werden übersprungen, nicht die ganze App blockiert | Einzelne kaputte Datei soll nicht die gesamte Suche unbrauchbar machen | 2026-07-15 |
| Sortierung alphabetisch nach Titel | Einfach, vorhersehbar; "nächster Termin" ist bei Kursen mit vielen wiederkehrenden Terminen nicht eindeutig bestimmbar | 2026-07-15 |
| Alle Kurse initial sichtbar (kein Filter = alle anzeigen) | Intuitiver Einstieg, erlaubt auch reines Durchstöbern ohne gezielten Filter | 2026-07-15 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Next.js als statischer Export (kein Server, kein Vercel) | App wird einmalig gebaut und liegt als eigenständige HTML/JS-Datei im selben geteilten SharePoint-Ordner wie JSON- und PDF-Ordner — kein Internetzugang, kein Hosting nötig | 2026-07-15 |
| Ordnerzugriff über die native File System Access API (Browser-Funktion, kein npm-Paket) | Kein zusätzliches Paket nötig; die API erlaubt direktes Lesen des ausgewählten Ordners und merkt sich die Berechtigung selbstständig zwischen Sitzungen | 2026-07-15 |
| Kein State-Management-Paket (React `useState`/`useReducer` reicht) | Datenmenge (aktuell 48, absehbar niedrige Hundert Kurse) und Komplexität rechtfertigen keine zusätzliche Bibliothek | 2026-07-15 |
| Bestehende shadcn/ui-Komponenten wiederverwenden (Card, Checkbox, Badge, Button, Accordion) | Bereits im Template installiert, deckt Filterleiste und Kurskarten vollständig ab, keine neuen Abhängigkeiten nötig | 2026-07-15 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Component Structure

```
Kurssuche-Seite (/)
├── Header
│   └── Titel "Kurssuche" + kurzer Hinweistext
├── Datenbereich
│   ├── "Alle Kurse laden"-Button
│   │     (sichtbar, wenn noch kein Ordner gewählt wurde oder die Berechtigung abgelaufen ist)
│   └── Status-Hinweis
│         ("48 Kurse geladen" / "2 Datei(en) konnten nicht geladen werden")
├── Filterleiste (mehrere Kategorien, jede mit an-/abschaltbaren Tags)
│   ├── Maßnahmentyp (Orientierung, Qualifizierung, Training, ...)
│   ├── Region (Bludenz, Bregenz, Dornbirn, Feldkirch, Vorarlberg-weit)
│   ├── Themen-Tags (Pflege, IT, Deutsch/Sprache, ...)
│   └── Zielgruppen-Tags (Frauen, Jugendliche, Wiedereinsteigerinnen, ...)
├── Ergebnisliste
│   ├── Kurs-Karte (eingeklappt: Titel, Maßnahmentyp, Region(en), nächste Starttermine)
│   │     └── Aufgeklappter Zustand: Zielgruppe, Ziel, Inhalt, Form & Dauer,
│   │         alle Termine, Veranstaltungsort, Kontakt, Veranstalter, Link zum Original-PDF
│   └── Leerer-Zustand-Hinweis ("Keine Kurse gefunden" bei zu enger Filterkombination)
```

### B) Data Model (plain language)

Es gibt keine Datenbank. Die App liest bei jedem Start (bzw. beim Klick auf
"Alle Kurse laden") alle JSON-Dateien aus dem vom Nutzer ausgewählten Ordner
direkt im Browser ein — das Schema der einzelnen Kurs-Dateien ist bereits in
`docs/tag-taxonomy.md` festgelegt (Titel, Maßnahmentyp, Regionen, Tags,
Zielgruppe, Ziel, Inhalt, Termine, Kontakt, Veranstalter, Quelle).

Im Speicher der App (nur während die Seite offen ist) werden gehalten:
- Die Liste aller erfolgreich eingelesenen Kurse
- Eine Liste der Dateien, die nicht eingelesen werden konnten (für den Fehlerhinweis)
- Die aktuell aktivierten Filter (welche Tags/Regionen/Maßnahmentypen an sind)

Die Berechtigung für den ausgewählten Ordner wird vom Browser selbst
gespeichert (nicht von der App) — deshalb muss man den Ordner nur beim
allerersten Mal auswählen.

### C) Tech Decisions (plain language)

- **Kein eigener Server, kein Hosting:** Die App wird einmal gebaut und liegt
  danach als fertige Datei direkt im geteilten SharePoint-Ordner neben den
  JSON- und PDF-Ordnern. Das passt zur Anforderung "kein Internet nötig,
  läuft komplett lokal/im Firmennetz".
- **Ordnerzugriff über eine Browser-Standardfunktion:** Es wird keine externe
  Bibliothek für das Lesen der Dateien gebraucht — Microsoft Edge bringt das
  bereits mit.
- **Keine zusätzliche Bibliothek fürs Verwalten des App-Zustands:** Bei der
  aktuellen und absehbaren Datenmenge (Kurse, Filter) reicht das, was React
  von Haus aus mitbringt.
- **Bestehende Bausteine wiederverwenden:** Karten, Checkboxen, Buttons gibt
  es im Template schon fertig (shadcn/ui) — es müssen keine neuen
  UI-Bausteine installiert werden.

### D) Dependencies

Keine neuen Pakete nötig — alles Erforderliche (Next.js, React, Tailwind,
shadcn/ui-Komponenten) ist im Projekt bereits installiert.

### Bekanntes technisches Risiko

Der Ordner-Auswahldialog (File System Access API) setzt normalerweise eine
"sichere" Browser-Umgebung voraus. Bei einer Datei, die direkt per
Doppelklick vom Ordner geöffnet wird (statt über eine Adresse `http://`),
kann es browserabhängig zu Einschränkungen kommen. Das wird beim Bauen der
UI (`/frontend`) als Erstes getestet — falls es nicht zuverlässig
funktioniert, ist als Fallback ein winziger lokaler Startmechanismus nötig
(z. B. eine Verknüpfung, die die Seite über `http://localhost` statt direkt
per Doppelklick öffnet). Das ändert nichts an Design oder Bedienung der App.

## Implementation Notes (Frontend)

**Umgesetzt:**
- `src/types/course.ts` — TypeScript-Typen für das Kurs-JSON-Schema + Filterlogik-Helfer (`getCourseFilterValues`)
- `src/types/file-system-access.d.ts` — Ambient-Typdeklarationen für die File System Access API (kein npm-Paket nötig)
- `src/lib/course-loader.ts` — Ordnerauswahl, IndexedDB-Persistenz des Ordner-Handles, Einlesen aller JSON-Dateien, Auflösen des PDF-Geschwisterordners (mit Namens-Alias-Liste: `courses`/`kurse`/`json` bzw. `source-pdfs`/`pdfs`/`pdf`/`dokumente`)
- `src/hooks/use-course-data.ts` — React-Hook, der beim Laden automatisch prüft, ob eine gespeicherte Ordnerberechtigung noch gültig ist, und sonst den "Alle Kurse laden"-Zustand zeigt
- `src/components/kurssuche/filter-panel.tsx` — Filterkategorien dynamisch aus den geladenen Kursen abgeleitet (inkl. Anzahl pro Tag), UND zwischen Kategorien / ODER innerhalb einer Kategorie (`courseMatchesFilters`)
- `src/components/kurssuche/course-card.tsx` — aufklappbare Kurskarte (shadcn Accordion, `type="multiple"` für unabhängiges Auf-/Zuklappen), fehlende Felder als "keine Angabe", PDF-Link öffnet die Datei über `URL.createObjectURL`
- `src/app/page.tsx` — Hauptseite: lädt/verwaltet Zustand, zeigt Lade-/Fehler-/Leer-Zustände, sortiert alphabetisch nach Titel
- `next.config.ts` — `output: "export"` für den statischen Build ohne Server

**Verifiziert:**
- `npm run build` (statischer Export) und `npm run lint` laufen fehlerfrei (ein vorbestehender, nicht mit dieser Feature zusammenhängender Lint-Fehler in `src/components/ui/sidebar.tsx` bleibt bestehen)
- Manuell im Browser geprüft (Playwright-Screenshot-Test mit Beispieldaten aus `data/courses/`): Anfangszustand mit "Alle Kurse laden"-Button, geladene Kursliste mit Filterleiste, aufklappbare Detailansicht inkl. aller Felder, Filterung (UND/ODER-Logik) reduziert die Liste korrekt, fehlende Felder (getestet am Kurs "MIA") zeigen "keine Angabe"
- Der native Ordner-Auswahldialog selbst (`showDirectoryPicker`) kann nicht automatisiert getestet werden (Browser-natives UI außerhalb der Seite) — das im Tech Design genannte Risiko (Verhalten bei `file://`-Aufruf) ist daher weiterhin ungetestet und bleibt als offener Punkt bestehen, bis die App im Zielumfeld (SharePoint-Ordner, Edge) ausprobiert wird

**Abweichungen vom Tech Design:** Keine.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
