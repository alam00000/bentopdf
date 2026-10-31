---
title: Edita els marcadors
description: Afegeix, edita, importa, exporta i elimina els marcadors d'un PDF amb un editor visual i compatibilitat amb CSV/JSON.
---

# Edita els marcadors

L'editor de marcadors et dona control total sobre els marcadors de navegació d'un PDF (també anomenats esquema). Pots afegir-ne de nous, editar els existents, reorganitzar la jerarquia i importar o exportar les dades dels marcadors en format CSV i JSON.

## Com funciona

1. Puja el PDF fent clic o arrossegant un fitxer a la zona de càrrega.
2. Si vols, marca **Extreu automàticament els marcadors existents** per carregar l'arbre de marcadors actual del document.
3. L'editor s'obre amb una vista dividida: el visor de PDF a l'esquerra i el tauler de marcadors a la dreta.
4. Escriu el títol d'un marcador i fes clic a **Afegeix a la pàgina** per crear un marcador que apunti a la pàgina actual.
5. Fes servir els botons de la barra d'eines per reorganitzar, aplicar estil o eliminar marcadors.
6. Fes clic a **Desa el PDF amb els marcadors** per baixar el fitxer actualitzat.

## Funcions

- Visor de PDF visual amb navegació per pàgines, controls de zoom i camp per anar a una pàgina
- Afegeix marcadors a qualsevol pàgina amb un sol clic
- Fes clic directament al PDF per definir una destinació exacta del marcador (mode de selecció)
- Jerarquia de marcadors imbricats amb reordenació per arrossegament
- Operacions per lots: selecciona diversos marcadors per canviar-ne el color o l'estil, o eliminar-los alhora
- Cerca de marcadors per trobar ràpidament entrades en arbres grans
- Suport de desfer i refer per a tots els canvis
- Importa marcadors des de fitxers CSV (títol, pàgina, nivell) o JSON
- Exporta marcadors a CSV o JSON per editar-los externament
- Estil dels marcadors: color (vermell, blau, verd, groc, lila) i estil de la lletra (negreta, cursiva, negreta cursiva)
- Navegació ràpida: desplaça't per les pàgines amb les tecles de pàgina amunt i avall

## Opcions

- **Extreu automàticament els marcadors existents**: quan està marcada, l'eina llegeix i mostra els marcadors actuals del PDF en carregar-lo.
- **Mode per lots**: activa-ho per seleccionar diversos marcadors i aplicar-hi canvis de color o estil, o eliminar-los en bloc.
- **Desplega-ho tot / Replega-ho tot**: mostra o amaga ràpidament els marcadors fills imbricats.

## Casos d'ús

- Afegir una taula de continguts a un llibre de text o un manual que no té marcadors
- Reestructurar els marcadors d'un document escanejat després de processar-lo amb OCR
- Exportar els marcadors a CSV, editar-los en un full de càlcul i tornar-los a importar
- Netejar marcadors generats automàticament que tenen referències de pàgina incorrectes
- Afegir marcadors de colors per assenyalar les seccions importants d'un escrit jurídic

## Consells

- Fes servir la importació CSV per crear marcadors en massa. El format és senzill: `title,page,level`, on el nivell 1 és el nivell superior.
- El mode de selecció et permet fer clic en un punt exacte de la pàgina del PDF per definir la destinació del marcador, cosa que és més precisa que apuntar només a un número de pàgina.
- Exporta els marcadors abans de fer canvis importants per tenir-ne una còpia de seguretat.

## Eines relacionades

- [Taula de continguts](./table-of-contents)
- [Editor de PDF](./edit-pdf)
- [Afegeix etiquetes de pàgina](./add-page-labels)
