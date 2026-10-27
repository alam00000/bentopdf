---
title: Beperkingen verwijderen
description: Verwijder wachtwoordbeveiliging, afdrukbeperkingen, bewerkingsvergrendelingen en kopieerbeperkingen uit PDF-bestanden.
---

# Beperkingen verwijderen

PDF's kunnen twee soorten wachtwoorden hebben: een gebruikerswachtwoord (nodig om het bestand te openen) en een eigenaarswachtwoord (bepaalt wat je ermee mag doen). Deze tool verwijdert beide, samen met alle bijbehorende beperkingen: afdrukken, bewerken, kopiëren en annotatievergrendelingen.

## Hoe het werkt

1. Upload een PDF-bestand.
2. Als de PDF een eigenaarswachtwoord heeft, voer je dat in bij het veld **Eigenaarswachtwoord**. Laat het leeg als de PDF alleen gebruiksbeperkingen zonder wachtwoord heeft.
3. Klik op **Beperkingen verwijderen**.
4. Download de PDF zonder beperkingen.

De tool gebruikt de vlaggen `--decrypt` en `--remove-restrictions` van QPDF om een schone kopie zonder beperkingen te maken.

## Wat wordt verwijderd

- Wachtwoordbeveiliging (zowel gebruikers- als eigenaarswachtwoorden)
- Afdrukbeperkingen
- Bewerkingsbeperkingen
- Beperkingen op het kopiëren van tekst en afbeeldingen
- Beperkingen op annotaties en opmerkingen
- Alle andere beveiligingsbeperkingen die in de PDF zijn vastgelegd

## Toepassingen

- Een PDF ontgrendelen die van jou is, maar waarvan je het wachtwoord jaren geleden hebt ingesteld
- Afdrukbeperkingen verwijderen uit een document waartoe je legitiem toegang hebt
- Kopiëren en plakken mogelijk maken in naslagmateriaal om aantekeningen te maken
- PDF's voorbereiden voor toegankelijkheidstools die geen beperkte documenten aankunnen

## Tips

- Je moet het eigenaarswachtwoord kennen als er een is ingesteld. Deze tool kraakt of brute-forcet geen wachtwoorden.
- Als je het bestand versleuteld wilt houden maar specifieke rechten wilt wijzigen, gebruik dan de tool Rechten Aanpassen.
- Het uitvoerbestand heeft geen enkele versleuteling: iedereen die het ontvangt kan het vrij openen.

## Gerelateerde tools

- [PDF ontgrendelen](./unlock-pdf): ontgrendel een PDF als je het gebruikerswachtwoord kent
- [PDF versleutelen](./protect-pdf): pas de versleuteling opnieuw toe met nieuwe instellingen
- [Rechten aanpassen](./change-permissions): wijzig selectief welke acties zijn toegestaan
