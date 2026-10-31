---
title: Rastrovať PDF
description: Preveďte strany PDF na PDF založené na obrázkoch. Zlúčte všetky vrstvy, odstráňte vyberateľný text a ovládajte DPI a formát obrázkov.
---

# Rastrovať PDF

Rastrovanie prevedie každú stranu PDF na obrázok a tieto obrázky znovu zostaví do PDF. Výsledok vyzerá rovnako ako originál, ale neobsahuje žiadny vyberateľný text, interaktívne prvky ani upraviteľné vrstvy. Ide v podstate o kvalitnú fotokópiu.

## Ako to funguje

1. Nahrajte jeden alebo viac súborov PDF.
2. Nastavte **DPI** (rozlíšenie) rastrovaného výstupu.
3. Vyberte **Formát obrázka**: PNG pre bezstratovú kvalitu alebo JPEG pre menšie súbory.
4. Voliteľne zaškrtnite **Previesť na odtiene sivej**.
5. Kliknite na **Rastrovať PDF**. Viacero súborov sa stiahne ako ZIP.

## Možnosti

| Nastavenie         | Hodnoty                         | Predvolené |
| ------------------ | ------------------------------- | ---------- |
| **DPI**            | 72, 150, 200, 300, 600          | 150        |
| **Formát obrázka** | PNG (bezstratový), JPEG (menší) | PNG        |
| **Odtiene sivej**  | Zap./Vyp.                       | Vyp.       |

## Odporúčania pre DPI

- **72**: len na zobrazenie na obrazovke, najmenšia veľkosť súboru
- **150**: dobrá rovnováha na bežné použitie
- **200**: ostrejší text, stredná veľkosť súboru
- **300**: výstup v tlačovej kvalite
- **600**: vysoká kvalita na archiváciu alebo profesionálnu tlač

## Prípady použitia

- Zabránenie extrakcii textu z dôverných dokumentov pred zdieľaním
- Odstránenie problémov so závislosťou od písiem prevodom textu na pixely
- Vytvorenie „plochej“ verzie PDF so zložitými vrstvami alebo priehľadnosťou, ktorá sa v rôznych prehliadačoch zobrazuje rozdielne
- Príprava PDF pre systém, ktorý prijíma len vstup založený na obrázkoch
- Odstránenie skrytého obsahu (napríklad sledovaných zmien alebo údajov formulárov) zredukovaním PDF na čisté obrázky

## Tipy

- 150 DPI v PNG je spoľahlivé predvolené nastavenie. Vyššie choďte len vtedy, ak potrebujete tlačový výstup alebo priblíženie jemných detailov.
- JPEG vytvára výrazne menšie súbory, ale na ostrých hranách textu spôsobuje kompresné artefakty.
- Rastrovanie je nevratné: ak budete neskôr potrebovať upraviteľný text, ponechajte si pôvodné PDF.

## Súvisiace nástroje

- [Komprimovať PDF](./compress-pdf): zmenšenie veľkosti rastrovaného PDF
- [Zarovnať naklonené PDF](./deskew-pdf): narovnanie strán pred rastrovaním naskenovaných dokumentov
- [Písma do kriviek](./font-to-outline): prevod písiem na vektorové cesty, ak chcete zachovať škálovateľnosť
- [Zlúčiť vrstvy PDF](./flatten-pdf): zlúčenie formulárov bez prevodu na obrázky
