# Kendi Sunucunuzda Barındırma Kılavuzu

BentoPDF kendi altyapınızda barındırılabilir. Bu kılavuz çeşitli dağıtım seçeneklerini kapsar.

## Docker / Podman ile Hızlı Başlangıç

BentoPDF'i kendi sunucunuzda barındırmanın en hızlı yolu:

> [!TIP]
> BentoPDF iki derleme halinde sunulur:
>
> - **Kendi Sunucunuzda Barındırma derlemesi**: `ghcr.io/alam00000/bentopdf-simple:latest`. Tanıtım arayüzü olmadan (kahraman bölümü, SSS, kullanıcı yorumları, alt bilgi yok) tüm PDF araçlarını içerir. Kurum içi/ekip/organizasyon dağıtımları için bunu kullanın. Özellikleri kısıtlanmış bir "lite" sürüm **değildir**.
> - **Ticari derleme**: `ghcr.io/alam00000/bentopdf:latest`. Tanıtım sitesinin tamamını içerir; bentopdf.com'un kendisi ve herkese açık dağıtım yapan ticari lisans sahipleri tarafından kullanılır.
>
> Emin değilseniz: Kendi Sunucunuzda Barındırma derlemesini çekin.

> [!IMPORTANT]
> Office dosyası dönüştürme `SharedArrayBuffer` gerektirir; bu da uygulamanın hem çapraz kaynak yalıtımlı olması hem de güvenli bir bağlamdan sunulması anlamına gelir. Resmi imaj gerekli COOP/COEP başlıklarını zaten gönderir, ancak tarayıcılar `http://192.168.x.x` gibi düz HTTP yerel ağ kaynaklarında `SharedArrayBuffer`'ı yine de devre dışı bırakır.
>
> `http://localhost` adresini yalnızca aynı cihazdaki testler için kullanın. Kullanıcılar BentoPDF'e bir yerel ağ IP'si veya ana bilgisayar adı üzerinden erişiyorsa, bağlantıyı HTTPS ile sonlandırın.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Veya Docker Compose / Podman Compose ile:

```yaml
# docker-compose.yml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    restart: unless-stopped
```

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Podman Quadlet (Linux Systemd)

BentoPDF'i bir systemd hizmeti olarak çalıştırın. `~/.config/containers/systemd/bentopdf.container` dosyasını oluşturun:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now bentopdf
```

Tam Quadlet belgeleri için [Docker dağıtım kılavuzuna](/tr/self-hosting/docker) bakın.

## Kaynaktan Derleme

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Yapılandırma Seçenekleri

### Kendi Sunucunuzda Barındırma derlemesi (Basit Mod)

Kendi Sunucunuzda Barındırma derlemesi (`bentopdf-simple` imajı, Basit Mod olarak da adlandırılır) Ticari derlemeyle **işlevsel olarak aynıdır**: her PDF aracı mevcuttur ve aynı şekilde davranır. Yalnızca bentopdf.com'da veya herkese açık bir ticari dağıtımda anlamlı olan tanıtım arayüzünü gizler. **Özellikleri kısıtlanmış veya "lite" bir sürüm değildir.**

**Kendi Sunucunuzda Barındırma derlemesinin gizledikleri** (yalnızca görünüm; hiçbir PDF özelliği kaldırılmaz):

- Gezinme çubuğu, kahraman bölümü, özellikler bölümü, SSS, kullanıcı yorumları, alt bilgi
- Sayfa başlığını "PDF Araçları" olarak günceller

**Kendi Sunucunuzda Barındırma derlemesinin koruduğu** (gerçekten PDF işi yapan her şey):

- Her PDF aracı (birleştirme, bölme, düzenleme, imzalama, OCR, Office dönüştürme vb.)
- Özel marka desteği, tüm derleme zamanı ve çalışma zamanı yapılandırması

Ticari derleme (`ghcr.io/alam00000/bentopdf:latest`) bentopdf.com'un kendisini çalıştıran ve herkese açık dağıtım yapan ticari lisans sahipleri tarafından kullanılan derlemedir; bir kurum içi araçta anlamlı olmayacak kahraman bölümü, SSS, kullanıcı yorumları ve alt bilgiyi ekler.

BentoPDF'i ekibiniz, kuruluşunuz veya kurum içi bir araç olarak kendi sunucunuzda barındırıyorsanız, Kendi Sunucunuzda Barındırma derlemesini çekin:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Tüm ayrıntılar için [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) dosyasına bakın.

### Ticari derleme (kendi markanızla herkese açık dağıtımlar)

Ticari derleme (`bentopdf` imajı, `-simple` soneki olmadan) bentopdf.com'un kendisini çalıştıran derlemedir. Her PDF aracının üzerine tanıtım sitesinin tamamını (kahraman bölümü, özellikler, SSS, kullanıcı yorumları, alt bilgi) ekler. **BentoPDF'i kendi markanız altında herkese açık bir PDF hizmeti olarak dağıtmak** istediğinizde bu derlemeyi kullanın, örneğin:

- BentoPDF'i kendi alan adınızda son kullanıcılar için barındırılan bir SaaS olarak çalıştırıyorsunuz
- Yalnızca çıplak araç arayüzünü değil, açılış sayfası deneyimini (tanıtım bölümleri + araçlar) istiyorsunuz
- BentoPDF'i ticari bir ürüne gömen bir ticari lisans sahibisiniz

**Olduğu gibi çalıştırın** (BentoPDF markası, derlemeyi önizlemek için yararlıdır):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Kendi markanızla derleyin** (tipik ticari iş akışı):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Diğer tüm derleme zamanı seçenekleri (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, WASM URL geçersiz kılmaları vb.) Kendi Sunucunuzda Barındırma derlemesinde olduğu gibi çalışır.

::: warning Lisanslama
Ticari derlemeyi çalıştırmaya BentoPDF'in iki lisans seçeneğinden biri altında izin verilir:

- **AGPL-3.0** (ücretsiz): dağıtımınız, marka değişiklikleri ve çevresindeki iş mantığı dahil tüm kaynak kodunu AGPL altında yayımlıyorsa izin verilir.
- **Ticari lisans** ($79 ömür boyu): marka fork'unuzu veya iş kodunuzu açık kaynak yapmadığınız kapalı kaynaklı / tescilli dağıtımlar için gereklidir.

Tam karşılaştırma için [Lisanslama sayfasına](https://www.bentopdf.com/licensing) bakın. AGPL lisanslı WASM modülleri (PyMuPDF, Ghostscript, CoherentPDF) çalışma zamanında bir CDN'den yüklenir, bu nedenle imajınıza girmezler ve lisanslama durumunuzu değiştirmezler.
:::

### Temel URL

Bir alt dizine dağıtın:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Özel Marka

Varsayılan BentoPDF logosunu, adını ve alt bilgi metnini derleme zamanında kendinizinkilerle değiştirin:

| Değişken           | Açıklama                                | Varsayılan                              |
| ------------------ | --------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Üst ve alt bilgide gösterilen marka adı | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | `public/` dizinine göre logo yolu       | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Özel alt bilgi/telif hakkı metni        | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Veya Docker ile:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Marka özelleştirme hem tam modda hem de Basit Modda çalışır ve diğer tüm derleme zamanı seçenekleriyle (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`) birlikte kullanılabilir.

### Belirli Araçları Devre Dışı Bırakma

Uyumluluk veya güvenlik için tek tek araçları gizleyin. Devre dışı bırakılan araçlar ana sayfadan, aramadan, kısayollardan, iş akışı oluşturucudan ve doğrudan URL erişiminden kaldırılır.

Araç kimlikleri, `.html` olmadan sayfa URL'sidir: herhangi bir aracı açıp URL'ye bakın (örn. `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Derleme zamanı** (pakete gömülür):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Çalışma zamanı** (yeniden derleme gerekmez, bir `config.json` bağlayın):

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf"]
}
```

```bash
docker run -d -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

Her iki yöntem birlikte kullanılabilir: listeler birleştirilir.

Ayrıca `config.json` dosyasına `editorDisabledCategories` ekleyerek, aracın tamamını devre dışı bırakmadan PDF Düzenleyici içindeki belirli özellikleri (örn. karartma) devre dışı bırakabilirsiniz. Kategorilerin tam listesi için [Docker kılavuzuna](/tr/self-hosting/docker#duzenleyici-ozelliklerini-devre-dısı-bırakma) bakın.

## Dağıtım Kılavuzları

Platformunuzu seçin:

- [Vercel](/tr/self-hosting/vercel)
- [Netlify](/tr/self-hosting/netlify)
- [Cloudflare Pages](/tr/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/tr/self-hosting/aws)
- [Hostinger](/tr/self-hosting/hostinger)
- [Nginx](/tr/self-hosting/nginx)
- [Apache](/tr/self-hosting/apache)
- [Docker](/tr/self-hosting/docker)
- [Kubernetes](/tr/self-hosting/kubernetes)
- [CORS Proxy](/tr/self-hosting/cors-proxy) - Dijital imzalar için gereklidir

## Sık Karşılaşılan Sorunlar

### Word / ODT / Excel / PowerPoint'ten PDF'ye Dönüştürme Takılıyor (SharedArrayBuffer Kullanılamıyor)

**Belirti**: LibreOffice tabanlı belge dönüştürmeleri (Word, ODT, Excel, PowerPoint'ten PDF'ye) yaklaşık %55'te takılır veya başlamaz. Tarayıcı konsolu şunu gösterebilir:

> `ReferenceError: SharedArrayBuffer is not defined`

...veya `window.crossOriginIsolated` değeri `false` döner ya da WASM derlemesi `expected magic word 00 61 73 6d, found 1f 8b 08 08` bildirir.

**Neden**: LibreOffice WASM, tarayıcının yalnızca sayfa **çapraz kaynak yalıtımlı** VE **güvenli bir bağlamdan** sunulduğunda etkinleştirdiği `SharedArrayBuffer`'a ihtiyaç duyar. Bunun için iki şeyin doğru olması gerekir:

1. Her yanıt her iki başlığı da içerir:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. Sayfa `https://...` veya `http://localhost` üzerinden sunulur. Yerel ağ IP'sinde düz HTTP (örn. `http://192.168.x.x`) güvenli SAYILMAZ: tarayıcılar orada `SharedArrayBuffer`'ı devre dışı bırakır.

`00 61 73 6d / 1f 8b 08 08` uyuşmazlığı ayrı bir alt belirtidir: önceden sıkıştırılmış `.wasm.gz` / `.data.gz` dosyalarında `Content-Encoding: gzip` yanıt başlığı eksiktir, bu yüzden tarayıcı açılmış WASM yerine ham gzip baytlarını alır.

**Çözüm**: tam yapılandırma için platformunuza özel dağıtım kılavuzuna bakın:

- [Nginx →](/tr/self-hosting/nginx#word-odt-excel-den-pdf-ye-donusturme-calısmıyor)
- [Apache →](/tr/self-hosting/apache#word-odt-excel-den-pdf-e-donusturme-calısmıyor)
- [AWS S3 + CloudFront →](/tr/self-hosting/aws#adım-3b-response-headers-policy-libreoffice-wasm-icin-gerekli)
- [Cloudflare Pages →](/tr/self-hosting/cloudflare#yapılandırma-dosyası) (`_headers` dosyası)
- [Netlify →](/tr/self-hosting/netlify#word-odt-excel-den-pdf-ye-donusturme-55-te-takılıyor) (`netlify.toml`)
- [Vercel →](/tr/self-hosting/vercel#word-odt-excel-den-pdf-ye-donusturme-calısmıyor) (`vercel.json`)
- [Hostinger →](/tr/self-hosting/hostinger#libreoffice-aracları-calısmıyor) (`.htaccess`)
- [Kubernetes →](/tr/self-hosting/kubernetes#sharedarraybuffer-baslıklarının-hala-calıstıgından-emin-olma-ingress-gateway)
- **Docker**: birlikte gelen nginx yapılandırması tarafından otomatik olarak halledilir, işlem gerekmez.

**Doğrulama**: herhangi bir BentoPDF sayfasında DevTools Konsolu'nu açın ve şunu çalıştırın:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Sayfa HTTPS veya `http://localhost` ise VE her yanıtta hem COEP hem COOP başlıkları varsa, iki kontrol de geçer. `http://192.168.x.x` veya loopback olmayan başka bir HTTP kaynağındaysanız, bağlantıyı HTTPS ile sonlandırın: yalnızca başlıkla çözülebilecek bir çözüm yoktur.

### `.mjs` Dosyaları `application/octet-stream` Olarak Sunuluyor

**Belirti**: PDF İmzala / Form Doldurucu / bazı diğer araçlar boş bir görüntüleyici gösterir veya yüklenemez. Tarayıcı konsolu şunu bildirir:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Neden**: Web sunucunuzda veya ters proxy'nizde `.mjs` dosyaları için bir MIME türü eşlemesi yok (birlikte gelen PDF görüntüleyici ES modüllerini bu uzantıyla sunar). Birçok standart sunucu yapılandırması tanınmayan uzantılar için varsayılan olarak `application/octet-stream` kullanır ve tarayıcılar bunu ES modülü olarak çalıştırmayı reddeder.

**Çözüm**: tam kod parçacığı için platformunuza özel dağıtım kılavuzuna bakın:

- [Nginx →](/tr/self-hosting/nginx#pdf-imzala-veya-form-doldurucu-bos-goruntuleyici-gosteriyor-mjs-mime-hatası)
- [Apache →](/tr/self-hosting/apache#pdf-imzala-veya-form-doldurucu-bos-goruntuleyici-gosteriyor-mjs-mime-hatası)
- [AWS S3 + CloudFront →](/tr/self-hosting/aws#adım-2-derleyin-ve-yukleyin) (`aws s3 cp ... --include "*.mjs"` bölümüne bakın)
- [Kubernetes →](/tr/self-hosting/kubernetes#mjs-mime-turu-hataları-pdf-imzala-form-doldurucu-iframe-i-bos)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: otomatik olarak halledilir, işlem gerekmez.

**Doğrulama**: DevTools → Network sekmesini açın, başarısız olan `.mjs` isteğini bulun ve `Content-Type` yanıt başlığını kontrol edin. `application/javascript` olmalıdır. Hâlâ `application/octet-stream` ise, dıştaki bir ters proxy veya CDN türü yeniden algılıyor olabilir: sunum zincirinizdeki her katmanı kontrol edin.

## WASM Yapılandırması (AGPL Bileşenleri)

BentoPDF, AGPL lisanslı işleme kütüphanelerini kaynak koduna **dahil etmez**, ancak tüm özelliklerin kutudan çıktığı gibi çalışması için **CDN URL'lerini önceden yapılandırır**; elle kurulum gerekmez.

::: tip Varsayılan Olarak Sıfır Yapılandırma
v2.0.0 itibarıyla WASM modülleri, ortam değişkenleriyle jsDelivr CDN'den yüklenecek şekilde önceden yapılandırılmıştır. Tüm gelişmiş özellikler herhangi bir kullanıcı yapılandırması olmadan hemen çalışır.
:::

| Bileşen         | Lisans   | Özellikler                                                     |
| --------------- | -------- | -------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | EPUB/MOBI/FB2/XPS dönüştürme, görsel çıkarma, tablo çıkarma    |
| **Ghostscript** | AGPL-3.0 | PDF/A dönüştürme, sıkıştırma, eğrilik düzeltme, rasterleştirme |
| **CoherentPDF** | AGPL-3.0 | İçindekiler, ekler, yer işaretleriyle PDF birleştirme          |

### Varsayılan Ortam Değişkenleri

Bunlar `.env.production` dosyasında ayarlanır ve derlemeye gömülür:

```bash
VITE_WASM_PYMUPDF_URL=https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/
VITE_WASM_GS_URL=https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/
VITE_WASM_CPDF_URL=https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/
VITE_TESSERACT_WORKER_URL=
VITE_TESSERACT_CORE_URL=
VITE_TESSERACT_LANG_URL=
VITE_TESSERACT_AVAILABLE_LANGUAGES=
VITE_OCR_FONT_BASE_URL=
```

### WASM URL'lerini Geçersiz Kılma

Özel dağıtımlar için varsayılanları derleme zamanında geçersiz kılabilirsiniz:

```bash
# Via Docker build args
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://your-server.com/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://your-server.com/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://your-server.com/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://your-server.com/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://your-server.com/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://your-server.com/ocr/fonts \
  -t bentopdf .

# Or via .env.production before building from source
VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ npm run build
```

Bir modülü tamamen devre dışı bırakmak için (kullanıcının Gelişmiş Ayarlar üzerinden elle yapılandırmasını gerektirir), değişkenini boş bir dizeye ayarlayın.

OCR için ya tüm `VITE_TESSERACT_*` değişkenlerini boş bırakıp varsayılan çevrimiçi varlıkları kullanın ya da kendi sunucunuzda/çevrimdışı OCR için worker/core/lang URL'lerini birlikte ayarlayın. Yalnızca belirli OCR dillerini pakete dahil ederseniz, arayüzün yalnızca kurulu dilleri sunması ve desteklenmeyen seçimlerin açıklayıcı bir hatayla başarısız olması için `VITE_TESSERACT_AVAILABLE_LANGUAGES` değişkenini de aynı virgülle ayrılmış kodlara ayarlayın. Tam çevrimdışı aranabilir PDF çıktısı için ayrıca `VITE_OCR_FONT_BASE_URL` değişkenini, birlikte gelen OCR yazı tiplerini sunan dahili dizine ayarlayın.

Kullanıcılar ayrıca bu varsayılanları arayüzdeki **Gelişmiş Ayarlar** üzerinden istedikleri zaman geçersiz kılabilir: tarayıcıda saklanan kullanıcı geçersiz kılmaları ortam varsayılanlarına göre önceliklidir.

### Hava Boşluklu / Çevrimdışı Dağıtım

İnternet erişimi olmayan ağlar için (kamu, sağlık, finans vb.). WASM URL'leri JavaScript'e **derleme zamanında** gömülür; gerçek WASM dosyaları çalışma zamanında **kullanıcının tarayıcısı** tarafından indirilir. Bu nedenle her şeyi internet erişimi olan bir makinede hazırlayıp yalıtılmış ağa aktarmanız gerekir.

#### Otomatik Betik (Önerilen)

Birlikte gelen `prepare-airgap.sh` betiği tüm süreci otomatikleştirir: WASM paketlerini indirir, Docker imajını derler ve bir kurulum betiğiyle birlikte kendi kendine yeten bir paket üretir.

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Show supported OCR language codes (for --ocr-languages)
bash scripts/prepare-airgap.sh --list-ocr-languages

# Search OCR language codes by name or abbreviation
bash scripts/prepare-airgap.sh --search-ocr-language german

# Interactive mode — prompts for all options
bash scripts/prepare-airgap.sh

# Or fully automated
bash scripts/prepare-airgap.sh --wasm-base-url https://internal.example.com/wasm
```

Bu, bir paket dizini üretir:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Paketi USB, kurum içi yapıt deposu veya onaylı bir yöntemle hava boşluklu ağa aktarın. Ardından birlikte gelen kurulum betiğini çalıştırın:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Kurulum betiği Docker imajını yükler, WASM dosyalarını çıkarır ve isteğe bağlı olarak kapsayıcıyı başlatır.

**Betik seçenekleri:**

| Bayrak                         | Açıklama                                                          | Varsayılan                   |
| ------------------------------ | ----------------------------------------------------------------- | ---------------------------- |
| `--wasm-base-url <url>`        | WASM'lerin dahili olarak barındırılacağı yer                      | _(zorunlu, eksikse sorulur)_ |
| `--image-name <name>`          | Docker imaj etiketi                                               | `bentopdf`                   |
| `--output-dir <path>`          | Çıktı paketi dizini                                               | `./bentopdf-airgap-bundle`   |
| `--simple-mode`                | Basit Modu etkinleştirir                                          | kapalı                       |
| `--base-url <path>`            | Alt dizin temel URL'si (örn. `/pdf/`)                             | `/`                          |
| `--language <code>`            | Varsayılan arayüz dili (örn. `fr`, `de`)                          | _(yok)_                      |
| `--brand-name <name>`          | Özel marka adı                                                    | _(yok)_                      |
| `--brand-logo <path>`          | `public/` dizinine göre logo yolu                                 | _(yok)_                      |
| `--footer-text <text>`         | Özel alt bilgi metni                                              | _(yok)_                      |
| `--ocr-languages <list>`       | Pakete dahil edilecek virgülle ayrılmış OCR dilleri               | `eng`                        |
| `--list-ocr-languages`         | Desteklenen OCR kodlarını ve adlarını yazdırır, sonra çıkar       | kapalı                       |
| `--search-ocr-language <term>` | OCR kodlarını ada veya kısaltmaya göre arar                       | kapalı                       |
| `--dockerfile <path>`          | Kullanılacak Dockerfile                                           | `Dockerfile`                 |
| `--skip-docker`                | Docker derlemesini ve dışa aktarmayı atlar                        | kapalı                       |
| `--skip-wasm`                  | WASM indirmeyi atlar (mevcut `.tgz` dosyalarını yeniden kullanır) | kapalı                       |

Etkileşimli istem ayrıca tam desteklenen Tesseract kod listesini yazdırmak için `list` ve `search german` veya `search chi` gibi eşleşmeleri bulmak için `search <term>` kabul eder.

::: warning Aynı Kaynak Gereksinimi
WASM dosyaları BentoPDF uygulamasıyla **aynı kaynaktan** sunulmalıdır. Web Worker'lar, komut dosyalarını çapraz kaynaktan yükleyemeyen `importScripts()` kullanır. Örneğin BentoPDF `https://internal.example.com` adresinde çalışıyorsa, WASM temel URL'si de `https://internal.example.com/wasm` olmalıdır.
:::

#### Elle Adımlar

<details>
<summary>Betik olmadan elle yapmayı tercih ediyorsanız</summary>

**Adım 1: WASM ve OCR paketlerini indirin** (internet erişimi olan bir makinede)

```bash
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf
```

**Adım 2: Docker imajını dahili URL'lerle derleyin**

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .
```

**Adım 3: Docker imajını dışa aktarın**

```bash
docker save bentopdf -o bentopdf.tar
```

**Adım 4: Hava boşluklu ağa aktarın**

USB, kurum içi yapıt deposu veya onaylı aktarım yöntemiyle kopyalayın:

- `bentopdf.tar`: Docker imajı
- Adım 1'deki beş `.tgz` WASM/OCR paketi
- Adım 1'deki `tesseract-langdata/` dizini
- Adım 1'deki `ocr-fonts/` dizini

**Adım 5: Hava boşluklu ağın içinde kurun**

```bash
# Load the Docker image
docker load -i bentopdf.tar

# Extract WASM packages
mkdir -p ./wasm/pymupdf ./wasm/gs ./wasm/cpdf ./wasm/ocr/core ./wasm/ocr/lang-data ./wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C ./wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C ./wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C ./wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" ./wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C ./wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz ./wasm/ocr/lang-data/
cp ./ocr-fonts/* ./wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

Dosyaların Adım 2'de yapılandırdığınız URL'lerde, yani `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` ve `.../ocr/fonts` dahil erişilebilir olduğundan emin olun.

</details>

::: info Docker yerine kaynaktan mı derliyorsunuz?
`npm run build` çalıştırmadan önce değişkenleri `.env.production` dosyasında ayarlayın:

```bash
VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/
VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/
VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/
VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js
VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core
VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data
VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts
```

:::

### Kendi WASM Proxy'nizi Barındırma

AGPL WASM dosyalarını uygun CORS başlıklarıyla sunmanız gerekiyorsa basit bir proxy dağıtabilirsiniz. Örnek bir uygulama için [Cloudflare WASM Proxy kılavuzuna](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) bakın.

::: tip Neden Ayrı?
Bu ayrım şunları sağlar:

- Ticari kullanıcılar için net yasal uyumluluk
- BentoPDF çekirdeğinin ikili lisansı (AGPL-3.0 / Ticari) altında kalması
- WASM dosyalarının kaynağa dahil edilmeden çalışma zamanında yüklenmesi
  :::

## Sistem Gereksinimleri

| Gereksinim | Asgari                                    |
| ---------- | ----------------------------------------- |
| Depolama   | ~100 MB (AGPL modülleri olmadan çekirdek) |
| RAM        | 512 MB                                    |
| CPU        | Herhangi bir modern işlemci               |

::: tip
BentoPDF statik bir sitedir: veritabanı veya arka uç sunucusu gerekmez!
:::
