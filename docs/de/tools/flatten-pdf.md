---
title: PDF reduzieren
description: Wandeln Sie interaktive Formulare und Annotationen in statische Inhalte um. Formularfelder werden nicht mehr bearbeitbar, Annotationen werden in die Seite eingebrannt.
---

# PDF reduzieren

Beim Reduzieren (Flatten) werden interaktive Elemente wie Formularfelder, Dropdowns, Kontrollkästchen, Annotationen, Markierungen und Haftnotizen direkt in den Seiteninhalt eingebunden. Das Aussehen bleibt gleich, aber nichts ist mehr bearbeitbar oder extrahierbar. Es ist das PDF-Pendant dazu, ein ausgefülltes Formular auszudrucken und wieder einzuscannen, nur bleibt die Qualität perfekt.

## So funktioniert es

1. Laden Sie eine oder mehrere PDF-Dateien hoch.
2. Klicken Sie auf **PDF reduzieren**.
3. Eine einzelne Datei wird direkt heruntergeladen. Mehrere Dateien ergeben ein ZIP-Archiv.

Das Werkzeug nutzt pdf-lib, um Formularfelder zu reduzieren (über `form.flatten()`), und einen eigenen Annotations-Flattener, der Annotationen in den Seitenstream einbrennt. Beide Vorgänge laufen in einem Durchgang.

## Was reduziert wird

- **Formularfelder**: Texteingaben, Kontrollkästchen, Optionsfelder, Dropdowns, Signaturfelder
- **Annotationen**: Kommentare, Markierungen, Durchstreichungen, Unterstreichungen, Haftnotizen, Stempel, Freihandannotationen
- **Interaktive Elemente**: Schaltflächen, Aktionsauslöser

## Was unverändert bleibt

- Textinhalt (bleibt auswählbar und durchsuchbar)
- Bilder und Grafiken
- Seitenlayout und Abmessungen
- Lesezeichen und Inhaltsverzeichnis
- Hyperlinks (außer sie basieren auf Annotationen)

## Anwendungsfälle

- Ein ausgefülltes Formular sperren, damit Empfänger die abgegebenen Antworten nicht ändern können
- Eine PDF für die Archivierung vorbereiten, wenn interaktive Elemente überflüssig sind
- Darstellungsprobleme beheben, weil Annotationen in verschiedenen Viewern unterschiedlich angezeigt werden
- Sicherstellen, dass ein unterschriebenes Dokument nach der Signatur nicht mehr verändert werden kann
- Die Dateigröße verringern, indem Formularfelddefinitionen und Annotationsobjekte entfernt werden

## Tipps

- Reduzieren Sie erst, wenn alle Änderungen abgeschlossen sind. Das Reduzieren einer PDF lässt sich nicht rückgängig machen.
- Wenn Sie zusätzlich Metadaten, JavaScript und Anhänge entfernen wollen, nutzen Sie stattdessen das Werkzeug PDF bereinigen. Es enthält das Reduzieren als eine der Optionen.
- Manche PDFs melden "kein Formular gefunden". Das ist normal, wenn das Dokument nur Annotationen und keine Formularfelder enthält.

## Verwandte Werkzeuge

- [PDF bereinigen](./sanitize-pdf): Formulare reduzieren und zusätzlich Metadaten, Skripte und mehr entfernen
- [PDF rastern](./rasterize-pdf): in eine bildbasierte PDF umwandeln für maximales Reduzieren
- [Schriftart zu Umriss](./font-to-outline): Schriften in Vektorpfade umwandeln
- [PDF verschlüsseln](./protect-pdf): die reduzierte PDF mit einem Passwort sperren
