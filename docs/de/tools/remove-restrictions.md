---
title: Beschränkungen entfernen
description: Entfernen Sie Passwortschutz, Druckbeschränkungen, Bearbeitungssperren und Kopierbeschränkungen aus PDF-Dateien.
---

# Beschränkungen entfernen

PDFs können zwei Arten von Passwörtern enthalten: ein Benutzerpasswort (zum Öffnen der Datei nötig) und ein Besitzerpasswort (steuert, was Sie mit der Datei tun dürfen). Dieses Werkzeug entfernt beide samt aller zugehörigen Beschränkungen: Druck-, Bearbeitungs-, Kopier- und Annotationssperren.

## So funktioniert es

1. Laden Sie eine PDF-Datei hoch.
2. Wenn die PDF ein Besitzerpasswort hat, geben Sie es im Feld **Besitzerpasswort** ein. Lassen Sie das Feld leer, wenn die PDF nur Nutzungsbeschränkungen ohne Passwort hat.
3. Klicken Sie auf **Beschränkungen entfernen**.
4. Laden Sie die unbeschränkte PDF herunter.

Das Werkzeug nutzt die QPDF-Flags `--decrypt` und `--remove-restrictions`, um eine saubere, unbeschränkte Kopie zu erzeugen.

## Was entfernt wird

- Passwortschutz (Benutzer- und Besitzerpasswort)
- Druckbeschränkungen
- Bearbeitungsbeschränkungen
- Beschränkungen beim Kopieren von Text und Bildern
- Beschränkungen für Annotationen und Kommentare
- Alle anderen in der PDF kodierten Sicherheitsbeschränkungen

## Anwendungsfälle

- Eine PDF entsperren, die Ihnen gehört, deren Passwort Sie aber vor Jahren festgelegt haben
- Druckbeschränkungen aus einem Dokument entfernen, auf das Sie rechtmäßig Zugriff haben
- Kopieren und Einfügen in Referenzmaterial für Notizen ermöglichen
- PDFs für Barrierefreiheitswerkzeuge vorbereiten, die mit eingeschränkten Dokumenten nicht umgehen können

## Tipps

- Wenn ein Besitzerpasswort gesetzt ist, müssen Sie es kennen. Dieses Werkzeug knackt oder errät keine Passwörter.
- Wenn die Datei verschlüsselt bleiben soll und Sie nur bestimmte Berechtigungen ändern wollen, nutzen Sie stattdessen das Werkzeug Berechtigungen ändern.
- Die Ausgabedatei ist komplett unverschlüsselt: Jeder, der sie erhält, kann sie frei öffnen.

## Verwandte Werkzeuge

- [PDF entschlüsseln](./unlock-pdf): eine PDF entsperren, wenn Sie das Benutzerpasswort kennen
- [PDF verschlüsseln](./protect-pdf): die Verschlüsselung mit neuen Einstellungen erneut anwenden
- [Berechtigungen ändern](./change-permissions): gezielt ändern, welche Aktionen erlaubt sind
