---
title: PDF til PNG
description: Konvertér PDF-sider til tabsfrie PNG-billeder med justerbar skala. Ideelt til skærmbilleder i høj kvalitet og gennemsigtige baggrunde.
---

# PDF til PNG

Konverterer hver side i en PDF til et PNG-billede. PNG bruger tabsfri komprimering, så outputtet bevarer alle detaljer fra den oprindelige side. PDF-filer med én side downloades som en `.png`-fil, og PDF-filer med flere sider giver en ZIP.

## Sådan fungerer det

1. Upload en PDF ved at klikke på slipområdet eller trække en fil hen på det.
2. Indstil skyderen **Skala** for at styre outputopløsningen.
3. Klik på **Konvertér** for at starte behandlingen.
4. Et enkelt PNG eller et ZIP-arkiv downloades automatisk.

## Indstillinger

- **Skala**: fra 1.0x til 3.0x (standard 2.0x). Ved 2.0x gengives en almindelig Letter-side i cirka 1.224 x 1.584 pixel. Højere skalaværdier giver større og skarpere billeder på bekostning af filstørrelse og behandlingstid.

## Outputformat

- **Enkelt side**: `filename.png`
- **Flere sider**: `filename_pngs.zip` med `page_1.png`, `page_2.png` osv.

## Anvendelser

- Tage skærmbilleder af PDF-sider i høj kvalitet til præsentationer.
- Udtrække diagrammer eller figurer, der kræver skarpe kanter og ingen komprimeringsartefakter.
- Forberede elementer til webdesign ud fra PDF-mockups.
- Lave tabsfrie sidebilleder til forbehandling før OCR.

## Tips

- PNG-filer er væsentligt større end JPG. Hvis filstørrelsen betyder mere end perfekt kvalitet, kan du bruge [PDF til JPG](./pdf-to-jpg) eller [PDF til WebP](./pdf-to-webp).
- Ved skala 1.0x svarer outputtet til PDF'ens oprindelige opløsning. Sæt den op til 3.0x for eksport i udskriftskvalitet.

## Relaterede værktøjer

- [PDF til JPG](./pdf-to-jpg)
- [PDF til WebP](./pdf-to-webp)
- [PDF til SVG](./pdf-to-svg)
