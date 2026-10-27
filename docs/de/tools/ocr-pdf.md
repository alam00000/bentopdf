---
title: OCR PDF
description: Machen Sie gescannte PDFs durchsuchbar und kopierbar mit Tesseract OCR, mit Unterstützung mehrerer Sprachen und Zeichenfilterung.
---

# OCR PDF

Verwandeln Sie gescannte Dokumente in durchsuchbare, kopierbare PDFs. Das Werkzeug nutzt Tesseract OCR, um Text in Bildern zu erkennen, und legt eine unsichtbare Textebene über die Originalseiten. Das Aussehen bleibt erhalten, der Inhalt wird vollständig durchsuchbar.

## So funktioniert es

1. Laden Sie eine gescannte oder bildbasierte PDF-Datei hoch.
2. Wählen Sie aus der durchsuchbaren Sprachliste eine oder mehrere Sprachen, die im Dokument vorkommen.
3. Passen Sie optional erweiterte Einstellungen an (Auflösung, Binarisierung, Whitelist).
4. Klicken Sie auf **OCR starten** und verfolgen Sie den Fortschritt in der Echtzeit-Fortschrittsanzeige.
5. Prüfen Sie nach Abschluss den extrahierten Text und laden Sie dann die durchsuchbare PDF oder eine einfache `.txt`-Datei herunter.

## Funktionen

- OCR in mehreren Sprachen mit durchsuchbarer Sprachauswahl
- Die unsichtbare Textebene erhält das ursprüngliche Aussehen des Dokuments
- Echtzeit-Fortschrittsanzeige und Protokollausgabe während der Verarbeitung
- Ergebnisse als durchsuchbare PDF oder als einfache Textdatei herunterladen
- Extrahierten Text direkt in die Zwischenablage kopieren
- Drei Auflösungsstufen, um Geschwindigkeit und Genauigkeit auszubalancieren

## Optionen

| Einstellung                          | Werte                                                                                                       | Standard | Zweck                                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| **Auflösung**                        | Standard (192 DPI), Hoch (288 DPI), Ultra (384 DPI)                                                         | Hoch     | Höhere Auflösung verbessert die Genauigkeit bei kleinem Text, dauert aber länger               |
| **Bild binarisieren**                | Ein / Aus                                                                                                   | Aus      | Verstärkt den Kontrast bei sauberen Scans durch Umwandlung in Schwarz-Weiß                     |
| **Zeichen-Whitelist-Voreinstellung** | Keine, Alphanumerisch, Zahlen + Währung, Nur Buchstaben, Nur Zahlen, Rechnung, Formulare, Benutzerdefiniert | Keine    | Beschränkt die erkannten Zeichen, um die Genauigkeit für bestimmte Dokumenttypen zu verbessern |
| **Zeichen-Whitelist**                | Freitext                                                                                                    | Leer     | Manueller Zeichensatz, wenn die Voreinstellung auf Benutzerdefiniert steht                     |

## Anwendungsfälle

- Gescannte Verträge und Rechnungen durchsuchbar machen, damit Sie sie mit Strg+F durchsuchen können
- Text aus fotografierten Dokumenten oder alten Papierunterlagen extrahieren
- Belege mit der Voreinstellung Rechnung verarbeiten, um Beträge und Daten genau zu erfassen
- Barrierefreie PDFs aus reinen Bild-Scans für Compliance-Anforderungen erstellen
- Textinhalte aus gescannten Büchern oder Handbüchern im Stapel extrahieren

## Tipps

- Wählen Sie mehrere Sprachen, wenn Ihr Dokument gemischtsprachige Inhalte enthält (z. B. englische Überschriften mit japanischem Fließtext).
- Nutzen Sie die Binarisierung bei Dokumenten mit verblasstem oder kontrastarmem Text. Sie kann die Erkennungsgenauigkeit deutlich verbessern.
- Die Whitelist-Voreinstellungen Rechnung und Formulare verringern Fehlerkennungen bei strukturierten Dokumenten stark, indem sie irrelevante Zeichenformen ignorieren.

## Verwandte Werkzeuge

- [PDF-Tabellen extrahieren](./extract-tables)
- [PDF zusammenführen](./merge-pdf)
- [PDF komprimieren](./compress-pdf)
