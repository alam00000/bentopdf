---
title: Text zu PDF
description: Wandeln Sie reine Textdateien oder getippten Text mit eigenen Schriften, Farben und Seitengrößen in PDF um.
---

# Text zu PDF

Wandeln Sie reinen Text in eine formatierte PDF um. Sie können `.txt`-Dateien hochladen oder direkt im integrierten Texteditor tippen. Das Werkzeug unterstützt mehrere Schriften, eigene Textfarben und viele Seitengrößen, von A0 bis A10 sowie US Letter, Legal und Tabloid.

## Unterstützte Formate

| Eingabe             | Endungen                       |
| :------------------ | :----------------------------- |
| Reine Textdateien   | `.txt`                         |
| Direkte Texteingabe | Im Editor tippen oder einfügen |

## So funktioniert es

1. Wählen Sie Ihren Eingabemodus mit dem Schalter oben: **Dateien hochladen** oder **Text eingeben**.
2. Ziehen Sie beim Hochladen eine oder mehrere `.txt`-Dateien per Drag & Drop hinein oder klicken Sie zur Auswahl. Geben Sie beim Tippen Ihren Text direkt in das Textfeld ein.
3. Konfigurieren Sie die Formatierungsoptionen: Schriftfamilie, Schriftgröße, Textfarbe und Seitengröße.
4. Klicken Sie auf **PDF erstellen**. Die Ausgabe wird als `text_to_pdf.pdf` heruntergeladen.

Beim Hochladen mehrerer Dateien werden ihre Inhalte mit Leerzeilen dazwischen aneinandergehängt.

## Optionen

| Option             | Werte                                                                            | Standard          |
| :----------------- | :------------------------------------------------------------------------------- | :---------------- |
| **Schriftfamilie** | Helvetica (serifenlos), Tiro (Serif), Courier (Festbreite), Times (Serif)        | Helvetica         |
| **Schriftgröße**   | 6 bis 72 pt                                                                      | 12                |
| **Textfarbe**      | Beliebige Farbe über die Farbauswahl                                             | Schwarz (#000000) |
| **Seitengröße**    | ISO A0 bis A10, B0 bis B10, C0 bis C10, US Letter, Legal, Tabloid, Ledger, 11x17 | A4                |

RTL-Sprachen (Arabisch, Hebräisch, Persisch, Urdu) werden automatisch erkannt. Wird RTL-Text gefunden, wechseln Textrichtung und Ausrichtung entsprechend.

## Anwendungsfälle

- Code-Schnipsel oder Logdateien mit der Schrift Courier in eine druckbare PDF umwandeln
- Aus spontan getippten Besprechungsnotizen schnell eine PDF erstellen
- Ein Manuskript als reinen Text für die Einreichung mit bestimmter Schrift und Seitengröße formatieren
- Eine PDF-Version einer README oder eines Changelogs für die Offline-Verteilung erstellen

## Tipps

- Nutzen Sie den Modus **Text eingeben**, wenn Sie Inhalte aus der Zwischenablage schnell umwandeln wollen, ohne sie zuerst als Datei zu speichern.
- Courier (Festbreite) ist die beste Schriftwahl für Code, Logs oder alle Inhalte, bei denen die Spaltenausrichtung wichtig ist.
- Die Seitenränder sind auf allen Seiten fest auf 72 Punkt (2,54 cm) eingestellt.

## Verwandte Werkzeuge

- [Markdown zu PDF](./markdown-to-pdf)
- [CSV zu PDF](./csv-to-pdf)
- [Word zu PDF](./word-to-pdf)
