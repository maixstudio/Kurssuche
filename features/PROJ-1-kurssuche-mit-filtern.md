# PROJ-1: Kurssuche mit Filtern

## Status: Planned
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
- [ ] Genauer Ordnerstruktur-Vertrag zwischen JSON-Ordner und PDF-Ordner (z. B. müssen sie Geschwisterordner sein?) — wird in `/architecture` festgelegt.

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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
