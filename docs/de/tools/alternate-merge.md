---
title: Seiten abwechselnd mischen
description: Führen Sie PDFs zusammen, indem die Seiten jeder Datei abwechselnd verschachtelt werden, mit Beibehaltung der Lesezeichen.
---

# Seiten abwechselnd mischen

Verschachtelen Sie die Seiten mehrerer PDF-Dateien so, dass sich die Seiten der Dokumente abwechseln. Dieses Werkzeug brauchen Sie, wenn ein normales Zusammenführen die Dateien nur hintereinanderhängen würde, Sie aber Seite 1 von Datei A, dann Seite 1 von Datei B, dann Seite 2 von Datei A und so weiter brauchen.

## So funktioniert es

1. Laden Sie mindestens zwei PDF-Dateien über die Ablagefläche hoch.
2. Das Werkzeug zeigt jede Datei mit Seitenzahl und Dateigröße an.
3. Ziehen Sie an den Griffen, um die Reihenfolge festzulegen, welche Datei in der Verschachtelung zuerst kommt.
4. Klicken Sie auf **Seiten mischen**, um die verschachtelte Ausgabe zu erzeugen.
5. Das Ergebnis wird als `alternated-mixed.pdf` heruntergeladen.

## Funktionen

- Verschachtelt Seiten über beliebig viele PDFs (mindestens zwei)
- Dateien per Drag-and-drop neu anordnen, um die Verschachtelungspriorität zu steuern
- Behält Lesezeichen der Quelldokumente bei
- Zeigt Seitenzahl und Dateigröße jeder hochgeladenen Datei an
- Verarbeitung über einen eigenen Web Worker für eine reaktionsfähige Oberfläche

## Anwendungsfälle

- Doppelseitige Scans wieder zusammensetzen, bei denen ungerade und gerade Seiten getrennt gescannt wurden
- Aufgabenblätter mit Lösungsschlüsseln kombinieren, sodass auf jede Frage direkt die Antwort folgt
- Zweisprachige Dokumente Seite für Seite zusammenführen (z. B. Englisch auf einer Seite, Übersetzung auf der nächsten)
- Vorder- und Rückseiten-Scans eines Einzelseiten-Scanners verschachteln

## Tipps

- Wenn Ihre Quell-PDFs unterschiedlich viele Seiten haben, gehen die Seiten des kürzeren Dokuments zuerst aus, und die übrigen Seiten des längeren Dokuments erscheinen am Ende.
- Die Dateireihenfolge ist wichtig: Die erste Datei in der Liste liefert die erste Seite der Ausgabe. Ziehen Sie die Dateien bei Bedarf um.

## Verwandte Werkzeuge

- [PDF zusammenführen](./merge-pdf)
- [Organisieren & Duplizieren](./organize-pdf)
- [PDF teilen](./split-pdf)
