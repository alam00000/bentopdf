---
title: PDF zu Graustufen
description: Wandeln Sie ein farbiges PDF in eine Graustufen-Version (Schwarzweiß) um. Erzeugt ein neues PDF, in dem auf jeder Seite alle Farben entfernt sind.
---

# PDF zu Graustufen

Wandelt ein farbiges PDF in eine Graustufen-Version um. Jede Seite wird gerendert, entsättigt und als JPEG-Bild in ein neues PDF eingebettet. Die Ausgabe behält die ursprünglichen Seitenmaße.

## So funktioniert es

1. Laden Sie ein PDF hoch, indem Sie auf die Ablagefläche klicken oder eine Datei darauf ziehen.
2. Klicken Sie auf **Umwandeln**, um die Datei zu verarbeiten.
3. Eine neue `greyscale.pdf` wird heruntergeladen, bei der alle Seiten in Schwarzweiß umgewandelt sind.

Im Hintergrund wird jede Seite im Maßstab 2x gerendert, die Pixeldaten laufen durch einen Graustufenfilter und werden dann als JPEG mit 90 % Qualität neu kodiert und in ein frisches PDF-Dokument gesetzt.

## Optionen

Dieses Werkzeug hat keine einstellbaren Optionen. Die Graustufenumwandlung nutzt eine Standard-Luminanzformel, und die JPEG-Qualität ist fest auf 90 % eingestellt.

## Ausgabeformat

- Eine einzelne Datei `greyscale.pdf` mit allen Seiten als Graustufen-JPEG-Bilder.

## Anwendungsfälle

- Dokumente für den Schwarzweißdruck vorbereiten, um Farbtinte zu sparen.
- Einreichungsanforderungen für rechtliche oder behördliche Unterlagen erfüllen, die Graustufen vorschreiben.
- Die Dateigröße bei farbintensiven PDFs verringern (JPEG-Graustufenbilder sind kleiner als Farbbilder).
- Einen einheitlichen Look für Dokumente mit gemischten Farb- und Schwarzweißseiten schaffen.

## Tipps

- Da jede Seite gerastert und als JPEG neu eingebettet wird, ist die Ausgabe bildbasiert. Text im ursprünglichen PDF ist danach nicht mehr auswählbar oder durchsuchbar. Wenn Sie danach durchsuchbaren Text brauchen, schicken Sie die Ausgabe durch das OCR-Werkzeug.
- Für mehr Kontrolle über Farbanpassungen (Helligkeit, Kontrast, Sättigung) sehen Sie sich das Werkzeug Farben anpassen oder den Graustufen-Knoten im [PDF-Workflow-Builder](./pdf-workflow) an.

## Verwandte Werkzeuge

- [PDF zu JPG](./pdf-to-jpg)
- [PDF zu PNG](./pdf-to-png)
- [PDF-Workflow-Builder](./pdf-workflow)
