---
title: PDF zu Excel
description: Extrahieren Sie Tabellen aus PDF-Dokumenten in eine Excel-Tabelle. Jede Tabelle erhält ein eigenes Arbeitsblatt mit Seitenverweis.
---

# PDF zu Excel

Extrahiert Tabellen aus einem PDF und speichert sie als Excel-Tabelle (`.xlsx`). Jede erkannte Tabelle landet auf einem eigenen Arbeitsblatt, beschriftet mit Tabellennummer und Quellseite. Die Tabellenerkennung übernimmt PyMuPDF, die Excel-Erzeugung die Bibliothek SheetJS.

## So funktioniert es

1. Laden Sie ein PDF hoch, indem Sie auf die Ablagefläche klicken oder eine Datei darauf ziehen.
2. Klicken Sie auf **Umwandeln**, um die Tabellenextraktion zu starten.
3. Das Werkzeug durchsucht jede Seite nach Tabellen und erstellt dann eine Excel-Arbeitsmappe.
4. Eine `.xlsx`-Datei mit einem Blatt pro Tabelle wird heruntergeladen.

## Optionen

Dieses Werkzeug hat keine einstellbaren Optionen. Alle erkannten Tabellen werden automatisch extrahiert.

## Ausgabeformat

- Eine einzelne Datei `filename.xlsx`.
- **Eine Tabelle**: ein einzelnes Arbeitsblatt namens "Table".
- **Mehrere Tabellen**: Arbeitsblätter namens "Table 1 (Page 3)", "Table 2 (Page 5)" usw. Blattnamen werden auf 31 Zeichen gekürzt (die Grenze von Excel).

## Anwendungsfälle

- PDF-Finanzberichte in bearbeitbare Tabellen für weitere Analysen umwandeln.
- Bestands- oder Bestelltabellen aus PDFs von Lieferanten extrahieren.
- Strukturierte Daten aus PDF-Formularen oder Katalogen zum Sortieren und Filtern in Excel übernehmen.
- Tabellarische PDF-Daten in einem Format archivieren, mit dem auch nicht technische Kollegen arbeiten können.

## Tipps

- Meldet das Werkzeug "Keine Tabellen gefunden", nutzt das PDF wahrscheinlich ein frei fließendes Textlayout statt strukturierter Tabellen. Versuchen Sie stattdessen [PDF zu Text](./pdf-to-text), um den Rohinhalt zu erhalten.
- Für ein einfacheres flaches Format nutzen Sie [PDF zu CSV](./pdf-to-csv). Für Downloads pro Tabelle in mehreren Formaten nutzen Sie [PDF-Tabellen extrahieren](./extract-tables).
- Prüfen Sie die Blattnamen, um zu erkennen, von welcher Seite jede Tabelle stammt.

## Verwandte Werkzeuge

- [PDF zu CSV](./pdf-to-csv)
- [PDF-Tabellen extrahieren](./extract-tables)
- [PDF zu Text](./pdf-to-text)
