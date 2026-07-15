# Product Requirements Document

## Vision
AMS-Kursberater:innen in Vorarlberg erhalten laufend PDF-Flyer mit Kursangeboten für ihre Kund:innen, haben aber keine Möglichkeit, gezielt nach passenden Angeboten zu suchen — sie müssen alle PDFs durchlesen und übersehen dadurch oft geeignete Kurse. Kurssuche macht diese Angebote durchsuchbar und filterbar, damit Berater:innen im Kundengespräch in Sekunden statt Minuten das passende Angebot finden.

## Target Users
AMS-Berater:innen (Bludenz/Bregenz/Dornbirn/Feldkirch), die im Beratungsgespräch Kund:innen passende Kursangebote vorschlagen.

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Kurssuche mit Filtern (Maßnahmentyp, Region, Themen-/Zielgruppen-Tags an/aus schaltbar, Ergebnisliste) | Roadmap |
| P0 (MVP) | Kurs-Erfassung (PDF hochladen → regelbasierte Vorbefüllung → Formular prüfen/korrigieren → JSON speichern) | Roadmap |
| P1 | Kurs-Detailansicht (alle Felder, Kontakt, Termine übersichtlich) | Roadmap |
| P2 | Mehrbenutzer-Sync / Migration weg von reinen JSON-Dateien, falls das Team wächst | Roadmap |

## Success Metrics
Berater:innen finden passende Kurse per Suche statt PDFs einzeln zu öffnen; alle aktuell 48 Kurse (wachsend) sind durchsuchbar.

## Constraints
Kein eigener Server/Datenbank — JSON-Dateien liegen in einem geteilten SharePoint/OneDrive-Ordner (kein Supabase). Zielbrowser Microsoft Edge (File System Access API für Ordnerzugriff). Keine KI-API (aus Kostengründen/Datenschutz regelbasierte Texterkennung statt LLM). Design: Standard-Optik des Templates (Tailwind + shadcn/ui), kein eigenes Branding.

## Non-Goals
Keine Benutzerkonten/Login, keine Datenbank, keine Echtzeit-Synchronisierung zwischen Nutzer:innen (neue Kurse werden erst nach Ordner-Sync für andere sichtbar), keine automatische KI-Texterkennung.

---

Use `/write-spec` to create detailed feature specifications for each item in the roadmap above.
