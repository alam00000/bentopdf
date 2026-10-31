---
title: JSON zu PDF
description: Rekonstruieren Sie PDF-Dateien aus dem JSON-Format von BentoPDF. Wandeln Sie JSON-Exporte zurück in ihre ursprünglichen PDF-Dokumente um.
---

# JSON zu PDF

Rekonstruieren Sie PDF-Dokumente aus JSON-Dateien, die zuvor mit dem Werkzeug **PDF zu JSON** von BentoPDF erstellt wurden. Es ist ein Werkzeug für die Rückumwandlung: Es nimmt die strukturierte JSON-Darstellung einer PDF und baut das ursprüngliche Dokument wieder auf.

::: warning
Dieses Werkzeug akzeptiert nur JSON-Dateien, die mit dem PDF-zu-JSON-Konverter von BentoPDF erstellt wurden. Standard-JSON-Dateien aus APIs, Datenbanken oder anderen Werkzeugen werden nicht unterstützt.
:::

## Unterstützte Formate

| Eingabe | Beschreibung                                                                  |
| :------ | :---------------------------------------------------------------------------- |
| `.json` | JSON-Dateien, die mit dem Werkzeug PDF zu JSON von BentoPDF exportiert wurden |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie eine oder mehrere JSON-Dateien per Drag & Drop hinein.
2. Die Dateiliste zeigt jede ausgewählte Datei mit ihrer Größe.
3. Klicken Sie auf **In PDF umwandeln**. Das Werkzeug verarbeitet alle Dateien mit einem Web Worker und der CPDF-Engine.
4. Die Ausgabe wird als `jsons-to-pdf.zip` heruntergeladen und enthält pro JSON-Eingabedatei eine PDF.

Die Umwandlung läuft in einem Web Worker im Hintergrund, sodass die Oberfläche auch bei großen Dateien reaktionsfähig bleibt.

## Optionen

Dieses Werkzeug hat keine konfigurierbaren Optionen. Die JSON-Struktur bestimmt die Ausgabe-PDF vollständig.

## Ausgabe

Bei der Umwandlung mehrerer JSON-Dateien werden die Ergebnisse als ZIP-Archiv geliefert. Jede PDF trägt den Namen ihrer JSON-Quelldatei (z. B. wird aus `report.json` die Datei `report.pdf`).

## Anwendungsfälle

- PDFs aus einem JSON-basierten Backup oder Archivierungsprozess wiederherstellen
- Eine PDF zur Prüfung über JSON leiten und dann wieder in PDF zurückwandeln
- Dokumente nach programmatischen Änderungen an der JSON-Struktur neu aufbauen
- Prüfen, ob ein PDF-zu-JSON-Export den gesamten Dokumentinhalt erfasst hat, indem Sie ihn zurückwandeln

## Tipps

- Wenn Sie beliebige JSON-Daten (wie API-Antworten oder Konfigurationsdateien) in eine formatierte PDF umwandeln wollen, passt das Werkzeug [Text zu PDF](./txt-to-pdf) besser. Fügen Sie das JSON als Text ein, dann wird es sauber formatiert dargestellt.
- Die CPDF-WebAssembly-Engine muss verfügbar sein, damit dieses Werkzeug funktioniert. Selbst gehostete Instanzen benötigen die konfigurierten CPDF-WASM-Dateien.

## Verwandte Werkzeuge

- [Text zu PDF](./txt-to-pdf)
- [Markdown zu PDF](./markdown-to-pdf)
- [CSV zu PDF](./csv-to-pdf)
