---
title: XPS zu PDF
description: Konvertieren Sie XPS- und OXPS-Dokumente in Ihrem Browser in das PDF-Format. Kein Upload, keine Anmeldung, vollständig privat.
---

# XPS zu PDF

Konvertieren Sie Microsoft-XPS- und OXPS-Dokumente in Standard-PDF-Dateien. XPS (XML Paper Specification) war Microsofts Antwort auf PDF, doch die Unterstützung dafür ist auf vielen Plattformen geschwunden. Dieses Tool macht solche Dokumente wieder universell lesbar.

## Unterstützte Formate

| Format | Erweiterung | Hinweise                             |
| :----- | :---------- | :----------------------------------- |
| XPS    | `.xps`      | Ursprüngliches Microsoft-XPS-Format  |
| OXPS   | `.oxps`     | Open XPS, die Variante nach ECMA-388 |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie Ihre XPS-/OXPS-Dateien per Drag-and-drop hinein. Sie können mehrere Dateien gleichzeitig auswählen.
2. Prüfen Sie die Dateiliste. Entfernen Sie einzelne Dateien mit dem Papierkorb-Symbol oder klicken Sie auf **Weitere Dateien hinzufügen**, um zusätzliche Dokumente anzuhängen.
3. Klicken Sie auf **In PDF konvertieren**. Die PyMuPDF-Engine verarbeitet jedes Dokument lokal in Ihrem Browser.
4. Eine einzelne Datei wird direkt als PDF heruntergeladen. Mehrere Dateien werden in einem ZIP-Archiv mit dem Namen `xps-converted.zip` gebündelt.

## Optionen

Dieses Tool führt eine direkte Formatkonvertierung ohne zusätzliche Konfiguration durch. Die Ausgabe behält Seitenabmessungen, Vektorgrafiken, Schriften und Bilder der XPS-Quelle bei.

## Anwendungsfälle

- XPS-Dateien öffnen, die Sie von älteren Windows-Systemen erhalten haben, auf denen der XPS-Druckertreiber voreingestellt war
- OXPS-Dokumente aus Windows 10/11 für die Weitergabe an macOS- oder Linux-Nutzer konvertieren
- Alte XPS-Dateien in einem weiter verbreiteten Format archivieren
- XPS-basierte behördliche oder geschäftliche Dokumente für externe Empfänger zugänglich machen

## Tipps

- Die Endungen `.xps` und `.oxps` werden automatisch erkannt, sodass Sie beide im selben Stapel mischen können.
- Wurde die ursprüngliche XPS-Datei mit einem hochauflösenden Druckertreiber erstellt, behält die resultierende PDF diese Qualität. Es findet keine Neuberechnung der Auflösung statt.

## Verwandte Tools

- [Word zu PDF](./word-to-pdf)
- [XML zu PDF](./xml-to-pdf)
