---
title: Fladgør PDF
description: Flad interaktive formularer og annotationer ud til statisk indhold. Gør formularfelter uredigerbare og brænder annotationer ind i siden.
---

# Fladgør PDF

Flatten slår interaktive elementer sammen med sidens indhold: formularfelter, rullelister, afkrydsningsfelter, annotationer, markeringer og påsatte noter. Det visuelle udseende forbliver det samme, men intet kan længere redigeres eller udtrækkes. Det svarer til at udskrive en udfyldt formular og scanne den ind igen, bortset fra at kvaliteten forbliver perfekt.

## Sådan fungerer det

1. Upload en eller flere PDF-filer.
2. Klik på **Fladgør PDF**.
3. En enkelt fil downloades direkte. Flere filer giver et ZIP-arkiv.

Værktøjet bruger pdf-lib til at flade formularfelter ud (via `form.flatten()`) og en dedikeret annotationsflader til at brænde annotationer ind i sidestrømmen. Begge handlinger sker i ét gennemløb.

## Hvad der flades ud

- **Formularfelter**: Tekstfelter, afkrydsningsfelter, radioknapper, rullelister, signaturfelter
- **Annotationer**: Kommentarer, markeringer, gennemstregning, understregning, påsatte noter, stempler, blækannotationer
- **Interaktive elementer**: Knapper, handlingsudløsere

## Hvad der forbliver uændret

- Tekstindhold (kan stadig markeres og søges i)
- Billeder og grafik
- Sidelayout og -mål
- Bogmærker og indholdsfortegnelse
- Hyperlinks (medmindre de er annotationsbaserede)

## Anvendelsesområder

- Låsning af en udfyldt formular, så modtagere ikke kan ændre de indsendte svar
- Klargøring af en PDF til arkivering, hvor interaktive elementer er unødvendige
- Rettelse af visningsproblemer, når annotationer gengives forskelligt i forskellige læsere
- Sikring af, at et underskrevet dokument ikke kan ændres, efter underskriften er påført
- Reduktion af filstørrelsen ved at fjerne formularfeltdefinitioner og annotationsobjekter

## Tips

- Flatten, når alle redigeringer er færdige. Der er ingen måde at gendanne en flattenet PDF på.
- Hvis du både vil flatten og fjerne metadata, JavaScript og vedhæftninger, så brug værktøjet Rens PDF i stedet. Det har flatten som en af sine indstillinger.
- Nogle PDF'er melder "ingen formular fundet". Det er normalt, hvis dokumentet kun har annotationer og ingen formularfelter.

## Relaterede værktøjer

- [Rens PDF](./sanitize-pdf): flatten formularer og fjern desuden metadata, scripts og mere
- [Rasterisér PDF](./rasterize-pdf): konvertér til billedbaseret PDF for maksimal flatten
- [Skrifttype til kontur](./font-to-outline): konvertér skrifttyper til vektorstier
- [Kryptér PDF](./protect-pdf): lås den fladgjorte PDF med en adgangskode
