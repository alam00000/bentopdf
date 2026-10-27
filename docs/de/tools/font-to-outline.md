---
title: Schriftart zu Umriss
description: Wandeln Sie alle PDF-Schriften in Vektorumrisse um, für eine einheitliche Darstellung auf allen Geräten. Beseitigt Probleme mit fehlenden Schriften.
---

# Schriftart zu Umriss

Beim Umwandeln von Schriften in Umrisse wird jedes Textzeichen von einem schriftbasierten Glyphen in einen Vektorpfad verwandelt. Die PDF hängt dann von keiner installierten Schrift mehr ab und wird auf jedem Gerät, in jedem Betriebssystem und auf jedem Drucker identisch dargestellt. Das ist ein Standardschritt in Prepress-Workflows.

## So funktioniert es

1. Laden Sie eine oder mehrere PDF-Dateien hoch.
2. Klicken Sie auf **In Umrisse umwandeln**.
3. Ghostscript wandelt den gesamten Text in Vektorpfade um.
4. Laden Sie das Ergebnis herunter. Mehrere Dateien ergeben ein ZIP-Archiv.

Es gibt keine Einstellungen. Das Werkzeug nutzt Ghostscript (WebAssembly), um alle Schriftverweise in einem Durchgang in Umrisspfade umzuwandeln.

## Was sich ändert

- Textzeichen werden zu Vektorkurven (Bézierpfade)
- Das Einbetten von Schriften ist nicht mehr nötig, die PDF ist auf Glyphenebene in sich geschlossen
- Die Dateigröße kann steigen, da Vektorpfade meist größer sind als Schriftverweise
- Das Erscheinungsbild bleibt exakt erhalten

## Was verloren geht

- Textauswahl und Kopieren und Einfügen
- Durchsuchbarkeit des Textes (Strg+F funktioniert nicht mehr)
- Die Möglichkeit, den Textinhalt zu bearbeiten
- Barrierefreiheit für Screenreader

## Anwendungsfälle

- PDFs an eine Druckerei schicken, die Schriften in Umrissen verlangt
- Dokumente mit eigenen oder lizenzierten Schriften an Personen weitergeben, die diese Schriften nicht haben
- Schriftersetzung verhindern, die das Aussehen Ihres Dokuments auf anderen Systemen verändert
- PDFs für Lasergravur oder CNC-Fräsen vorbereiten, die Vektoreingaben erfordern
- Sicherstellen, dass eine logolastige PDF auf allen Plattformen korrekt angezeigt wird

## Tipps

- Behalten Sie Ihre Original-PDF. Das Umwandeln in Umrisse ist unumkehrbar, Pfade lassen sich nicht in bearbeitbaren Text zurückverwandeln.
- Wenn der Text durchsuchbar bleiben soll, nehmen Sie stattdessen das Werkzeug PDF rastern mit anschließender OCR.
- PDFs mit Umrissen sind tendenziell größer. Führen Sie danach PDF komprimieren aus, wenn die Dateigröße wichtig ist.

## Verwandte Werkzeuge

- [PDF reduzieren](./flatten-pdf): Formulare und Annotationen reduzieren, ohne Schriften anzutasten
- [PDF rastern](./rasterize-pdf): in eine bildbasierte PDF statt in Vektorumrisse umwandeln
- [PDF komprimieren](./compress-pdf): Dateigröße nach dem Umwandeln verringern
- [PDF zu PDF/A](./pdf-to-pdfa): für die Archivierung umwandeln, nachdem die Schriftunabhängigkeit sichergestellt ist
