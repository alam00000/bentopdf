---
title: XPS til PDF
description: Konvertér XPS- og OXPS-dokumenter til PDF i din browser. Ingen upload, ingen tilmelding, fuldt privat.
---

# XPS til PDF

Konvertér Microsoft XPS- og OXPS-dokumenter til almindelige PDF-filer. XPS (XML Paper Specification) var Microsofts svar på PDF, men understøttelsen er faldet på tværs af platforme. Dette værktøj gør de dokumenter universelt læsbare igen.

## Understøttede formater

| Format | Filtypenavn | Noter                                |
| :----- | :---------- | :----------------------------------- |
| XPS    | `.xps`      | Oprindeligt Microsoft XPS-format     |
| OXPS   | `.oxps`     | Open XPS, ECMA-388-standardvarianten |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip dine XPS/OXPS-filer. Du kan vælge flere filer på én gang.
2. Gennemgå fillisten. Fjern enkelte filer med papirkurvsikonet, eller klik på **Tilføj flere filer** for at tilføje flere dokumenter.
3. Klik på **Konverter til PDF**. PyMuPDF-motoren behandler hvert dokument lokalt i din browser.
4. En enkelt fil downloades direkte som PDF. Flere filer samles i et ZIP-arkiv med navnet `xps-converted.zip`.

## Indstillinger

Dette værktøj udfører en direkte formatkonvertering uden yderligere konfiguration. Resultatet bevarer de oprindelige sidemål, vektorgrafik, skrifttyper og billeder fra XPS-kilden.

## Anvendelsesområder

- Åbning af XPS-filer modtaget fra ældre Windows-systemer, der som standard brugte XPS-printerdriveren
- Konvertering af OXPS-dokumenter fra Windows 10/11 til deling med macOS- eller Linux-brugere
- Arkivering af ældre XPS-filer i et mere udbredt format
- Gør XPS-baserede offentlige eller virksomhedsdokumenter tilgængelige for eksterne modtagere

## Tips

- Både filtypenavnene `.xps` og `.oxps` håndteres automatisk, så du kan blande dem i samme batch.
- Hvis den oprindelige XPS-fil blev oprettet med en printerdriver i høj opløsning, bevarer den resulterende PDF den kvalitet. Der sker ingen resampling.

## Relaterede værktøjer

- [Word til PDF](./word-to-pdf)
- [XML til PDF](./xml-to-pdf)
