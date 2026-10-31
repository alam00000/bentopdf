---
title: PowerPoint till PDF
description: Konvertera PowerPoint-presentationer (PPT, PPTX) och ODP-filer till PDF med bevarad bildformatering.
---

# PowerPoint till PDF

Konvertera presentationsfiler till PDF. Varje bild blir en sida i dokumentet, med text, bilder, former och övergångar renderade via en LibreOffice-motor i webbläsaren. Stöder både moderna och äldre PowerPoint-format samt formatet OpenDocument Presentation.

## Format som stöds

| Format                    | Filändelser |
| :------------------------ | :---------- |
| PowerPoint (modern)       | `.pptx`     |
| PowerPoint (äldre)        | `.ppt`      |
| OpenDocument Presentation | `.odp`      |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp dina presentationsfiler.
2. Granska fillistan. Lägg till fler eller ta bort filer vid behov.
3. Klicka på **Konvertera till PDF**. LibreOffice-motorn laddas första gången och konverterar sedan varje fil.
4. En enskild fil laddas ned direkt som PDF. Flera filer paketeras i `powerpoint-converted.zip`.

## Alternativ

Det här verktyget har inga extra inställningar. Bilderna renderas i sina ursprungliga mått.

## Resultat

| Antal filer | Resultat                                                             |
| :---------- | :------------------------------------------------------------------- |
| 1 fil       | Enskild PDF att ladda ned (ursprungligt filnamn med ändelsen `.pdf`) |
| 2+ filer    | ZIP-arkiv (`powerpoint-converted.zip`) med en PDF per fil            |

## Användningsområden

- Konvertera en presentation till PDF innan du delar den med en publik som kanske inte har PowerPoint
- Skapa en utskrivbar handout av en bildpresentation för en konferens eller workshop
- Arkivera presentationer i ett format som ser likadant ut på alla enheter
- Konvertera ett bibliotek med ODP-presentationer från LibreOffice Impress till PDF i bulk
- Skapa en PDF-version av en pitch deck för e-postbilagor

## Tips

- Animationer och övergångar i bilderna återges inte i PDF-filen. Varje bild fångas som en statisk sida.
- Inbäddade videor visas inte i resultatet. Ersätt dem med en skärmbild eller platshållarbild vid behov.
- Anteckningar för talaren ingår inte i standardexporten till PDF. Behöver du anteckningar kan du först exportera från PowerPoints egen vy "Skriv ut anteckningar".
- LibreOffice-motorn cachas efter första laddningen, så att konvertera en andra presentation under samma session går mycket snabbare.

## Relaterade verktyg

- [Word till PDF](./word-to-pdf)
- [Excel till PDF](./excel-to-pdf)
- [Bilder till PDF](./image-to-pdf)
