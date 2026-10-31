---
title: Elimina les pàgines en blanc
description: Detecta i elimina automàticament les pàgines en blanc o gairebé en blanc del PDF amb sensibilitat ajustable.
---

# Elimina les pàgines en blanc

Analitza el PDF a la cerca de pàgines en blanc o gairebé en blanc i elimina-les automàticament. L'eina renderitza cada pàgina i n'analitza el contingut de píxels per determinar si és en blanc, i després et deixa confirmar quines pàgines s'eliminen abans de processar.

## Com funciona

1. Puja el fitxer PDF.
2. Ajusta el control lliscant de **Sensibilitat** per controlar com d'estricta és la definició de «en blanc».
3. Fes clic a **Detecta pàgines en blanc** per analitzar el document.
4. L'eina mostra miniatures de les pàgines en blanc detectades perquè les revisis.
5. Confirma la selecció i descarrega el PDF net sense les pàgines en blanc.

## Opcions

- **Sensibilitat**: un control lliscant del 0 % al 100 % (per defecte, 80 %). Els valors alts són més estrictes i només marquen pàgines completament o gairebé blanques. Els valors baixos són més permissius i detecten pàgines amb contingut mínim, com un sol punt o una marca d'aigua tènue.

## Funcions

- Anàlisi a nivell de píxel de cada pàgina per detectar contingut en blanc
- Control lliscant de sensibilitat ajustable per afinar la detecció
- Previsualització en miniatura de les pàgines en blanc detectades per a la verificació manual
- Conserva exactament com són totes les pàgines que no són en blanc
- Admet documents de qualsevol mida o nombre de pàgines
- Indicador de progrés durant l'anàlisi

## Casos d'ús

- Netejar documents escanejats on l'escàner ha capturat el revers buit d'originals d'una sola cara
- Eliminar pàgines separadores de lots de documents escanejats en massa
- Eliminar pàgines en blanc inserides per sistemes de gestió documental
- Netejar PDF exportats de processadors de textos que de vegades inclouen pàgines en blanc al final
- Reduir la mida del fitxer eliminant pàgines buides innecessàries

## Consells

- Comença amb la sensibilitat per defecte del 80 % i ajusta-la a partir d'aquí. Si l'eina no detecta pàgines que a tu et semblen en blanc, redueix la sensibilitat. Si marca pàgines amb contingut lleuger que vols conservar, augmenta-la.
- L'eina renderitza cada pàgina per analitzar-ne el contingut, de manera que el temps de processament augmenta amb el nombre de pàgines. En documents molt grans, compta amb una espera breu.
- Revisa les pàgines en blanc detectades a la previsualització en miniatura abans de confirmar l'eliminació. Les pàgines amb capçaleres, peus o marques d'aigua tènues poden quedar marcades segons la sensibilitat configurada.

## Eines relacionades

- [Retalla PDF](./crop-pdf)
- [Editor de PDF](./edit-pdf)
- [Números de pàgina](./page-numbers)
