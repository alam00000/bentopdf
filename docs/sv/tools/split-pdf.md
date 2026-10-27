---
title: Dela PDF
description: Dela en PDF i mindre filer efter sidintervall, visuellt urval, bokmärken, jämna/udda sidor eller fasta intervall.
---

# Dela PDF

Dela upp en PDF i mindre dokument med ett av sex delningslägen. Från enkla sidintervall till delning baserad på bokmärken, det här verktyget hanterar alla scenarier för att dela ett dokument.

## Så fungerar det

1. Ladda upp en enskild PDF-fil.
2. Välj ett delningsläge i listrutan.
3. Konfigurera lägets alternativ (sidintervall, urval osv.).
4. Klicka på bearbetningsknappen.
5. Resultatet laddas ned som en enskild PDF eller ett ZIP-arkiv beroende på läge och inställningar.

## Delningslägen

| Läge               | Beskrivning                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Intervall**      | Ange sidintervall som `1-3, 5, 8-10`. Flera intervall ger separata PDF-filer i en ZIP. Ett enda intervall ger en PDF. |
| **Visuellt urval** | Bläddra bland sidminiatyrer och klicka för att välja de sidor du vill ha. Valda sidor extraheras till en ny PDF.      |
| **Jämna / udda**   | Extrahera enbart jämnt numrerade eller udda numrerade sidor.                                                          |
| **Alla sidor**     | Dela varje sida till en egen PDF-fil, nedladdad som ZIP.                                                              |
| **Bokmärken**      | Dela vid bokmärkesgränser. Välj bokmärkesnivå för att styra var delningarna sker.                                     |
| **Var N:e sida**   | Dela i delar om N sidor vardera (t.ex. var 5:e sida). Den sista delen kan ha färre sidor.                             |

## Funktioner

- Sex olika delningslägen som täcker i princip alla användningsfall
- Visuell sidväljare med miniatyrer som laddas vid behov
- Bokmärkesmedveten delning med nivåfiltrering
- ZIP-utdata som alternativ för lägena intervall och visuellt urval
- Hanterar sidintervall med blandad syntax (`1-3, 5, 8-10`)
- Varning när delning efter N sidor ger ojämna delar

## Användningsområden

- Extrahera ett specifikt kapitel eller avsnitt ur ett stort dokument
- Separera udda och jämna sidor för arbetsflöden med dubbelsidig utskrift
- Dela en bok-PDF i enskilda kapitelfiler vid bokmärkesgränser
- Isolera specifika sidor (som en signatursida) från ett kontrakt
- Dela en sammanställd rapport i filer per avsnitt för distribution

## Tips

- Flera sidintervall separerade med kommatecken (t.ex. `1-5, 10-15, 20-25`) ger separata PDF-filer, en per intervall, samlade i en ZIP.
- Bokmärkesläget kräver att PDF-filen faktiskt innehåller bokmärken. Om inga hittas får du ett felmeddelande.
- Kryssrutan "Ladda ned som ZIP" i lägena Intervall och Visuellt urval låter dig få enskilda PDF-filer per sida i stället för en samlad fil.

## Relaterade verktyg

- [Sammanfoga PDF](./merge-pdf)
- [Extrahera sidor](./extract-pages)
- [Ta bort sidor](./delete-pages)
- [PDF-multiverktyg](./pdf-multi-tool)
