---
title: PDF til PDF/A
description: Konvertér almindelige PDF-filer til PDF/A-format til langtidsarkivering. Understøtter konformitetsniveauerne PDF/A-1b, PDF/A-2b og PDF/A-3b.
---

# PDF til PDF/A

PDF/A er en ISO-standardiseret delmængde af PDF, der er designet til langtidsbevaring af digitale dokumenter. Dette værktøj konverterer dine almindelige PDF-filer til PDF/A-kompatible dokumenter med Ghostscript, som kører direkte i din browser.

## Sådan fungerer det

1. Upload en eller flere PDF-filer.
2. Vælg en **PDF/A-version** i rullemenuen.
3. Aktivér eventuelt **Flad PDF ud først** til komplekse filer, der ikke kan konverteres normalt.
4. Klik på **Konvertér til PDF/A**. Flere filer giver et ZIP-arkiv.

## PDF/A-versioner

| Version      | Begrænsninger                                      | Bedst til                                             |
| ------------ | -------------------------------------------------- | ----------------------------------------------------- |
| **PDF/A-1b** | Strengest. Ingen gennemsigtighed, ingen lag.       | Maksimal kompatibilitet med ældre arkiveringssystemer |
| **PDF/A-2b** | Tillader gennemsigtighed og JPEG2000.              | Almindelig arkivering (anbefales)                     |
| **PDF/A-3b** | Tillader indlejrede vedhæftninger i alle formater. | Arkivering af dokumenter med kildedatafiler           |

PDF/A-2b er valgt som standard og passer til langt de fleste arkiveringsbehov.

## Indstillingen Flad ud først

Nogle PDF-filer indeholder funktioner, der forhindrer en ren PDF/A-konvertering: usædvanlige skrifttypekodninger, komplekse gennemsigtighedsstakke eller ødelagte interne strukturer. Når du aktiverer **Flad ud først**, rasteriseres PDF'en i 300 DPI før konvertering, hvilket garanterer overholdelse af standarden, men gør teksten umulig at markere. Brug den som reserveløsning, når den almindelige konvertering giver fejl.

Udfladning først kræver PyMuPDF WASM-motoren.

## Anvendelser

- Opfylde offentlige eller juridiske arkiveringskrav (mange jurisdiktioner kræver PDF/A til retsdokumenter)
- Indsende dokumenter til institutionelle arkiver eller digitale biblioteker
- Bevare forretningsoptegnelser, hvor den oprindelige software måske ikke findes om ti år
- Forberede fakturaer til e-faktureringsstandarder, der kræver PDF/A-3b med XML-vedhæftninger

## Tips

- Prøv konvertering uden udfladning først. Aktivér den kun, hvis du får en fejl.
- PDF/A indlejrer alle skrifttyper, så outputfiler er ofte større end originalerne.
- Valider outputtet i en dedikeret PDF/A-validator, hvis din arbejdsgang kræver streng overholdelse.

## Relaterede værktøjer

- [Komprimer PDF](./compress-pdf): reducér filstørrelsen efter konvertering
- [Fladgør PDF](./flatten-pdf): flad formularer ud, før du konverterer til PDF/A
- [Fjern metadata](./remove-metadata): fjern metadata før arkivering
