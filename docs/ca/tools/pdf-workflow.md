---
title: Creador de fluxos de treball PDF
description: Crea fluxos de processament de PDF personalitzats de manera visual connectant nodes en un llenç. Encadena operacions com fusionar, comprimir, afegir marca d'aigua i exportar.
---

# Creador de fluxos de treball PDF

El Creador de fluxos de treball et permet encadenar diverses operacions de PDF en un únic flux automatitzat. En lloc d'executar les eines una per una, connectes un graf visual de nodes (entrada, processament i sortida) i ho executes tot amb un clic. Els teus fitxers no surten mai del navegador.

## Com funciona

La interfície es divideix en tres panells: una **caixa de nodes** a l'esquerra, el **llenç** al centre i un **panell de paràmetres** a la dreta que apareix quan selecciones un node.

1. **Afegeix nodes** fent-hi clic a la barra lateral esquerra o arrossegant-los directament al llenç. Utilitza la barra de cerca de la part superior de la caixa de nodes per filtrar per nom.
2. **Connecta els nodes** arrossegant des d'un connector de sortida (a la part inferior d'un node) fins a un connector d'entrada (a la part superior d'un altre). Les connexions flueixen de dalt a baix.
3. **Configura els paràmetres** fent clic en un node per obrir-ne el panell de paràmetres a la dreta. Cada tipus de node té les seves pròpies opcions (intervals de pàgines, controls lliscants de qualitat, contrasenyes, etc.).
4. **Executa el flux de treball** fent clic al botó **Executa** de la barra d'eines. El motor executa els nodes en ordre topològic, processant-los un darrere l'altre. Una barra d'estat a la part inferior en mostra el progrés.
5. **Baixa els resultats**: el node final Baixa desa el PDF resultant (o un ZIP si es generen diversos fitxers).

## Categories de nodes

Els nodes s'organitzen en sis categories, cadascuna amb un color diferent al llenç:

- **Entrada** (blau): entrada de PDF, entrada d'imatges, Word/Excel/PowerPoint a PDF i més de 15 convertidors d'altres formats que alimenten el flux amb fitxers.
- **Edita i anota** (índigo): retalla, escala de grisos, inverteix els colors, marca d'aigua, números de pàgina, capçalera i peu de pàgina, efecte d'escàner, ajusta els colors, color de fons, elimina les pàgines en blanc, elimina les anotacions.
- **Organitza i gestiona** (violeta): fusiona, divideix, extreu pàgines, gira, suprimeix pàgines, inverteix, afegeix una pàgina en blanc, divideix pàgines, diverses pàgines per full, uniformitza la mida de pàgina, combina en una sola pàgina, fullet, pòster, edita les metadades, taula de continguts, OCR.
- **Optimitza i repara** (ambre): comprimeix, rasteritza, linealitza, corregeix la inclinació, PDF a PDF/A, tipus de lletra a contorns, repara.
- **Protegeix el PDF** (rosa): xifra, desxifra, sanititza, aplana, signatura digital, censura.
- **Sortida** (verd blavós): baixa (detecta automàticament un sol PDF o un ZIP), PDF a imatges, PDF a text, PDF a DOCX, PDF a XLSX, PDF a CSV, PDF a SVG, PDF a Markdown, extreu imatges.

## Desar i carregar fluxos de treball

La barra d'eines ofereix quatre opcions de persistència:

- **Desa**: desa el flux de treball actual com a plantilla amb nom a l'emmagatzematge local del navegador. Pots desar diverses plantilles.
- **Carrega**: obre una finestra amb totes les plantilles desades. Fes clic a Carrega per restaurar-ne una, o suprimeix les plantilles que ja no necessitis.
- **Exporta**: baixa el flux de treball com a fitxer `.json` perquè el puguis compartir o en facis una còpia de seguretat.
- **Importa**: carrega un fitxer de flux de treball `.json` del disc, restaurant tots els nodes, les posicions i les connexions.

Les plantilles es conserven entre sessions a l'emmagatzematge local. Els fitxers JSON exportats són portàtils entre navegadors i ordinadors.

## Model d'execució

El motor crea un graf de dependències a partir de les teves connexions i executa els nodes en ordre topològic. Si algun node falla, l'execució s'atura i el node amb error es marca en vermell. Cal tenir en compte unes quantes regles:

- Cada flux de treball necessita almenys un node d'**Entrada** i un node de **Sortida**.
- El motor detecta les dependències circulars i bloqueja l'execució amb un error.
- El node **Xifra** ha de ser l'últim pas de processament abans del node de sortida. Si el col·loques abans, apareixerà un avís de validació perquè els nodes posteriors no poden operar amb dades xifrades.
- Els PDF protegits amb contrasenya demanen la contrasenya durant l'execució.
- S'admeten entrades de diversos PDF: el node Fusiona pot combinar-los, o els nodes de processament en lot processaran cada PDF individualment.

## Tipus de connectors

Les connexions utilitzen connectors tipats per evitar connexions no vàlides:

- **PDF** (índigo): un sol document PDF.
- **MultiPDF** (ambre): diversos documents PDF agrupats.
- **Image** (verd): un blob d'imatge.

## Opcions

Cada node té la seva pròpia configuració accessible des del panell de paràmetres de la dreta. Els patrons habituals inclouen:

- **Intervals de pàgines** als nodes Divideix, Extreu pàgines i Suprimeix pàgines
- **Controls lliscants de qualitat** als nodes de sortida de conversió d'imatges
- **Camps de contrasenya** als nodes Xifra i Desxifra
- **Entrades de text** per a Marca d'aigua, Capçalera i peu de pàgina, Edita les metadades
- **Angles de rotació** al node Gira
- **Nivell de compressió** al node Comprimeix
- **Selecció d'idioma d'OCR** al node OCR

## Casos d'ús

- **Flux de processament de factures**: entrada de PDF -> OCR -> Extreu taules -> Baixa com a CSV.
- **Estandardització d'informes**: Word a PDF -> Uniformitza la mida de pàgina -> Afegeix números de pàgina -> Marca d'aigua -> Comprimeix -> Baixa.
- **Preparació per a l'arxivament**: entrada de PDF -> Repara -> Aplana -> Sanititza -> PDF a PDF/A -> Baixa.
- **Extracció d'imatges en lot**: entrada de PDF (diversos fitxers) -> Extreu imatges -> Baixa el ZIP.
- **Fullets llestos per imprimir**: entrada de PDF -> Fullet -> Retalla -> Comprimeix -> Baixa.
- **Distribució segura**: entrada de PDF -> Censura -> Elimina les anotacions -> Xifra -> Baixa.

## Consells

- Utilitza **Supr** o **Retrocés** per eliminar el node seleccionat del llenç.
- Fes clic al botó **X** de la barra d'estat d'un node per suprimir-lo directament.
- Desplaça el llenç fent clic i arrossegant sobre un espai buit. El cursor canvia a una icona de mà mentre es desplaça.
- Al mòbil, utilitza el botó **+** de la barra d'eines per mostrar o amagar la caixa de nodes.
- Si el flux de treball genera diversos fitxers de sortida, el node Baixa els agrupa automàticament en un ZIP.
- Comença amb coses senzilles: crea i prova un flux de dos nodes abans d'afegir-hi complexitat.

## Eines relacionades

- [PDF a text](./pdf-to-text)
- [PDF a Excel](./pdf-to-excel)
- [Extreu imatges](./extract-images)
- [PDF a Markdown](./pdf-to-markdown)
