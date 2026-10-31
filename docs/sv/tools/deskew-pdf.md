---
title: Räta upp PDF
description: Räta automatiskt upp lutande sidor i skannade PDF-filer med OpenCV-skevhetsdetektering. Justerbara inställningar för tröskel och DPI.
---

# Räta upp PDF

Skannade dokument är sällan helt raka. Även en liten lutning gör OCR mindre exakt och utskrifter slarviga. Det här verktyget använder OpenCV:s bildbehandlingsalgoritmer för att upptäcka varje sidas skevhetsvinkel och rotera tillbaka den till vågrätt.

## Så fungerar det

1. Ladda upp en eller flera skannade PDF-filer.
2. Ange **Skevhetströskel**. Sidor med en upptäckt skevhet under detta värde lämnas orörda.
3. Välj **Bearbetningskvalitet (DPI)**. Högre DPI ger bättre detekteringsnoggrannhet men tar längre tid.
4. Klicka på **Räta upp PDF**.
5. Efter bearbetningen visar en resultatpanel varje sidas upptäckta vinkel och om den korrigerades.

## Alternativ

| Inställning          | Värden                    | Standard |
| -------------------- | ------------------------- | -------- |
| **Skevhetströskel**  | 0,1, 0,5, 1,0, 2,0 grader | 0,5      |
| **Bearbetnings-DPI** | 100, 150, 200, 300        | 150      |

## Så fungerar skevhetsdetektering

Verktyget återger varje sida som en bild med vald DPI och använder sedan OpenCV för att upptäcka dominerande linjevinklar i innehållet. Om den upptäckta skevheten överstiger tröskeln roteras sidan med den omvända vinkeln för att räta upp den. Sidor under tröskeln förs vidare oförändrade.

## Användningsfall

- Rensa upp batchskannade avtal eller juridiska dokument
- Förbereda skannade kvitton eller fakturor för OCR-bearbetning
- Räta upp sidor från en planskanner där pappret placerats ojämnt
- Förbättra den visuella kvaliteten på digitaliserat arkivmaterial

## Tips

- Sänk tröskeln till 0,1 grader om du behöver pixelperfekt justering för OCR.
- 150 DPI är snabbt och exakt för de flesta dokument. Använd 300 DPI för mycket liten text eller sidor med fina detaljer.
- Uträtning fungerar bäst på dokument med tydliga horisontella textrader. Det kan ha svårt med sidor som mest består av bilder eller diagonala designelement.

## Relaterade verktyg

- [Rasterisera PDF](./rasterize-pdf): konvertera den uträtade utdatan till en platt, bildbaserad PDF
- [Komprimera PDF](./compress-pdf): minska filstorleken efter uträtning
- [Reparera PDF](./repair-pdf): åtgärda strukturella problem i skannade PDF-filer
