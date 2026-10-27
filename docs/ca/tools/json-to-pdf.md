---
title: JSON a PDF
description: Reconstrueix fitxers PDF a partir del format JSON de BentoPDF. Converteix les exportacions JSON de nou en els documents PDF originals.
---

# JSON a PDF

Reconstrueix documents PDF a partir de fitxers JSON creats prèviament amb l'eina **PDF a JSON** de BentoPDF. És una eina de conversió d'anada i tornada: agafa la representació estructurada en JSON d'un PDF i en reconstrueix el document original.

::: warning
Aquesta eina només accepta fitxers JSON generats pel convertidor PDF a JSON de BentoPDF. Els fitxers JSON estàndard d'API, bases de dades o altres eines no són compatibles.
:::

## Formats compatibles

| Entrada | Descripció                                               |
| :------ | :------------------------------------------------------- |
| `.json` | Fitxers JSON exportats per l'eina PDF a JSON de BentoPDF |

## Com funciona

1. Fes clic a l'àrea de càrrega o arrossega-hi un o més fitxers JSON.
2. La llista de fitxers mostra cada fitxer seleccionat amb la seva mida.
3. Fes clic a **Converteix a PDF**. L'eina processa tots els fitxers amb un Web Worker i el motor CPDF.
4. El resultat es baixa com a `jsons-to-pdf.zip`, que conté un PDF per cada fitxer JSON d'entrada.

La conversió s'executa en un Web Worker en segon pla, de manera que la interfície continua responent bé fins i tot amb fitxers grans.

## Opcions

Aquesta eina no té opcions configurables. L'estructura del JSON determina completament el PDF resultant.

## Sortida

Quan converteixes diversos fitxers JSON, els resultats es lliuren en un arxiu ZIP. Cada PDF rep el nom del seu fitxer JSON d'origen (p. ex., `report.json` passa a ser `report.pdf`).

## Casos d'ús

- Restaurar PDF des d'una còpia de seguretat o un flux d'arxiu basat en JSON
- Fer passar un PDF per JSON per inspeccionar-lo i tornar-lo a convertir en PDF
- Reconstruir documents després de modificacions programàtiques de l'estructura JSON
- Verificar que una exportació de PDF a JSON ha capturat tot el contingut del document tornant-la a convertir

## Consells

- Si necessites convertir dades JSON arbitràries (com respostes d'API o fitxers de configuració) en un PDF amb format, l'eina [Text a PDF](./txt-to-pdf) és més adequada. Enganxa el JSON com a text i es renderitzarà amb el format correcte.
- El motor WebAssembly CPDF ha d'estar disponible perquè aquesta eina funcioni. Les instàncies autoallotjades necessiten tenir configurats els fitxers WASM de CPDF.

## Eines relacionades

- [Text a PDF](./txt-to-pdf)
- [Markdown a PDF](./markdown-to-pdf)
- [CSV a PDF](./csv-to-pdf)
