---
title: Visualitza les metadades
description: Inspecciona totes les propietats de metadades d'un PDF, incloent-hi la informació del document, les dades XMP i els detalls estructurals.
---

# Visualitza les metadades

Examina les propietats ocultes incrustades en un fitxer PDF. L'eina mostra la informació del document (títol, autor, dates), les metadades XMP, les dimensions de les pàgines i altres dades estructurals en un format llegible.

## Com funciona

1. Puja un fitxer PDF.
2. L'eina analitza el fitxer immediatament i mostra totes les metadades disponibles en seccions organitzades.
3. Revisa el diccionari d'informació del document, l'arbre de metadades XMP i les propietats estructurals.
4. No cal cap pas de processament: les metadades es mostren tan bon punt es carrega el fitxer.

## Característiques

- Mostra els camps d'informació estàndard del document: Títol, Autor, Assumpte, Paraules clau, Creador, Productor
- Mostra les dates de creació i modificació en un format llegible
- Analitza i mostra l'arbre complet de metadades XMP amb espais de noms imbricats
- Converteix el format de data del PDF (`D:20240101120000Z`) en dates llegibles
- Organitzat en seccions plegables per facilitar la navegació

## Seccions de metadades

| Secció                      | Contingut                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| **Informació del document** | Títol, Autor, Assumpte, Paraules clau, Creador, Productor, Data de creació, Data de modificació   |
| **Metadades XMP**           | Arbre complet de metadades basat en XML amb Dublin Core, XAP, PDF i espais de noms personalitzats |
| **Propietats del document** | Nombre de pàgines, versió del PDF, mida del fitxer, estat del xifratge                            |

## Casos d'ús

- Comprovar qui ha creat un PDF i quan es va modificar per última vegada
- Verificar que les metadades s'han definit correctament abans de publicar un document
- Auditar PDF per protegir la privadesa comprovant quina informació personal hi ha incrustada
- Investigar el programari utilitzat per crear o modificar un PDF (mitjançant el camp Productor)
- Revisar les metadades XMP per complir amb la gestió d'actius digitals

## Consells

- Les cadenes de data del PDF que comencen per `D:` es converteixen automàticament al format de la teva zona horària local.
- Si els camps de metadades apareixen buits, el creador del PDF simplement no els va definir. No tots els PDF contenen metadades riques.
- Per modificar les metadades després d'inspeccionar-les, utilitza [Edita les metadades](./edit-metadata). Per eliminar-les del tot, utilitza Elimina les metadades.

## Eines relacionades

- [Edita les metadades](./edit-metadata)
- [Capes OCG del PDF](./pdf-layers)
- [Compara PDF](./compare-pdfs)
