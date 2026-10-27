# Docker / Podman ile Dağıtım

BentoPDF'i üretim ortamında kendi sunucunuzda barındırmanın en kolay yolu.

> [!IMPORTANT]
> **Office Dosya Dönüştürme için Gerekli Başlıklar**
>
> LibreOffice tabanlı araçlar (Word, Excel, PowerPoint dönüştürme), `SharedArrayBuffer` desteği için şu HTTP başlıklarını gerektirir:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Sayfa ayrıca güvenli bir bağlamdan sunulmalıdır. `http://localhost` yerel testler için çalışır, ancak `http://192.168.x.x` gibi yerel ağ IP'leri genellikle bu koşulu karşılamaz. Bu yüzden başlıklar mevcut olsa bile düz HTTP üzerinden Office dönüştürme başarısız olur.
>
> Resmi konteyner görüntüleri bu başlıkları içerir. Bir ters proxy kullanıyorsanız (Traefik, Caddy vb.), bu başlıkların korunduğundan veya eklendiğinden emin olun ve geri döngü dışı erişim için HTTPS kullanın.

> [!TIP]
> **Podman Kullanıcıları:** Tüm `docker` komutları, `docker` yerine `podman` ve `docker-compose` yerine `podman-compose` yazılarak Podman ile çalışır.

## Hızlı Başlangıç

> [!TIP]
> BentoPDF iki sürüm olarak sunulur:
>
> - **Kendi Sunucunda Barındırma sürümü**: `ghcr.io/alam00000/bentopdf-simple:latest`. Tüm PDF araçları, tanıtım bölümleri **olmadan** (ana sayfa bölümü, SSS, kullanıcı yorumları, alt bilgi yok). Dahili/ekip/kurum dağıtımları için bunu kullanın. Özellikleri kısıtlanmış bir "lite" sürüm **değildir**.
> - **Ticari sürüm**: `ghcr.io/alam00000/bentopdf:latest`. Tam tanıtım sitesi; bentopdf.com'un kendisi ve herkese açık dağıtım yapan ticari lisans sahipleri tarafından kullanılır.
>
> Emin değilseniz: Kendi Sunucunda Barındırma sürümünü çekin.

```bash
# Docker
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  --restart unless-stopped \
  ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d \
  --name bentopdf \
  -p 3000:8080 \
  ghcr.io/alam00000/bentopdf-simple:latest
```

## Docker Compose / Podman Compose

`docker-compose.yml` dosyasını oluşturun:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    container_name: bentopdf
    ports:
      - '3000:8080'
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:8080']
      interval: 30s
      timeout: 10s
      retries: 3
```

Çalıştırın:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Kendi Görüntünüzü Derleyin

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

Derleyin ve çalıştırın:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Ortam Değişkenleri

| Değişken                             | Açıklama                                                                                                                                                                                            | Varsayılan                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Kendi Sunucunda Barındırma varyantını derler (bentopdf.com tanıtım bölümlerini gizler: ana sayfa bölümü, SSS, kullanıcı yorumları, alt bilgi). Tüm PDF araçları kalır.                              | `false`                                                        |
| `BASE_URL`                           | Alt dizine dağıtım                                                                                                                                                                                  | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | PyMuPDF WASM modül URL'si                                                                                                                                                                           | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | Ghostscript WASM modül URL'si                                                                                                                                                                       | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | CoherentPDF WASM modül URL'si                                                                                                                                                                       | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | OCR worker betik URL'si                                                                                                                                                                             | _(boş; Tesseract.js varsayılan CDN'i kullanılır)_              |
| `VITE_TESSERACT_CORE_URL`            | OCR çekirdek çalışma zamanı dizini                                                                                                                                                                  | _(boş; Tesseract.js varsayılan CDN'i kullanılır)_              |
| `VITE_TESSERACT_LANG_URL`            | OCR traineddata dizini                                                                                                                                                                              | _(boş; Tesseract.js varsayılan CDN'i kullanılır)_              |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Arayüzde gösterilen virgülle ayrılmış OCR dilleri                                                                                                                                                   | _(boş; tam katalog gösterilir)_                                |
| `VITE_OCR_FONT_BASE_URL`             | OCR metin katmanı yazı tipi dizini                                                                                                                                                                  | _(boş; uzak Noto yazı tipi URL'leri kullanılır)_               |
| `VITE_DEFAULT_LANGUAGE`              | Varsayılan arayüz dili                                                                                                                                                                              | `en`                                                           |
| `VITE_BRAND_NAME`                    | Özel marka adı                                                                                                                                                                                      | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | `public/` klasörüne göre logo yolu                                                                                                                                                                  | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Özel alt bilgi/telif hakkı metni                                                                                                                                                                    | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | Gizlenecek araç kimlikleri (virgülle ayrılmış)                                                                                                                                                      | _(boş; tüm araçlar etkin)_                                     |
| `DISABLE_GITHUB_STARS`               | Sayfa yüklenirken GitHub yıldız sayısı çekimini atlar ve `api.github.com` adresini CSP'den çıkarır. Simple Mode derlemeleri bunu her zaman atlar.                                                   | `false`                                                        |
| `SITE_URL`                           | Canonical, hreflang ve sitemap bağlantılarına yazılan herkese açık URL. Arama motorlarının dağıtımınızı ayrı bir site olarak görmesini istemiyorsanız varsayılan değerde bırakın.                   | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Özel bir `SITE_URL` ile her sayfa `noindex` olarak işaretlenir, böylece kopyanız arama sonuçlarında bentopdf.com ile rekabet etmez. Arama motorlarının dizinlemesine izin vermek için `true` yapın. | `false`                                                        |

WASM modül URL'leri CDN varsayılanlarıyla önceden yapılandırılmıştır, tüm gelişmiş özellikler kutudan çıktığı gibi çalışır. İnternetten yalıtılmış veya kendi sunucunuzdaki dağıtımlar için bunları geçersiz kılın.

### Arama motorları

Varsayılan olarak her sayfa, arama motorlarını asıl kaynak olarak bentopdf.com'a yönlendirir, böylece dağıtımınız kopya olarak görünmez. Özel veya dahili bir örnek için hiçbir şeyi değiştirmeniz gerekmez.

- **Örneğinizi arama sonuçlarının tamamen dışında tutun:** konteyneri `-e ROBOTS_NOINDEX=true` ile çalıştırın. Bunun için yalnızca yeniden başlatma gerekir, yeniden derleme gerekmez.
- **Örneğinizi arama sonuçlarında ayrı bir site yapın:** `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true` ile derleyin. `ALLOW_INDEXING=true` olmadan, özel bir `SITE_URL` her sayfayı `noindex` olarak işaretler.

### Content-Security-Policy

nginx görüntüsü, uygulanan bir `Content-Security-Policy` başlığıyla gelir. CSP'nin `script-src`, `connect-src` ve `font-src` yönergeleri, yukarıdaki `VITE_*` URL değişkenlerinden **derleme zamanında oluşturulur**. `--build-arg` ile verdiğiniz tüm ana bilgisayarlar politikaya otomatik olarak eklenir.

Sonuç olarak:

- Derleme zamanında `VITE_CORS_PROXY_URL` veya `VITE_WASM_*_URL` değerlerini geçersiz kılarsanız, CSP bu kaynaklara otomatik izin verir, ek yapılandırma gerekmez.
- `cdn.jsdelivr.net` üzerindeki URL'lerde `script-src`, tüm CDN'e değil yalnızca tam sürümlü paket klasörüne izin verir, örneğin `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`. jsDelivr herhangi bir herkese açık npm paketini veya GitHub deposunu sunar, bu yüzden ana bilgisayarın tamamına izin vermek bunların hepsinin örneğinizde çalışmasına izin verirdi. Diğer ana bilgisayarlardaki URL'lere kaynak bazında izin verilir.
- Özel WASM URL'lerini _çalışma zamanında_ uygulama içi Gelişmiş Ayarlar sayfasından yapılandırırsanız, bu kaynaklar CSP'de **yer almaz** ve tarayıcı bunlara yapılan istekleri engeller. Bu, `cdn.jsdelivr.net` üzerindeki aynı paketin farklı bir sürümü için de geçerlidir, çünkü yalnızca derleme zamanında ayarlanan sürüme izin verilir. Çalışma zamanı yapılandırması deneme amaçlıdır. Kalıcı özel URL'ler için ilgili `VITE_*` build arg değerini ayarlayın.
- Üç `VITE_WASM_*_URL` değerinin tümünü geçersiz kılan internetten yalıtılmış dağıtımlarda, bu `cdn.jsdelivr.net` paket klasörleri de CSP'den çıkarılır (her varsayılan değiştirilir, eklenmez). `cdn.jsdelivr.net` üzerindeki Tesseract OCR varsayılanları, üç `VITE_TESSERACT_*` değerini de ayarlayana kadar politikada kalır. Benzer şekilde, `VITE_CORS_PROXY_URL` ayarlamak herkese açık `bentopdf-cors-proxy.bentopdf.workers.dev` varsayılanının yerini alır.

CSP, `script-src` içinde `'unsafe-eval'` içerir, çünkü LibreOffice WASM çalışma zamanı (Word/Excel/PowerPoint dönüştürme araçlarınca kullanılır) ve wasm-vips görüntü kütüphanesi (PDF'den TIFF'e dönüştürmede kullanılır) dahili dağıtım kodunu `new Function()` ile derler. Bunu kaldırmak bu araçları bozar. `SIMPLE_MODE` ile (LibreOffice olmadan) derliyor ve PDF'den TIFF'e dönüştürmeye ihtiyaç duymuyorsanız, daha sıkı bir politika için oluşturulan `security-headers.conf` dosyasını elle düzenleyip `'unsafe-eval'` değerini çıkarabilirsiniz.

OCR için, varsayılan çevrimiçi varlıkları kullanmak üzere `VITE_TESSERACT_*` değişkenlerini boş bırakın veya kendi sunucunuzdaki/çevrimdışı OCR için üçünü birlikte ayarlayın. Kısmi OCR geçersiz kılmaları reddedilir, çünkü worker, çekirdek çalışma zamanı ve traineddata dizini birbiriyle eşleşmelidir. Tamamen çevrimdışı aranabilir PDF çıktısı için ayrıca `VITE_OCR_FONT_BASE_URL` değerini ayarlayın, böylece OCR metin katmanı yazı tipleri herkese açık Noto yazı tipi URL'leri yerine dahili sunucunuzdan yüklenir.

`VITE_DEFAULT_LANGUAGE`, ilk kez gelen ziyaretçiler için arayüz dilini belirler. Desteklenen değerler: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Kullanıcılar dili yine değiştirebilir, bu yalnızca varsayılanı değiştirir.

Örnek:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Özel Marka

Varsayılan BentoPDF logosunu, adını ve alt bilgi metnini kendinizinkilerle değiştirin. Logo dosyanızı `public/` klasörüne koyun (veya mevcut bir görseli kullanın), ardından marka değişkenlerini derleme zamanında verin:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Marka özelleştirme hem tam modda hem Simple Mode'da çalışır ve diğer tüm derleme zamanı seçenekleriyle birleştirilebilir.

### Belirli Araçları Devre Dışı Bırakma

Uyumluluk veya güvenlik gereksinimleri için araçları arayüzden gizleyin. Devre dışı bırakılan araçlar ana sayfadan, arama sonuçlarından, klavye kısayollarından ve iş akışı oluşturucudan kaldırılır. Doğrudan URL ile erişim "araç kullanılamıyor" sayfasını gösterir.

Araç kimlikleri, sayfa URL'sinin `.html` olmayan halidir. Örneğin araç `bentopdf.com/edit-pdf.html` adresindeyse kimliği `edit-pdf` olur.

#### Araç Kimliklerini Bulma

En kolay yol: BentoPDF'te herhangi bir aracı açıp URL'ye bakın. Yolun son kısmı (`.html` olmadan) araç kimliğidir.

<details>
<summary>Araç kimliklerinin tam listesi</summary>

**Düzenle ve Not Ekle:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**PDF'e Dönüştür:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**PDF'den Dönüştür:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Düzenle ve Yönet:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Optimize Et ve Onar:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Güvenlik:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Seçenek 1: Derleme zamanı (Docker build arg)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Bu, devre dışı listesini JavaScript paketine gömer. Değiştirmek için yeniden derleme gerekir.

#### Seçenek 2: Çalışma zamanı (config.json)

Sunulan dizine bir `config.json` dosyası bağlayın, yeniden derleme gerekmez:

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
}
```

```bash
docker run -d \
  -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

Veya Docker Compose ile:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

İki yöntem birlikte kullanılabilir, listeler birleştirilir. Bir araç herhangi birinde yer alıyorsa devre dışı bırakılır.

#### Düzenleyici Özelliklerini Devre Dışı Bırakma

PDF Düzenleyici içindeki belirli özellikleri (örn. karartma, ek açıklamalar, formlar) tüm düzenleyici aracını devre dışı bırakmadan da kapatabilirsiniz. `config.json` dosyanıza `editorDisabledCategories` ekleyin:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Düzenleyici kategorilerinin tam listesi</summary>

**Yakınlaştırma:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Ek Açıklama:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Şekiller:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Form:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Karartma:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Belge:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Sayfa:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Panel:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Araçlar:** `tools`, `pan`, `pointer`, `capture`

**Seçim:** `selection`, `selection-copy`

**Geçmiş:** `history`, `history-undo`, `history-redo`

</details>

Kategoriler hiyerarşiktir: bir üst kategoriyi (örn. `annotation`) devre dışı bırakmak tüm alt kategorilerini de devre dışı bırakır.

### GitHub Yıldız Sayacını Devre Dışı Bırakma

Gezinme çubuğu, sayfa yüklenirken `api.github.com` adresinden çekilen canlı bir GitHub yıldız sayısı gösterir. Bir PDF özelliğine hizmet etmeyen tek harici istek budur. Çekme kodunu paketten kaldırmak ve `api.github.com` adresini Content-Security-Policy'den çıkarmak için derleme zamanında devre dışı bırakın:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Simple Mode derlemeleri (`bentopdf-simple`) yıldız sayacını her zaman atlar. Bu bayrak yalnızca Ticari sürümde veya özel tam derlemelerde gereklidir.

### Özel WASM URL'leri (İnternetten Yalıtılmış / Kendi Sunucunuzda)

> [!IMPORTANT]
> WASM URL'leri JavaScript'e **derleme zamanında** gömülür. WASM dosyaları çalışma zamanında **kullanıcının tarayıcısı** tarafından indirilir, Docker bunları derleme sırasında indirmez. İnternetten yalıtılmış ağlarda WASM dosyalarını tarayıcıların erişebildiği dahili bir sunucuda barındırmanız gerekir.

**Tam air-gapped iş akışı:**

```bash
# 1. On a machine WITH internet — download WASM packages
bash scripts/prepare-airgap.sh --list-ocr-languages
bash scripts/prepare-airgap.sh --search-ocr-language german

# 2. Download WASM/OCR packages
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf

# 3. Build the image with your internal server URLs
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .

# 4. Export the image
docker save bentopdf -o bentopdf.tar

# 5. Transfer bentopdf.tar + the .tgz packages + tesseract-langdata/ + ocr-fonts/ into the air-gapped network

# 6. Inside the air-gapped network — load and run
docker load -i bentopdf.tar

# Extract WASM packages to your internal web server
mkdir -p /var/www/wasm/pymupdf /var/www/wasm/gs /var/www/wasm/cpdf /var/www/wasm/ocr/core /var/www/wasm/ocr/lang-data /var/www/wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C /var/www/wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C /var/www/wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C /var/www/wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" /var/www/wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C /var/www/wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz /var/www/wasm/ocr/lang-data/
cp ./ocr-fonts/* /var/www/wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

`--ocr-languages` için `bash scripts/prepare-airgap.sh --list-ocr-languages` komutunun yazdırdığı kodları kullanın veya `bash scripts/prepare-airgap.sh --search-ocr-language <term>` ile ada göre arayın. Kısıtlı bir OCR alt kümesiyle derlerken, uygulamanın yalnızca pakete dahil dilleri göstermesi için aynı kodları `VITE_TESSERACT_AVAILABLE_LANGUAGES` değerine verin. Tam çevrimdışı OCR çıktısı için ayrıca paketle gelen `ocr-fonts/` dizinini barındırın ve `VITE_OCR_FONT_BASE_URL` değerini ona yönlendirin.

Bir modülü devre dışı bırakmak için değişkeni boş bir dizeye ayarlayın (kullanıcıların Gelişmiş Ayarlar üzerinden elle yapılandırması gerekir).

## Özel Port

Varsayılan olarak BentoPDF, konteyner içinde `8080` portunu dinler. Bunu değiştirmek için çalışma zamanında `PORT` ortam değişkenini ayarlayın:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Değişken | Açıklama                        | Varsayılan |
| -------- | ------------------------------- | ---------- |
| `PORT`   | Konteynerde Nginx dinleme portu | `8080`     |

Bu, hem standart hem nonroot Dockerfile'larla çalışır.

## Özel Kullanıcı Kimliği (PUID/PGID)

Belirli bir root olmayan kullanıcı olarak çalışmayı gerektiren ortamlar için (NAS cihazları, güvenlik bağlamlı Kubernetes, kurumsal politikalar), BentoPDF, LSIO tarzı PUID/PGID desteğine sahip ayrı bir Dockerfile sunar.

### Derleme ve Çalıştırma

```bash
# Build the non-root image
docker build -f Dockerfile.nonroot -t bentopdf-nonroot .

# Run with custom UID/GID
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  -e PUID=1000 \
  -e PGID=1000 \
  --restart unless-stopped \
  bentopdf-nonroot
```

### Ortam Değişkenleri

| Değişken       | Açıklama                            | Varsayılan |
| -------------- | ----------------------------------- | ---------- |
| `PUID`         | Çalıştırılacak kullanıcı kimliği    | `1000`     |
| `PGID`         | Çalıştırılacak grup kimliği         | `1000`     |
| `PORT`         | Nginx dinleme portu                 | `8080`     |
| `DISABLE_IPV6` | IPv6 dinleyicisini devre dışı bırak | `false`    |

### Docker Compose

```yaml
services:
  bentopdf:
    build:
      context: .
      dockerfile: Dockerfile.nonroot
    container_name: bentopdf
    ports:
      - '3000:8080'
    environment:
      - PUID=1000
      - PGID=1000
    restart: unless-stopped
```

### Nasıl Çalışır

Konteyner root olarak başlar, belirtilen PUID/PGID ile bir kullanıcı oluşturur, yazılabilir tüm dizinlerin sahipliğini ayarlar, ardından `su-exec` ile ayrıcalıkları düşürür. nginx süreci tamamen belirttiğiniz kullanıcı olarak çalışır.

> [!NOTE]
> Standart `Dockerfile`, `nginx-unprivileged` (UID 101) kullanır ve çoğu dağıtım için önerilir. `Dockerfile.nonroot` dosyasını yalnızca belirli bir UID/GID gerektiğinde kullanın.

> [!WARNING]
> PUID/PGID `0` (root) olamaz. Giriş noktası girdileri doğrular ve geçersiz değerlerde hatayla çıkar.

## Traefik ile (Ters Proxy)

```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - '--providers.docker=true'
      - '--entrypoints.web.address=:80'
      - '--entrypoints.websecure.address=:443'
      - '--certificatesresolvers.letsencrypt.acme.email=you@example.com'
      - '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web'
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.bentopdf.rule=Host(`pdf.example.com`)'
      - 'traefik.http.routers.bentopdf.entrypoints=websecure'
      - 'traefik.http.routers.bentopdf.tls.certresolver=letsencrypt'
      - 'traefik.http.services.bentopdf.loadbalancer.server.port=8080'
      # Required headers for SharedArrayBuffer (LibreOffice WASM)
      - 'traefik.http.routers.bentopdf.middlewares=bentopdf-headers'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Opener-Policy=same-origin'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Embedder-Policy=require-corp'
    restart: unless-stopped
```

## Caddy ile (Ters Proxy)

```yaml
services:
  caddy:
    image: caddy:2
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    restart: unless-stopped

volumes:
  caddy_data:
```

Caddyfile:

```
pdf.example.com {
    reverse_proxy bentopdf:8080
    header Cross-Origin-Opener-Policy "same-origin"
    header Cross-Origin-Embedder-Policy "require-corp"
}
```

## Kaynak Sınırları

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## Podman Quadlet (Systemd Entegrasyonu)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) Podman konteynerlerini systemd servisleri olarak çalıştırmanızı sağlar. Linux sistemlerdeki üretim dağıtımları için idealdir.

### Temel Quadlet Kurulumu

`~/.config/containers/systemd/bentopdf.container` (kullanıcı) veya `/etc/containers/systemd/bentopdf.container` (sistem) konumunda bir konteyner birim dosyası oluşturun:

```ini
[Unit]
Description=BentoPDF - Privacy-first PDF toolkit
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Etkinleştirme ve Başlatma

```bash
# Reload systemd to detect new unit
systemctl --user daemon-reload

# Start the service
systemctl --user start bentopdf

# Enable on boot
systemctl --user enable bentopdf

# Check status
systemctl --user status bentopdf

# View logs
journalctl --user -u bentopdf -f
```

> [!TIP]
> Sistem genelinde dağıtım için `systemctl` komutunu `--user` bayrağı olmadan kullanın ve dosyayı `/etc/containers/systemd/` içine yerleştirin.

### Sağlık Kontrollü Quadlet

```ini
[Unit]
Description=BentoPDF with health monitoring
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry
HealthCmd=wget --spider -q http://localhost:8080 || exit 1
HealthInterval=30s
HealthTimeout=10s
HealthRetries=3

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Quadlet ile Otomatik Güncelleme

Podman, yeni görüntüler mevcut olduğunda konteynerleri otomatik güncelleyebilir:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Quadlet Ağ Yapılandırması

Özel ağ yapılandırması için `bentopdf.network` ağ dosyasını oluşturun:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Ardından konteyner dosyanızda ona başvurun:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Güncelleme

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
