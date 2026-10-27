---
title: PDF zu TIFF
description: Wandeln Sie PDF-Seiten in TIFF-Bilder um, wie sie in Druck-, Fax- und Archiv-Workflows üblich sind. Weicht bei Kodierungsfehlern auf PNG aus.
---

# PDF zu TIFF

Wandelt jede Seite eines PDFs in ein TIFF-Bild um. TIFF ist das Standardformat für Druckproduktion, Faxsysteme und Dokumentenarchivierung. Das Werkzeug nutzt PackBits-Komprimierung für die TIFF-Kodierung und weicht auf PNG aus, wenn eine Seite nicht kodiert werden kann.

## So funktioniert es

1. Laden Sie ein PDF hoch, indem Sie auf die Ablagefläche klicken oder eine Datei darauf ziehen.
2. Klicken Sie auf **Umwandeln**, um die Datei zu verarbeiten.
3. Eine einzelne TIFF-Datei oder ein ZIP-Archiv wird automatisch heruntergeladen.

## Optionen

Dieses Werkzeug hat keine einstellbaren Optionen. Seiten werden mit einem festen Maßstab von 2x gerendert.

## Ausgabeformat

- **Einzelne Seite**: `filename.tiff`
- **Mehrere Seiten**: `filename_tiffs.zip` mit `page_1.tiff`, `page_2.tiff` usw.

Schlägt die TIFF-Kodierung für eine bestimmte Seite fehl (wegen Komprimierungsproblemen), wird diese Seite stattdessen als `.png`-Datei gespeichert. Das ZIP enthält dann eine Mischung aus TIFF- und PNG-Dateien.

## Anwendungsfälle

- Dokumente bei Behörden oder Rechtssystemen einreichen, die das TIFF-Format verlangen.
- Seiten für die Faxübertragung über digitale Faxdienste vorbereiten.
- Gescannte Dokumente in einem weit unterstützten verlustfreien Format archivieren.
- Seiten in Dokumentenmanagementsysteme von Unternehmen einspeisen.

## Tipps

- TIFF-Dateien sind groß. Wenn Sie verlustfreie Qualität nur für Web oder Bildschirm brauchen, ist [PDF zu PNG](./pdf-to-png) die bessere Wahl.
- Prüfen Sie den ZIP-Inhalt, wenn einige Seiten auf PNG ausweichen mussten. Möglicherweise möchten Sie diese separat umwandeln.

## Verwandte Werkzeuge

- [PDF zu PNG](./pdf-to-png)
- [PDF zu BMP](./pdf-to-bmp)
- [PDF zu JPG](./pdf-to-jpg)
