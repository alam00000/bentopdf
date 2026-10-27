---
title: PDF platmaken
description: Maak interactieve formulieren en aantekeningen plat tot statische inhoud. Formuliervelden worden niet-bewerkbaar en aantekeningen worden in de pagina ingebakken.
---

# PDF platmaken

Platmaken voegt interactieve elementen, zoals formuliervelden, keuzelijsten, selectievakjes, aantekeningen, markeringen en plaknotities, rechtstreeks samen met de pagina-inhoud. Het uiterlijk blijft gelijk, maar niets is nog bewerkbaar of uitleesbaar. Het is het PDF-equivalent van een ingevuld formulier afdrukken en weer inscannen, alleen blijft de kwaliteit perfect.

## Zo werkt het

1. Upload een of meer PDF-bestanden.
2. Klik op **PDF platmaken**.
3. Eén bestand wordt direct gedownload. Meerdere bestanden leveren een ZIP-archief op.

De tool gebruikt pdf-lib om formuliervelden plat te maken (via `form.flatten()`) en een aparte aantekeningenverwerker om aantekeningen in de paginastroom in te bakken. Beide bewerkingen gebeuren in één keer.

## Wat wordt platgemaakt

- **Formuliervelden**: Tekstvelden, selectievakjes, keuzerondjes, keuzelijsten, handtekeningvelden
- **Aantekeningen**: Opmerkingen, markeringen, doorhalingen, onderstrepingen, plaknotities, stempels, inktaantekeningen
- **Interactieve elementen**: Knoppen, actietriggers

## Wat ongewijzigd blijft

- Tekstinhoud (blijft selecteerbaar en doorzoekbaar)
- Afbeeldingen en afbeeldingselementen
- Pagina-indeling en afmetingen
- Bladwijzers en inhoudsopgave
- Hyperlinks (tenzij ze op aantekeningen zijn gebaseerd)

## Toepassingen

- Een ingevuld formulier vergrendelen zodat ontvangers de ingediende antwoorden niet kunnen wijzigen
- Een PDF voorbereiden voor archivering waarbij interactieve elementen niet nodig zijn
- Weergaveproblemen oplossen doordat aantekeningen in verschillende viewers anders worden getoond
- Zorgen dat een ondertekend document na het plaatsen van de handtekening niet meer kan worden gewijzigd
- De bestandsgrootte verkleinen door formulierveldedefinities en aantekeningobjecten te verwijderen

## Tips

- Maak pas plat als alle bewerkingen klaar zijn. Platmaken is niet ongedaan te maken.
- Wil je platmaken en ook metadata, JavaScript en bijlagen verwijderen, gebruik dan de tool PDF opschonen: platmaken zit daar als optie in.
- Sommige PDF's melden "geen formulier gevonden". Dat is normaal als het document alleen aantekeningen en geen formuliervelden heeft.

## Gerelateerde tools

- [PDF opschonen](./sanitize-pdf): formulieren platmaken plus metadata, scripts en meer verwijderen
- [PDF rasteriseren](./rasterize-pdf): omzetten naar een PDF op afbeeldingsbasis voor maximaal platmaken
- [Lettertype naar contour](./font-to-outline): lettertypen omzetten naar vectorpaden
- [PDF versleutelen](./protect-pdf): beveilig de platgemaakte PDF met een wachtwoord
