---
title: Ta bort metadata
description: Ta bort all dold metadata från PDF-filer, inklusive författare, titel, skapandedatum, producent, XMP-data och dokument-ID.
---

# Ta bort metadata

Varje PDF bär metadata som kan avslöja vem som skapade den, vilken programvara som användes, när den senast ändrades och mer. Det här verktyget tar bort allt: infoordlistan, XMP-metadataströmmar, dokument-ID och programspecifik data, så att dokumentet blir rent och utan spår av sitt ursprung.

## Så fungerar det

1. Ladda upp en PDF-fil.
2. Klicka på **Ta bort metadata**.
3. Ladda ned den rensade filen.

Inga alternativ att konfigurera. Verktyget är grundligt med flit: det rensar allt.

## Vad som tas bort

- **Fält i infoordlistan**: Titel, Författare, Ämne, Nyckelord, Skapare, Producent, skapandedatum, ändringsdatum
- **XMP-metadataström**: XML-baserat metadatablock som lagras i dokumentkatalogen
- **Dokument-ID**: Unika identifierare i PDF-trailern som kan användas för att spåra ett dokument mellan system
- **PieceInfo**: Programspecifik metadata som läggs till av program som Illustrator eller InDesign

## Vad som finns kvar

- Allt synligt sidinnehåll (text, bilder, grafik)
- Formulärfält och anteckningar
- Bokmärken och länkar
- Själva dokumentstrukturen

## Användningsområden

- Ta bort ditt namn och din organisation från ett dokument innan du publicerar det anonymt
- Ta bort tidsstämplar som avslöjar när ett dokument förbereddes
- Rensa producentsträngar som visar vilken PDF-programvara du använder
- Förbereda dokument för myndighetsinlämningar som kräver PDF-filer utan metadata
- Ta bort spår av redigeringshistorik innan du delar ett dokument externt

## Tips

- Använd verktyget Visa metadata först för att se exakt vilken metadata din PDF innehåller innan du tar bort den.
- Om du behöver ta bort metadata _och_ JavaScript, anteckningar och inbäddade filer, använd Sanera PDF för en grundligare rensning.
- Borttagning av metadata är permanent. Behåll originalet om du kan behöva datan senare.

## Relaterade verktyg

- [Sanera PDF](./sanitize-pdf): ta bort metadata samt skript, bilagor och mer
- [Skydda PDF](./protect-pdf): skydda den rensade PDF-filen med ett lösenord
- [Komprimera PDF](./compress-pdf): borttagning av metadata kan minska filstorleken något, komprimera för större besparing
