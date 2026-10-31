---
title: PDF schützen
description: Schützen Sie PDF-Dateien mit 256-Bit-AES-Verschlüsselung per Passwort. Legen Sie Benutzer- und Besitzerpasswörter mit einstellbaren Nutzungsbeschränkungen fest.
---

# PDF schützen

Sperre Ihre PDF mit einem Passwort, damit nur berechtigte Personen sie öffnen können. BentoPDF verwendet 256-Bit-AES-Verschlüsselung, denselben Standard wie Banken und Behörden, und wendet sie vollständig in Ihrem Browser über QPDF an.

## So funktioniert es

1. Laden Sie eine PDF-Datei hoch.
2. Geben Sie ein **Benutzerpasswort** ein (erforderlich). Dieses Passwort brauchen Personen, um die Datei zu öffnen.
3. Geben Sie optional ein **Besitzerpasswort** ein. Wenn es gesetzt ist, erhält die PDF Nutzungsbeschränkungen, die Drucken, Bearbeiten, Kopieren und Kommentieren verhindern.
4. Klicken Sie auf **PDF verschlüsseln**.
5. Laden Sie die verschlüsselte Datei herunter.

## Passworttypen

### Benutzerpasswort (erforderlich)

Das Benutzerpasswort geben Empfänger ein, um die PDF zu öffnen. Ohne es ist das Dokument vollständig unzugänglich. Jede verschlüsselte PDF muss eines haben.

### Besitzerpasswort (optional)

Das Besitzerpasswort steuert, was ein berechtigter Benutzer nach dem Öffnen der Datei tun darf. Wenn Sie ein eigenes Besitzerpasswort festlegen, wendet BentoPDF automatisch die strengsten Beschränkungen an:

- Ändern deaktiviert
- Extrahieren/Kopieren deaktiviert
- Drucken deaktiviert
- Kommentieren deaktiviert
- Formularausfüllen deaktiviert
- Dokumentzusammenstellung deaktiviert

Wenn Sie das Besitzerpasswort leer lassen, wird die PDF verschlüsselt (zum Öffnen ist weiterhin das Benutzerpasswort nötig), hat aber nach dem Öffnen keine Nutzungsbeschränkungen.

## Details zur Verschlüsselung

- **Algorithmus**: AES-256 (256-Bit Advanced Encryption Standard)
- **Schlüssellänge**: 256 Bit
- **Standard**: PDF-2.0-Verschlüsselung (QPDF-Implementierung)

AES-256 lässt sich mit heutiger Technik rechnerisch nicht per Brute-Force knacken. Die Sicherheit Ihrer verschlüsselten PDF hängt allein von der Stärke Ihres Passworts ab.

## Anwendungsfälle

- Vertrauliche Finanzberichte vor dem E-Mail-Versand schützen
- Rechtsdokumente sichern, die an die Gegenseite gehen
- Medizinische Unterlagen oder personenbezogene Daten mit einem Passwort versehen
- Kostenpflichtige Inhalte (E-Books, Berichte) mit Zugriffskontrolle verteilen
- Datenschutzrichtlinien erfüllen, die Verschlüsselung gespeicherter Daten verlangen

## Tipps

- Verwenden Sie ein starkes, einzigartiges Passwort. Eine Passphrase mit mindestens 12 Zeichen aus Groß- und Kleinbuchstaben, Zahlen und Symbolen ist ideal.
- Teilen Sie das Passwort über einen separaten Kanal (Telefon, Textnachricht) und nie in derselben E-Mail wie die PDF.
- Wenn Sie nur Aktionen einschränken wollen (kein Drucken, kein Kopieren), ohne ein Passwort zum Öffnen zu verlangen, nutzen Sie stattdessen das Werkzeug Berechtigungen ändern.

## Verwandte Werkzeuge

- [PDF entschlüsseln](./unlock-pdf): Verschlüsselung entfernen, wenn Sie das Passwort kennen
- [Berechtigungen ändern](./change-permissions): bestimmte Nutzungsbeschränkungen anpassen
- [Beschränkungen entfernen](./remove-restrictions): alle Sicherheitseinstellungen aus einer PDF entfernen
- [PDF bereinigen](./sanitize-pdf): versteckte Inhalte vor dem Verschlüsseln entfernen
