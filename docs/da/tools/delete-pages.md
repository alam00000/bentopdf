---
title: Slet sider
description: Fjern bestemte sider fra en PDF efter sidetal, interval eller visuelt valg af miniaturer.
---

# Slet sider

Fjern uønskede sider fra et PDF-dokument. Angiv sider, der skal slettes, ved at skrive sidetal eller intervaller, eller klik direkte på sidernes miniaturer for at markere dem til fjernelse.

## Sådan fungerer det

1. Upload en PDF-fil. Værktøjet gengiver miniaturer af hver side.
2. Indtast de sider, der skal slettes, i tekstfeltet med intervalsyntaks (f.eks. `2, 5-8`), eller klik på miniaturer for at skifte dem.
3. Markerede sider fremhæves visuelt, så du kan bekræfte dit valg.
4. Klik på behandlingsknappen. Der oprettes en ny PDF uden de valgte sider.

## Funktioner

- Tekstbaseret sidevalg med intervalsyntaks (`2, 5-8, 12`)
- Visuelt miniaturegitter til sletning med klik
- Fremhævning i realtid af sider, der er markeret til sletning
- Inputvalidering mod det faktiske antal sider
- Bevarer alle ikke-slettede sider i deres oprindelige rækkefølge

## Anvendelser

- Fjern tomme sider eller fyldsider fra et skannet dokument
- Fjern forsider eller bilag, før du deler et dokument
- Ryd op i udkastsider, der ved en fejl blev liggende i en endelig PDF
- Fjern sider med følsomme oplysninger før distribution

## Tips

- Sletning af sider påvirker ikke de resterende siders indhold eller formatering. Resultatet er en tro kopi af originalen minus de fjernede sider.
- Hvis du vil beholde bestemte sider i stedet for at fjerne bestemte sider, er [Udtræk sider](./extract-pages) et bedre valg.
- Miniaturevisningen indlæses løbende, så store dokumenter forbliver responsive.

## Relaterede værktøjer

- [Udtræk sider](./extract-pages)
- [Duplikér og organisér](./organize-pdf)
- [Opdel PDF](./split-pdf)
