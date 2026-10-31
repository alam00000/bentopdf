---
title: Tabellen extrahieren
description: Erkennen Sie und extrahieren Sie Tabellen aus PDF-Dokumenten. Export als CSV, JSON oder Markdown mit Einzeltabellen-Granularität.
---

# Tabellen extrahieren

Erkennt alle Tabellen in einer PDF und lässt Sie sie im Format Ihrer Wahl exportieren: CSV, JSON oder Markdown. Jede Tabelle wird einzeln mit Seiten- und Positionsmetadaten extrahiert. Angetrieben von der Tabellenerkennung von PyMuPDF.

## So funktioniert es

1. Laden Sie eine PDF hoch, indem Sie auf die Ablagefläche klicken oder eine Datei darauf ziehen.
2. Wählen Sie Ihr bevorzugtes **Exportformat**: CSV, JSON oder Markdown.
3. Klicken Sie auf **Extrahieren**, um die Verarbeitung zu starten.
4. Wird eine Tabelle gefunden, wird sie als einzelne Datei heruntergeladen. Mehrere Tabellen ergeben ein ZIP-Archiv mit einer Datei pro Tabelle.

## Optionen

- **Exportformat**: Wählen Sie zwischen:
  - **CSV**: durch Kommas getrennte Werte mit korrekter Maskierung für Felder, die Kommas, Anführungszeichen oder Zeilenumbrüche enthalten. Geeignet für Tabellenkalkulationen und Datenbanken.
  - **JSON**: Array-von-Arrays-Struktur, formatiert mit 2 Leerzeichen Einrückung. Geeignet für die programmatische Weiterverarbeitung.
  - **Markdown**: Tabellenformat mit senkrechten Strichen als Trennzeichen, von PyMuPDF erzeugt. Geeignet für Dokumentation und README-Dateien.

## Ausgabeformat

- **Einzelne Tabelle**: `filename_table.csv` (oder `.json` / `.md`)
- **Mehrere Tabellen**: `filename_tables.zip` mit Dateien wie `table_1_page3.csv`, `table_2_page5.csv` usw.

## Anwendungsfälle

- Bestimmte Tabellen aus langen PDF-Berichten extrahieren, ohne die Daten des gesamten Dokuments zu ziehen.
- Tabellen im Markdown-Format erhalten, um sie direkt in GitHub-Issues, Wikis oder Dokumentation einzufügen.
- Strukturierte JSON-Daten aus PDF-Tabellen für API-Integrationen oder Skripte gewinnen.
- Tabellen verschiedener PDF-Versionen vergleichen, indem beide als CSV exportiert und per Diff verglichen werden.

## Tipps

- Dieses Werkzeug gibt Ihnen Kontrolle pro Tabelle. Wenn Sie einfach alle Tabellen in einer einzigen CSV haben möchten, nutzen Sie [PDF zu CSV](./pdf-to-csv). Für eine vollständige Excel-Arbeitsmappe nutzen Sie [PDF zu Excel](./pdf-to-excel).
- Tabellen, die sich über mehrere Seiten erstrecken, werden möglicherweise als separate Tabellen pro Seite erkannt. Sie müssen sie eventuell manuell zusammenfügen.
- Werden keine Tabellen erkannt, ist die PDF möglicherweise ein gescanntes Bild. Führen Sie zuerst OCR aus, um eine Textebene hinzuzufügen.

## Verwandte Werkzeuge

- [PDF zu CSV](./pdf-to-csv)
- [PDF zu Excel](./pdf-to-excel)
- [PDF zu Text](./pdf-to-text)
