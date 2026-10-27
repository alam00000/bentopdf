---
title: Word til PDF
description: Konvertér Word-dokumenter (DOC, DOCX), ODT- og RTF-filer til PDF i din browser med fuld bevarelse af formatering.
---

# Word til PDF

Konvertér Microsoft Word-dokumenter og kompatible formater til PDF. Værktøjet bruger en browserbaseret LibreOffice-motor, der håndterer DOC-, DOCX-, ODT- og RTF-filer og bevarer formatering, tabeller, billeder, sidehoveder, sidefødder og typografier i resultatet.

## Understøttede formater

| Format            | Filtypenavne |
| :---------------- | :----------- |
| Word (moderne)    | `.docx`      |
| Word (ældre)      | `.doc`       |
| OpenDocument Text | `.odt`       |
| Rich Text Format  | `.rtf`       |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip dine Word-dokumenter. Du kan vælge flere filer på én gang.
2. Gennemgå og administrér fillisten.
3. Klik på **Konverter til PDF**. LibreOffice-motoren indlæses ved første brug (en statusindikator viser initialiseringen), og derefter konverteres hver fil.
4. En enkelt fil downloades direkte som PDF. Flere filer pakkes i `word-converted.zip`.

## Indstillinger

Dette værktøj har ingen yderligere indstillinger. LibreOffice-motoren producerer resultatet med sin standardprofil for PDF-eksport.

## Resultat

| Antal filer | Resultat                                                           |
| :---------- | :----------------------------------------------------------------- |
| 1 fil       | Enkelt PDF-download (oprindeligt filnavn med filtypenavnet `.pdf`) |
| 2+ filer    | ZIP-arkiv (`word-converted.zip`) med én PDF pr. fil                |

## Anvendelsesområder

- Konvertering af et CV eller en ansøgning fra DOCX til PDF, før du sender en jobansøgning
- Batchkonvertering af en række kontrakter eller tilbud til PDF til levering til en kunde
- Omdannelse af ældre `.doc`-filer til moderne PDF-filer til langtidsarkivering
- Konvertering af samarbejdsdokumenter fra Google Docs (eksporteret som DOCX) til PDF
- Fremstilling af udskriftsklare PDF-filer fra Word-skabeloner, der bruges til automatisk dokumentgenerering

## Tips

- LibreOffice-motoren downloades én gang pr. session og caches. Forvent et par sekunders indlæsningstid ved den første konvertering, mens efterfølgende konverteringer er meget hurtigere.
- Kompleks formatering (makroer, ActiveX-kontroller, avanceret SmartArt) konverteres måske ikke perfekt. Almindelige dokumentelementer som tekst, tabeller, billeder, sidehoveder og fodnoter konverteres pålideligt.
- Da dette værktøj også accepterer ODT og RTF, kan du bruge det som en samlet konverter til alle tekstbehandlingsformater.

## Relaterede værktøjer

- [ODT til PDF](./odt-to-pdf)
- [RTF til PDF](./rtf-to-pdf)
- [Excel til PDF](./excel-to-pdf)
- [PowerPoint til PDF](./powerpoint-to-pdf)
