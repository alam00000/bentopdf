---
title: PDF OCG-lager
description: Visa, växla, lägg till och ta bort Optional Content Group-lager (OCG) i ett PDF-dokument.
---

# PDF OCG-lager

Hantera Optional Content Groups (OCG), vanligen kallade "lager", i en PDF. Du kan växla lagrens synlighet, lägga till nya lager (även underlager), ta bort lager och spara den ändrade PDF-filen.

## Så fungerar det

1. Ladda upp en PDF-fil.
2. Klicka på bearbetningsknappen för att läsa in dokumentet med PyMuPDF-motorn.
3. Verktyget visar alla befintliga lager med synlighet, låsstatus och nästlad hierarki.
4. Använd kryssrutorna för att visa eller dölja lager. Låsta lager kan inte växlas.
5. Lägg till nya lager på översta nivån genom att skriva ett namn och klicka på lägg till-knappen, eller lägg till underlager under ett befintligt överordnat lager.
6. Ta bort lager som du inte längre behöver.
7. Klicka på **Spara** för att ladda ner den ändrade PDF-filen med dina lagerändringar.

## Funktioner

- Visar lagerhierarkin med korrekt indrag för nästlade lager
- Slå på eller av lagrets synlighet
- Indikator för låsta lager förhindrar oavsiktliga ändringar
- Lägg till lager på översta nivån eller underlager med egna namn
- Ta bort enskilda lager
- Sparar alla ändringar i en ny PDF-fil

## Användningsområden

- Växla synligheten för markeringslager i arkitekt- eller konstruktionsritningar
- Lägga till nya anteckningslager i ett designdokument med många lager
- Ta bort föråldrade lager från en mall innan den distribueras
- Undersöka vilka lager som finns i en komplex PDF från en tredje part

## Tips

- Om PDF-filen saknar lager visar verktyget ett tomt läge med en uppmaning att lägga till ett. Inte alla PDF-filer använder OCG-lager, de är vanligast i CAD-exporter och designfiler.
- Underlager visas med indrag under sitt överordnade lager. Du kan nästla lager till valfritt djup.
- Låsta lager visas med en låsikon och deras kryssrutor är inaktiverade. Låsningarna har angetts av PDF-filens skapare.

## Relaterade verktyg

- [Visa metadata](./view-metadata)
- [Redigera metadata](./edit-metadata)
- [Duplicera & organisera](./organize-pdf)
