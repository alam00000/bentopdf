---
title: PDF zu SVG
description: Wandeln Sie PDF-Seiten in skalierbare SVG-Vektorgrafiken um. Erhält Text und Formen als Vektorpfade für unbegrenztes Skalieren.
---

# PDF zu SVG

Wandelt jede Seite eines PDFs in eine SVG-Datei (Scalable Vector Graphics) um. Anders als Rasterformate erhält SVG Vektorpfade, Text und Formen, sodass die Ausgabe ohne Pixelbildung auf jede Größe skaliert. Basiert auf PyMuPDF.

## So funktioniert es

1. Laden Sie ein oder mehrere PDFs hoch, indem Sie auf die Ablagefläche klicken oder Dateien darauf ziehen. Sie können mehrere Dateien hinzufügen und einzeln verwalten.
2. Klicken Sie auf **Umwandeln**, um alle hochgeladenen Dateien zu verarbeiten.
3. Umwandlungen einer einzelnen Datei mit nur einer Seite werden als eigenständige `.svg` heruntergeladen. Alles andere wird als ZIP-Archiv heruntergeladen.

## Optionen

Dieses Werkzeug hat keine einstellbaren Optionen. Jede Seite wird mit dem nativen Vektorexport von PyMuPDF in SVG umgewandelt.

## Ausgabeformat

- **Eine Datei, eine Seite**: `filename.svg`
- **Eine Datei, mehrere Seiten**: `filename_svg.zip` mit `page_1.svg`, `page_2.svg` usw.
- **Mehrere Dateien**: `pdf_to_svg.zip` mit Dateien, geordnet nach dem Namen des Quelldokuments.

## Anwendungsfälle

- Vektordiagramme, Grafiken oder Illustrationen aus PDF-Berichten für Webseiten extrahieren.
- PDF-Seiteninhalte in einem Vektoreditor wie Inkscape oder Illustrator bearbeiten.
- Skalierbare Seitenvorschauen in responsive Webanwendungen einbetten.
- Logos oder Grafiken aus PDF-Broschüren unter Erhalt scharfer Kanten extrahieren.

## Tipps

- SVG funktioniert am besten mit PDFs, die Vektorinhalte enthalten. Gescannte Dokumente oder bildlastige PDFs erzeugen große SVG-Dateien mit eingebetteten Rasterdaten.
- Für Rasterausgabe bei bildlastigen PDFs nutzen Sie stattdessen [PDF zu PNG](./pdf-to-png) oder [PDF zu JPG](./pdf-to-jpg).
- Dieses Werkzeug unterstützt die Stapelumwandlung: Laden Sie mehrere PDFs auf einmal hoch, um alle in einem Durchlauf umzuwandeln.

## Verwandte Werkzeuge

- [PDF zu PNG](./pdf-to-png)
- [PDF zu JPG](./pdf-to-jpg)
- [PDF zu Markdown](./pdf-to-markdown)
