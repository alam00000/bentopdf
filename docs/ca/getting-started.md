# Primers passos

Et donem la benvinguda a BentoPDF! Aquesta guia t'ajudarà a posar-te en marxa ràpidament.

## Què és BentoPDF?

BentoPDF és un conjunt d'eines PDF gratuït, de codi obert i pensat per protegir la privadesa, que funciona **íntegrament al navegador**. Els fitxers no surten mai del dispositiu: tot el processament es fa en local amb tecnologia WebAssembly (WASM).

## Inici ràpid

### Opció 1: utilitza la versió allotjada

Visita [bentopdf.com](https://www.bentopdf.com) per utilitzar BentoPDF a l'instant, sense instal·lació.

### Opció 2: allotja'l tu mateix amb Docker

> [!IMPORTANT]
> La conversió de fitxers d'Office requereix `SharedArrayBuffer`, que necessita tots dos:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - un context segur
>
> `http://localhost` funciona per a proves locals perquè els navegadors consideren fiable el bucle local. `http://192.168.x.x` o altres IP de la xarxa local normalment no, de manera que les conversions de Word/Excel/PowerPoint requeriran HTTPS quan s'hi accedeixi des d'altres dispositius de la xarxa.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF s'ofereix en dues versions: la **versió autoallotjada** (`bentopdf-simple`, la utilitzada més amunt) per a desplegaments interns, d'equip o d'organització, i la **versió comercial** (`bentopdf:latest`) que utilitza el mateix bentopdf.com i els titulars de llicència comercial amb desplegaments públics. Totes dues inclouen les mateixes eines PDF: la versió comercial afegeix la portada, les preguntes freqüents, els testimonis i el peu de pàgina de bentopdf.com. Si tens dubtes, utilitza la versió autoallotjada.

Després obre `http://localhost:3000` al navegador.

> [!NOTE]
> Si prepares un desplegament d'OCR aïllat de la xarxa, has d'allotjar internament les fonts de la capa de text d'OCR, a més del worker de Tesseract, el runtime principal i els fitxers traineddata. La configuració completa es documenta a [Autoallotjament](/ca/self-hosting/), incloent-hi `VITE_OCR_FONT_BASE_URL` i el directori `ocr-fonts/` inclòs.

### Opció 3: compila des del codi font

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Les funcions d'un cop d'ull

| Categoria                 | Eines                                                        |
| ------------------------- | ------------------------------------------------------------ |
| **Converteix a PDF**      | Word, Excel, PowerPoint, imatges, Markdown, EPUB, MOBI i més |
| **Converteix des de PDF** | JPG, PNG, text, Excel, SVG i més                             |
| **Edita i anota**         | Signa, ressalta, censura, omple formularis, afegeix segells  |
| **Organitza**             | Fusiona, divideix, gira, suprimeix pàgines, reordena         |
| **Optimitza**             | Comprimeix, repara, aplana, OCR                              |
| **Seguretat**             | Xifra, desxifra, elimina restriccions                        |

## Compatibilitat amb navegadors

BentoPDF funciona millor en navegadors moderns:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Següents passos

- [Explora totes les eines](/ca/tools/)
- [Allotja BentoPDF tu mateix](/ca/self-hosting/)
- [Contribueix al projecte](/ca/contributing)
