---
title: PDF zu PNG
description: Wandeln Sie PDF-Seiten in verlustfreie PNG-Bilder mit einstellbarem Maßstab um. Ideal für hochwertige Screenshots und transparente Hintergründe.
---

# PDF zu PNG

Wandelt jede Seite eines PDFs in ein PNG-Bild um. PNG nutzt verlustfreie Komprimierung, daher erhält die Ausgabe jedes Detail der Originalseite. Einseitige PDFs werden als `.png`-Datei heruntergeladen, mehrseitige PDFs ergeben ein ZIP.

## So funktioniert es

1. Laden Sie ein PDF hoch, indem Sie auf die Ablagefläche klicken oder eine Datei darauf ziehen.
2. Stellen Sie den Regler **Maßstab** ein, um die Ausgabeauflösung zu steuern.
3. Klicken Sie auf **Umwandeln**, um die Verarbeitung zu starten.
4. Ein einzelnes PNG oder ein ZIP-Archiv wird automatisch heruntergeladen.

## Optionen

- **Maßstab**: reicht von 1.0x bis 3.0x (Standard 2.0x). Bei 2.0x wird eine Seite im Letter-Format mit etwa 1.224 x 1.584 Pixeln gerendert. Höhere Maßstäbe erzeugen größere, schärfere Bilder auf Kosten von Dateigröße und Verarbeitungszeit.

## Ausgabeformat

- **Einzelne Seite**: `filename.png`
- **Mehrere Seiten**: `filename_pngs.zip` mit `page_1.png`, `page_2.png` usw.

## Anwendungsfälle

- Hochwertige Screenshots von PDF-Seiten für Präsentationen erstellen.
- Diagramme oder Grafiken extrahieren, die scharfe Kanten und keine Komprimierungsartefakte brauchen.
- Assets für das Webdesign aus PDF-Entwürfen vorbereiten.
- Verlustfreie Seitenbilder für die OCR-Vorverarbeitung erzeugen.

## Tipps

- PNG-Dateien sind deutlich größer als JPG. Wenn die Dateigröße wichtiger ist als perfekte Qualität, nutzen Sie [PDF zu JPG](./pdf-to-jpg) oder [PDF zu WebP](./pdf-to-webp).
- Bei Maßstab 1.0x entspricht die Ausgabe der nativen Auflösung des PDFs. Erhöhen Sie auf 3.0x für Exporte in Druckqualität.

## Verwandte Werkzeuge

- [PDF zu JPG](./pdf-to-jpg)
- [PDF zu WebP](./pdf-to-webp)
- [PDF zu SVG](./pdf-to-svg)
