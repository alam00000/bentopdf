---
title: Word do PDF
description: Prevádzajte dokumenty Word (DOC, DOCX), ODT a RTF do PDF priamo v prehliadači s úplným zachovaním formátovania.
---

# Word do PDF

Prevádzajte dokumenty Microsoft Word a kompatibilné formáty do PDF. Nástroj používa engine LibreOffice bežiaci v prehliadači, ktorý spracuje súbory DOC, DOCX, ODT a RTF a vo výstupe zachová formátovanie, tabuľky, obrázky, hlavičky, päty a štýly.

## Podporované formáty

| Formát            | Prípony |
| :---------------- | :------ |
| Word (moderný)    | `.docx` |
| Word (starší)     | `.doc`  |
| OpenDocument Text | `.odt`  |
| Rich Text Format  | `.rtf`  |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite dokumenty Word. Naraz môžete vybrať viac súborov.
2. Skontrolujte a upravte zoznam súborov.
3. Kliknite na **Previesť do PDF**. Engine LibreOffice sa načíta pri prvom použití (indikátor priebehu ukazuje stav inicializácie), potom sa prevedie každý súbor.
4. Jeden súbor sa stiahne priamo ako PDF. Viac súborov sa zabalí do `word-converted.zip`.

## Možnosti

Tento nástroj nemá žiadne ďalšie nastavenia. Engine LibreOffice vytvorí výstup pomocou predvoleného profilu exportu PDF.

## Výstup

| Počet vstupov | Výstup                                                          |
| :------------ | :-------------------------------------------------------------- |
| 1 súbor       | Stiahnutie jedného PDF (pôvodný názov súboru s príponou `.pdf`) |
| 2+ súbory     | ZIP archív (`word-converted.zip`) s jedným PDF pre každý súbor  |

## Prípady použitia

- Prevod životopisu alebo motivačného listu z DOCX do PDF pred odoslaním žiadosti o prácu
- Hromadný prevod zmlúv alebo návrhov do PDF na odovzdanie klientovi
- Premena starších súborov `.doc` na moderné PDF na dlhodobú archiváciu
- Prevod spoločných dokumentov z Google Docs (exportovaných ako DOCX) do PDF
- Tvorba PDF pripravených na tlač zo šablón Word používaných pri automatickom generovaní dokumentov

## Tipy

- Engine LibreOffice sa stiahne raz za reláciu a uloží do vyrovnávacej pamäte. Pri prvom prevode počítajte s niekoľkými sekundami načítania, ďalšie prevody sú oveľa rýchlejšie.
- Zložité formátovanie (makrá, ovládacie prvky ActiveX, pokročilý SmartArt) sa nemusí previesť dokonale. Štandardné prvky dokumentu -- text, tabuľky, obrázky, hlavičky, poznámky pod čiarou -- sa prevádzajú spoľahlivo.
- Keďže tento nástroj prijíma aj ODT a RTF, môžete ho použiť ako univerzálny prevodník pre všetky formáty textových procesorov.

## Súvisiace nástroje

- [ODT do PDF](./odt-to-pdf)
- [RTF do PDF](./rtf-to-pdf)
- [Excel do PDF](./excel-to-pdf)
- [PowerPoint do PDF](./powerpoint-to-pdf)
