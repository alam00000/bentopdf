---
title: Vis metadata
description: Undersøg alle metadataegenskaber i en PDF, herunder dokumentoplysninger, XMP-data og strukturelle detaljer.
---

# Vis metadata

Undersøg de skjulte egenskaber, der er indlejret i en PDF-fil. Værktøjet viser dokumentoplysninger (titel, forfatter, datoer), XMP-metadata, sidestørrelser og andre strukturelle data i et læsbart format.

## Sådan fungerer det

1. Upload en PDF-fil.
2. Værktøjet parser straks filen og viser alle tilgængelige metadata i overskuelige sektioner.
3. Gennemgå dokumentets infoordbog, XMP-metadatatræet og de strukturelle egenskaber.
4. Intet behandlingstrin er nødvendigt: metadata vises, så snart filen er indlæst.

## Funktioner

- Viser standardfelter for dokumentoplysninger: Title, Author, Subject, Keywords, Creator, Producer
- Viser oprettelses- og ændringsdatoer i et læsbart format
- Parser og gengiver hele XMP-metadatatræet med indlejrede navnerum
- Konverterer PDF-datoformatet (`D:20240101120000Z`) til læsbare datoer
- Organiseret i sammenklappelige sektioner for nem navigation

## Metadatasektioner

| Sektion                 | Indhold                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------- |
| **Dokumentoplysninger** | Title, Author, Subject, Keywords, Creator, Producer, Creation Date, Modification Date  |
| **XMP-metadata**        | Komplet XML-baseret metadatatræ med Dublin Core, XAP, PDF og brugerdefinerede navnerum |
| **Dokumentegenskaber**  | Sideantal, PDF-version, filstørrelse, krypteringsstatus                                |

## Anvendelsesområder

- Kontrol af, hvem der har skrevet en PDF, og hvornår den sidst blev ændret
- Bekræftelse af, at metadata er indstillet korrekt, før et dokument udgives
- Revision af PDF-filer af hensyn til privatlivet ved at kontrollere, hvilke personlige oplysninger der er indlejret
- Undersøgelse af, hvilken software der er brugt til at oprette eller ændre en PDF (via feltet Producer)
- Gennemgang af XMP-metadata i forbindelse med compliance for digital asset management

## Tips

- PDF-datostrenge, der begynder med `D:`, konverteres automatisk til din lokale tidszone.
- Hvis metadatafelter virker tomme, har PDF-skaberen blot ikke angivet dem. Ikke alle PDF-filer indeholder rige metadata.
- Brug [Redigér metadata](./edit-metadata) til at ændre metadata efter gennemgangen. Brug Fjern metadata til at fjerne dem helt.

## Relaterede værktøjer

- [Redigér metadata](./edit-metadata)
- [PDF OCG-lag](./pdf-layers)
- [Sammenlign PDF-filer](./compare-pdfs)
