---
title: E-Mail zu PDF
description: Wandeln Sie EML- und MSG-E-Mail-Dateien in Ihrem Browser in PDF um. Behält Kopfzeilen, Nachrichtentext und Anhangsliste bei.
---

# E-Mail zu PDF

Wandeln Sie gespeicherte E-Mail-Dateien in saubere, druckbare PDFs um. Das Werkzeug parst EML- und MSG-Dateien, liest die gesamte Nachricht aus (Kopfzeilen, Nachrichtentext und Anhang-Metadaten) und stellt alles in einer strukturierten PDF dar. Praktisch für rechtliche Beweissicherung, Aufbewahrung oder zum Drucken einer wichtigen E-Mail.

## Unterstützte Formate

| Format | Erweiterung | Hinweise                                                                   |
| :----- | :---------- | :------------------------------------------------------------------------- |
| EML    | `.eml`      | Standard-MIME-E-Mail-Format (aus den meisten E-Mail-Programmen exportiert) |
| MSG    | `.msg`      | Proprietäres Format von Microsoft Outlook                                  |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie Ihre EML- oder MSG-Dateien hinein. Sie können beide Formate in einem Stapel mischen.
2. Prüfen Sie die Dateiliste. Entfernen Sie unerwünschte Einträge mit dem Papierkorb-Symbol oder klicken Sie auf **Weitere Dateien hinzufügen**, um mehr E-Mails aufzunehmen.
3. Konfigurieren Sie die Umwandlungsoptionen (siehe unten).
4. Klicken Sie auf **In PDF umwandeln**. Das Werkzeug parst jede E-Mail, stellt den Inhalt als formatiertes HTML dar und wandelt ihn über die PyMuPDF-Engine in PDF um.
5. Eine einzelne E-Mail wird direkt als PDF heruntergeladen. Mehrere E-Mails werden in `emails-converted.zip` verpackt.

## Optionen

| Option                        | Standard | Beschreibung                                                                                             |
| :---------------------------- | :------- | :------------------------------------------------------------------------------------------------------- |
| **Seitengröße**               | A4       | Wählen Sie zwischen den Seitenmaßen A4, Letter oder Legal.                                               |
| **CC und BCC einschließen**   | An       | Wenn aktiviert, erscheinen die CC- und BCC-Empfängerlisten im Kopfbereich der E-Mail in der PDF.         |
| **Anhangsliste einschließen** | An       | Wenn aktiviert, erscheint in der PDF eine Liste der Dateianhänge der E-Mail (mit Dateinamen und Größen). |

## Anwendungsfälle

- Wichtige Geschäftskorrespondenz für Compliance oder Prüfungen als PDF archivieren
- E-Mail-Verläufe für Gerichtsverfahren oder Auskunftsersuchen drucken
- Einen dauerhaften Nachweis von Bestellbestätigungen, Belegen oder per E-Mail erhaltenen Verträgen anlegen
- Outlook-MSG-Dateien in einem Format sichern, für dessen Lesen Outlook nicht nötig ist
- Kundensupport-Vorgänge aus exportierten EML-Dateien dokumentieren

## Tipps

- Sowohl EML (von Thunderbird, Apple Mail und den meisten E-Mail-Programmen verwendet) als auch Outlook-MSG-Dateien werden unterstützt. Exportieren Sie E-Mails aus Ihrem E-Mail-Programm und ziehen Sie sie direkt in das Werkzeug.
- HTML-formatierte E-Mails behalten ihre Formatierung in der PDF. Reine Text-E-Mails werden mit sauberer, gut lesbarer Formatierung dargestellt.
- Die Anhangsliste zeigt Dateinamen und Größen, bettet die eigentlichen Anhangsdateien aber nicht in die PDF ein.

## Verwandte Werkzeuge

- [XML zu PDF](./xml-to-pdf)
- [XPS zu PDF](./xps-to-pdf)
