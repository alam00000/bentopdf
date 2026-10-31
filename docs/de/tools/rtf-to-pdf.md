---
title: RTF zu PDF
description: Wandeln Sie Rich-Text-Format-Dateien (RTF) in Ihrem Browser mit einer LibreOffice-basierten Engine in PDF um.
---

# RTF zu PDF

Wandeln Sie Rich-Text-Format-Dokumente in PDF um. RTF ist ein plattformübergreifendes Dokumentformat, das von praktisch jeder Textverarbeitung unterstützt wird. Dieses Werkzeug nutzt eine browserbasierte LibreOffice-Engine, um RTF-Dateien mit erhaltener Formatierung darzustellen: Fett, Kursiv, Tabellen und eingebettete Bilder werden in die PDF übernommen.

## Unterstützte Formate

| Format | Endungen | MIME-Typen                    |
| :----- | :------- | :---------------------------- |
| RTF    | `.rtf`   | `text/rtf`, `application/rtf` |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie eine oder mehrere RTF-Dateien per Drag & Drop hinein.
2. Prüfen Sie die Dateiliste. Fügen Sie weitere Dateien hinzu oder entfernen Sie welche.
3. Klicken Sie auf **In PDF umwandeln**. Die LibreOffice-Engine wird bei der ersten Nutzung initialisiert und verarbeitet dann jede Datei.
4. Eine einzelne Datei wird direkt als PDF heruntergeladen. Mehrere Dateien werden als `rtf-converted.zip` geliefert.

## Optionen

Dieses Werkzeug hat keine zusätzlichen Einstellungen. Die Umwandlung erhält die ursprüngliche RTF-Formatierung.

## Ausgabe

| Anzahl der Eingaben | Ausgabe                                                  |
| :------------------ | :------------------------------------------------------- |
| 1 Datei             | Einzelner PDF-Download (z. B. `letter.pdf`)              |
| 2+ Dateien          | ZIP-Archiv (`rtf-converted.zip`) mit einer PDF pro Datei |

## Anwendungsfälle

- Ältere RTF-Dokumente aus früheren Textverarbeitungen in moderne PDFs umwandeln
- RTF-E-Mail-Vorlagen in PDF-Vorschauen verwandeln
- RTF-Ausgaben aus juristischen oder medizinischen Softwaresystemen verarbeiten
- RTF-Dateien aus einem Dokumentenmanagementsystem stapelweise zur Archivierung in PDF umwandeln

## Tipps

- Die LibreOffice-Engine wird einmal geladen und zwischengespeichert. Die erste Umwandlung in einer Sitzung dauert ein paar Sekunden länger, weitere gehen schneller.
- RTF-Dateien mit eingebetteten OLE-Objekten werden möglicherweise nicht alle Objekte perfekt darstellen. Reiner Text, Bilder und Standardformatierung werden zuverlässig umgewandelt.
- Wenn Ihre RTF-Dateien mit Microsoft Word erstellt wurden, können Sie sie auch direkt mit dem Werkzeug [Word zu PDF](./word-to-pdf) umwandeln, das neben DOC und DOCX auch RTF akzeptiert.

## Verwandte Werkzeuge

- [Word zu PDF](./word-to-pdf)
- [ODT zu PDF](./odt-to-pdf)
- [Text zu PDF](./txt-to-pdf)
