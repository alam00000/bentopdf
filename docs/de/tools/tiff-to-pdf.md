---
title: TIFF zu PDF
description: Wandeln Sie einseitige und mehrseitige TIFF-Bilder in Ihrem Browser mit voller Seitenunterstützung in PDF um.
---

# TIFF zu PDF

Wandeln Sie TIFF-Dateien in PDF um, auch mehrseitige TIFFs. Jede Seite (oder "IFD") einer TIFF-Datei wird zu einer eigenen Seite in der Ausgabe-PDF. Das ist besonders nützlich für gescannte Dokumente, Faxe und medizinische Bilder, die häufig als mehrseitige TIFFs gespeichert werden.

## Unterstützte Formate

| Format | Endungen        |
| :----- | :-------------- |
| TIFF   | `.tiff`, `.tif` |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie Ihre TIFF-Dateien per Drag & Drop hinein.
2. Prüfen Sie die Dateiliste und verwalten Sie sie nach Bedarf.
3. Klicken Sie auf **In PDF umwandeln**. Das Ergebnis wird als `from_tiff.pdf` heruntergeladen.

Das Werkzeug dekodiert jede TIFF-Datei mit einem JavaScript-TIFF-Decoder und extrahiert die rohen RGBA-Pixeldaten jeder Seite. Jede Seite wird auf eine Canvas gerendert, als PNG exportiert und in die PDF eingebettet. Die Seitenmaße entsprechen denen der ursprünglichen TIFF-Seiten.

## Optionen

Dieses Werkzeug bietet keine zusätzlichen Qualitätseinstellungen. Bilder werden in ihrer Originalauflösung eingebettet.

## Anwendungsfälle

- Mehrseitige Faxdokumente (TIFF-F) in ein portableres PDF-Format umwandeln
- Gescannte Dokumentarchive, die als TIFF vorliegen, in durchsuchbare PDFs verwandeln (anschließend mit dem OCR-Werkzeug kombinieren)
- Medizinische Bilddateien (Pathologie-Präparate, Radiologie-Exporte) im TIFF-Format verarbeiten
- GIS- oder Satellitenbild-TIFFs in teilbare Dokumente umwandeln

## Tipps

- Mehrseitige TIFFs werden vollständig unterstützt. Ein TIFF mit 10 Seiten ergibt eine PDF mit 10 Seiten. Sie müssen das TIFF nicht vorher teilen.
- Sehr große TIFF-Dateien (mehrere hundert Megabyte) können länger dauern, da die gesamte Datei im Browserspeicher dekodiert werden muss.
- Wenn Sie OCR auf der entstandenen PDF brauchen, führen Sie sie nach der Umwandlung durch das Werkzeug [OCR PDF](./ocr-pdf).

## Verwandte Werkzeuge

- [Bilder zu PDF](./image-to-pdf)
- [BMP zu PDF](./bmp-to-pdf)
- [JPG zu PDF](./jpg-to-pdf)
