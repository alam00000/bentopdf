---
title: Excel zu PDF
description: Wandeln Sie Excel-Tabellen (XLS, XLSX), ODS- und CSV-Dateien unter Erhalt der Formatierung in PDF um.
---

# Excel zu PDF

Wandeln Sie Tabellendateien in PDF um. Das Werkzeug verarbeitet moderne Excel-Dateien, das ältere XLS-Format, OpenDocument-Tabellen und sogar CSV. Alles wird über eine browserbasierte LibreOffice-Engine gerendert, die Zellformatierung, Formeln (als berechnete Werte), Diagramme und Layouts mit mehreren Blättern erhält.

## Unterstützte Formate

| Format               | Erweiterungen |
| :------------------- | :------------ |
| Excel (modern)       | `.xlsx`       |
| Excel (älter)        | `.xls`        |
| OpenDocument-Tabelle | `.ods`        |
| CSV                  | `.csv`        |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie Ihre Tabellendateien hinein.
2. Prüfen Sie die Dateiliste. Fügen Sie weitere Dateien hinzu oder entfernen Sie unerwünschte.
3. Klicken Sie auf **In PDF umwandeln**. Die LibreOffice-Engine wird bei der ersten Nutzung initialisiert und verarbeitet dann jede Datei.
4. Eine einzelne Datei wird direkt als PDF heruntergeladen. Mehrere Dateien werden als `excel-converted.zip` geliefert.

## Optionen

Dieses Werkzeug hat keine zusätzliche Konfiguration. Die LibreOffice-Engine bestimmt Seitenlayout, Skalierung und Druckbereich anhand der integrierten Einstellungen der Tabelle.

## Ausgabe

| Anzahl Eingaben | Ausgabe                                                             |
| :-------------- | :------------------------------------------------------------------ |
| 1 Datei         | Einzelner PDF-Download (ursprünglicher Dateiname mit Endung `.pdf`) |
| 2+ Dateien      | ZIP-Archiv (`excel-converted.zip`) mit einer PDF pro Datei          |

## Anwendungsfälle

- Finanzberichte oder Budgets aus Excel zur Weitergabe in PDF umwandeln
- Druckfertige PDFs aus Bestands- oder Produktkatalog-Tabellen erstellen
- Datenanalyse-Ergebnisse mit Beteiligten teilen, die kein Excel installiert haben
- Quartalsberichte in einem nicht bearbeitbaren Format archivieren
- ODS-Dateien aus LibreOffice Calc in PDF umwandeln

## Tipps

- In der Tabelle eingebettete Diagramme werden in der PDF dargestellt. Prüfen Sie vor der Umwandlung, dass sie in der Quelldatei korrekt aussehen.
- Hat Ihre Tabelle mehrere Blätter, werden alle Blätter in die PDF-Ausgabe aufgenommen.
- Für einfache CSV-Daten ohne Formatierung bietet das Werkzeug [CSV zu PDF](./csv-to-pdf) eine leichtere Umwandlung. Nutzen Sie Excel zu PDF, wenn Formatierung, Diagramme oder mehrere Blätter erhalten bleiben sollen.

## Verwandte Werkzeuge

- [CSV zu PDF](./csv-to-pdf)
- [Word zu PDF](./word-to-pdf)
- [PowerPoint zu PDF](./powerpoint-to-pdf)
