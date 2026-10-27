---
title: Sidehoved og sidefod
description: Tilføj tilpasselig sidehoved- og sidefodstekst til PDF-sider med dynamiske variabler for sidetal.
---

# Sidehoved og sidefod

Tilføj tekst i seks positioner på dine PDF-sider: sidehoved til venstre, i midten og til højre samt sidefod til venstre, i midten og til højre. Værktøjet understøtter dynamiske variabler for sidetal og samlet sideantal, så du kan oprette skabeloner som "Side 3 af 10", der opdateres automatisk for hver side.

## Sådan fungerer det

1. Upload din PDF-fil.
2. Indstillingspanelet vises med formateringskontroller og seks tekstfelter.
3. Indtast den ønskede tekst i en af sidehoved-/sidefodspositionerne.
4. Brug pladsholderne `{page}` og `{total}` til dynamisk sidenummerering.
5. Juster skriftstørrelse og skriftfarve, og begræns eventuelt til et bestemt sideinterval.
6. Klik på **Tilføj sidehoved og sidefod** for at behandle og downloade.

## Indstillinger

- **Sideinterval**: Begræns eventuelt, hvilke sider der får sidehoved og sidefod. Lad feltet stå tomt for at anvende det på alle sider. Format: "1-3, 5" (kommaseparerede intervaller).
- **Skriftstørrelse**: Mellem 6 og 24 punkter. Standard er 10.
- **Skriftfarve**: Vælg en vilkårlig farve med farvevælgeren.
- **Sidehoved venstre / midten / højre**: Tekstfelter øverst på hver side.
- **Sidefod venstre / midten / højre**: Tekstfelter nederst på hver side.

## Funktioner

- Seks uafhængige tekstpositioner pr. side
- Dynamisk `{page}`-variabel, der indsætter det aktuelle sidetal
- Dynamisk `{total}`-variabel, der indsætter det samlede sideantal
- Filtrering på sideinterval for at ramme bestemte sider
- Tilpasselig skriftstørrelse og farve
- Helvetica-skrifttype for et rent, professionelt resultat

## Anvendelsesområder

- Tilføjelse af "Side {page} af {total}" i midten af sidefoden i en rapport
- Placering af et firmanavn i sidehovedet til venstre og en dokumentdato i sidehovedet til højre
- Tilføjelse af fortrolighedsmeddelelser i sidefoden i juridiske dokumenter
- Stempling af dokumentrevisionsnumre på bestemte sideintervaller

## Tips

- Kombinér `{page}` og `{total}` i ét felt til formater som "Side {page} af {total}" eller "{page}/{total}".
- Du kan lade de fleste felter stå tomme og kun udfylde de positioner, du har brug for. Tomme felter springes blot over.
- Til mere komplekse sidehoveder med billeder eller logoer kan du overveje værktøjet [Tilføj vandmærke](./add-watermark) placeret øverst på siden.

## Relaterede værktøjer

- [Sidetal](./page-numbers)
- [Tilføj vandmærke](./add-watermark)
- [Bates-nummerering](./bates-numbering)
