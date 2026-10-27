---
title: PDF zu WebP
description: Wandeln Sie PDF-Seiten in WebP-Bilder mit einstellbarer Qualität um. Kleinere Dateien als JPG bei vergleichbarer Bildqualität.
---

# PDF zu WebP

Wandelt jede Seite eines PDFs in ein WebP-Bild um. WebP erzeugt bei gleicher wahrgenommener Qualität in der Regel 25 bis 35 % kleinere Dateien als JPG und ist damit eine gute Wahl für die Webnutzung.

## So funktioniert es

1. Laden Sie ein PDF hoch, indem Sie auf die Ablagefläche klicken oder eine Datei darauf ziehen.
2. Stellen Sie den Regler **Qualität** ein.
3. Klicken Sie auf **Umwandeln**, um die Datei zu verarbeiten.
4. Eine einzelne `.webp`-Datei oder ein ZIP-Archiv wird automatisch heruntergeladen.

## Optionen

- **Qualität**: ein Regler von 0 % bis 100 % (Standard 85 %). Steuert den Grad der verlustbehafteten Komprimierung. Höhere Werte behalten mehr Details.

Seiten werden intern im Maßstab 2x gerendert, sodass die Bilder etwa die doppelten nativen Maße des PDFs haben.

## Ausgabeformat

- **Einzelne Seite**: `filename.webp`
- **Mehrere Seiten**: `filename_webps.zip` mit `page_1.webp`, `page_2.webp` usw.

## Anwendungsfälle

- Seitenvorschauen für Websites vorbereiten, bei denen die Bandbreite zählt.
- Leichte Bildversionen von Flyern oder Broschüren für soziale Medien erzeugen.
- Mehrseitige Dokumente im Stapel in einen webtauglich optimierten Bildsatz umwandeln.

## Tipps

- WebP wird von allen modernen Browsern unterstützt. Für Kompatibilität mit älteren Systemen weiche auf [PDF zu JPG](./pdf-to-jpg) aus.
- Eine Qualität von 80 bis 85 % ist auf dem Bildschirm meist nicht vom Original zu unterscheiden und hält die Dateien klein.

## Verwandte Werkzeuge

- [PDF zu JPG](./pdf-to-jpg)
- [PDF zu PNG](./pdf-to-png)
- [PDF zu BMP](./pdf-to-bmp)
