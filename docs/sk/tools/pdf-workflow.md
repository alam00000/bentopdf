---
title: Tvorca pracovných postupov (Workflow) PDF
description: Vizuálne vytvárajte vlastné reťazce spracovania PDF prepájaním uzlov na plátne. Reťazte operácie ako spojenie, kompresia, vodoznak a export.
---

# Tvorca pracovných postupov (Workflow) PDF

Tvorca pracovných postupov umožňuje spojiť viacero operácií s PDF do jedného automatizovaného reťazca. Namiesto spúšťania nástrojov jeden po druhom poprepájate vizuálny graf uzlov (vstup, spracovanie, výstup) a všetko spustíte jedným kliknutím. Vaše súbory nikdy neopustia prehliadač.

## Ako to funguje

Rozhranie je rozdelené na tri panely: **panel uzlov** vľavo, **plátno** v strede a **panel nastavení** vpravo, ktorý sa zobrazí po výbere uzla.

1. **Pridávajte uzly** kliknutím v ľavom bočnom paneli alebo ich presuňte priamo na plátno. Vyhľadávacím poľom v hornej časti panela uzlov ich filtrujete podľa názvu.
2. **Prepájajte uzly** ťahaním z výstupnej zásuvky (spodok uzla) do vstupnej zásuvky (vrch iného uzla). Prepojenia vedú zhora nadol.
3. **Nastavte možnosti** kliknutím na uzol, čím sa vpravo otvorí jeho panel nastavení. Každý typ uzla má vlastné možnosti (rozsahy strán, posuvníky kvality, heslá atď.).
4. **Spustite pracovný postup** kliknutím na tlačidlo **Spustiť** na paneli nástrojov. Engine vykonáva uzly v topologickom poradí a spracúva ich postupne. Stavový riadok dole sleduje priebeh.
5. **Stiahnite výsledky**: koncový uzol Stiahnuť uloží výsledné PDF (alebo ZIP, ak vznikne viac súborov).

## Kategórie uzlov

Uzly sú rozdelené do šiestich kategórií, každá má na plátne vlastnú farbu:

- **Vstup** (modrá): PDF Vstup, Vstup obrázkov, Word/Excel/PowerPoint do PDF a viac ako 15 ďalších prevodníkov formátov, ktoré privádzajú súbory do reťazca.
- **Úpravy a anotácie** (indigová): Orezať, Odtiene sivej, Invertovať farby, Vodoznak, Čísla strán, Hlavička a pätička, Efekt skenera, Úprava farieb, Farba pozadia, Odstrániť prázdne strany, Odstrániť anotácie.
- **Usporiadanie a správa** (fialová): Spojiť, Rozdeliť, Extrahovať strany, Otočiť, Odstrániť strany, Obrátiť, Pridať prázdnu stranu, Rozdeliť strany, N-Up, Zjednotiť veľkosť strán, Spojiť do jednej strany, Brožúra, Plagát, Upraviť metadáta, Obsah, OCR.
- **Optimalizácia a oprava** (jantárová): Komprimovať, Rastrovať, Linearizovať, Zarovnať naklonenie, PDF do PDF/A, Písma do kriviek, Opraviť.
- **Zabezpečenie PDF** (ružová): Zašifrovať, Dešifrovať, Vyčistiť, Zlúčiť vrstvy, Digitálny podpis, Začierniť.
- **Výstup** (tyrkysová): Stiahnuť (automaticky rozpozná jedno PDF alebo ZIP), PDF do obrázkov, PDF do textu, PDF do DOCX, PDF do XLSX, PDF do CSV, PDF do SVG, PDF do Markdownu, Extrahovať obrázky.

## Ukladanie a načítanie pracovných postupov

Panel nástrojov ponúka štyri možnosti uchovania:

- **Uložiť**: uloží aktuálny pracovný postup ako pomenovanú šablónu v lokálnom úložisku prehliadača. Môžete uložiť viac šablón.
- **Načítať**: otvorí okno so zoznamom všetkých uložených šablón. Kliknutím na Načítať jednu obnovíte, prípadne odstráňte šablóny, ktoré už nepotrebujete.
- **Exportovať**: stiahne pracovný postup ako súbor `.json`, aby ste ho mohli zdieľať alebo zálohovať.
- **Importovať**: načíta súbor pracovného postupu `.json` z disku a obnoví všetky uzly, pozície a prepojenia.

Šablóny pretrvávajú medzi reláciami v lokálnom úložisku. Exportované súbory JSON sú prenosné medzi prehliadačmi a počítačmi.

## Model vykonávania

Engine zostaví z vašich prepojení graf závislostí a vykonáva uzly v topologickom poradí. Ak niektorý uzol zlyhá, vykonávanie sa zastaví a chybný uzol sa označí načerveno. Niekoľko pravidiel, na ktoré treba pamätať:

- Každý pracovný postup potrebuje aspoň jeden uzol **Vstup** a jeden uzol **Výstup**.
- Engine rozpozná cyklické závislosti a zablokuje vykonávanie s chybou.
- Uzol **Zašifrovať** musí byť posledným krokom spracovania pred výstupným uzlom. Ak ho umiestnite skôr, zobrazí sa varovanie validácie, pretože nasledujúce uzly nemôžu pracovať so zašifrovanými dátami.
- PDF chránené heslom si počas vykonávania vyžiadajú heslo.
- Podporujú sa vstupy s viacerými PDF: uzol Spojiť ich môže zlúčiť, alebo uzly hromadného spracovania spracujú každé PDF samostatne.

## Typy zásuviek

Prepojenia používajú typované zásuvky, ktoré zabraňujú neplatnému zapojeniu:

- **PDF** (indigová): jeden dokument PDF.
- **MultiPDF** (jantárová): viac dokumentov PDF spolu.
- **Image** (zelená): obrázkový blob.

## Možnosti

Každý uzol má vlastné nastavenia dostupné cez pravý panel nastavení. Bežné príklady:

- **Rozsahy strán** v uzloch Rozdeliť, Extrahovať strany, Odstrániť strany
- **Posuvníky kvality** vo výstupných uzloch prevodu na obrázky
- **Polia hesla** v uzloch Zašifrovať a Dešifrovať
- **Textové vstupy** pre Vodoznak, Hlavička a pätička, Upraviť metadáta
- **Uhly otočenia** v uzle Otočiť
- **Úroveň kompresie** v uzle Komprimovať
- **Výber jazyka OCR** v uzle OCR

## Prípady použitia

- **Spracovanie faktúr**: PDF Vstup -> OCR -> Extrahovať tabuľky -> Stiahnuť ako CSV.
- **Štandardizácia správ**: Word do PDF -> Zjednotiť veľkosť strán -> Pridať čísla strán -> Vodoznak -> Komprimovať -> Stiahnuť.
- **Príprava na archiváciu**: PDF Vstup -> Opraviť -> Zlúčiť vrstvy -> Vyčistiť -> PDF do PDF/A -> Stiahnuť.
- **Hromadná extrakcia obrázkov**: PDF Vstup (viac súborov) -> Extrahovať obrázky -> Stiahnuť ZIP.
- **Brožúry pripravené na tlač**: PDF Vstup -> Brožúra -> Orezať -> Komprimovať -> Stiahnuť.
- **Bezpečná distribúcia**: PDF Vstup -> Začierniť -> Odstrániť anotácie -> Zašifrovať -> Stiahnuť.

## Tipy

- Klávesom **Delete** alebo **Backspace** odstránite vybraný uzol z plátna.
- Kliknutím na tlačidlo **X** na stavovom riadku uzla ho priamo odstránite.
- Plátno posúvate kliknutím a ťahaním na prázdnom mieste. Kurzor sa počas posúvania zmení na ikonu ruky.
- Na mobile prepínate panel uzlov tlačidlom **+** na paneli nástrojov.
- Ak pracovný postup vytvorí viac výstupných súborov, uzol Stiahnuť ich automaticky zabalí do ZIP.
- Začnite jednoducho: pred pridaním zložitosti vytvorte a otestujte reťazec s dvoma uzlami.

## Súvisiace nástroje

- [PDF do Textu](./pdf-to-text)
- [PDF do Excelu](./pdf-to-excel)
- [Extrahovať obrázky](./extract-images)
- [PDF do Markdownu](./pdf-to-markdown)
