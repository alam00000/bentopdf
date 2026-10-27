---
title: Correu electrònic a PDF
description: Converteix fitxers de correu EML i MSG a PDF al navegador. Conserva les capçaleres, el cos i la llista de fitxers adjunts.
---

# Correu electrònic a PDF

Converteix fitxers de correu desats en PDF nets i imprimibles. L'eina analitza fitxers EML i MSG, n'extreu el missatge complet (capçaleres, contingut del cos i metadades dels adjunts) i ho renderitza tot en un PDF estructurat. És útil per a la descoberta judicial, per conservar registres o simplement per imprimir un correu important.

## Formats compatibles

| Format | Extensió | Notes                                                                          |
| :----- | :------- | :----------------------------------------------------------------------------- |
| EML    | `.eml`   | Format de correu MIME estàndard (exportat per la majoria de clients de correu) |
| MSG    | `.msg`   | Format propietari de Microsoft Outlook                                         |

## Com funciona

1. Fes clic a la zona de càrrega o arrossega i deixa anar els fitxers EML o MSG. Pots barrejar tots dos formats en un mateix lot.
2. Revisa la llista de fitxers. Elimina les entrades que no vulguis amb la icona de la paperera o fes clic a **Afegeix més fitxers** per incloure-hi més correus.
3. Configura les opcions de conversió (vegeu més avall).
4. Fes clic a **Converteix a PDF**. L'eina analitza cada correu, en renderitza el contingut com a HTML amb estil i el converteix a PDF amb el motor PyMuPDF.
5. Un sol correu es baixa directament com a PDF. Si són diversos, s'empaqueten a `emails-converted.zip`.

## Opcions

| Opció                                               | Per defecte | Descripció                                                                                                     |
| :-------------------------------------------------- | :---------- | :------------------------------------------------------------------------------------------------------------- |
| **Mida de pàgina**                                  | A4          | Tria entre les dimensions de pàgina A4, Letter o Legal.                                                        |
| **Inclou els destinataris CC i CCO a la capçalera** | Activat     | Si està activat, les llistes de destinataris en CC i CCO apareixen a la secció de capçalera del correu al PDF. |
| **Inclou la llista d'adjunts del correu**           | Activat     | Si està activat, al PDF apareix una llista dels fitxers adjunts del correu (amb noms i mides).                 |

## Casos d'ús

- Arxivar correspondència empresarial important en PDF per al compliment normatiu o l'auditoria
- Imprimir fils de correu per a procediments judicials o sol·licituds de descoberta
- Crear un registre permanent de confirmacions de comanda, rebuts o contractes rebuts per correu
- Fer una còpia de seguretat de fitxers MSG d'Outlook en un format que no requereixi Outlook per llegir-los
- Documentar interaccions d'atenció al client a partir de fitxers EML exportats

## Consells

- S'admeten tant els fitxers EML (que fan servir Thunderbird, Apple Mail i la majoria de clients de correu) com els MSG d'Outlook. Exporta els correus des del teu client de correu i deixa'ls anar directament a l'eina.
- Els correus en format HTML conserven l'estil al PDF. Els correus en text pla es renderitzen amb un format net i llegible.
- La llista d'adjunts mostra noms de fitxer i mides, però no incrusta els fitxers adjunts reals al PDF.

## Eines relacionades

- [XML a PDF](./xml-to-pdf)
- [XPS a PDF](./xps-to-pdf)
