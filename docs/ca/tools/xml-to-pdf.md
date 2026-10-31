---
title: XML a PDF
description: Converteix fitxers XML en documents PDF estructurats al navegador. Gratuït, privat i sense processament al servidor.
---

# XML a PDF

Converteix fitxers de dades XML en documents PDF llegibles i estructurats. L'XML en brut és potent, però difícil de llegir per a les persones. Aquesta eina analitza l'arbre XML, identifica les estructures de dades repetides i les renderitza com a taules i seccions amb format en un PDF A4 apaïsat.

## Formats admesos

| Format | Extensió | Notes                             |
| :----- | :------- | :-------------------------------- |
| XML    | `.xml`   | Qualsevol document XML ben format |

## Com funciona

1. Fes clic a l'àrea de càrrega o arrossega i deixa anar els fitxers XML. Es poden processar diversos fitxers en un sol lot.
2. Revisa la llista de fitxers. Elimina els fitxers que no vulguis amb la icona de la paperera, o fes clic a **Afegeix més fitxers** per incloure'n més.
3. Fes clic a **Converteix a PDF**. L'eina analitza l'estructura XML amb el DOMParser integrat del navegador, n'analitza la jerarquia de dades i la renderitza en un PDF amb jsPDF i format de taula automàtic.
4. Un sol fitxer es descarrega com a PDF. Diverses conversions s'empaqueten a `xml-to-pdf.zip`.

## Opcions

No cal cap configuració manual. El convertidor detecta automàticament l'estructura XML i tria les maquetacions de taula adequades. La sortida utilitza l'orientació A4 apaïsada per encabir conjunts de dades amples.

## Casos d'ús

- Convertir exportacions de dades XML de bases de dades o API en informes imprimibles
- Crear resums llegibles a partir de fitxers de configuració XML
- Convertir factures o registres de transaccions basats en XML en PDF per conservar-los
- Fer llegibles en forma de document mapes del lloc XML o canals RSS

## Consells

- L'XML ha d'estar ben format. Si l'analitzador troba errors de sintaxi, la conversió fallarà amb un missatge d'error descriptiu que indica el problema.
- Les estructures XML molt imbricades s'aplanen en taules. Per obtenir els millors resultats, les dades haurien de tenir elements germans repetits amb elements fills coherents.
- Durant la conversió apareixen actualitzacions de progrés que mostren cada fase: lectura, anàlisi, estudi i renderització.

## Eines relacionades

- [FB2 a PDF](./fb2-to-pdf)
- [XPS a PDF](./xps-to-pdf)
- [Correu electrònic a PDF](./email-to-pdf)
