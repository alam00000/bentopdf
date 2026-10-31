---
title: JPG til PDF
description: Konvertér et eller flere JPG-, JPEG- og JPEG 2000-billeder til én PDF-fil direkte i din browser.
---

# JPG til PDF

Omdan JPG-billeder til en ren PDF. Upload én fil, eller saml flere JPG'er i en batch. Hvert billede bliver til en fuldstørrelsesside i det færdige dokument.

## Understøttede formater

| Format    | Filtypenavne    |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip dine JPG-filer. Flere filer kan vælges.
2. Gennemgå de uploadede filer. Brug papirkurv-ikonet til at fjerne enkelte filer, eller klik på **Tilføj flere filer** for at tilføje til listen.
3. Vælg et **PDF-kvalitetsniveau**.
4. Klik på **Konvertér til PDF**. Værktøjet komprimerer billederne efter din kvalitetsindstilling, konverterer dem via PyMuPDF-motoren og downloader `from_jpgs.pdf`.

## Indstillinger

**PDF-kvalitet** justerer den komprimering, der anvendes på hvert billede, før det indlejres i PDF'en:

- **Høj kvalitet**: bevarer maksimal detaljegrad. Brug til fotografi eller udskrivning.
- **Mellem kvalitet** (standard): en solid balance mellem klarhed og filstørrelse.
- **Lav kvalitet**: kraftig komprimering for det mindste output.

## Anvendelsesområder

- Konvertering af scannede dokumenter gemt som JPG'er til én PDF til indsendelse
- Samling af produktfotos i et katalog til kunder
- Omdannelse af JPEG 2000-billeder fra medicin eller satellitter til en bærbar PDF
- Oprettelse af et udskrivbart fotoalbum fra kameraeksporter

## Tips

- JPEG 2000-filer (`.jp2`, `.jpx`) understøttes fuldt ud, ikke kun standard-JPEG. Det er nyttigt til medicinsk billeddannelse og geospatiale data.
- Hvis dine JPG'er kommer fra et telefonkamera, giver Mellem kvalitet normalt en fil, der er 40-60 % mindre end Høj uden synlig forskel på skærmen.

## Relaterede værktøjer

- [Billeder til PDF](./image-to-pdf)
- [PNG til PDF](./png-to-pdf)
- [WebP til PDF](./webp-to-pdf)
