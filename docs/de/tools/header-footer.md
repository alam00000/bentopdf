---
title: Kopf- & Fußzeile
description: Fügen Sie den PDF-Seiten anpassbaren Kopf- und Fußzeilentext mit dynamischen Seitenzahl-Variablen hinzu.
---

# Kopf- & Fußzeile

Fügen Sie Text an sechs Positionen Ihrer PDF-Seiten hinzu: Kopfzeile links, Kopfzeile Mitte, Kopfzeile rechts, Fußzeile links, Fußzeile Mitte und Fußzeile rechts. Das Werkzeug unterstützt dynamische Variablen für Seitenzahlen und Gesamtseitenzahl, sodass Sie Vorlagen wie "Seite 3 von 10" erstellen kÃ¶nnen, die sich pro Seite automatisch aktualisieren.

## So funktioniert es

1. Laden Sie Ihre PDF-Datei hoch.
2. Das Optionsfenster erscheint mit Formatierungssteuerungen und sechs Texteingabefeldern.
3. Geben Sie den gewünschten Text an einer beliebigen Position der Kopf- oder Fußzeile ein.
4. Nutzen Sie die Platzhalter `{page}` und `{total}` für dynamische Seitenzahlen.
5. Passen Sie Schriftgröße und Schriftfarbe an und beschränken Sie optional auf einen bestimmten Seitenbereich.
6. Klicken Sie auf **Kopf- & Fußzeile hinzufügen**, um zu verarbeiten und herunterzuladen.

## Optionen

- **Seitenbereich**: Beschränken Sie optional, welche Seiten Kopf- und Fußzeilen erhalten. Leer lassen, um alle Seiten einzubeziehen. Format: "1-3, 5" (kommagetrennte Bereiche).
- **Schriftgröße**: Zwischen 6 und 24 Punkt. Standard ist 10.
- **Schriftfarbe**: Wählen Sie eine beliebige Farbe mit der Farbauswahl.
- **Kopfzeile links / Mitte / rechts**: Textfelder für den oberen Seitenrand.
- **Fußzeile links / Mitte / rechts**: Textfelder für den unteren Seitenrand.

## Funktionen

- Sechs unabhängige Textpositionen pro Seite
- Dynamische Variable `{page}`, die die aktuelle Seitenzahl einfügt
- Dynamische Variable `{total}`, die die Gesamtseitenzahl einfügt
- Seitenbereichsfilter, um bestimmte Seiten gezielt zu bearbeiten
- Anpassbare Schriftgröße und Farbe
- Helvetica-Schrift für ein klares, professionelles Ergebnis

## Anwendungsfälle

- "Seite {page} von {total}" in der Fußzeile Mitte eines Berichts einfügen
- Einen Firmennamen in die Kopfzeile links und ein Dokumentdatum in die Kopfzeile rechts setzen
- Vertraulichkeitshinweise in die Fußzeile von Rechtsdokumenten einfügen
- Revisionsnummern auf bestimmten Seitenbereichen aufstempeln

## Tipps

- Kombinieren Sie `{page}` und `{total}` in einem Feld für Formate wie "Seite {page} von {total}" oder "{page}/{total}".
- Sie können die meisten Felder leer lassen und nur die Positionen ausfüllen, die Sie brauchen. Leere Felder werden einfach übersprungen.
- Für komplexere Kopfzeilen mit Bildern oder Logos können Sie das Werkzeug [Wasserzeichen hinzufügen](./add-watermark) nutzen und oben auf der Seite positionieren.

## Verwandte Werkzeuge

- [Seitenzahlen](./page-numbers)
- [Wasserzeichen hinzufügen](./add-watermark)
- [Bates-Nummerierung](./bates-numbering)
