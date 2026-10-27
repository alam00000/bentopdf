---
title: Dimensions de pàgina
description: Analitza les mides, les orientacions, les proporcions i la rotació de les pàgines d'un PDF. Detecta documents amb mides mixtes i exporta les dades a CSV.
---

# Dimensions de pàgina

Una eina de diagnòstic que llegeix cada pàgina del PDF i en informa de les dimensions exactes, l'orientació, el nom de la mida estàndard, la proporció, l'àrea i la rotació. És útil per detectar pàgines de mides diferents abans d'imprimir o per documentar les propietats d'un PDF que has rebut.

## Com funciona

1. Carrega un fitxer PDF. L'anàlisi comença automàticament, sense cap botó per prémer.
2. Un quadre de resum mostra el total de pàgines, el nombre de mides de pàgina úniques i si el document té mides mixtes.
3. Consulta la taula completa de resultats amb els detalls de cada pàgina.
4. Canvia les unitats de visualització entre punts, polzades, mil·límetres o píxels.
5. Fes clic a **Exporta a CSV** per desar les dades.

## Camps de l'informe

| Columna        | Descripció                                             |
| -------------- | ------------------------------------------------------ |
| Pàg. núm.      | Número de pàgina correlatiu                            |
| Dimensions     | Amplada x Alçada en la unitat seleccionada             |
| Mida estàndard | Nom coincident (A4, Letter, etc.) o "Personalitzada"   |
| Orientació     | Vertical o Horitzontal                                 |
| Proporció      | Relació entre amplada i alçada en decimal              |
| Àrea           | Àrea de la pàgina en la unitat seleccionada al quadrat |
| Rotació        | Rotació de la pàgina en graus                          |

## Característiques

- Detecció automàtica de mides de paper estàndard (A3, A4, A5, Letter, Legal, Tabloid i més)
- Avís de document amb mides mixtes amb el detall de quines mides apareixen i quantes pàgines n'utilitzen cadascuna
- Conversió d'unitats entre punts, polzades, mil·límetres i píxels (a 96 PPI)
- Exportació a CSV per utilitzar-la en fulls de càlcul o sistemes de documentació

## Casos d'ús

- Verificar que totes les pàgines són A4 abans de lliurar un document a una impremta
- Diagnosticar per què un PDF fusionat s'imprimeix amb marges inesperats en algunes pàgines
- Documentar el disseny de pàgina d'un gran arxiu de PDF per als registres de metadades
- Identificar pàgines girades que cal corregir

## Consells

- Si el resum mostra "Mides mixtes", utilitza l'eina Uniformitza la mida de pàgina per estandarditzar abans d'imprimir.
- El camp de rotació ajuda a identificar pàgines que es mostren correctament però tenen un atribut de rotació diferent de zero, cosa que pot causar problemes en alguns fluxos de treball.

## Eines relacionades

- [Uniformitza la mida de pàgina](./fix-page-size): estandarditza les pàgines després d'identificar mides mixtes
- [Comprimeix PDF](./compress-pdf): optimitza el PDF després de corregir els problemes de pàgina
- [Gira PDF](./rotate-pdf): corregeix les pàgines girades
