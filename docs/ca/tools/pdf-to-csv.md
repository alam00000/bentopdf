---
title: PDF a CSV
description: Extreu taules de documents PDF i exporta-les en un únic fitxer CSV. Admet PDF de diverses pàgines amb detecció automàtica de taules.
---

# PDF a CSV

Extreu les taules d'un PDF i les exporta com a fitxer CSV. L'eina analitza cada pàgina a la cerca de dades tabulars amb el motor de detecció de taules de PyMuPDF i després escriu totes les files trobades en una única sortida separada per comes.

## Com funciona

1. Carrega un PDF fent clic a la zona de càrrega o arrossegant-hi un fitxer.
2. Fes clic a **Converteix** per iniciar l'extracció de taules.
3. L'eina analitza cada pàgina i identifica les taules automàticament.
4. Es baixa un fitxer `.csv` amb totes les dades de les taules extretes.

Les taules de pàgines diferents se separen amb files en blanc a la sortida. Les cel·les que contenen comes, cometes o salts de línia s'escapen correctament segons la RFC 4180.

## Opcions

Aquesta eina no té opcions configurables. Totes les taules trobades al document s'extreuen i es combinen en un únic CSV.

## Format de sortida

- Un únic fitxer `filename.csv` amb totes les taules detectades.

## Casos d'ús

- Passar a un full de càlcul dades financeres d'extractes bancaris o factures en PDF.
- Extreure taules de preus de pressupostos de proveïdors per comparar-les.
- Convertir dades de recerca tabulars de treballs en PDF a un format adequat per a eines d'anàlisi.
- Migrar dades d'informes PDF antics a bases de dades.

## Consells

- Si no es troba cap taula, l'eina mostra el missatge "No s'ha trobat cap taula". Normalment vol dir que el PDF utilitza una disposició de text que sembla tabular però que no està estructurada com una taula real.
- Per tenir més control sobre cada taula, utilitza [Extreu taules](./extract-tables), que et permet triar entre els formats de sortida CSV, JSON i Markdown.
- Si necessites les dades en format Excel amb un full per a cada taula, utilitza [PDF a Excel](./pdf-to-excel).

## Eines relacionades

- [PDF a Excel](./pdf-to-excel)
- [Extreu taules](./extract-tables)
- [PDF a text](./pdf-to-text)
