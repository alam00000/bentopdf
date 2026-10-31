---
title: RTF do PDF
description: Preveďte súbory Rich Text Format (RTF) do PDF vo svojom prehliadači pomocou enginu založeného na LibreOffice.
---

# RTF do PDF

Preveďte dokumenty Rich Text Format do PDF. RTF je multiplatformový formát dokumentov, ktorý podporuje prakticky každý textový editor. Tento nástroj používa engine LibreOffice bežiaci v prehliadači na vykreslenie súborov RTF s nedotknutým formátovaním: tučné písmo, kurzíva, tabuľky aj vložené obrázky sa prenesú do PDF.

## Podporované formáty

| Formát | Prípony | Typy MIME                     |
| :----- | :------ | :---------------------------- |
| RTF    | `.rtf`  | `text/rtf`, `application/rtf` |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite jeden či viac súborov RTF.
2. Skontrolujte zoznam súborov. Podľa potreby pridajte ďalšie alebo súbory odstráňte.
3. Kliknite na **Previesť do PDF**. Engine LibreOffice sa inicializuje pri prvom použití a potom spracuje každý súbor.
4. Jeden súbor sa stiahne priamo ako PDF. Viacero súborov dostanete ako `rtf-converted.zip`.

## Možnosti

Tento nástroj nemá žiadne ďalšie nastavenia. Prevod zachováva pôvodné formátovanie RTF.

## Výstup

| Počet vstupov | Výstup                                                        |
| :------------ | :------------------------------------------------------------ |
| 1 súbor       | Stiahnutie jedného PDF (napr. `letter.pdf`)                   |
| 2+ súbory     | Archív ZIP (`rtf-converted.zip`) s jedným PDF pre každý súbor |

## Prípady použitia

- Prevod starších dokumentov RTF zo starých textových editorov na moderné PDF
- Premena e-mailových šablón RTF na náhľady v PDF
- Spracovanie výstupu RTF z právnych alebo zdravotníckych softvérových systémov
- Hromadný prevod súborov RTF zo systému na správu dokumentov do PDF na archiváciu

## Tipy

- Engine LibreOffice sa načíta raz a uloží do medzipamäte. Prvý prevod v relácii trvá o niekoľko sekúnd dlhšie, ďalšie sú rýchlejšie.
- Súbory RTF s vloženými objektmi OLE nemusia vykresliť všetky objekty dokonale. Čistý text, obrázky a štandardné formátovanie sa prevedú spoľahlivo.
- Ak vaše súbory RTF vytvoril Microsoft Word, môžete ich previesť aj priamo nástrojom [Word do PDF](./word-to-pdf), ktorý okrem DOC a DOCX prijíma aj RTF.

## Súvisiace nástroje

- [Word do PDF](./word-to-pdf)
- [ODT do PDF](./odt-to-pdf)
- [Text do PDF](./txt-to-pdf)
