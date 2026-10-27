---
title: PDF zu CSV
description: Extrahieren Sie Tabellen aus PDF-Dokumenten und exportieren Sie sie als einzelne CSV-Datei. Verarbeitet mehrseitige PDFs mit automatischer Tabellenerkennung.
---

# PDF zu CSV

Extrahiert Tabellen aus einem PDF und exportiert sie als CSV-Datei. Das Werkzeug durchsucht jede Seite mit der Tabellenerkennung von PyMuPDF nach tabellarischen Daten und schreibt alle gefundenen Zeilen in eine einzige durch Kommas getrennte Ausgabe.

## So funktioniert es

1. Laden Sie ein PDF hoch, indem Sie auf die Ablagefläche klicken oder eine Datei darauf ziehen.
2. Klicken Sie auf **Umwandeln**, um die Tabellenextraktion zu starten.
3. Das Werkzeug durchsucht jede Seite und erkennt Tabellen automatisch.
4. Eine `.csv`-Datei mit allen extrahierten Tabellendaten wird heruntergeladen.

Tabellen verschiedener Seiten sind in der Ausgabe durch leere Zeilen getrennt. Zellen mit Kommas, Anführungszeichen oder Zeilenumbrüchen werden gemäß RFC 4180 korrekt maskiert.

## Optionen

Dieses Werkzeug hat keine einstellbaren Optionen. Alle im Dokument gefundenen Tabellen werden extrahiert und in einer einzigen CSV zusammengefasst.

## Ausgabeformat

- Eine einzelne Datei `filename.csv` mit allen erkannten Tabellen.

## Anwendungsfälle

- Finanzdaten aus PDF-Kontoauszügen oder Rechnungen in eine Tabelle übernehmen.
- Preistabellen aus Lieferantenangeboten zum Vergleich extrahieren.
- Tabellarische Forschungsdaten aus PDF-Arbeiten in ein für Analysewerkzeuge geeignetes Format umwandeln.
- Daten aus alten PDF-Berichten in Datenbanken migrieren.

## Tipps

- Werden keine Tabellen gefunden, zeigt das Werkzeug die Meldung "Keine Tabellen gefunden". Das bedeutet meist, dass das PDF ein Textlayout nutzt, das tabellarisch aussieht, aber nicht als echte Tabelle strukturiert ist.
- Für mehr Kontrolle über einzelne Tabellen nutzen Sie [PDF-Tabellen extrahieren](./extract-tables), womit Sie zwischen CSV, JSON und Markdown als Ausgabeformat wählen können.
- Wenn Sie die Daten im Excel-Format mit separaten Blättern pro Tabelle brauchen, nutzen Sie [PDF zu Excel](./pdf-to-excel).

## Verwandte Werkzeuge

- [PDF zu Excel](./pdf-to-excel)
- [PDF-Tabellen extrahieren](./extract-tables)
- [PDF zu Text](./pdf-to-text)
