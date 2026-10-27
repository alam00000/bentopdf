---
title: OCR PDF
description: Gør scannede PDF'er søgbare og kopierbare med Tesseract OCR med understøttelse af flere sprog og tegnfiltrering.
---

# OCR PDF

Omdan scannede dokumenter til søgbare, kopierbare PDF'er. Værktøjet bruger Tesseract OCR til at genkende tekst i billeder og lægger et usynligt tekstlag oven på de oprindelige sider, så det visuelle udseende bevares, mens indholdet bliver fuldt søgbart.

## Sådan fungerer det

1. Upload en scannet PDF eller en billedbaseret PDF-fil.
2. Vælg et eller flere sprog, der findes i dokumentet, i den søgbare sprogliste.
3. Juster eventuelt avancerede indstillinger (opløsning, binarisering, whitelist).
4. Klik på **Start OCR**, og følg fremdriften i statuslinjen i realtid.
5. Når det er færdigt, kan du gennemgå den udtrukne tekst og derefter downloade den søgbare PDF eller en almindelig `.txt`-fil.

## Funktioner

- OCR på flere sprog med en søgbar sprogvælger
- Usynligt tekstlag bevarer dokumentets oprindelige udseende
- Statuslinje og logoutput i realtid under behandlingen
- Download resultater som søgbar PDF eller almindelig tekstfil
- Kopiér udtrukket tekst direkte til udklipsholderen
- Tre opløsningsniveauer til at afveje hastighed mod nøjagtighed

## Indstillinger

| Indstilling                             | Værdier                                                                                         | Standard | Formål                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| **Opløsning**                           | Standard (192 DPI), Høj (288 DPI), Ultra (384 DPI)                                              | Høj      | Højere opløsning forbedrer nøjagtigheden på lille tekst, men tager længere tid    |
| **Binarisér billede**                   | Til / Fra                                                                                       | Fra      | Forbedrer kontrasten for rene scanninger ved at konvertere til sort og hvid       |
| **Forudindstilling for tegn-whitelist** | Ingen, Alfanumerisk, Tal + valuta, Kun bogstaver, Kun tal, Faktura, Formularer, Brugerdefineret | Ingen    | Begrænser genkendte tegn for at forbedre nøjagtigheden for bestemte dokumenttyper |
| **Tegn-whitelist**                      | Fri tekst                                                                                       | Tom      | Manuelt tegnsæt, når forudindstillingen er sat til Brugerdefineret                |

## Anvendelsesområder

- Gør scannede kontrakter og fakturaer søgbare, så du kan bruge Ctrl+F i dem
- Udtrækning af tekst fra fotograferede dokumenter eller gamle papirarkiver
- Behandling af kvitteringer med forudindstillingen Faktura for nøjagtigt at fange beløb og datoer
- Oprettelse af tilgængelige PDF'er fra scanninger, der kun består af billeder, til compliancekrav
- Batchudtrækning af tekstindhold fra scannede bøger eller manualer

## Tips

- Vælg flere sprog, hvis dit dokument indeholder tekst på blandede sprog (f.eks. engelske overskrifter med japansk brødtekst).
- Brug binariseringsindstillingen til dokumenter med falmet tekst eller lav kontrast. Den kan forbedre genkendelsesnøjagtigheden markant.
- Forudindstillingerne Faktura og Formularer reducerer falske positiver kraftigt på strukturerede dokumenter ved at ignorere irrelevante tegnformer.

## Relaterede værktøjer

- [Udtræk PDF-tabeller](./extract-tables)
- [Flet PDF](./merge-pdf)
- [Komprimer PDF](./compress-pdf)
