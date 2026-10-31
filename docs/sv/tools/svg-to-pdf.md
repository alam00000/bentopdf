---
title: SVG till PDF
description: Konvertera SVG-vektorgrafik till PDF med kvalitetskontroll, helt i webbläsaren.
---

# SVG till PDF

Konvertera Scalable Vector Graphics-filer (SVG) till PDF. Verktyget rasteriserar varje SVG via webbläsarens renderingsmotor och bäddar sedan in resultatet i dess ursprungliga upplösning. Användbart för att göra vektorikoner, diagram och illustrationer till portabla dokument.

## Format som stöds

| Format | Filändelser |
| :----- | :---------- |
| SVG    | `.svg`      |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp en eller flera SVG-filer.
2. Granska och hantera fillistan.
3. Välj en nivå för **PDF-kvalitet**.
4. Klicka på **Konvertera till PDF**. Resultatet laddas ned som `from_svgs.pdf`.

Varje SVG läses som text, renderas på en canvas i sin egen bredd och höjd (standard 800x600 om inga mått anges) och exporteras som PNG. Den PNG-filen bäddas sedan in i PDF-filen med pdf-lib. Transparenta områden fylls med vit bakgrund.

## Alternativ

**PDF-kvalitet** styr komprimeringen efter rasteriseringen:

- **Hög kvalitet**: närmast den ursprungliga renderingen.
- **Medelhög kvalitet** (standard): bra balans.
- **Låg kvalitet**: minsta filen, en del detaljförlust.

## Användningsområden

- Konvertera arkitekt- eller ingenjörsdiagram från SVG till en tryckklar PDF
- Paketera ikonuppsättningar i en referens-PDF för ett designsystem
- Göra datavisualiseringar (D3.js, export från diagrambibliotek) till rapportklara PDF-filer
- Skapa utskrivbara versioner av SVG-baserad infografik

## Tips

- SVG-filer utan explicita attribut för `width` och `height` renderas i 800x600 pixlar. För bästa resultat, ange mått i SVG-källan innan du konverterar.
- Komplexa SVG-filer med externa typsnittsreferenser eller länkade bilder kanske inte renderas perfekt. Bädda in alla resurser i SVG-filen för tillförlitligt resultat.
- Eftersom SVG-filen rasteriseras innehåller PDF-filen en bitmappsbild i stället för vektorbanor. För äkta vektor-PDF behövs ett dedikerat vektorverktyg.

## Relaterade verktyg

- [Bilder till PDF](./image-to-pdf)
- [PNG till PDF](./png-to-pdf)
- [BMP till PDF](./bmp-to-pdf)
