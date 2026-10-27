---
title: Duplex-Zusammenführung
description: Ordnen Sie Duplex-Scan-PDFs, bei denen Vorder- und Rückseiten in getrennten Blöcken liegen, in die richtige Vorder-/Rückseiten-Reihenfolge.
---

# Duplex-Zusammenführung

Duplex zusammenführen ist für ADF-Scan-Abläufe gedacht, bei denen eine PDF zwei Seitenblöcke enthält:

- zuerst alle Vorderseiten
- danach alle Rückseiten

Statt manuell zu teilen und neu zusammenzusetzen, verschränkt dieses Werkzeug die beiden Blöcke in natürlicher Lesereihenfolge: Vorderseite 1, Rückseite 1, Vorderseite 2, Rückseite 2 und so weiter.

## So funktioniert es

1. Laden Sie eine einzelne PDF hoch, die durch Stapelscannen im Duplexverfahren entstanden ist.
2. Legen Sie den Teilungspunkt fest, an dem der Vorderseitenblock endet.
3. Wählen Sie die Behandlung des Rückseitenblocks:
   - **Rückseitenblock umkehren** (üblich, wenn der Stapel vor dem Scannen der Rückseiten gewendet wird)
   - **Rückseitenblock unverändert lassen**
4. Klicken Sie auf **PDF zusammenführen**, um das neu geordnete Ergebnis herunterzuladen.

## Optionen

- **Teilung automatisch erkennen (Hälfte)**: setzt den Teilungspunkt auf `ceil(totalPages / 2)`.
- **Warnung bei ungerader Seitenzahl**: warnt, wenn die Gesamtseitenzahl ungerade ist (oft ein Scanfehler).
- **Bestätigung bei ungleichen Blöcken**: fragt nach, wenn sich die Größen von Vorder- und Rückseitenblock unterscheiden.
- **Gruppierter Export**: teilt die zusammengeführte Ausgabe anhand der ursprünglichen Seitenzahl der Dokumente in einzelne PDFs und lädt sie als ZIP herunter.

## Ausgabeverhalten

- **Standard**: eine Ausgabe-PDF (eine Eingabe-PDF ergibt eine Ausgabe-PDF).
- **Gruppierter Modus**: Die Ausgabe wird nach Ihrem Wert für Seiten pro Dokument aufgeteilt. Entstehen mehrere Teile, werden sie als ein ZIP heruntergeladen, andernfalls als einzelne PDF.

Sind die Blöcke ungleich groß, werden zuerst die gepaarten Seiten zusammengeführt, und die übrigen ungepaarten Seiten werden am Ende angehängt.

## Häufige Anwendungsfälle

- Die Reihenfolge wiederherstellen, nachdem ein Stapel doppelseitiger Formulare in zwei Durchgängen gescannt wurde.
- Vorder-/Rückseiten-Pakete aus Bürogeräten rekonstruieren, die zuerst alle Vorderseiten und dann alle Rückseiten ausgeben.
- Archivscans nachbearbeiten, bevor sie in Einzeldokumente geteilt werden.

## Tipps

- Die meisten Duplex-Stapel sollten eine gerade Gesamtseitenzahl haben.
- Wenn die Rückseiten im Ergebnis verkehrt aussehen, wechseln Sie zwischen **Rückseitenblock umkehren** und **Rückseitenblock unverändert lassen**.
- Bei 2-seitigen Originalen (Vorder- und Rückseite) nutzen Sie den gruppierten Export mit `2` Seiten pro Dokument.

## Verwandte Werkzeuge

- [Seiten abwechselnd mischen](./alternate-merge)
- [PDF teilen](./split-pdf)
- [PDF zusammenführen](./merge-pdf)
- [Organisieren & Duplizieren](./organize-pdf)
