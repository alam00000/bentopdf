---
title: XPS till PDF
description: Konvertera XPS- och OXPS-dokument till PDF-format i webbläsaren. Ingen uppladdning, ingen registrering, helt privat.
---

# XPS till PDF

Konvertera Microsoft XPS- och OXPS-dokument till vanliga PDF-filer. XPS (XML Paper Specification) var Microsofts svar på PDF, men stödet för det har minskat på de flesta plattformar. Det här verktyget gör dokumenten läsbara för alla igen.

## Format som stöds

| Format | Filändelse | Anmärkningar                                   |
| :----- | :--------- | :--------------------------------------------- |
| XPS    | `.xps`     | Ursprungligt Microsoft XPS-format              |
| OXPS   | `.oxps`    | Open XPS, varianten enligt standarden ECMA-388 |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp dina XPS-/OXPS-filer. Du kan välja flera filer samtidigt.
2. Gå igenom fillistan. Ta bort enskilda filer med papperskorgsikonen, eller klicka på **Lägg till fler filer** för att lägga till fler dokument.
3. Klicka på **Konvertera till PDF**. PyMuPDF-motorn bearbetar varje dokument lokalt i webbläsaren.
4. En enskild fil laddas ner direkt som PDF. Flera filer paketeras i ett ZIP-arkiv med namnet `xps-converted.zip`.

## Alternativ

Det här verktyget gör en direkt formatkonvertering utan ytterligare konfiguration. Utdata bevarar de ursprungliga sidmåtten, vektorgrafiken, typsnitten och bilderna från XPS-källan.

## Användningsområden

- Öppna XPS-filer från äldre Windows-system som använde XPS-skrivardrivrutinen som standard
- Konvertera OXPS-dokument från Windows 10/11 för att dela med macOS- eller Linux-användare
- Arkivera äldre XPS-filer i ett format som stöds bredare
- Göra XPS-baserade myndighets- eller företagsdokument tillgängliga för externa mottagare

## Tips

- Både `.xps` och `.oxps` hanteras automatiskt, så du kan blanda dem i samma batch.
- Om den ursprungliga XPS-filen skapades med en skrivardrivrutin för hög upplösning behåller den resulterande PDF:en den kvaliteten. Ingen omsampling sker.

## Relaterade verktyg

- [Word till PDF](./word-to-pdf)
- [XML till PDF](./xml-to-pdf)
