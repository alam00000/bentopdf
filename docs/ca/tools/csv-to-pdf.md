---
title: CSV a PDF
description: Converteix fitxers de full de càlcul CSV en taules PDF formatades directament al navegador.
---

# CSV a PDF

Converteix fitxers CSV en documents PDF nets i formatats. Cada CSV s'analitza i es representa com una taula al PDF resultant. Això és útil quan necessites imprimir o compartir dades tabulars sense que el destinatari hagi de tenir un programa de fulls de càlcul.

## Formats compatibles

| Format | Extensions |
| :----- | :--------- |
| CSV    | `.csv`     |

## Com funciona

1. Fes clic a la zona de càrrega o arrossega i deixa anar un o més fitxers CSV.
2. Revisa la llista de fitxers. Afegeix-ne més o elimina els que no vulguis.
3. Fes clic a **Converteix a PDF**. Un indicador de progrés mostra l'estat de la conversió.
4. Un sol fitxer es baixa directament com a PDF. Si són diversos, s'empaqueten a `csv-converted.zip`.

## Opcions

Aquesta eina no té cap configuració addicional. El CSV s'analitza i es formata automàticament com a taula.

## Resultat

| Nombre d'entrades | Resultat                                                   |
| :---------------- | :--------------------------------------------------------- |
| 1 fitxer          | Baixada d'un únic PDF (p. ex., `data.pdf`)                 |
| 2 o més fitxers   | Arxiu ZIP (`csv-converted.zip`) amb un PDF per cada fitxer |

## Casos d'ús

- Convertir informes de bases de dades exportats en taules PDF imprimibles
- Compartir dades financeres o llistes d'inventari amb persones que no tenen Excel
- Crear versions en PDF de fitxers de registre CSV per a la documentació de compliment normatiu
- Imprimir llistes d'adreces, fulls de notes o qualsevol dada tabular desada com a CSV

## Consells

- Per obtenir els millors resultats, assegura't que el CSV fa servir comes com a delimitadors estàndard. L'eina segueix les convencions habituals d'anàlisi de CSV.
- Si el CSV té moltes columnes, la taula es pot comprimir per ajustar-se a l'amplada de la pàgina. Considera dividir els conjunts de dades amples en diversos fitxers.
- Per als fitxers d'Excel (`.xls`, `.xlsx`), fes servir l'eina [Excel a PDF](./excel-to-pdf), que conserva el format del full de càlcul i els diversos fulls.

## Eines relacionades

- [Excel a PDF](./excel-to-pdf)
- [Text a PDF](./txt-to-pdf)
- [JSON a PDF](./json-to-pdf)
