---
title: CBZ do PDF
description: Prevádzajte archívy komiksov CBZ a CBR do PDF priamo v prehliadači. Zadarmo, súkromne, bez nahrávania.
---

# CBZ do PDF

Premeňte archívy komiksov na PDF. CBZ a CBR sú štandardné formáty digitálnych komiksov: ide len o archívy ZIP alebo RAR plné obrázkov. Tento nástroj extrahuje každú stranu, zachová poradie čítania a vytvorí čisté PDF, v ktorom sa každý obrázok stane stranou v plnej veľkosti.

## Podporované formáty

| Formát | Prípona | Poznámky                                                    |
| :----- | :------ | :---------------------------------------------------------- |
| CBZ    | `.cbz`  | Archív komiksu na báze ZIP (spracovaný lokálne cez pdf-lib) |
| CBR    | `.cbr`  | Archív komiksu na báze RAR (spracovaný enginom PyMuPDF)     |

Prevodník CBZ rozpozná v archíve obrázky JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF, HEIC a JXL. Neštandardné formáty sa pred vložením automaticky prevedú na PNG.

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite súbory CBZ či CBR. V jednej dávke môžete kombinovať oba formáty.
2. Skontrolujte zoznam súborov. Odstráňte tie, ktoré nepotrebujete, alebo kliknite na **Pridať ďalšie súbory**.
3. Kliknite na **Previesť do PDF**. Pri súboroch CBZ nástroj rozbalí archív, zoradí obrázky podľa názvu v prirodzenom poradí, zistí skutočný formát každého obrázka a vloží ich do PDF pomocou pdf-lib. Súbory CBR sa namiesto toho spracujú enginom PyMuPDF.
4. Jeden súbor sa stiahne ako PDF. Viac súborov vytvorí archív ZIP s názvom `comic-converted.zip`.

## Možnosti

Nie je potrebné nič nastavovať. Každý obrázok sa stane stranou s rozmermi zodpovedajúcimi originálu, takže dvojstrany zostanú široké a jednotlivé strany úzke.

## Prípady použitia

- Čítanie komiksov v aplikácii na tablete alebo telefóne, ktorá podporuje PDF, ale nie CBZ/CBR
- Tlač vybraných strán z digitálneho komiksu
- Archivácia zbierky komiksov vo formáte, ktorý otvorí každý prehliadač súborov
- Zdieľanie komiksu s niekým, kto nemá špeciálnu čítačku komiksov

## Tipy

- Obrázky v archíve sa zoraďujú prirodzeným poradím (takže `page2.jpg` je pred `page10.jpg`). Pre správne poradie strán pomenujte súbory s konzistentným číslovaním.
- Prevodník rozpoznáva formáty obrázkov podľa binárnych podpisov, nie podľa prípon. PNG omylom pomenovaný `.jpg` sa aj tak vloží správne.
- Súbory CBZ sa spracúvajú úplne v prehliadači bez načítania enginu PyMuPDF, takže sa prevádzajú rýchlejšie než súbory CBR.

## Súvisiace nástroje

- [EPUB do PDF](./epub-to-pdf)
- [MOBI do PDF](./mobi-to-pdf)
- [Obrázky do PDF](./image-to-pdf)
