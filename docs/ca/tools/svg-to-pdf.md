---
title: SVG a PDF
description: Converteix gràfics vectorials SVG a PDF amb control de qualitat, completament al navegador.
---

# SVG a PDF

Converteix fitxers Scalable Vector Graphics (SVG) a PDF. L'eina rasteritza cada SVG amb el motor de renderització del navegador i n'incrusta el resultat a la resolució nativa. És útil per convertir icones vectorials, diagrames i il·lustracions en documents portàtils.

## Formats compatibles

| Format | Extensions |
| :----- | :--------- |
| SVG    | `.svg`     |

## Com funciona

1. Fes clic a l'àrea de càrrega o arrossega i deixa anar un o més fitxers SVG.
2. Revisa i gestiona la llista de fitxers.
3. Tria un nivell de **Qualitat del PDF**.
4. Fes clic a **Converteix a PDF**. El resultat es baixa com a `from_svgs.pdf`.

Cada SVG es llegeix com a text, es representa en un llenç amb l'amplada i l'alçada intrínseques (800x600 per defecte si no s'especifiquen dimensions) i s'exporta com a PNG. Aquest PNG s'incrusta després al PDF amb pdf-lib. Les àrees transparents s'omplen amb un fons blanc.

## Opcions

**Qualitat del PDF** controla la compressió després de la rasterització:

- **Alta qualitat**: el més proper a la representació original.
- **Qualitat mitjana** (per defecte): bon equilibri.
- **Qualitat baixa**: fitxer més petit, amb una mica de pèrdua de detall.

## Casos d'ús

- Convertir diagrames d'arquitectura o enginyeria d'SVG a un PDF llest per imprimir
- Empaquetar conjunts d'icones en un PDF de referència per a un sistema de disseny
- Convertir visualitzacions de dades (D3.js, exportacions de biblioteques de gràfics) en PDF per a informes
- Crear versions imprimibles d'infografies basades en SVG

## Consells

- Els fitxers SVG sense atributs `width` i `height` explícits es representen a 800x600 píxels. Per obtenir els millors resultats, defineix les dimensions a l'SVG abans de convertir-lo.
- Els SVG complexos amb referències a fonts externes o imatges enllaçades poden no representar-se perfectament. Incrusta tots els recursos a l'SVG per a una sortida fiable.
- Com que l'SVG es rasteritza, el PDF contindrà una imatge de mapa de bits en lloc de traçats vectorials. Per a una sortida PDF realment vectorial, cal una eina vectorial dedicada.

## Eines relacionades

- [Imatges a PDF](./image-to-pdf)
- [PNG a PDF](./png-to-pdf)
- [BMP a PDF](./bmp-to-pdf)
