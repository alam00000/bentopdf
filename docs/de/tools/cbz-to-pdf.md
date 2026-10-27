---
title: CBZ zu PDF
description: Wandlen Sie CBZ- und CBR-Comicarchive in Ihrem Browser in PDF um. Kostenlos, privat, kein Upload nötig.
---

# CBZ zu PDF

Verwandlen Sie Comic-Archivdateien in PDFs. CBZ und CBR sind die Standardformate für digitale Comics: Es sind einfach ZIP- oder RAR-Archive voller Bilder. Dieses Werkzeug extrahiert jede Seite, behält die Lesereihenfolge bei und erzeugt eine saubere PDF, in der jedes Bild zu einer Seite in voller Größe wird.

## Unterstützte Formate

| Format | Erweiterung | Hinweise                                                        |
| :----- | :---------- | :-------------------------------------------------------------- |
| CBZ    | `.cbz`      | ZIP-basiertes Comicarchiv (lokal mit pdf-lib verarbeitet)       |
| CBR    | `.cbr`      | RAR-basiertes Comicarchiv (über die PyMuPDF-Engine verarbeitet) |

Der CBZ-Konverter erkennt JPEG-, PNG-, GIF-, BMP-, WebP-, AVIF-, TIFF-, HEIC- und JXL-Bilder im Archiv. Nicht standardmäßige Formate werden vor dem Einbetten automatisch in PNG umgewandelt.

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie Ihre CBZ- oder CBR-Dateien hinein. Sie können beide Formate in einem Stapel mischen.
2. Prüfen Sie die aufgelisteten Dateien. Entfernen Sie nicht benötigte oder klicken Sie auf **Weitere Dateien hinzufügen**, um mehr hinzuzufügen.
3. Klicken Sie auf **In PDF umwandeln**. Bei CBZ-Dateien entpackt das Werkzeug das Archiv, sortiert die Bilddateien in natürlicher Reihenfolge nach Namen, erkennt das tatsächliche Format jedes Bildes und bettet sie mit pdf-lib in eine PDF ein. CBR-Dateien laufen stattdessen über die PyMuPDF-Engine.
4. Eine einzelne Datei wird als PDF heruntergeladen. Bei mehreren Dateien entsteht ein ZIP-Archiv namens `comic-converted.zip`.

## Optionen

Es ist keine Konfiguration nötig. Jedes Bild wird zu einer Seite in der Größe des Originals, sodass Doppelseiten breit und Einzelseiten schmal bleiben.

## Anwendungsfälle

- Comics auf einem Tablet oder in einer Handy-App lesen, die PDF, aber nicht CBZ/CBR unterstützt
- Bestimmte Seiten eines digitalen Comics drucken
- Eine Comicsammlung in einem Format archivieren, das jeder Dateibetrachter öffnen kann
- Einen Comic mit jemandem teilen, der keinen speziellen Comic-Reader hat

## Tipps

- Bilder im Archiv werden in natürlicher Reihenfolge sortiert (`page2.jpg` kommt also vor `page10.jpg`). Benennen Sie Ihre Dateien mit einheitlicher Nummerierung, damit die Seitenreihenfolge stimmt.
- Der Konverter erkennt Bildformate anhand ihrer binären Signatur, nicht anhand der Dateiendung. Eine PNG-Datei, die versehentlich `.jpg` heißt, wird trotzdem korrekt eingebettet.
- CBZ-Dateien werden vollständig im Browser verarbeitet, ohne die PyMuPDF-Engine zu laden, und werden daher schneller umgewandelt als CBR-Dateien.

## Verwandte Werkzeuge

- [EPUB zu PDF](./epub-to-pdf)
- [MOBI zu PDF](./mobi-to-pdf)
- [Bilder zu PDF](./image-to-pdf)
