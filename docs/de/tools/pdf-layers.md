---
title: PDF-OCG-Ebenen
description: Zeigen Sie Ebenen (Optional Content Groups, OCG) in einem PDF-Dokument an, schalten Sie sie um, fügen Sie sie hinzu und löschen Sie sie.
---

# PDF-OCG-Ebenen

Verwalten Sie die Optional Content Groups (OCG), im Alltag meist "Ebenen" genannt, in einem PDF. Sie können die Sichtbarkeit von Ebenen umschalten, neue Ebenen hinzufügen (auch verschachtelte untergeordnete Ebenen), Ebenen löschen und das geänderte PDF speichern.

## So funktioniert es

1. Laden Sie eine PDF-Datei hoch.
2. Klicken Sie auf die Schaltfläche zum Verarbeiten, um das Dokument mit der PyMuPDF-Engine zu laden.
3. Das Werkzeug zeigt alle vorhandenen Ebenen mit Sichtbarkeitsstatus, Sperrstatus und Verschachtelungshierarchie.
4. Schalten Sie mit den Kontrollkästchen Ebenen ein oder aus. Gesperrte Ebenen lassen sich nicht umschalten.
5. Fügen Sie neue Ebenen oberster Ebene hinzu, indem Sie einen Namen eingeben und auf die Hinzufügen-Schaltfläche klicken, oder fügen Sie untergeordnete Ebenen unter einer bestehenden übergeordneten hinzu.
6. Löschen Sie Ebenen, die Sie nicht mehr brauchen.
7. Klicken Sie auf **Speichern**, um das geänderte PDF mit Ihren Ebenenänderungen herunterzuladen.

## Funktionen

- Zeigt die Ebenenhierarchie mit passender Einrückung für verschachtelte Ebenen
- Sichtbarkeit von Ebenen ein- oder ausschalten
- Anzeige gesperrter Ebenen verhindert versehentliche Änderungen
- Ebenen oberster Ebene oder untergeordnete Ebenen mit eigenen Namen hinzufügen
- Einzelne Ebenen löschen
- Speichert alle Änderungen in einer neuen PDF-Datei

## Anwendungsfälle

- Die Sichtbarkeit von Markup-Ebenen in Architektur- oder Konstruktionszeichnungen umschalten
- Neue Anmerkungsebenen zu einem Designdokument mit mehreren Ebenen hinzufügen
- Veraltete Ebenen aus einer Vorlage entfernen, bevor sie verteilt wird
- Prüfen, welche Ebenen in einem komplexen PDF von Dritten vorhanden sind

## Tipps

- Hat das PDF keine Ebenen, zeigt das Werkzeug einen leeren Zustand mit der Aufforderung, eine hinzuzufügen. Nicht alle PDFs verwenden OCG-Ebenen, sie sind am häufigsten bei CAD-Exporten und Designdateien.
- Untergeordnete Ebenen werden unter ihrer übergeordneten Ebene eingerückt dargestellt. Sie können Ebenen beliebig tief verschachteln.
- Gesperrte Ebenen werden mit einem Schloss-Symbol angezeigt, ihre Kontrollkästchen sind deaktiviert. Diese Sperren setzt der Ersteller des PDFs.

## Verwandte Werkzeuge

- [Metadaten anzeigen](./view-metadata)
- [Metadaten bearbeiten](./edit-metadata)
- [Duplizieren & Organisieren](./organize-pdf)
