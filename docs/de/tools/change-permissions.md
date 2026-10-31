---
title: Berechtigungen ändern
description: Legen Sie PDF-Nutzungsberechtigungen für Drucken, Kopieren, Bearbeiten und Kommentieren fest oder änderen Sie sie. Verwendet 256-Bit-AES-Verschlüsselung.
---

# Berechtigungen ändern

Legen Sie genau fest, was Empfänger mit Ihrer PDF tun dürfen. Anders als einfache Verschlüsselung, die die Datei nur hinter einem Passwort sperrt, können Sie hier Drucken, Kopieren, Bearbeiten, Kommentieren, Formularausfüllen, Dokumentenzusammenstellung und Seitenextraktion gezielt erlauben oder verbieten. Alles wird durch 256-Bit-AES-Verschlüsselung durchgesetzt.

## So funktioniert es

1. Laden Sie eine PDF-Datei hoch.
2. Ist die PDF bereits verschlüsselt, geben Sie das **Aktuelle Passwort** ein.
3. Legen Sie ein **Neues Benutzerpasswort** (zum Öffnen erforderlich) und/oder ein **Neues Besitzerpasswort** (steuert die Berechtigungen) fest.
4. Schalten Sie einzelne Berechtigungen über die Kontrollkästchen ein oder aus.
5. Klicken Sie auf **Berechtigungen ändern**.
6. Laden Sie die aktualisierte PDF herunter.

Wenn Sie beide Felder für neue Passwörter leer lassen, entschlüsselt das Werkzeug die PDF vollständig und entfernt alle Verschlüsselungen und Beschränkungen.

## Berechtigungseinstellungen

| Berechtigung                          | Was sie steuert                                                   |
| ------------------------------------- | ----------------------------------------------------------------- |
| **Drucken erlauben**                  | Ob das Dokument gedruckt werden kann                              |
| **Kopieren erlauben**                 | Ob Text und Bilder ausgewählt und kopiert werden können           |
| **Ändern erlauben**                   | Ob der Dokumentinhalt bearbeitet werden kann                      |
| **Kommentieren erlauben**             | Ob Kommentare, Markierungen und Stempel hinzugefügt werden können |
| **Formularausfüllen erlauben**        | Ob interaktive Formularfelder ausgefüllt werden können            |
| **Dokumentzusammenstellung erlauben** | Ob Seiten eingefügt, gelöscht oder gedreht werden können          |
| **Seitenextraktion erlauben**         | Ob einzelne Seiten extrahiert werden können                       |

Alle Berechtigungen benötigen ein Besitzerpasswort, um durchgesetzt zu werden. Ohne Besitzerpasswort werden die Berechtigungskennzeichen von den meisten PDF-Readern ignoriert.

## Wie Berechtigungen in PDF funktionieren

PDF-Berechtigungen sind Teil der Verschlüsselungsspezifikation. Sie werden als Bit-Flags im Verschlüsselungswörterbuch gespeichert und von konformen PDF-Readern durchgesetzt. Der entscheidende Unterschied:

- **Benutzerpasswort**: Wird benötigt, um die Datei überhaupt zu öffnen.
- **Besitzerpasswort**: Wird benötigt, um Berechtigungen zu ändern oder Beschränkungen zu entfernen. Ohne es bestimmen die Berechtigungskennzeichen, welche Vorgänge der Benutzer ausführen darf.

Wenn Sie nur ein Besitzerpasswort festlegen (kein Benutzerpasswort), kann jeder die Datei öffnen, ist aber auf die erlaubten Vorgänge beschränkt. Wenn Sie beide festlegen, braucht die Datei zum Öffnen ein Passwort und ist nach der Authentifizierung eingeschränkt.

## Anwendungsfälle

- Einen Bericht verteilen, der angesehen und gedruckt, aber nicht bearbeitet oder kopiert werden kann
- Eine Vertragsvorlage teilen, die Empfänger ausfüllen, aber nicht ändern können
- Einen PDF-Katalog veröffentlichen, in dem das Kopieren von Bildern deaktiviert ist
- Kommentare in einem Prüfentwurf erlauben und gleichzeitig strukturelle Änderungen verhindern

## Tipps

- Legen Sie immer ein Besitzerpasswort fest, sonst sind die Berechtigungen wirkungslos. Berechtigungen ohne Besitzerpasswort lassen sich nicht durchsetzen.
- Manche PDF-Werkzeuge von Drittanbietern ignorieren Berechtigungskennzeichen. Für stärkeren Schutz sollten Sie die PDF rastern oder DRM verwenden.
- Nutzen Sie dieses Werkzeug, um alte RC4-verschlüsselte PDFs auf AES-256 zu aktualisieren.

## Verwandte Werkzeuge

- [PDF verschlüsseln](./protect-pdf): einfacher Passwortschutz ohne detaillierte Berechtigungen
- [PDF entschlüsseln](./unlock-pdf): Verschlüsselung vollständig entfernen
- [Beschränkungen entfernen](./remove-restrictions): alle Beschränkungen aufheben, wenn Sie das Besitzerpasswort haben
