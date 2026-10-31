---
title: Bates-numrering
description: Tillämpa Bates-nummer på en eller flera PDF-filer med anpassningsbara mallar, nollutfyllnad, teckensnitt och placering.
---

# Bates-numrering

Bates-numrering stämplar löpande identifierare på varje sida i dina PDF-filer. Det är standardmetoden för att märka dokument i rättsliga processer, revisioner och efterlevnadsarbete. Verktyget stöder flera filer och anpassningsbara mallar, och ger antingen individuellt numrerade PDF-filer eller ett enda ZIP-arkiv.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer. Du kan dra flera filer samtidigt.
2. Välj en stilförinställning eller skapa en egen mall.
3. Konfigurera position, teckensnitt, storlek, färg och startnummer.
4. Klicka på **Tillämpa Bates-nummer** för att bearbeta.
5. En enskild fil laddas ner direkt. Flera filer laddas ner som ett ZIP-arkiv.

## Alternativ

- **Stilförinställning**: Välj bland inbyggda format:
  - Exhibit + Case + Bates + Page (t.ex. "Exhibit 1 Case XYZ 000001 Page 1")
  - Exhibit + Case + Bates (utan sidnummer)
  - Case + Bates
  - Endast Bates-nummer (t.ex. "000001")
  - Anpassad (skriv din egen mall)
- **Anpassa stil**: En mallsträng med platshållare: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Bates-utfyllnad**: Antal siffror (3 till 6) för Bates-nummer med inledande nollor. Visas bara i anpassat läge.
- **Position**: Sidhuvud eller sidfot, vänster, mitten eller höger.
- **Bates börjar från**: Det första Bates-numret. Standard är 1. Numreringen fortsätter över filerna.
- **Filräknaren börjar från**: Startnumret för platshållaren `[FILE]`.
- **Teckensnitt**: Helvetica, Times New Roman eller Courier.
- **Teckenstorlek**: Storleken på den stämplade texten.
- **Färg**: Färgväljare för texten i Bates-numret.

## Funktioner

- Liveförhandsvisning som visar hur Bates-numren ser ut över alla uppladdade filer
- Stöd för flera filer med sammanhängande numrering över dokumenten
- Ändra filernas ordning med dra och släpp för att styra numreringsföljden
- Sex positionsalternativ (sidhuvud/sidfot, vänster/mitten/höger)
- Adaptiv marginalberäkning som tar hänsyn till olika sidstorlekar
- ZIP-utdata för batcher med flera filer
- Mallplatshållare för maximal flexibilitet

## Användningsområden

- Stämpla bevisdokument inför rättegång med löpande exhibit-nummer
- Numrera revisionsunderlag som omfattar dussintals filer
- Tillämpa myndighetsreferensnummer på efterlevnadsdokumentation
- Märka bilagor till patentansökningar med ärendespecifika identifierare

## Tips

- Dra filerna i fillistan för att ändra ordning innan du bearbetar. Bates-numreringen följer denna ordning.
- Använd platshållaren `[FILENAME]` för att ta med det ursprungliga filnamnet i stämpeln, vilket gör det lättare att spåra sidor tillbaka till källdokumenten.
- Förhandsvisningsrutan uppdateras i realtid när du ändrar inställningar, så du kan kontrollera formatet innan du bearbetar.

## Relaterade verktyg

- [Sidnummer](./page-numbers)
- [Lägg till sidetiketter](./add-page-labels)
- [Sidhuvud och sidfot](./header-footer)
