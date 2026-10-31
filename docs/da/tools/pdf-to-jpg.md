---
title: PDF til JPG
description: Konvertér PDF-sider til JPG-billeder med justerbar kvalitet. PDF-filer med én side downloades direkte, PDF-filer med flere sider eksporteres som ZIP.
---

# PDF til JPG

Konverterer hver side i en PDF til et JPG-billede. Dokumenter med én side downloades som en selvstændig `.jpg`-fil. PDF-filer med flere sider giver et ZIP-arkiv med ét JPG pr. side.

## Sådan fungerer det

1. Upload en PDF ved at klikke på slipområdet eller trække en fil hen på det. Værktøjet viser filnavn, filstørrelse og sideantal.
2. Justér skyderen **Kvalitet** for at styre JPG-komprimeringen.
3. Klik på **Konvertér** for at starte behandlingen.
4. Resultatet downloades automatisk: ét JPG for PDF-filer med én side eller en ZIP-fil for dokumenter med flere sider.

## Indstillinger

- **Kvalitet**: en skyder fra 0 % til 100 % (standard 90 %). Højere værdier giver skarpere billeder med større filer. Lavere værdier komprimerer mere aggressivt.

Siderne gengives internt i 2x skala, så outputopløsningen er dobbelt så stor som PDF'ens sidemål. En almindelig Letter-side giver et billede på cirka 1.224 x 1.584 pixel.

## Outputformat

- **Enkelt side**: `filename.jpg`
- **Flere sider**: `filename_jpgs.zip` med `page_1.jpg`, `page_2.jpg` osv.

## Anvendelser

- Generere forhåndsvisningsminiaturer til et dokumenthåndteringssystem.
- Dele en side fra en rapport i en chat eller e-mail, der ikke understøtter PDF.
- Lave billedelementer af PDF-diagrammer eller illustrationer.
- Arkivere scannede dokumenter som enkeltbilleder.

## Tips

- Til tabsfrit output kan du bruge [PDF til PNG](./pdf-to-png) i stedet.
- En kvalitetsindstilling på 80-90 % er en god balance mellem filstørrelse og visuel troværdighed.
- Hvis du har brug for et bestemt format pr. side, kan du overveje [PDF Workflow-bygger](./pdf-workflow), som har en outputnode til PDF til billeder.

## Relaterede værktøjer

- [PDF til PNG](./pdf-to-png)
- [PDF til WebP](./pdf-to-webp)
- [PDF til BMP](./pdf-to-bmp)
- [PDF til TIFF](./pdf-to-tiff)
