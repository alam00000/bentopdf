---
title: PowerPoint do PDF
description: Preveďte prezentácie PowerPoint (PPT, PPTX) a súbory ODP do PDF so zachovaním formátovania snímok.
---

# PowerPoint do PDF

Preveďte súbory prezentácií do PDF. Každá snímka sa stane stranou výsledného dokumentu, pričom text, obrázky, tvary a prechody vykreslí engine LibreOffice bežiaci v prehliadači. Podporované sú moderné aj staršie formáty PowerPoint, ako aj formát OpenDocument Presentation.

## Podporované formáty

| Formát                    | Prípony |
| :------------------------ | :------ |
| PowerPoint (moderný)      | `.pptx` |
| PowerPoint (starší)       | `.ppt`  |
| OpenDocument Presentation | `.odp`  |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite súbory prezentácií.
2. Skontrolujte zoznam súborov. Podľa potreby pridajte ďalšie alebo súbory odstráňte.
3. Kliknite na **Previesť do PDF**. Engine LibreOffice sa načíta pri prvom použití a potom prevedie každý súbor.
4. Jeden súbor sa stiahne priamo ako PDF. Viacero súborov sa zabalí do `powerpoint-converted.zip`.

## Možnosti

Tento nástroj nemá žiadne ďalšie nastavenia. Snímky sa vykreslia v ich pôvodných rozmeroch.

## Výstup

| Počet vstupov | Výstup                                                               |
| :------------ | :------------------------------------------------------------------- |
| 1 súbor       | Stiahnutie jedného PDF (pôvodný názov súboru s príponou `.pdf`)      |
| 2+ súbory     | Archív ZIP (`powerpoint-converted.zip`) s jedným PDF pre každý súbor |

## Prípady použitia

- Prevod prezentácie do PDF pred zdieľaním s publikom, ktoré nemusí mať PowerPoint
- Vytvorenie tlačiteľných podkladov zo sady snímok na konferenciu alebo workshop
- Archivácia prezentácií vo formáte, ktorý sa na každom zariadení zobrazí rovnako
- Hromadný prevod knižnice prezentácií ODP z LibreOffice Impress do PDF
- Vytvorenie PDF verzie pitch decku na prílohy e-mailov

## Tipy

- Animácie a prechody snímok sa v PDF nezobrazia. Každá snímka sa zachytí ako statická strana.
- Vložené videá sa vo výstupe nezobrazia. V prípade potreby ich nahraďte snímkou obrazovky alebo zástupným obrázkom.
- Poznámky prednášajúceho nie sú v predvolenom exporte PDF zahrnuté. Ak poznámky potrebujete, zvážte najprv export z natívneho zobrazenia „Tlač poznámok“ v PowerPointe.
- Engine LibreOffice sa po prvom načítaní uloží do medzipamäte, takže prevod druhej prezentácie v rovnakej relácii je oveľa rýchlejší.

## Súvisiace nástroje

- [Word do PDF](./word-to-pdf)
- [Excel do PDF](./excel-to-pdf)
- [Obrázky do PDF](./image-to-pdf)
