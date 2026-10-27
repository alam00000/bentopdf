---
title: PDF zu JPG
description: Wandeln Sie PDF-Seiten in JPG-Bilder mit einstellbarer Qualität um. Einseitige PDFs werden direkt heruntergeladen, mehrseitige als ZIP exportiert.
---

# PDF zu JPG

Wandelt jede Seite eines PDFs in ein JPG-Bild um. Einseitige Dokumente werden als eigenständige `.jpg`-Datei heruntergeladen. Mehrseitige PDFs ergeben ein ZIP-Archiv mit einem JPG pro Seite.

## So funktioniert es

1. Laden Sie ein PDF hoch, indem Sie auf die Ablagefläche klicken oder eine Datei darauf ziehen. Das Werkzeug zeigt Dateiname, Dateigröße und Seitenzahl an.
2. Stellen Sie den Regler **Qualität** ein, um die JPG-Komprimierung zu steuern.
3. Klicken Sie auf **Umwandeln**, um die Verarbeitung zu starten.
4. Das Ergebnis wird automatisch heruntergeladen: ein einzelnes JPG bei einseitigen PDFs oder eine ZIP-Datei bei mehrseitigen Dokumenten.

## Optionen

- **Qualität**: ein Regler von 0 % bis 100 % (Standard 90 %). Höhere Werte erzeugen schärfere Bilder mit größeren Dateien. Niedrigere Werte komprimieren stärker.

Seiten werden intern im Maßstab 2x gerendert, die Ausgabeauflösung ist also doppelt so groß wie die PDF-Seitenmaße. Eine Seite im Letter-Format ergibt ein Bild mit etwa 1.224 x 1.584 Pixeln.

## Ausgabeformat

- **Einzelne Seite**: `filename.jpg`
- **Mehrere Seiten**: `filename_jpgs.zip` mit `page_1.jpg`, `page_2.jpg` usw.

## Anwendungsfälle

- Vorschaubilder für ein Dokumentenmanagementsystem erzeugen.
- Eine Seite aus einem Bericht in einem Chat oder einer E-Mail teilen, die kein PDF unterstützt.
- Bildmaterial aus PDF-Diagrammen oder Illustrationen erstellen.
- Gescannte Dokumente als einzelne Bilder archivieren.

## Tipps

- Für verlustfreie Ausgabe nutzen Sie stattdessen [PDF zu PNG](./pdf-to-png).
- Eine Qualitätseinstellung von 80 bis 90 % bietet einen guten Kompromiss zwischen Dateigröße und Bildtreue.
- Wenn Sie pro Seite ein bestimmtes Format brauchen, sehen Sie sich den [PDF-Workflow-Builder](./pdf-workflow) mit seinem Ausgabe-Knoten PDF zu Bildern an.

## Verwandte Werkzeuge

- [PDF zu PNG](./pdf-to-png)
- [PDF zu WebP](./pdf-to-webp)
- [PDF zu BMP](./pdf-to-bmp)
- [PDF zu TIFF](./pdf-to-tiff)
