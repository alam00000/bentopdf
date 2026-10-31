---
title: Ordena les cares d'un escaneig a doble cara
description: Reordena els PDF d'escanejos a doble cara que tenen les pàgines anteriors i les posteriors en blocs separats, i els posa en l'ordre correcte de cara i revers.
---

# Ordena les cares d'un escaneig a doble cara

Aquesta eina està pensada per als fluxos d'escaneig amb alimentador automàtic en què un PDF conté dos blocs de pàgines:

- primer, totes les cares anteriors
- després, totes les cares posteriors

En lloc de dividir i tornar a muntar manualment, l'eina intercala els dos blocs en l'ordre natural de lectura: cara 1, revers 1, cara 2, revers 2, i així successivament.

## Com funciona

1. Puja un sol PDF creat a partir de l'escaneig d'una pila a doble cara.
2. Defineix el punt de divisió on acaba el bloc de cares anteriors.
3. Tria com es tracta el bloc de reversos:
   - **Inverteix el bloc de reversos** (habitual quan la pila es gira abans d'escanejar els reversos)
   - **Mantén el bloc de reversos tal com està**
4. Fes clic a **Ordena les cares del PDF** per baixar el resultat reordenat.

## Opcions

- **Detecta automàticament el punt de divisió (meitat)**: defineix el punt de divisió a `ceil(totalPages / 2)`.
- **Avís de pàgines senars**: avisa quan el total de pàgines és senar (sovint és un desajust de l'escaneig).
- **Confirmació de blocs desiguals**: demana confirmació quan les mides dels blocs de cares i reversos són diferents.
- **Exportació agrupada**: divideix el resultat ordenat en PDF separats segons el nombre de pàgines del document original i el baixa com a ZIP.

## Comportament de la sortida

- **Per defecte**: un PDF de sortida (un PDF d'entrada, un PDF de sortida).
- **Mode agrupat**: la sortida es divideix en fragments segons el valor de pàgines per document; si es produeixen diversos fragments, es baixen en un sol ZIP, i si no, es baixa un únic PDF.

Si les mides dels blocs són desiguals, primer s'ordenen les pàgines aparellades i les pàgines sense parella restants s'afegeixen al final.

## Casos d'ús habituals

- Restaurar l'ordre després d'escanejar una pila de formularis a doble cara en dues passades.
- Reconstruir paquets de cara i revers a partir d'escàners d'oficina que generen primer totes les cares i després tots els reversos.
- Postprocessar escanejos d'arxiu abans de dividir-los en fitxers per document.

## Consells

- La majoria dels lots a doble cara haurien de tenir un nombre total de pàgines parell.
- Si el resultat sembla invertit als reversos, canvia entre **Inverteix el bloc de reversos** i **Mantén el bloc de reversos tal com està**.
- Per a originals de 2 pàgines (cara i revers), fes servir l'exportació agrupada amb `2` pàgines per document.

## Eines relacionades

- [Alterna i barreja pàgines](./alternate-merge)
- [Divideix PDF](./split-pdf)
- [Fusiona PDF](./merge-pdf)
- [Duplica i organitza](./organize-pdf)
