---
title: RTF til PDF
description: Konvertér Rich Text Format-filer (RTF) til PDF i din browser med en LibreOffice-drevet motor.
---

# RTF til PDF

Konvertér Rich Text Format-dokumenter til PDF. RTF er et dokumentformat på tværs af platforme, som stort set alle tekstbehandlingsprogrammer understøtter. Dette værktøj bruger en LibreOffice-motor i browseren til at gengive RTF-filer med formateringen intakt: fed, kursiv, tabeller og indlejrede billeder føres alle over i PDF'en.

## Understøttede formater

| Format | Filendelser | MIME-typer                    |
| :----- | :---------- | :---------------------------- |
| RTF    | `.rtf`      | `text/rtf`, `application/rtf` |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip en eller flere RTF-filer.
2. Gennemgå fillisten. Tilføj flere eller fjern filer efter behov.
3. Klik på **Konvertér til PDF**. LibreOffice-motoren initialiseres ved første brug og behandler derefter hver fil.
4. En enkelt fil downloades direkte som PDF. Flere filer leveres som `rtf-converted.zip`.

## Indstillinger

Dette værktøj har ingen yderligere indstillinger. Konverteringen bevarer den oprindelige RTF-formatering.

## Resultat

| Antal filer | Resultat                                           |
| :---------- | :------------------------------------------------- |
| 1 fil       | Enkelt PDF-download (f.eks. `letter.pdf`)          |
| 2+ filer    | ZIP-arkiv (`rtf-converted.zip`) med én PDF pr. fil |

## Anvendelsesmuligheder

- Konvertere ældre RTF-dokumenter fra gamle tekstbehandlingsprogrammer til moderne PDF'er
- Gøre RTF-e-mailskabeloner til PDF-forhåndsvisninger
- Behandle RTF-output fra juridiske eller medicinske softwaresystemer
- Batchkonvertere RTF-filer fra et dokumenthåndteringssystem til PDF til arkivering

## Tips

- LibreOffice-motoren indlæses én gang og caches. Den første konvertering i en session tager nogle ekstra sekunder, de næste går hurtigere.
- RTF-filer med indlejrede OLE-objekter gengiver muligvis ikke alle objekter perfekt. Ren tekst, billeder og standardformatering konverteres pålideligt.
- Hvis dine RTF-filer er oprettet i Microsoft Word, kan du også konvertere dem direkte med værktøjet [Word til PDF](./word-to-pdf), som accepterer RTF ved siden af DOC og DOCX.

## Relaterede værktøjer

- [Word til PDF](./word-to-pdf)
- [ODT til PDF](./odt-to-pdf)
- [Tekst til PDF](./txt-to-pdf)
