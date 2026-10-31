---
title: PDF zu BMP
description: Wandeln Sie PDF-Seiten in unkomprimierte BMP-Bilder um. Nützlich für Altsysteme und Druck-Workflows, die Bitmap-Eingaben erfordern.
---

# PDF zu BMP

Wandelt jede Seite eines PDFs in ein BMP-Bild (Bitmap) um. BMP ist ein unkomprimiertes Format, daher ist die Ausgabe pixelgenau und ohne Qualitätsverlust, die Dateien sind aber groß.

## So funktioniert es

1. Laden Sie ein PDF hoch, indem Sie auf die Ablagefläche klicken oder eine Datei darauf ziehen.
2. Klicken Sie auf **Umwandeln**, um die Datei zu verarbeiten.
3. Eine einzelne `.bmp`-Datei oder ein ZIP-Archiv wird automatisch heruntergeladen.

## Optionen

Dieses Werkzeug hat keine einstellbaren Optionen. Seiten werden mit einem festen Maßstab von 2x gerendert, sodass die Bilder etwa die doppelten Maße der ursprünglichen PDF-Seite haben.

## Ausgabeformat

- **Einzelne Seite**: `filename.bmp`
- **Mehrere Seiten**: `filename_bmps.zip` mit `page_1.bmp`, `page_2.bmp` usw.

## Anwendungsfälle

- PDF-Seiten in Altsysteme oder Hardware einspeisen, die nur BMP-Eingaben akzeptieren.
- Unkomprimierte Bilder für bestimmte Druck-Workflows vorbereiten.
- Bitmap-Ausgabe als Eingabe für Bildverarbeitungswerkzeuge nutzen, die Rohpixeldaten benötigen.

## Tipps

- BMP-Dateien sind sehr groß, weil sie Rohpixeldaten ohne Komprimierung speichern. Für die meisten Zwecke liefert [PDF zu PNG](./pdf-to-png) verlustfreie Qualität bei viel kleineren Dateien.
- Wenn Ihr Zielsystem PNG oder TIFF akzeptiert, bevorzugen Sie diese Formate, um Speicherplatz zu sparen.

## Verwandte Werkzeuge

- [PDF zu PNG](./pdf-to-png)
- [PDF zu TIFF](./pdf-to-tiff)
- [PDF zu JPG](./pdf-to-jpg)
