---
title: PDF komprimieren
description: Verkleineren Sie PDF-Dateien um bis zu 90 % mit der Hyper-Compress-Engine. Unterstützt Zieldateigrößen, Stapelverarbeitung und eigene Qualitätseinstellungen.
---

# PDF komprimieren

Verkleineren Sie Ihre PDF-Dateien, ohne sie zu beschädigen. PDF komprimieren wird von [Hyper Compress](https://www.bentopdf.com/hyper-compress) angetrieben, der eigenen Komprimierungs-Engine von BentoPDF. Sie komprimiert Bilder neu, erstellt Teilmengen von Schriften und führt sie zusammen und entfernt unnötigen Ballast wie eingebettete Vorschaubilder und private Anwendungsdaten. Die PDF bleibt voll funktionsfähig: Text bleibt auswählbar, Links und Formularfelder funktionieren weiter.

Hyper Compress ist zu WebAssembly kompiliert und wird mit BentoPDF ausgeliefert, sodass die Komprimierung offline und in Air-Gap-Umgebungen ohne zusätzliche Einrichtung funktioniert.

## So funktioniert es

1. Laden Sie eine oder mehrere PDFs hoch, indem Sie auf die Ablagefläche klicken oder Dateien hineinziehen.
2. Wählen Sie eine **Komprimierungsstufe**: Niedrig, Mittel, Hoch oder Verlustfrei.
3. Geben Sie optional eine **Zieldateigröße** ein oder öffnen Sie **Benutzerdefinierte Einstellungen** für feinere Kontrolle, einschließlich **In Graustufen umwandeln**.
4. Klicken Sie auf **PDF komprimieren**. Bei mehreren Dateien erhalten Sie einen einzelnen ZIP-Download.

## Besondere Dokumente

- **Digital signierte PDFs** werden unverändert zurückgegeben, weil jede Änderung die Signatur ungültig machen würde. Aktivieren Sie **Inhaltsschutz überschreiben** unter Benutzerdefinierte Einstellungen, um die Signaturen zu entfernen und die Datei zu komprimieren. Die sichtbare Signatur bleibt auf der Seite, die Datei ist aber nicht mehr signiert.
- **PDF/A-Dateien** verlieren nach der Komprimierung ihre PDF/A-Kennzeichnung, damit die Datei nie eine Konformität behauptet, die sie nicht mehr erfüllt. Aktivieren Sie **PDF/A beibehalten** unter Benutzerdefinierte Einstellungen, um die Konformität der Datei zu erhalten.
- **Passwortgeschützte PDFs** bekommen auf ihrer Dateikarte ein Passwortfeld. Geben Sie dort das Passwort ein, und Hyper Compress öffnet die Datei selbst, ganz ohne separaten Entsperrschritt. Bei zwei oder mehr gesperrten Dateien entsperrt ein gemeinsames Feld alle Dateien, die dasselbe Passwort verwenden. Die komprimierte Kopie hat kein Passwort. Mit [PDF verschlüsseln](./protect-pdf) können Sie wieder eines hinzufügen.
- **Scans ohne Textebene** lassen sich mit **Seiten rastern** unter Benutzerdefinierte Einstellungen weiter verkleinern, wodurch jede Seite durch ein optimiertes Bild ersetzt wird. Bei jedem Dokument mit auswählbarem Text, auch bei per OCR bearbeiteten Scans, wird dies übersprungen, außer **Inhaltsschutz überschreiben** ist aktiviert. Dann werden auch Textseiten zu Bildern, sodass Text nicht mehr auswählbar ist und Links nicht mehr funktionieren.

## Komprimierungsstufen

| Stufe           | Bildqualität       | Max. Auflösung | Am besten für                 |
| --------------- | ------------------ | -------------- | ----------------------------- |
| **Niedrig**     | 80                 | 200 DPI        | Erhalt der visuellen Qualität |
| **Mittel**      | 50                 | 150 DPI        | Alltägliche Dokumente         |
| **Hoch**        | 20                 | 72 DPI         | E-Mail-Anhänge, Web-Uploads   |
| **Verlustfrei** | Bilder unverändert | Unverändert    | Archivkopien                  |

Bei Hoch werden außerdem die 14 Standard-PDF-Schriften sowie ähnliche Schriften wie Arial nicht mehr eingebettet, sofern das sicher ist.

## Zieldateigröße

Geben Sie eine Größe in KB oder MB ein, und Hyper Compress sucht die beste Bildqualität, die noch hineinpasst, ausgehend von der gewählten Stufe. Wenn das Dokument nicht so klein werden kann, erhalten Sie die kleinste mögliche Version und eine entsprechende Meldung. Die eigenen Seiten wie [PDF auf 1 MB komprimieren](https://www.bentopdf.com/compress-pdf-to-1mb) öffnen sich mit bereits eingetragenem Ziel.

## Benutzerdefinierte Einstellungen

Öffnen Sie den Bereich Benutzerdefinierte Einstellungen, um Hyper Compress direkt anzupassen. Wenn Sie eine Komprimierungsstufe wählen, werden diese Werte auf die der Stufe zurückgesetzt, und sobald Sie einen davon ändern, wechselt die Stufe zu Benutzerdefiniert.

- **Inhaltsschutz überschreiben**: Standardmäßig lässt Hyper Compress signierte PDFs unangetastet und rastert keine Seiten mit Text. Wenn Sie dies aktivieren, werden beide Schutzmaßnahmen umgangen. Die Einstellung bleibt aktiv, wenn Sie die Stufe wechseln.

- **Bilder**: Bildqualität, maximale Auflösung, erzwungenes Neuabtasten, Farbreduzierung, Beschneiden unsichtbarer Bildbereiche, Entfernen alternativer Bilder, Vereinfachen von Farbprofilen, JPEG 2000 und verlustfreier Modus
- **Schriften**: Teilmengenbildung, Zusammenführen von Duplikaten und Nicht-Einbetten von Standardschriften und ihren Ähnlichen
- **Inhalt**: Anmerkungen, Formularfelder oder Links verflachen
- **Bereinigung**: Entfernen von Vorschaubildern, Anwendungsdaten, Artikel-Threads, Weberfassungsinformationen, der Strukturhierarchie oder Ausgabeabsichten
- **Rastern**: Seiten durch Bilder ersetzen, für reine Bild-Scans. Wird übersprungen, wenn das Dokument auswählbaren Text enthält
- **Ausgabe**: PDF/A beibehalten und Brotli-Komprimierung für PDF-2.0-Reader, die sie unterstützen

## Anwendungsfälle

- Einen 50-MB-Bericht unter das Limit für E-Mail-Anhänge bringen
- Einen Scan mit einer Zieldateigröße unter das strenge Upload-Limit eines Portals bringen
- Marketing-PDFs für schnellere Downloads auf Websites optimieren
- Große Dokumentensätze archivieren, wenn Speicherkosten eine Rolle spielen
- Den mobilen Datenverbrauch beim Teilen von PDFs über Messenger senken

## Tipps

- Beginnen Sie mit Mittel. Ist das Ergebnis immer noch zu groß, legen Sie eine Zieldateigröße fest oder wechslen Sie zu Hoch.
- Bei einem Scan ohne Textebene aktivieren Sie Seiten rastern unter Benutzerdefinierte Einstellungen.
- In Graustufen umwandeln unter Benutzerdefinierte Einstellungen kann die Dateigröße bei sehr farbigen Dokumenten deutlich senken.

## Verwandte Werkzeuge

- [PDF linearisieren](./linearize-pdf): die komprimierte PDF für schnelles Anzeigen im Web optimieren
- [PDF rastern](./rasterize-pdf): Seiten mit einer bestimmten DPI in Bilder umwandeln, auch Seiten mit Text
- [PDF reparieren](./repair-pdf): eine PDF reparieren, die woanders bei der Komprimierung beschädigt wurde
- [Metadaten entfernen](./remove-metadata): versteckte Daten für mehr Privatsphäre entfernen
