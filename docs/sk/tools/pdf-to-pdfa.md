---
title: PDF do PDF/A
description: Prevádzajte štandardné PDF do formátu PDF/A na dlhodobú archiváciu. Podporuje úrovne zhody PDF/A-1b, PDF/A-2b a PDF/A-3b.
---

# PDF do PDF/A

PDF/A je normou ISO štandardizovaná podmnožina PDF určená na dlhodobé digitálne uchovávanie. Tento nástroj prevádza vaše štandardné PDF na dokumenty v súlade s PDF/A pomocou Ghostscriptu bežiaceho priamo vo vašom prehliadači.

## Ako to funguje

1. Nahrajte jeden alebo viac súborov PDF.
2. V rozbaľovacom zozname vyberte **Verziu PDF/A**.
3. Voliteľne zapnite **Predbežne zlúčiť PDF** pre zložité súbory, pri ktorých bežný prevod zlyhá.
4. Kliknite na **Previesť do PDF/A**. Viac súborov vytvorí archív ZIP.

## Verzie PDF/A

| Verzia       | Obmedzenia                                     | Najvhodnejšie na                                         |
| ------------ | ---------------------------------------------- | -------------------------------------------------------- |
| **PDF/A-1b** | Najprísnejšia. Bez priehľadnosti, bez vrstiev. | Maximálnu kompatibilitu so staršími archívnymi systémami |
| **PDF/A-2b** | Povoľuje priehľadnosť a JPEG2000.              | Všeobecnú archiváciu (odporúčané)                        |
| **PDF/A-3b** | Povoľuje vložené prílohy ľubovoľného formátu.  | Archiváciu dokumentov so zdrojovými dátovými súbormi     |

Predvolene je vybraná PDF/A-2b, ktorá vyhovuje veľkej väčšine archivačných potrieb.

## Možnosť predbežného zlúčenia

Niektoré PDF obsahujú prvky, ktoré bránia čistému prevodu na PDF/A: neobvyklé kódovanie písiem, zložité vrstvenie priehľadnosti alebo poškodené vnútorné štruktúry. Zapnutím **Predbežne zlúčiť** sa PDF pred prevodom rastruje pri 300 DPI, čo zaručí súlad, no text už nebude možné označiť. Použite to ako záložné riešenie, keď štandardný prevod hlási chyby.

Predbežné zlúčenie vyžaduje engine PyMuPDF WASM.

## Prípady použitia

- Splnenie úradných alebo právnych požiadaviek na archiváciu (mnohé jurisdikcie vyžadujú PDF/A pre súdne podania)
- Odovzdávanie dokumentov do inštitucionálnych repozitárov alebo digitálnych knižníc
- Uchovávanie obchodných záznamov, keď pôvodný softvér o desať rokov nemusí existovať
- Príprava faktúr pre štandardy elektronickej fakturácie, ktoré vyžadujú PDF/A-3b s prílohami XML

## Tipy

- Najprv skúste prevod bez predbežného zlúčenia. Zapnite ho, iba ak dostanete chybu.
- PDF/A vkladá všetky písma, takže výstupné súbory sú často väčšie ako originály.
- Ak váš postup vyžaduje prísny súlad, overte výstup v špecializovanom validátore PDF/A.

## Súvisiace nástroje

- [Komprimovať PDF](./compress-pdf): zmenší veľkosť súboru po prevode
- [Zlúčiť vrstvy PDF](./flatten-pdf): zlúči formuláre pred prevodom do PDF/A
- [Odstrániť metadáta](./remove-metadata): odstráni metadáta pred archiváciou
