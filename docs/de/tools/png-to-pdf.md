---
title: PNG zu PDF
description: Wandeln Sie ein oder mehrere PNG-Bilder mit einstellbarer Qualität vollständig in Ihrem Browser in ein PDF-Dokument um.
---

# PNG zu PDF

Wandeln Sie PNG-Bilder in PDF um und behalten Sie dabei die volle Auflösung. Jedes PNG wird zu einer eigenen Seite, deren Größe den ursprünglichen Bildmaßen entspricht. Transparenz wird automatisch behandelt.

## Unterstützte Formate

| Format | Endungen |
| :----- | :------- |
| PNG    | `.png`   |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie PNG-Dateien per Drag-and-drop hinein. Sie können mehrere auf einmal auswählen.
2. Verwalten Sie die Dateiliste: Entfernen Sie unerwünschte Dateien oder fügen Sie weitere hinzu.
3. Wählen Sie im Dropdown eine **PDF-Qualität**.
4. Klicken Sie auf **In PDF umwandeln**. Die Ausgabe wird als `from_jpgs.pdf` heruntergeladen.

Das Werkzeug nutzt pdf-lib, um jedes Bild direkt einzubetten. Lässt sich ein PNG nicht nativ einbetten (z. B. wegen eines ungewöhnlichen Farbprofils), wird es stattdessen über ein Canvas als JPEG neu gerendert.

## Optionen

Die **PDF-Qualität** steuert die Komprimierung vor dem Einbetten:

- **Hohe Qualität**: minimale Komprimierung, größte Dateigröße.
- **Mittlere Qualität** (Standard): guter Kompromiss aus Größe und Klarheit.
- **Niedrige Qualität**: maximale Komprimierung, kleinste Ausgabe.

## Anwendungsfälle

- Screenshots in ein mehrseitiges PDF für Fehlerberichte oder Dokumentation umwandeln
- UI-Design-Exporte zur Prüfung in einer einzigen Datei bündeln
- Diagramm-Exporte (draw.io, Excalidraw) in ein teilbares PDF umwandeln
- Eine Reihe von Diagrammbildern zu einem Bericht zusammenstellen

## Tipps

- PNG-Dateien mit Transparenz erhalten im PDF einen weißen Hintergrund. Wenn Sie einen anderen Hintergrund brauchen, bearbeiten Sie die Bilder vorher.
- Bei Screenshots und Diagrammen mit scharfen Kanten und Text vermeidet die hohe Qualität JPEG-Artefakte. Bei mittlerer oder niedriger Qualität wird möglicherweise intern in JPEG umgewandelt.

## Verwandte Werkzeuge

- [Bilder zu PDF](./image-to-pdf)
- [JPG zu PDF](./jpg-to-pdf)
- [SVG zu PDF](./svg-to-pdf)
