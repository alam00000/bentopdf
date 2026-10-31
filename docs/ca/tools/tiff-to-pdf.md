---
title: TIFF a PDF
description: Converteix imatges TIFF d'una o diverses pàgines a format PDF al navegador, amb compatibilitat completa de pàgines.
---

# TIFF a PDF

Converteix fitxers TIFF a PDF, inclosos els TIFF de diverses pàgines. Cada pàgina (o "IFD") d'un fitxer TIFF es converteix en una pàgina separada al PDF de sortida. Això és especialment útil per a documents escanejats, faxos i imatges mèdiques, que sovint es desen com a TIFF de diverses pàgines.

## Formats compatibles

| Format | Extensions      |
| :----- | :-------------- |
| TIFF   | `.tiff`, `.tif` |

## Com funciona

1. Fes clic a l'àrea de càrrega o arrossega i deixa anar els fitxers TIFF.
2. Revisa la llista de fitxers i gestiona-la segons calgui.
3. Fes clic a **Converteix a PDF**. El resultat es baixa com a `from_tiff.pdf`.

L'eina descodifica cada fitxer TIFF amb un descodificador TIFF en JavaScript i n'extreu les dades de píxels RGBA de cada pàgina. Cada pàgina es representa en un llenç, s'exporta com a PNG i s'incrusta al PDF. Les dimensions de les pàgines coincideixen amb les pàgines TIFF originals.

## Opcions

Aquesta eina no ofereix opcions de qualitat addicionals. Les imatges s'incrusten a la seva resolució nativa.

## Casos d'ús

- Convertir documents de fax de diverses pàgines (TIFF-F) a un format PDF més portàtil
- Convertir arxius de documents escanejats desats com a TIFF en PDF cercables (combinant-ho després amb l'eina OCR)
- Processar fitxers d'imatge mèdica (preparacions de patologia, exportacions de radiologia) que utilitzen TIFF
- Convertir fitxers TIFF d'imatges SIG o de satèl·lit en documents fàcils de compartir

## Consells

- Els TIFF de diverses pàgines són totalment compatibles. Un TIFF de 10 pàgines produirà un PDF de 10 pàgines. No cal dividir el TIFF abans.
- Els fitxers TIFF molt grans (centenars de megabytes) poden trigar més a processar-se, ja que tot el fitxer s'ha de descodificar a la memòria del navegador.
- Si necessites OCR al PDF resultant, passa'l per l'eina [Reconeixement OCR de PDF](./ocr-pdf) després de la conversió.

## Eines relacionades

- [Imatges a PDF](./image-to-pdf)
- [BMP a PDF](./bmp-to-pdf)
- [JPG a PDF](./jpg-to-pdf)
