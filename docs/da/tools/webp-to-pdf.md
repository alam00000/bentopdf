---
title: WebP til PDF
description: Konvertér WebP-billeder til PDF direkte i din browser med justerbar komprimeringskvalitet.
---

# WebP til PDF

Konvertér Googles WebP-billedformat til PDF. Det er især nyttigt, når du har downloadet billeder fra nettet i WebP-format og har brug for dem i et mere udbredt format til udskrivning eller deling.

## Understøttede formater

| Format | Filtypenavne |
| :----- | :----------- |
| WebP   | `.webp`      |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip dine WebP-filer.
2. Gennemgå fillisten, og fjern de filer, du ikke har brug for.
3. Vælg et niveau for **PDF-kvalitet**.
4. Klik på **Konverter til PDF**. Resultatet downloades som `from_webps.pdf`.

Internt afkodes hvert WebP-billede via browserens canvas-API og indlejres derefter i PDF-filen med pdf-lib. Det betyder, at konverteringen virker i enhver browser, der understøtter WebP-afkodning (alle moderne browsere gør).

## Indstillinger

**PDF-kvalitet** styrer komprimeringen, når billeder indlejres:

- **Høj kvalitet**: bevarer flest detaljer.
- **Mellem kvalitet** (standard): afbalanceret resultat.
- **Lav kvalitet**: mindste filstørrelse.

## Anvendelsesområder

- Konvertering af webdownloadede billeder gemt som WebP til en udskrivbar PDF
- Samling af WebP-skærmbilleder fra Chrome eller Edge i dokumentation
- Oprettelse af en PDF-portefølje af billeder eksporteret fra designværktøjer, der som standard bruger WebP
- Arkivering af WebP-billeder i et mere udbredt læsbart format

## Tips

- WebP afkodes internt til PNG, før det indlejres i PDF-filen, så tabsfrie WebP-billeder bevarer deres kvalitet på indstillingen High.
- Hvis du har en blanding af WebP og andre billedformater, så brug værktøjet [Billeder til PDF](./image-to-pdf) i stedet: det accepterer alt på én gang.

## Relaterede værktøjer

- [Billeder til PDF](./image-to-pdf)
- [PNG til PDF](./png-to-pdf)
- [JPG til PDF](./jpg-to-pdf)
