---
title: JPG zu PDF
description: Wandeln Sie ein oder mehrere JPG-, JPEG- und JPEG-2000-Bilder direkt im Browser in eine einzige PDF-Datei um.
---

# JPG zu PDF

Mach aus JPG-Bildern eine saubere PDF. Laden Sie eine Datei hoch oder bündle mehrere JPGs, jedes Bild wird zu einer Seite in voller Größe im Ausgabedokument.

## Unterstützte Formate

| Format    | Erweiterungen   |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie Ihre JPG-Dateien per Drag & Drop hinein. Mehrfachauswahl wird unterstützt.
2. Prüfen Sie die hochgeladenen Dateien. Entfernen Sie einzelne Dateien mit dem Papierkorb-Symbol oder klicken Sie auf **Weitere Dateien hinzufügen**, um die Liste zu erweitern.
3. Wählen Sie eine **PDF-Qualität**.
4. Klicken Sie auf **In PDF umwandeln**. Das Werkzeug komprimiert die Bilder entsprechend Ihrer Qualitätseinstellung, wandelt sie mit der PyMuPDF-Engine um und lädt `from_jpgs.pdf` herunter.

## Optionen

Die **PDF-Qualität** steuert die Komprimierung, die auf jedes Bild angewendet wird, bevor es in die PDF eingebettet wird:

- **Hohe Qualität**: erhält maximale Details. Für Fotografie oder Druck.
- **Mittlere Qualität** (Standard): ein solider Mittelweg zwischen Klarheit und Dateigröße.
- **Niedrige Qualität**: starke Komprimierung für die kleinste Ausgabe.

## Anwendungsfälle

- Als JPG gespeicherte Scans in einer einzigen PDF zur Einreichung zusammenfassen
- Produktfotos zu einem Katalog für Kunden bündeln
- Medizinische oder Satellitenbilder in JPEG 2000 in eine portable PDF umwandeln
- Aus Kameraexporten ein druckbares Fotoalbum erstellen

## Tipps

- JPEG-2000-Dateien (`.jp2`, `.jpx`) werden vollständig unterstützt, nicht nur Standard-JPEG. Das ist nützlich für medizinische Bildgebung und Geodaten.
- Wenn Ihre JPGs von einer Handykamera stammen, erzeugt die mittlere Qualität meist eine Datei, die 40-60 % kleiner ist als bei hoher Qualität, ohne sichtbaren Unterschied am Bildschirm.

## Verwandte Werkzeuge

- [Bilder zu PDF](./image-to-pdf)
- [PNG zu PDF](./png-to-pdf)
- [WebP zu PDF](./webp-to-pdf)
