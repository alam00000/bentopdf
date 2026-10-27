---
title: Linealitza PDF
description: Optimitza els fitxers PDF per a una visualització web ràpida amb càrrega progressiva. També conegut com a optimització «Fast Web View».
---

# Linealitza PDF

La linealització reestructura un PDF perquè la primera pàgina es pugui mostrar abans que s'hagi baixat tot el fitxer. Adobe ho anomena «Fast Web View». Si publiques PDF en un lloc web o els serveixes mitjançant un portal de documents, la linealització fa que s'obrin molt més ràpid.

## Com funciona

1. Puja un o més fitxers PDF.
2. Fes clic a **Linealitza PDF**.
3. Baixa els resultats en un arxiu ZIP que conté tots els fitxers linealitzats.

No hi ha cap paràmetre per configurar. L'eina fa servir l'indicador `--linearize` de QPDF, que reorganitza l'estructura interna del PDF sense alterar-ne el contingut visual.

## Què fa la linealització

- Reordena els objectes del PDF perquè les dades de la primera pàgina apareguin al principi del fitxer
- Afegeix un diccionari de linealització i taules de pistes perquè els visors sàpiguen on trobar cada pàgina
- Permet les peticions per intervals de bytes: un navegador pot obtenir només la primera pàgina sense baixar tot el fitxer
- Neteja la taula de referències creuades per a un accés aleatori eficient

## Funcionalitats

- Processament per lots de diversos PDF en una sola operació
- El resultat conserva tot el contingut, els tipus de lletra, les imatges i els elements interactius
- Fa servir QPDF (WebAssembly) per a una linealització fiable i conforme a l'estàndard
- Els resultats s'empaqueten en un ZIP per baixar-los fàcilment

## Casos d'ús

- Publicar informes en PDF en un lloc web on els usuaris esperen que les pàgines es mostrin a l'instant
- Incrustar PDF en aplicacions web amb visors al navegador
- Publicar catàlegs o manuals en PDF als quals s'accedeix amb connexions mòbils lentes
- Preparar documents per a xarxes de distribució de contingut (CDN) que admeten el servei per intervals de bytes

## Consells

- Linealitza quan hagis acabat totes les altres edicions. Qualsevol modificació posterior (fusionar, afegir pàgines) trencarà la linealització.
- Combina-ho amb Comprimeix PDF per obtenir els PDF més petits i que es carreguin més ràpid possible.
- La linealització afegeix una petita quantitat de pes al fitxer (normalment menys d'un 1 %).

## Eines relacionades

- [Comprimeix PDF](./compress-pdf): redueix la mida del fitxer abans de linealitzar-lo
- [Repara PDF](./repair-pdf): corregeix els problemes estructurals que impedeixen la linealització
- [Elimina les metadades](./remove-metadata): elimina les metadades abans de publicar en línia
