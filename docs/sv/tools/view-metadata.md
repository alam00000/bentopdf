---
title: Visa metadata
description: Granska alla metadataegenskaper i en PDF, inklusive dokumentinformation, XMP-data och strukturella detaljer.
---

# Visa metadata

Undersök de dolda egenskaperna som är inbäddade i en PDF-fil. Verktyget visar dokumentinformation (titel, författare, datum), XMP-metadata, sidmått och andra strukturella data i ett läsbart format.

## Så fungerar det

1. Ladda upp en PDF-fil.
2. Verktyget tolkar filen direkt och visar all tillgänglig metadata i ordnade avsnitt.
3. Gå igenom dokumentinformationsordlistan, XMP-metadataträdet och de strukturella egenskaperna.
4. Inget bearbetningssteg behövs, metadata visas så fort filen har lästs in.

## Funktioner

- Visar standardfälten för dokumentinformation: Title, Author, Subject, Keywords, Creator, Producer
- Visar skapande- och ändringsdatum i läsbart format
- Tolkar och visar hela XMP-metadataträdet med nästlade namnrymder
- Omvandlar PDF-datumformatet (`D:20240101120000Z`) till läsbara datum
- Ordnat i hopfällbara avsnitt för enkel navigering

## Metadataavsnitt

| Avsnitt                 | Innehåll                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------- |
| **Dokumentinformation** | Titel, författare, ämne, nyckelord, skapare, producent, skapandedatum, ändringsdatum   |
| **XMP-metadata**        | Fullständigt XML-baserat metadataträd med Dublin Core-, XAP-, PDF- och egna namnrymder |
| **Dokumentegenskaper**  | Antal sidor, PDF-version, filstorlek, krypteringsstatus                                |

## Användningsområden

- Kontrollera vem som skrev en PDF och när den senast ändrades
- Verifiera att metadata har angetts korrekt innan ett dokument publiceras
- Granska PDF:er ur integritetssynpunkt genom att se vilken personlig information som är inbäddad
- Undersöka vilken programvara som skapade eller ändrade en PDF (via fältet Producer)
- Gå igenom XMP-metadata för efterlevnad inom hantering av digitala tillgångar

## Tips

- PDF-datumsträngar som börjar med `D:` omvandlas automatiskt till formatet för din lokala tidszon.
- Om metadatafält verkar tomma har PDF:ens skapare helt enkelt inte angett dem. Alla PDF:er innehåller inte rik metadata.
- Om du vill ändra metadata efter granskningen, använd [Redigera metadata](./edit-metadata). Om du vill ta bort den helt, använd Ta bort metadata.

## Relaterade verktyg

- [Redigera metadata](./edit-metadata)
- [PDF OCG-lager](./pdf-layers)
- [Jämför PDF:er](./compare-pdfs)
