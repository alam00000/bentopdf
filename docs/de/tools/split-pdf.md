---
title: PDF teilen
description: Teilen Sie eine PDF in kleinere Dateien nach Seitenbereich, visueller Auswahl, Lesezeichen, geraden/ungeraden Seiten oder festen Intervallen.
---

# PDF teilen

Zerlege eine PDF mit einem von sechs Teilungsmodi in kleinere Dokumente. Von einfachen Seitenbereichen bis zur Teilung nach Lesezeichen deckt dieses Werkzeug jedes Szenario zum Aufteilen eines Dokuments ab.

## So funktioniert es

1. Laden Sie eine einzelne PDF-Datei hoch.
2. Wählen Sie im Dropdown einen Teilungsmodus.
3. Konfigurieren Sie die modusspezifischen Optionen (Seitenbereiche, Auswahlen usw.).
4. Klicken Sie auf die Schaltfläche zum Verarbeiten.
5. Das Ergebnis wird je nach Modus und Einstellungen als einzelne PDF oder als ZIP-Archiv heruntergeladen.

## Teilungsmodi

| Modus                 | Beschreibung                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bereich**           | Gib Seitenbereiche wie `1-3, 5, 8-10` ein. Mehrere Bereiche ergeben getrennte PDFs in einem ZIP. Ein einzelner Bereich ergibt eine PDF.            |
| **Visuelle Auswahl**  | Blättern Sie durch Seitenvorschauen und klicken Sie, um die gewünschten Seiten auszuwählen. Ausgewählte Seiten werden in eine neue PDF extrahiert. |
| **Gerade / Ungerade** | Extrahiere nur gerade oder nur ungerade Seiten.                                                                                                    |
| **Alle Seiten**       | Teile jede Seite in eine eigene PDF-Datei auf, die als ZIP heruntergeladen wird.                                                                   |
| **Lesezeichen**       | Teile an Lesezeichengrenzen. Wählen Sie die Lesezeichenebene, um zu steuern, wo geteilt wird.                                                      |
| **Alle N Seiten**     | Teile in Abschnitte von je N Seiten (z. B. alle 5 Seiten). Der letzte Abschnitt kann weniger Seiten haben.                                         |

## Funktionen

- Sechs verschiedene Teilungsmodi, die praktisch jeden Anwendungsfall abdecken
- Visuelle Seitenauswahl mit bei Bedarf geladenen Vorschaubildern
- Teilung nach Lesezeichen mit Ebenenfilter
- ZIP-Ausgabe als Option für die Modi Bereich und Visuell
- Verarbeitet Seitenbereiche mit gemischter Syntax (`1-3, 5, 8-10`)
- Warnung, wenn die Teilung nach N Seiten ungleich große Abschnitte ergibt

## Anwendungsfälle

- Ein bestimmtes Kapitel oder einen Abschnitt aus einem großen Dokument extrahieren
- Ungerade und gerade Seiten für Abläufe beim doppelseitigen Drucken trennen
- Ein Buch als PDF an den Lesezeichengrenzen in einzelne Kapiteldateien zerlegen
- Bestimmte Seiten (wie die Unterschriftsseite) aus einem Vertrag herauslösen
- Einen zusammengestellten Bericht für die Verteilung in Dateien pro Abschnitt teilen

## Tipps

- Mehrere durch Kommas getrennte Seitenbereiche (z. B. `1-5, 10-15, 20-25`) ergeben getrennte PDFs, eine pro Bereich, gebündelt in einem ZIP.
- Der Modus Lesezeichen setzt voraus, dass die PDF tatsächlich Lesezeichen enthält. Werden keine gefunden, erhalten Sie eine Fehlermeldung.
- Mit dem Kontrollkästchen "Als ZIP herunterladen" in den Modi Bereich und Visuell erhalten Sie einzelne PDFs pro Seite statt einer kombinierten Datei.

## Verwandte Werkzeuge

- [PDF zusammenführen](./merge-pdf)
- [Seiten extrahieren](./extract-pages)
- [Seiten löschen](./delete-pages)
- [PDF-Multitool](./pdf-multi-tool)
