---
title: SVG zu PDF
description: Wandeln Sie SVG-Vektorgrafiken mit Qualitätssteuerung vollständig in Ihrem Browser in PDF um.
---

# SVG zu PDF

Wandeln Sie Scalable-Vector-Graphics-Dateien (SVG) in PDF um. Das Werkzeug rastert jede SVG über die Rendering-Engine des Browsers und bettet das Ergebnis in seiner Originalauflösung ein. Praktisch, um Vektorsymbole, Diagramme und Illustrationen in portable Dokumente zu verwandeln.

## Unterstützte Formate

| Format | Endungen |
| :----- | :------- |
| SVG    | `.svg`   |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie eine oder mehrere SVG-Dateien per Drag & Drop hinein.
2. Prüfen und verwalten Sie die Dateiliste.
3. Wählen Sie eine **PDF-Qualität**.
4. Klicken Sie auf **In PDF umwandeln**. Das Ergebnis wird als `from_svgs.pdf` heruntergeladen.

Jede SVG wird als Text gelesen, mit ihrer eigenen Breite und Höhe auf eine Canvas gerendert (Standard 800x600, wenn keine Maße angegeben sind) und als PNG exportiert. Dieses PNG wird dann mit pdf-lib in die PDF eingebettet. Transparente Bereiche werden mit weißem Hintergrund gefüllt.

## Optionen

**PDF-Qualität** steuert die Komprimierung nach dem Rastern:

- **Hohe Qualität**: am nächsten an der ursprünglichen Darstellung.
- **Mittlere Qualität** (Standard): gute Balance.
- **Niedrige Qualität**: kleinste Datei, etwas Detailverlust.

## Anwendungsfälle

- Architektur- oder Konstruktionsdiagramme von SVG in eine druckfertige PDF umwandeln
- Symbolsammlungen für ein Design-System in einer Referenz-PDF bündeln
- Datenvisualisierungen (D3.js, Exporte von Diagrammbibliotheken) in berichtsfertige PDFs verwandeln
- Druckbare Versionen SVG-basierter Infografiken erstellen

## Tipps

- SVG-Dateien ohne explizite Attribute `width` und `height` werden mit 800x600 Pixeln gerendert. Legen Sie für beste Ergebnisse die Maße im SVG-Quelltext fest, bevor Sie umwandeln.
- Komplexe SVGs mit externen Schriftverweisen oder verknüpften Bildern werden möglicherweise nicht perfekt dargestellt. Binden Sie für zuverlässige Ausgabe alle Ressourcen direkt in die SVG ein.
- Da die SVG gerastert wird, enthält die PDF ein Bitmap-Bild statt Vektorpfaden. Für echte Vektor-PDF-Ausgabe ist ein spezielles Vektorwerkzeug nötig.

## Verwandte Werkzeuge

- [Bilder zu PDF](./image-to-pdf)
- [PNG zu PDF](./png-to-pdf)
- [BMP zu PDF](./bmp-to-pdf)
