---
title: ODT do PDF
description: Prevádzajte súbory OpenDocument Text (ODT) do formátu PDF v prehliadači pomocou enginu založeného na LibreOffice.
---

# ODT do PDF

Prevádzajte súbory OpenDocument Text do PDF. ODT je natívny formát LibreOffice Writer, Apache OpenOffice a ďalších open-source textových editorov. Tento nástroj používa engine LibreOffice bežiaci v prehliadači, ktorý vytvára presné prevody so zachovaním formátovania, tabuliek, obrázkov a štýlov.

## Podporované formáty

| Formát            | Prípony |
| :---------------- | :------ |
| OpenDocument Text | `.odt`  |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo presuňte jeden či viac súborov ODT.
2. Skontrolujte zoznam súborov. Pridajte ďalšie súbory alebo odstráňte nechcené.
3. Kliknite na **Previesť do PDF**. Engine LibreOffice sa inicializuje (stav načítania zobrazuje indikátor priebehu) a potom sa prevedie každý súbor.
4. Jeden súbor sa stiahne priamo ako PDF. Viac súborov sa zabalí do `odt-converted.zip`.

## Možnosti

Tento nástroj nemá žiadne ďalšie nastavenia. Prevod čo najvernejšie zachováva formátovanie pôvodného dokumentu.

## Výstup

| Počet vstupov | Výstup                                                       |
| :------------ | :----------------------------------------------------------- |
| 1 súbor       | Stiahnutie jedného PDF (napr. `document.pdf`)                |
| 2+ súborov    | Archív ZIP (`odt-converted.zip`) s jedným PDF na každý súbor |

## Prípady použitia

- Prevod dokumentov LibreOffice Writer do PDF na zdieľanie s používateľmi Microsoft Office
- Tvorba PDF pripravených na tlač z akademických prác napísaných vo formáte OpenDocument
- Hromadný prevod priečinka šablón ODT do PDF na distribúciu
- Generovanie PDF zo súborov ODT vytvorených automatizovanými systémami na tvorbu dokumentov

## Tipy

- Engine LibreOffice sa načíta pri prvom použití a pre ďalšie prevody sa uloží do vyrovnávacej pamäte. Prvé načítanie trvá niekoľko sekúnd, potom sú prevody rýchle.
- Zložité dokumenty s vloženými objektmi OLE alebo neobvyklými písmami sa môžu vykresliť mierne odlišne ako v desktopovom LibreOffice. Pred hromadným prevodom vyskúšajte vzorku.
- Pre dokumenty Word (`.doc`, `.docx`) použite radšej nástroj [Word do PDF](./word-to-pdf), ktorý tiež používa engine LibreOffice, no priamo prijíma formáty Microsoft.

## Súvisiace nástroje

- [Word do PDF](./word-to-pdf)
- [RTF do PDF](./rtf-to-pdf)
- [Text do PDF](./txt-to-pdf)
