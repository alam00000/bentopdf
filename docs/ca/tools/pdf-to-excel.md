---
title: PDF a Excel
description: Extreu taules de documents PDF a un full de càlcul d'Excel. Cada taula té el seu propi full amb referència de pàgina.
---

# PDF a Excel

Extreu les taules d'un PDF i les desa com a full de càlcul d'Excel (`.xlsx`). Cada taula detectada es col·loca en el seu propi full, etiquetat amb el número de taula i la pàgina d'origen. Funciona amb PyMuPDF per a la detecció de taules i la biblioteca SheetJS per generar l'Excel.

## Com funciona

1. Carrega un PDF fent clic a la zona de càrrega o arrossegant-hi un fitxer.
2. Fes clic a **Converteix** per iniciar l'extracció de taules.
3. L'eina analitza cada pàgina a la cerca de taules i després crea un llibre d'Excel.
4. Es baixa un fitxer `.xlsx` amb un full per a cada taula.

## Opcions

Aquesta eina no té opcions configurables. Totes les taules detectades s'extreuen automàticament.

## Format de sortida

- Un únic fitxer `filename.xlsx`.
- **Una taula**: un sol full anomenat "Table".
- **Diverses taules**: fulls anomenats "Table 1 (Page 3)", "Table 2 (Page 5)", etc. Els noms dels fulls es trunquen a 31 caràcters (el límit d'Excel).

## Casos d'ús

- Convertir informes financers en PDF a fulls de càlcul editables per continuar l'anàlisi.
- Extreure taules d'inventari o de comandes de PDF de proveïdors.
- Passar dades estructurades de formularis o catàlegs en PDF a Excel per ordenar-les i filtrar-les.
- Arxivar dades tabulars de PDF en un format amb el qual els companys no tècnics puguin treballar.

## Consells

- Si l'eina informa "No s'ha trobat cap taula", el PDF probablement utilitza una disposició de text lliure en lloc de taules estructurades. Prova [PDF a text](./pdf-to-text) per obtenir el contingut en brut.
- Per a un format pla més senzill, utilitza [PDF a CSV](./pdf-to-csv). Per a baixades per taula en diversos formats, utilitza [Extreu taules](./extract-tables).
- Revisa els noms dels fulls per identificar de quina pàgina prové cada taula.

## Eines relacionades

- [PDF a CSV](./pdf-to-csv)
- [Extreu taules](./extract-tables)
- [PDF a text](./pdf-to-text)
