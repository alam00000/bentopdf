---
title: Bilder extrahieren
description: Extrahieren Sie alle eingebetteten Bilder aus PDF-Dateien. Zeigen Sie sie in einem Raster an und laden Sie sie einzeln oder als ZIP-Archiv herunter.
---

# Bilder extrahieren

Holt jedes eingebettete Bild aus einer oder mehreren PDF-Dateien heraus. Die extrahierten Bilder werden in einem Vorschauraster angezeigt, in dem Sie sie einzeln herunterladen oder alles auf einmal als ZIP erhalten können. Angetrieben von PyMuPDF.

## So funktioniert es

1. Laden Sie eine oder mehrere PDFs hoch, indem Sie auf die Ablagefläche klicken oder Dateien darauf ziehen. Fügen Sie nach Bedarf weitere Dateien hinzu oder entfernen Sie einzelne.
2. Klicken Sie auf **Extrahieren**, um die Verarbeitung zu starten.
3. Das Werkzeug durchsucht jede Seite jeder hochgeladenen PDF und findet und extrahiert eingebettete Bilder.
4. Die extrahierten Bilder erscheinen als Vorschaubilder in einem Raster. Jedes Bild hat eine Download-Schaltfläche.
5. Klicken Sie auf **Alle herunterladen**, um alles als ZIP-Archiv zu speichern.

## Optionen

Dieses Werkzeug hat keine konfigurierbaren Optionen. Alle eingebetteten Bilder werden in ihrem nativen Format extrahiert (typischerweise PNG, JPEG oder dem Format, das beim Einbetten des Bildes in die PDF verwendet wurde).

## Ausgabeformat

- Bilder erscheinen im Vorschauraster mit Namen wie `image_1.png`, `image_2.jpg` usw.
- **Alle herunterladen** erzeugt `extracted-images.zip` mit allen Bildern.
- Einzelne Bilder können nacheinander aus dem Raster heruntergeladen werden.

## Anwendungsfälle

- Fotos oder Grafiken aus einer PDF zur Wiederverwendung in einem anderen Projekt zurückgewinnen.
- Produktbilder aus einer Katalog-PDF für ein E-Commerce-Angebot extrahieren.
- Diagramme aus technischer Dokumentation für Präsentationen herausholen.
- Prüfen, welche Bilder in einem Dokument eingebettet sind, bevor Sie es teilen.

## Tipps

- Das Werkzeug extrahiert Bilder genau so, wie sie in der PDF gespeichert sind. Es rendert keine Seiten als Bilder. Dafür nutzen Sie [PDF zu PNG](./pdf-to-png) oder [PDF zu JPG](./pdf-to-jpg).
- Meldet das Werkzeug "Keine Bilder gefunden", verwendet die PDF möglicherweise Vektorgrafiken statt eingebetteter Rasterbilder, oder es ist ein gescanntes Dokument, bei dem die gesamte Seite ein einziges großes Bild ist.
- Die Stapelverarbeitung funktioniert über mehrere PDFs hinweg. Alle Bilder aller Dateien werden in einem einzigen Raster und ZIP zusammengefasst.

## Verwandte Werkzeuge

- [PDF zu PNG](./pdf-to-png)
- [PDF zu JPG](./pdf-to-jpg)
- [PDF-Workflow-Builder](./pdf-workflow)
