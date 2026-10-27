---
title: Sanera PDF
description: Ta bort dolt och potentiellt farligt innehåll från PDF-filer, inklusive metadata, JavaScript, inbäddade filer, anteckningar och lager.
---

# Sanera PDF

PDF-filer kan innehålla mycket mer än det du ser på skärmen. Dold metadata, inbäddad JavaScript, filbilagor, formulärdata och lagerinformation kan läcka känsliga uppgifter eller utgöra säkerhetsrisker. Sanering tar bort allt detta och ger dig ett rent dokument som är säkert att dela offentligt.

## Så fungerar det

1. Ladda upp en PDF-fil.
2. Välj vilka element som ska tas bort i checklistan.
3. Klicka på **Sanera PDF**.
4. Ladda ned den rensade filen.

## Saneringsalternativ

Alla alternativ är aktiverade som standard. Avmarkera de du vill behålla.

| Alternativ                  | Vad som tas bort                                                    |
| --------------------------- | ------------------------------------------------------------------- |
| **Platta till formulär**    | Omvandlar interaktiva formulärfält till statiskt innehåll           |
| **Ta bort metadata**        | Tar bort författare, titel, skapandedatum, programinfo och XMP-data |
| **Ta bort anteckningar**    | Raderar kommentarer, markeringar, klisterlappar och markup          |
| **Ta bort JavaScript**      | Eliminerar inbäddade skript som kan köras vid öppning               |
| **Ta bort inbäddade filer** | Tar bort filbilagor som är inbäddade i PDF-filen                    |
| **Ta bort lager (OCG)**     | Plattar till valfria innehållsgrupper till ett enda lager           |
| **Ta bort länkar**          | Tar bort hyperlänkar och URL-referenser                             |
| **Ta bort strukturträd**    | Tar bort dokumentstrukturen som används för tillgänglighetstaggning |
| **Ta bort MarkInfo**        | Tar bort information om märkt innehåll                              |
| **Ta bort typsnitt**        | Tar bort inbäddad typsnittsdata (använd med försiktighet)           |

## Användningsområden

- Förbereda en PDF för offentlig publicering genom att ta bort intern metadata (författarnamn, programversioner, redigeringshistorik)
- Ta bort JavaScript från en PDF som mottagits från en opålitlig källa innan du öppnar den
- Rensa en PDF innan du skickar den till en kund som inte ska se inbäddade kommentarer eller formulärfältsnamn
- Ta bort dolda lager från en arkitektritning innan du delar slutversionen
- Uppfylla krav på dataminimering enligt integritetslagstiftning

## Tips

- Lämna "Ta bort typsnitt" avmarkerat om du inte är säker på att PDF-filen fortfarande renderas korrekt. Att ta bort typsnitt kan göra text osynlig i vissa läsare.
- Om du bara behöver ta bort metadata är det dedikerade verktyget Ta bort metadata snabbare och mer fokuserat.
- Sanering går inte att ångra. Behåll din originalfil.

## Relaterade verktyg

- [Ta bort metadata](./remove-metadata): ta bara bort metadata utan att röra annat innehåll
- [Platta till PDF](./flatten-pdf): platta specifikt till formulär och anteckningar
- [Skydda PDF](./protect-pdf): lägg till lösenordsskydd efter saneringen
- [Rasterisera PDF](./rasterize-pdf): den radikala lösningen, konvertera till bilder för att eliminera allt dolt innehåll
