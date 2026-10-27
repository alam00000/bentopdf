---
title: ODT til PDF
description: Konvertér OpenDocument Text-filer (ODT) til PDF i din browser med en LibreOffice-drevet motor.
---

# ODT til PDF

Konvertér OpenDocument Text-filer til PDF. ODT er det oprindelige format i LibreOffice Writer, Apache OpenOffice og andre open source-tekstbehandlingsprogrammer. Værktøjet bruger en browserbaseret LibreOffice-motor til at lave præcise konverteringer, der bevarer formatering, tabeller, billeder og typografier.

## Understøttede formater

| Format            | Filtypenavne |
| :---------------- | :----------- |
| OpenDocument Text | `.odt`       |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip en eller flere ODT-filer.
2. Gennemgå fillisten. Tilføj flere filer, eller fjern uønskede.
3. Klik på **Konvertér til PDF**. LibreOffice-motoren initialiseres (en statusindikator viser indlæsningen), og derefter konverteres hver fil.
4. En enkelt fil downloades direkte som PDF. Flere filer pakkes i `odt-converted.zip`.

## Indstillinger

Dette værktøj har ingen yderligere konfiguration. Konverteringen bevarer dokumentets oprindelige formatering så præcist som muligt.

## Output

| Antal inputfiler | Output                                             |
| :--------------- | :------------------------------------------------- |
| 1 fil            | Enkelt PDF-download (f.eks. `document.pdf`)        |
| 2+ filer         | ZIP-arkiv (`odt-converted.zip`) med én PDF pr. fil |

## Anvendelser

- Konvertere LibreOffice Writer-dokumenter til PDF, så de kan deles med Microsoft Office-brugere
- Lave udskriftsklare PDF-filer af akademiske artikler skrevet i OpenDocument-format
- Batchkonvertere en mappe med ODT-skabeloner til PDF-filer til distribution
- Generere PDF-filer fra ODT-filer oprettet af automatiske dokumentgenereringssystemer

## Tips

- LibreOffice-motoren indlæses ved første brug og gemmes i cachen til efterfølgende konverteringer. Den første indlæsning tager nogle sekunder, derefter går konverteringerne hurtigt.
- Komplekse dokumenter med indlejrede OLE-objekter eller usædvanlige skrifttyper kan gengives en smule anderledes end i LibreOffice på computeren. Test med en prøve, før du batchkonverterer.
- Til Word-dokumenter (`.doc`, `.docx`) skal du bruge værktøjet [Word til PDF](./word-to-pdf), som også bruger LibreOffice-motoren, men accepterer Microsoft-formater direkte.

## Relaterede værktøjer

- [Word til PDF](./word-to-pdf)
- [RTF til PDF](./rtf-to-pdf)
- [Tekst til PDF](./txt-to-pdf)
