---
title: PDF-Workflow-Builder
description: Erstellen Sie eigene PDF-Verarbeitungspipelines visuell, indem Sie Knoten auf einer Arbeitsfläche verbinden. Verketten Sie Operationen wie Zusammenführen, Komprimieren, Wasserzeichen und Export.
---

# PDF-Workflow-Builder

Mit dem Workflow-Builder verketten Sie mehrere PDF-Operationen zu einer einzigen automatisierten Pipeline. Statt Werkzeuge nacheinander einzeln auszuführen, verbinden Sie einen visuellen Graphen aus Knoten (Eingabe, Verarbeitung, Ausgabe) und führen alles mit einem Klick aus. Ihre Dateien verlassen nie den Browser.

## So funktioniert es

Die Oberfläche besteht aus drei Bereichen: einer **Knoten-Werkzeugkiste** links, der **Arbeitsfläche** in der Mitte und einem **Einstellungsbereich** rechts, der erscheint, wenn Sie einen Knoten auswählen.

1. **Knoten hinzufügen**: Klicken Sie sie in der linken Seitenleiste an oder ziehen Sie sie direkt auf die Arbeitsfläche. Mit der Suchleiste oben in der Werkzeugkiste filtern Sie nach Namen.
2. **Knoten verbinden**: Ziehen Sie von einem Ausgangsanschluss (unten an einem Knoten) zu einem Eingangsanschluss (oben an einem anderen Knoten). Verbindungen verlaufen von oben nach unten.
3. **Einstellungen vornehmen**: Klicken Sie auf einen Knoten, um rechts seinen Einstellungsbereich zu öffnen. Jeder Knotentyp hat eigene Optionen (Seitenbereiche, Qualitätsregler, Passwörter usw.).
4. **Workflow ausführen**: Klicken Sie in der Werkzeugleiste auf **Ausführen**. Die Engine führt die Knoten in topologischer Reihenfolge nacheinander aus. Eine Statusleiste unten zeigt den Fortschritt.
5. **Ergebnisse herunterladen**: Der abschließende Download-Knoten speichert das fertige PDF (oder ein ZIP, wenn mehrere Dateien entstehen).

## Knotenkategorien

Die Knoten sind in sechs Kategorien gegliedert, die auf der Arbeitsfläche farblich gekennzeichnet sind:

- **Eingabe** (blau): PDF-Eingabe, Bildeingabe, Word/Excel/PowerPoint zu PDF und über 15 weitere Formatkonverter, die Dateien in die Pipeline einspeisen.
- **Bearbeiten & Kommentieren** (indigo): Zuschneiden, Graustufen, Farben invertieren, Wasserzeichen, Seitenzahlen, Kopf- & Fußzeile, Scanner-Effekt, Farben anpassen, Hintergrundfarbe, Leere Seiten entfernen, Anmerkungen entfernen.
- **Organisieren & Verwalten** (violett): Zusammenführen, Teilen, Seiten extrahieren, Drehen, Seiten löschen, Umkehren, Leere Seite hinzufügen, Seiten aufteilen, N-Up, Seitengröße reparieren, Zu einer Seite kombinieren, Broschüre, Posterize, Metadaten bearbeiten, Inhaltsverzeichnis, OCR.
- **Optimieren & Reparieren** (bernstein): Komprimieren, Rastern, Linearisieren, Begradigen, PDF zu PDF/A, Schrift in Pfade umwandeln, Reparieren.
- **PDF schützen** (rosé): Verschlüsseln, Entschlüsseln, Bereinigen, Reduzieren, Digital signieren, Schwärzen.
- **Ausgabe** (türkis): Download (erkennt automatisch einzelnes PDF oder ZIP), PDF zu Bildern, PDF zu Text, PDF zu DOCX, PDF zu XLSX, PDF zu CSV, PDF zu SVG, PDF zu Markdown, Bilder extrahieren.

## Workflows speichern und laden

Die Werkzeugleiste bietet vier Möglichkeiten zur Speicherung:

- **Speichern**: legt den aktuellen Workflow als benannte Vorlage im lokalen Speicher Ihres Browsers ab. Sie können mehrere Vorlagen speichern.
- **Laden**: öffnet ein Fenster mit allen gespeicherten Vorlagen. Klicken Sie auf Laden, um eine wiederherzustellen, oder löschen Sie Vorlagen, die Sie nicht mehr brauchen.
- **Exportieren**: lädt den Workflow als `.json`-Datei herunter, damit Sie ihn teilen oder sichern können.
- **Importieren**: lädt eine `.json`-Workflow-Datei von der Festplatte und stellt alle Knoten, Positionen und Verbindungen wieder her.

Vorlagen bleiben im lokalen Speicher über Sitzungen hinweg erhalten. Exportierte JSON-Dateien sind zwischen Browsern und Geräten übertragbar.

## Ausführungsmodell

Die Engine erstellt aus Ihren Verbindungen einen Abhängigkeitsgraphen und führt die Knoten in topologischer Reihenfolge aus. Schlägt ein Knoten fehl, wird die Ausführung angehalten und der fehlerhafte Knoten rot markiert. Einige Regeln, die Sie beachten sollten:

- Jeder Workflow braucht mindestens einen **Eingabe**-Knoten und einen **Ausgabe**-Knoten.
- Die Engine erkennt zirkuläre Abhängigkeiten und blockiert die Ausführung mit einer Fehlermeldung.
- Der Knoten **Verschlüsseln** muss der letzte Verarbeitungsschritt vor dem Ausgabeknoten sein. Platzieren Sie ihn früher, erscheint eine Validierungswarnung, weil nachfolgende Knoten nicht mit verschlüsselten Daten arbeiten können.
- Passwortgeschützte PDFs fragen während der Ausführung nach einem Passwort.
- Eingaben mit mehreren PDFs werden unterstützt: Der Zusammenführen-Knoten kann sie vereinen, oder Knoten für die Stapelverarbeitung verarbeiten jedes PDF einzeln.

## Anschlusstypen

Verbindungen nutzen typisierte Anschlüsse, um ungültige Verdrahtung zu verhindern:

- **PDF** (indigo): ein einzelnes PDF-Dokument.
- **MultiPDF** (bernstein): mehrere gebündelte PDF-Dokumente.
- **Image** (grün): ein Bild-Blob.

## Optionen

Jeder Knoten hat eine eigene Konfiguration, erreichbar über den rechten Einstellungsbereich. Häufige Muster sind:

- **Seitenbereiche** bei den Knoten Teilen, Seiten extrahieren, Seiten löschen
- **Qualitätsregler** bei Ausgabeknoten für Bildumwandlung
- **Passwortfelder** bei den Knoten Verschlüsseln und Entschlüsseln
- **Texteingaben** für Wasserzeichen, Kopf- & Fußzeile, Metadaten bearbeiten
- **Drehwinkel** beim Knoten Drehen
- **Komprimierungsstufe** beim Knoten Komprimieren
- **OCR-Sprachauswahl** beim OCR-Knoten

## Anwendungsfälle

- **Rechnungsverarbeitungs-Pipeline**: PDF-Eingabe -> OCR -> Tabellen extrahieren -> Download als CSV.
- **Berichte vereinheitlichen**: Word zu PDF -> Seitengröße reparieren -> Seitenzahlen hinzufügen -> Wasserzeichen -> Komprimieren -> Download.
- **Archivierung vorbereiten**: PDF-Eingabe -> Reparieren -> Reduzieren -> Bereinigen -> PDF zu PDF/A -> Download.
- **Bilder im Stapel extrahieren**: PDF-Eingabe (mehrere Dateien) -> Bilder extrahieren -> ZIP herunterladen.
- **Druckfertige Broschüren**: PDF-Eingabe -> Broschüre -> Zuschneiden -> Komprimieren -> Download.
- **Sichere Weitergabe**: PDF-Eingabe -> Schwärzen -> Anmerkungen entfernen -> Verschlüsseln -> Download.

## Tipps

- Nutzen Sie **Entf** oder **Rücktaste**, um den ausgewählten Knoten von der Arbeitsfläche zu entfernen.
- Klicken Sie auf die Schaltfläche **X** in der Statusleiste eines Knotens, um ihn direkt zu löschen.
- Verschieben Sie die Arbeitsfläche, indem Sie auf leeren Bereich klicken und ziehen. Der Cursor wird dabei zu einem Greifsymbol.
- Auf Mobilgeräten schalten Sie die Knoten-Werkzeugkiste mit der Schaltfläche **+** in der Werkzeugleiste um.
- Erzeugt Ihr Workflow mehrere Ausgabedateien, bündelt der Download-Knoten sie automatisch in einem ZIP.
- Fangen Sie einfach an: Bauen und testen Sie eine Pipeline mit zwei Knoten, bevor Sie sie komplexer machen.

## Verwandte Werkzeuge

- [PDF zu Text](./pdf-to-text)
- [PDF zu Excel](./pdf-to-excel)
- [Bilder extrahieren](./extract-images)
- [PDF zu Markdown](./pdf-to-markdown)
