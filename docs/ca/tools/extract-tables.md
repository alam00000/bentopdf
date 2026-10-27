---
title: Extreu taules de PDF
description: Detecta i extreu taules de documents PDF. Exporta-les com a CSV, JSON o Markdown amb una granularitat per taula.
---

# Extreu taules de PDF

Detecta totes les taules d'un PDF i et permet exportar-les en el format que triïs: CSV, JSON o Markdown. Cada taula s'extreu individualment amb metadades de pàgina i de posició. Funciona amb el motor de detecció de taules de PyMuPDF.

## Com funciona

1. Puja un PDF fent clic a la zona de càrrega o arrossegant-hi un fitxer.
2. Selecciona el **format d'exportació** que prefereixis: CSV, JSON o Markdown.
3. Fes clic a **Extreu taules** per iniciar el processament.
4. Si es troba una sola taula, es baixa com un únic fitxer. Si n'hi ha diverses, es genera un arxiu ZIP amb un fitxer per taula.

## Opcions

- **Format d'exportació**: tria entre:
  - **CSV**: valors separats per comes, amb les cometes adequades als camps que contenen comes, cometes o salts de línia. Adequat per a fulls de càlcul i bases de dades.
  - **JSON**: estructura de matrius de matrius, amb format llegible i sagnat de 2 espais. Adequat per al consum programàtic.
  - **Markdown**: format de taula delimitada per barres verticals renderitzat per PyMuPDF. Adequat per a documentació i fitxers README.

## Format de sortida

- **Una sola taula**: `filename_table.csv` (o `.json` / `.md`)
- **Diverses taules**: `filename_tables.zip` amb fitxers anomenats `table_1_page3.csv`, `table_2_page5.csv`, etc.

## Casos d'ús

- Extreure taules concretes d'informes PDF extensos sense treure les dades de tot el document.
- Obtenir taules en format Markdown per enganxar-les directament a incidències de GitHub, wikis o documentació.
- Obtenir dades JSON estructurades de les taules d'un PDF per a integracions d'API o scripts.
- Comparar taules entre diferents versions d'un PDF exportant-ne totes dues a CSV i comparant-les.

## Consells

- Aquesta eina et dona control per taula. Si només vols abocar totes les taules en un únic CSV, fes servir [PDF a CSV](./pdf-to-csv). Per a un llibre d'Excel complet, fes servir [PDF a Excel](./pdf-to-excel).
- Les taules que s'estenen per diverses pàgines es poden detectar com a taules separades per pàgina. Potser les hauràs de concatenar manualment.
- Si no es detecta cap taula, és possible que el PDF sigui una imatge escanejada. Passa'l primer per l'OCR per afegir-hi una capa de text.

## Eines relacionades

- [PDF a CSV](./pdf-to-csv)
- [PDF a Excel](./pdf-to-excel)
- [PDF a text](./pdf-to-text)
