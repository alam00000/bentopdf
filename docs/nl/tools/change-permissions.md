---
title: Rechten aanpassen
description: Stel gebruiksrechten van een PDF in of wijzig ze voor afdrukken, kopiëren, bewerken en annoteren. Gebruikt 256-bits AES-versleuteling.
---

# Rechten aanpassen

Bepaal precies wat ontvangers met je PDF mogen doen. Anders dan eenvoudige versleuteling, die het bestand alleen achter een wachtwoord zet, kun je met deze tool afdrukken, kopiëren, bewerken, annoteren, formulieren invullen, documentsamenstelling en pagina-extractie selectief toestaan of weigeren, allemaal afgedwongen met 256-bits AES-versleuteling.

## Zo werkt het

1. Upload een PDF-bestand.
2. Als de PDF al versleuteld is, voer je het **Huidige wachtwoord** in.
3. Stel een **Nieuw gebruikerswachtwoord** in (vereist om te openen) en/of een **Nieuw eigenaarswachtwoord** (bepaalt de rechten).
4. Zet afzonderlijke rechten aan of uit met de selectievakjes.
5. Klik op **Rechten aanpassen**.
6. Download de bijgewerkte PDF.

Als je beide velden voor een nieuw wachtwoord leeg laat, ontsleutelt de tool de PDF volledig en verwijdert alle versleuteling en beperkingen.

## Rechtenbeheer

| Recht                              | Wat het regelt                                                   |
| ---------------------------------- | ---------------------------------------------------------------- |
| **Afdrukken toestaan**             | Of het document mag worden afgedrukt                             |
| **Kopiëren toestaan**              | Of tekst en afbeeldingen mogen worden geselecteerd en gekopieerd |
| **Wijzigen toestaan**              | Of de inhoud van het document mag worden bewerkt                 |
| **Annoteren toestaan**             | Of opmerkingen, markeringen en stempels mogen worden toegevoegd  |
| **Formulieren invullen toestaan**  | Of interactieve formuliervelden mogen worden ingevuld            |
| **Documentsamenstelling toestaan** | Of pagina's mogen worden ingevoegd, verwijderd of gedraaid       |
| **Pagina-extractie toestaan**      | Of afzonderlijke pagina's mogen worden geëxtraheerd              |

Voor alle rechten is een eigenaarswachtwoord nodig om ze af te dwingen. Zonder eigenaarswachtwoord worden de rechtenvlaggen door de meeste PDF-lezers genegeerd.

## Hoe rechten werken in PDF

PDF-rechten maken deel uit van de versleutelingsspecificatie. Ze worden als bitvlaggen opgeslagen in het versleutelingswoordenboek en afgedwongen door conforme PDF-lezers. Het belangrijkste verschil:

- **Gebruikerswachtwoord**: nodig om het bestand überhaupt te openen.
- **Eigenaarswachtwoord**: nodig om rechten te wijzigen of beperkingen te verwijderen. Zonder dit wachtwoord bepalen de rechtenvlaggen welke handelingen de gebruiker mag uitvoeren.

Als je alleen een eigenaarswachtwoord instelt (geen gebruikerswachtwoord), kan iedereen het bestand openen, maar is hij beperkt tot de toegestane handelingen. Als je beide instelt, is voor het openen een wachtwoord nodig en gelden de beperkingen na verificatie.

## Toepassingen

- Een rapport verspreiden dat kan worden bekeken en afgedrukt, maar niet bewerkt of gekopieerd
- Een contractsjabloon delen die ontvangers kunnen invullen maar niet wijzigen
- Een PDF-catalogus publiceren waarin het kopiëren van afbeeldingen is uitgeschakeld
- Annotaties toestaan in een conceptversie ter beoordeling, terwijl structurele wijzigingen worden voorkomen

## Tips

- Stel altijd een eigenaarswachtwoord in, anders werkt het niet. Rechten zonder eigenaarswachtwoord zijn niet af te dwingen.
- Sommige PDF-tools van derden negeren rechtenvlaggen. Overweeg voor sterkere bescherming de PDF te rasteriseren of DRM te gebruiken.
- Gebruik deze tool om oude met RC4 versleutelde PDF's te upgraden naar AES-256.

## Gerelateerde tools

- [PDF versleutelen](./protect-pdf): eenvoudige wachtwoordbeveiliging zonder gedetailleerde rechten
- [PDF ontsleutelen](./unlock-pdf): versleuteling volledig verwijderen
- [Beperkingen verwijderen](./remove-restrictions): alle beperkingen verwijderen als je het eigenaarswachtwoord hebt
