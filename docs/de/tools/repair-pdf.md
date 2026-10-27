---
title: PDF reparieren
description: Stellen Sie Daten aus beschädigten oder defekten PDF-Dateien mit der Reparatur-Engine von QPDF wieder her. Unterstützt Stapelverarbeitung.
---

# PDF reparieren

Wenn sich eine PDF nicht öffnen lässt, verzerrte Inhalte zeigt oder in Ihrem Viewer Fehler auslöst, versucht dieses Werkzeug, ihre interne Struktur neu aufzubauen. Es nutzt die Reparatur-Engine von QPDF, die Daten aus vielen Arten von Beschädigungen wiederherstellen kann: defekte Querverweistabellen, abgeschnittene Streams, ungültige Objektverweise und mehr.

## So funktioniert es

1. Laden Sie eine oder mehrere beschädigte PDF-Dateien hoch.
2. Klicken Sie auf **PDF reparieren**.
3. Eine einzelne reparierte Datei wird direkt heruntergeladen. Bei mehreren Dateien entsteht ein ZIP-Archiv.

Das Werkzeug schickt jede Datei mit dem Flag `--decrypt` durch QPDF. Dadurch muss QPDF die gesamte PDF-Struktur lesen und neu schreiben und behebt dabei behebbare Probleme.

## Funktionen

- Stapelreparatur mehrerer PDFs in einem Vorgang
- Automatische Erkennung von behebbaren und nicht behebbaren Dateien
- Erfolgs- und Fehlerbericht pro Datei bei der Verarbeitung mehrerer Dateien
- Nutzt QPDF (WebAssembly), eine bewährte Bibliothek zur PDF-Transformation

## Was repariert werden kann

- Defekte oder fehlende Querverweistabellen
- Abgeschnittene Dateienden durch unvollständige Downloads
- Ungültige Objektnummerierung und Stream-Längen
- Kleinere Strukturfehler fehlerhafter PDF-Generatoren
- Verschlüsselungsartefakte nach fehlgeschlagenen Entschlüsselungsversuchen

## Was nicht repariert werden kann

- Stark abgeschnittene Dateien, in denen der Großteil der Inhaltsdaten fehlt
- PDFs, die mit einem Passwort verschlüsselt sind, das Sie nicht haben
- Dateien, die in Wirklichkeit keine PDFs sind (falsche Dateiendung)
- Bildbeschädigungen innerhalb der PDF (die Struktur wird repariert, Pixeldaten werden aber nicht neu erzeugt)

## Anwendungsfälle

- Eine PDF nach einem fehlgeschlagenen E-Mail-Download wiederherstellen
- Dateien öffnen, die von älteren oder nicht standardkonformen PDF-Generatoren erzeugt wurden
- PDFs reparieren, die in einem Viewer funktionieren, in einem anderen aber nicht
- Beschädigte Archivdokumente für die Langzeitspeicherung vorbereiten

## Tipps

- Wenn die Reparatur fehlschlägt, öffnen Sie die Datei zuerst in einem Browser. Browser haben eine eigene Wiederherstellungslogik und zeigen eventuell genug Inhalt an, um die Datei erneut zu speichern.
- Bei verschlüsselten PDFs, deren Reparatur fehlschlägt, versuchen Sie zuerst PDF entschlüsseln und reparieren Sie dann die entschlüsselte Ausgabe.

## Verwandte Werkzeuge

- [PDF komprimieren](./compress-pdf): die Struktur der reparierten PDF weiter bereinigen
- [PDF linearisieren](./linearize-pdf): die reparierte Datei für die Auslieferung im Web optimieren
- [PDF reduzieren](./flatten-pdf): Formulare reduzieren, die möglicherweise beschädigt wurden
