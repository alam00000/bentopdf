---
title: PDF do CBZ
description: Preveďte PDF na súbor CBZ (Comic Book Archive) pre čítačky komiksov ako Komga, Kavita, CDisplayEx a Calibre.
---

# PDF do CBZ

Prevedie PDF na súbor CBZ (Comic Book ZIP), štandardný formát digitálnych komiksov a mangy. Každá strana PDF sa stane obrázkom v archíve. Nástroj kvôli maximálnej kompatibilite generuje metadáta v troch formátoch: ComicInfo.xml, metadata.opf a ComicBookInfo JSON.

## Ako to funguje

1. Nahrajte PDF kliknutím na oblasť nahrávania alebo presunutím súboru do nej.
2. Zvoľte formát obrázkov, kvalitu, mierku a voliteľné metadáta.
3. Kliknutím na **Previesť** vytvoríte súbor CBZ.
4. Súbor `.cbz` sa stiahne automaticky.

## Možnosti

| Možnosť          | Hodnoty         | Predvolené | Popis                                                                                          |
| ---------------- | --------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| Formát obrázkov  | JPEG, PNG, WebP | JPEG       | JPEG pre farebné komiksy, PNG pre bezstratovú čiernobielu mangu, WebP pre najlepšiu kompresiu. |
| Kvalita          | 50–100%         | 85%        | Riadi kompresiu JPEG/WebP. Pri PNG je skrytá (vždy bezstratové).                               |
| Mierka           | 1.0x–4.0x       | 2.0x       | Vyššia mierka vytvára ostrejšie obrázky pre obrazovky s vysokým rozlíšením.                    |
| Odtiene sivej    | Zap./Vyp.       | Vyp.       | Prevedie strany do odtieňov sivej. Zmenšuje súbor pri čiernobielom obsahu.                     |
| Režim manga      | Zap./Vyp.       | Vyp.       | Nastaví v metadátach smer čítania sprava doľava.                                               |
| Zahrnúť metadáta | Zap./Vyp.       | Zap.       | Vloží ComicInfo.xml, metadata.opf a ComicBookInfo JSON.                                        |

## Polia metadát

Keď sú metadáta zapnuté, môžete vyplniť:

- **Názov**: Automaticky zistený z názvu súboru PDF.
- **Séria**: Názov série (napr. „Naruto“).
- **Číslo (#)**: Číslo vydania v rámci série.
- **Zväzok (Vol.)**: Číslo zväzku.
- **Autor(i)**: Meno scenáristu alebo tvorcu.
- **Vydavateľ**: Vydavateľská spoločnosť.
- **Značky / Žáner**: Značky oddelené čiarkami (napr. „Akcia, Dobrodružstvo“).
- **Rok vydania**: Rok vydania (1900–2100).
- **Hodnotenie**: Hodnotenie komunity od 0 do 5.

## Kompatibilita metadát

Nástroj zapisuje metadáta v troch formátoch, aby ich našla každá čítačka:

| Formát             | Umiestnenie        | Podporuje                                   |
| ------------------ | ------------------ | ------------------------------------------- |
| ComicInfo.xml      | Súbor v ZIP        | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | Súbor v ZIP        | Calibre                                     |
| ComicBookInfo JSON | Pole komentára ZIP | Calibre (záloha)                            |

## Výstupný formát

- `filename.cbz`: Archív ZIP s očíslovanými obrázkami strán a súbormi metadát.

Obrázky strán sú pomenované číslami doplnenými nulami (`01.jpg`, `02.jpg` atď.), aby ich čítačky zobrazili v správnom poradí.

## Prípady použitia

- Prevod PDF s mangou alebo komiksami na použitie v čítačkách komiksov.
- Budovanie digitálnej knižnice komiksov v Komga, Kavita alebo Calibre.
- Prevod naskenovaných komiksov do formátu vhodného na čítanie.
- Zdieľanie komiksov vo formáte, ktorý zachová smer čítania a metadáta.

## Tipy

- Pre farebné komiksy použite **JPEG** a pre čiernobielu mangu **PNG**, PNG komprimuje čiernobiely obsah veľmi efektívne.
- Pri mange zapnite **Odtiene sivej**, výrazne tým zmenšíte súbor.
- Vyplňte polia **Séria** a **Číslo**, aby správcovia knižníc (Komga, Calibre) mohli vašu zbierku usporiadať automaticky.
- **WebP** ponúka najlepšiu kompresiu, no staršie čítačky komiksov ho nemusia podporovať.

## Súvisiace nástroje

- [PDF do JPG](./pdf-to-jpg)
- [PDF do PNG](./pdf-to-png)
- [PDF do TIFF](./pdf-to-tiff)
- [Extrahovať obrázky](./extract-images)
