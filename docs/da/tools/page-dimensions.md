---
title: Sidestørrelser
description: Analysér PDF-sidestørrelser, orienteringer, billedformater og rotation. Find dokumenter med blandede størrelser, og eksportér data til CSV.
---

# Sidestørrelser

Et diagnosticeringsværktøj, der læser hver side i din PDF og rapporterer dens præcise mål, orientering, standardstørrelsesnavn, billedformat, areal og rotation. Nyttigt til at opdage sider i blandede størrelser før udskrivning eller til at dokumentere egenskaberne for en PDF, du har modtaget.

## Sådan fungerer det

1. Upload en PDF-fil. Analysen starter automatisk, så der er ingen knap at trykke på.
2. Et oversigtspanel viser det samlede sideantal, antallet af unikke sidestørrelser, og om dokumentet har blandede størrelser.
3. Gennemse den fulde resultattabel med detaljer for hver side.
4. Skift visningsenhed mellem punkter, tommer, millimeter eller pixel.
5. Klik på **Eksportér til CSV** for at gemme dataene.

## Rapporterede felter

| Kolonne           | Beskrivelse                                            |
| ----------------- | ------------------------------------------------------ |
| Side nr.          | Fortløbende sidetal                                    |
| Mål               | Bredde x højde i den valgte enhed                      |
| Standardstørrelse | Matchet navn (A4, Letter osv.) eller "Brugerdefineret" |
| Orientering       | Stående eller liggende                                 |
| Billedformat      | Forholdet mellem bredde og højde som decimaltal        |
| Areal             | Sidens areal i den valgte enhed i anden                |
| Rotation          | Sidens rotation i grader                               |

## Funktioner

- Automatisk genkendelse af standardpapirstørrelser (A3, A4, A5, Letter, Legal, Tabloid og flere)
- Advarsel om blandede størrelser med en oversigt over, hvilke størrelser der forekommer, og hvor mange sider der bruger hver
- Enhedsomregning mellem punkter, tommer, millimeter og pixel (ved 96 PPI)
- CSV-eksport til brug i regneark eller dokumentationssystemer

## Anvendelser

- Kontrollere, at alle sider er A4, før et dokument sendes til et trykkeri
- Finde ud af, hvorfor en flettet PDF udskrives med uventede margener på bestemte sider
- Dokumentere sidelayoutet i et stort PDF-arkiv til metadataoptegnelser
- Finde roterede sider, der skal rettes

## Tips

- Hvis oversigten viser "Blandede størrelser", kan du bruge værktøjet Ret sidestørrelse til at standardisere før udskrivning.
- Rotationsfeltet hjælper med at finde sider, der vises korrekt, men har en rotationsattribut forskellig fra nul, hvilket kan give problemer i nogle arbejdsgange.

## Relaterede værktøjer

- [Ret sidestørrelse](./fix-page-size): standardisér sider, når du har fundet blandede størrelser
- [Komprimer PDF](./compress-pdf): optimér PDF'en, når sideproblemerne er rettet
- [Roter PDF](./rotate-pdf): ret roterede sider
