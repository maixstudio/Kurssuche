# Tag-Katalog & JSON-Schema (Kurssuche)

Living Document — beim Erfassen eines neuen Kurses immer zuerst hier nach
einem passenden Tag suchen, bevor ein neuer Tag angelegt wird. Neue Tags
werden hier ergänzt, damit die Liste konsistent bleibt (kein "Pflege" neben
"Betreuung und Pflege" als Duplikat).

## Herkunft

Erstellt aus 48 AMS-Vorarlberg-Kursflyern (`docs/source-pdfs/`), die alle
demselben Layout folgen (Titel, Maßnahmentyp, Zielgruppe, Ziel, Inhalt, Form
und Dauer, Veranstaltungsnummer/Termine, Veranstaltungsort, Kontakt,
Veranstalter). Die daraus erzeugten Kurs-JSONs liegen in `data/courses/`.

## JSON-Schema pro Kurs (`data/courses/<slug>.json`)

```
{
  "id": "slug",
  "titel": "string",
  "massnahmentyp": "Orientierung | Qualifizierung | Training | Aktive Arbeitssuche |
                     Orientierung und Qualifizierung | Aus- und Weiterbildung |
                     Bildungsmaßnahme - Orientierung | Sonstiges",
  "regionen": ["Bludenz" | "Bregenz" | "Dornbirn" | "Feldkirch" | "Vorarlberg-weit", ...],
  "teilregion": "Oberland" | "Unterland" | null,
  "themen_tags": ["string", ...],
  "zielgruppe_tags": ["string", ...],
  "sprachniveau": "A1" | "A2" | "B1" | "B2" | "A1/A2/B1" | null,
  "altersgrenze": {"von": number|null, "bis": number|null},
  "zielgruppe": "Freitext",
  "ziel": "Freitext",
  "inhalt": {"Abschnittsname": ["Punkt", ...], ...} | ["Punkt", ...],
  "form_und_dauer": "Freitext",
  "termine": [{"kursnummer": "string", "start": "TT.MM.JJJJ", "anmerkung": "string"}, ...],
  "veranstaltungsort": ["Adresse", ...],
  "kontakt": [{"name": "string|null", "telefon": "string|null", "email": "string|null", "bereich": "string (optional)"}],
  "veranstalter": {"name": "string", "adresse": "string"},
  "anmeldung_hinweis": "Freitext",
  "quelle": {"dateiname": "string", "ausstellungsdatum": "TT.MM.JJJJ"}
}
```

Filterbar (für die Suchmaske): `massnahmentyp`, `regionen`, `teilregion`,
`themen_tags`, `zielgruppe_tags`, `sprachniveau`. Alle anderen Felder sind
Anzeige-/Detailinformation bzw. Freitextsuche.

## Regionen

AMS Vorarlberg gliedert sich in vier Geschäftsstellen: **Bludenz, Bregenz,
Dornbirn, Feldkirch**. Manche Kurse laufen landesweit (`"Vorarlberg-weit"`).
Zusätzlich gibt es die informelle Zweiteilung **Oberland** (Bludenz/Feldkirch)
und **Unterland** (Bregenz/Dornbirn), die in manchen Kurstiteln explizit
auftaucht (`teilregion`).

## Maßnahmentyp (kontrollierte Liste)

- Orientierung
- Qualifizierung
- Orientierung und Qualifizierung
- Training
- Aktive Arbeitssuche
- Aus- und Weiterbildung
- Bildungsmaßnahme - Orientierung
- Sonstiges (Stiftungen, Förderprogramme, Sonderformate ohne AMS-Standardlabel)

## Themen-Tags (Stand: 48 Kurse)

Berufsorientierung, Bewerbungstraining, Wiedereinstieg, Frauen, Jugendliche,
Deutsch/Sprache, Sprachförderung, Handwerk/Technik, IT, Digitalisierung, EDV,
Lehrausbildung, Lehrabschluss, Berufsschule, Berufsqualifizierung,
Pflichtschulabschluss, Bildungsabschluss, Pflege, Betreuung,
Gesundheits- und Sozialberufe, Gesundheit, Krankenhaus, Kinderbetreuung,
Pädagogik, Metalltechnik, CNC, Gastronomie, Handel, Büro, Kaufmännisch,
Wirtschaft/Büro, Wirtschaftskompetenz, Migration/Flucht, Integration,
Psychosoziale Stabilisierung, Arbeitsmarktintegration, Arbeitssuche,
Karriereplanung, Vereinbarkeit Familie und Beruf, Behinderung/Lernbehinderung,
Grundkompetenzen, MINT, Mangelberufe, Höherqualifizierung, Vorqualifizierung,
Umwelt/Green Jobs, Stiftung, Fachkräfteförderung, Unternehmensförderung,
Empowerment, Vernetzung

## Zielgruppen-Tags (Stand: 48 Kurse)

Frauen, Frauen 40+, Mädchen, Wiedereinsteigerinnen, Betreuungspflichten,
Lehrstellensuchende, lehrstellensuchend, abgebrochene Lehre,
ohne Praktikumsplatz, Pflichtschulabschluss, ohne Pflichtschulabschluss,
arbeitssuchend, arbeitslos gemeldet, ohne Beschäftigung,
geringfügige Beschäftigung, ab 25 Jahren, Sprachdefizite,
bildungsferne Flüchtlinge, Fluchthintergrund, Migrationshintergrund,
Konventionsflüchtlinge, subsidiär Schutzberechtigte,
sonderpädagogischer Förderbedarf, Lernbehinderung,
soziale/emotionale Beeinträchtigung, Vermittlungshindernisse,
psychische Auffälligkeiten, Suchtproblematik, Weiterbildung, Umschulung

## Bekannte Lücken / Duplikate

- `KIT - Kompetenzzentrum IT.pdf`, `KIT Kompetenzzentrum IT Bludenz.pdf` und
  `KIT.pdf` beschreiben denselben Kurs (Standort Bludenz) — bewusst als 3
  separate JSONs angelegt (1:1 zur PDF-Quelle), da sich die Dateien inhaltlich
  fast, aber nicht ganz decken (unterschiedliche Detailtiefe).
- `MIA - Mein Weg in den Arbeitsmarkt.docx` folgt keinem AMS-Flyer-Layout
  (kein Veranstaltungsort/Kontakt/Veranstalter angegeben) — entsprechende
  Felder sind `null`/leer.
- Einige Kurse haben kein festes `massnahmentyp`-Label im Original (Chance,
  Restart, Umweltstiftung, Zukunftsstiftung, ÖIF, Patient_innenservice, MIA)
  → als `"Sonstiges"` erfasst.
