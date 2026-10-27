# Deploy dengan Docker / Podman

Cara termudah untuk menghosting BentoPDF sendiri di lingkungan produksi.

> [!IMPORTANT]
> **Header yang Diperlukan untuk Konversi File Office**
>
> Alat berbasis LibreOffice (konversi Word, Excel, PowerPoint) memerlukan header HTTP berikut untuk dukungan `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Halaman juga harus disajikan dari konteks aman (secure context). `http://localhost` berfungsi untuk pengujian lokal, tetapi `http://192.168.x.x` atau IP LAN lainnya biasanya tidak memenuhi syarat, sehingga konversi Office melalui HTTP biasa akan gagal meskipun header sudah ada.
>
> Image container resmi sudah menyertakan header ini. Jika menggunakan reverse proxy (Traefik, Caddy, dll.), pastikan header ini dipertahankan atau ditambahkan, dan gunakan HTTPS untuk akses non-loopback.

> [!TIP]
> **Pengguna Podman:** Semua perintah `docker` dapat dipakai dengan Podman dengan mengganti `docker` menjadi `podman` dan `docker-compose` menjadi `podman-compose`.

## Mulai Cepat

> [!TIP]
> BentoPDF tersedia dalam dua build:
>
> - **Self-Hosted build**: `ghcr.io/alam00000/bentopdf-simple:latest`. Semua alat PDF, **tanpa** elemen pemasaran (tanpa hero, FAQ, testimoni, footer). Gunakan ini untuk penerapan internal/tim/organisasi. Ini **bukan** versi "lite" dengan fitur yang dikurangi.
> - **Commercial build**: `ghcr.io/alam00000/bentopdf:latest`. Situs pemasaran lengkap, digunakan oleh bentopdf.com sendiri dan oleh pemegang lisensi komersial yang menjalankan penerapan publik.
>
> Jika ragu: gunakan Self-Hosted build.

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

Buat `docker-compose.yml`:

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

Jalankan:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Build Image Anda Sendiri

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

Build dan jalankan:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Environment Variable

| Variabel                             | Deskripsi                                                                                                                                                                             | Default                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Build varian Self-Hosted (menyembunyikan elemen pemasaran bentopdf.com: hero, FAQ, testimoni, footer). Semua alat PDF tetap ada.                                                      | `false`                                                        |
| `BASE_URL`                           | Deploy ke subdirektori                                                                                                                                                                | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL modul WASM PyMuPDF                                                                                                                                                                | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL modul WASM Ghostscript                                                                                                                                                            | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL modul WASM CoherentPDF                                                                                                                                                            | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL skrip worker OCR                                                                                                                                                                  | _(kosong; gunakan CDN default Tesseract.js)_                   |
| `VITE_TESSERACT_CORE_URL`            | Direktori runtime inti OCR                                                                                                                                                            | _(empty; use Tesseract.js default CDN)_                        |
| `VITE_TESSERACT_LANG_URL`            | Direktori traineddata OCR                                                                                                                                                             | _(empty; use Tesseract.js default CDN)_                        |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Bahasa OCR yang ditampilkan di UI, dipisahkan koma                                                                                                                                    | _(kosong; tampilkan katalog lengkap)_                          |
| `VITE_OCR_FONT_BASE_URL`             | Direktori font lapisan teks OCR                                                                                                                                                       | _(kosong; gunakan URL font Noto jarak jauh)_                   |
| `VITE_DEFAULT_LANGUAGE`              | Bahasa UI default                                                                                                                                                                     | `en`                                                           |
| `VITE_BRAND_NAME`                    | Nama merek kustom                                                                                                                                                                     | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Path logo relatif terhadap `public/`                                                                                                                                                  | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Teks footer/hak cipta kustom                                                                                                                                                          | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | ID alat yang disembunyikan, dipisahkan koma                                                                                                                                           | _(kosong; semua alat aktif)_                                   |
| `DISABLE_GITHUB_STARS`               | Lewati pengambilan jumlah bintang GitHub saat halaman dimuat dan hapus `api.github.com` dari CSP. Build Simple Mode selalu melewatinya.                                               | `false`                                                        |
| `SITE_URL`                           | URL publik yang ditulis ke tautan canonical, hreflang, dan sitemap. Biarkan default kecuali Anda ingin mesin pencari memperlakukan deployment Anda sebagai situs tersendiri.          | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Dengan `SITE_URL` kustom, setiap halaman ditandai `noindex` agar salinan Anda tidak bersaing dengan bentopdf.com di hasil pencarian. Atur ke `true` agar mesin pencari mengindeksnya. | `false`                                                        |

URL modul WASM sudah dikonfigurasi dengan default CDN, sehingga semua fitur lanjutan langsung berfungsi. Timpa nilai ini untuk deployment air-gapped atau hosting mandiri.

### Mesin pencari

Secara default, setiap halaman mengarahkan mesin pencari ke bentopdf.com sebagai sumber aslinya, sehingga deployment Anda tidak muncul sebagai duplikat. Anda tidak perlu mengubah apa pun untuk instans privat atau internal.

- **Sembunyikan instans Anda sepenuhnya dari hasil pencarian:** jalankan container dengan `-e ROBOTS_NOINDEX=true`. Ini hanya perlu restart, tidak perlu build ulang.
- **Jadikan instans Anda situs tersendiri di hasil pencarian:** build dengan `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Tanpa `ALLOW_INDEXING=true`, `SITE_URL` kustom menandai setiap halaman `noindex`.

### Content-Security-Policy

Image nginx dilengkapi header `Content-Security-Policy` yang ditegakkan. Direktif `script-src`, `connect-src`, dan `font-src` pada CSP **dibuat saat build** dari variabel URL `VITE_*` di atas, sehingga host apa pun yang Anda berikan melalui `--build-arg` otomatis ditambahkan ke kebijakan.

Dengan demikian:

- Jika Anda menimpa `VITE_CORS_PROXY_URL` atau `VITE_WASM_*_URL` saat build, CSP otomatis mengizinkan origin tersebut, tanpa konfigurasi tambahan.
- Untuk URL di `cdn.jsdelivr.net`, `script-src` hanya mengizinkan folder paket dengan versi yang tepat, misalnya `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, bukan seluruh CDN. jsDelivr menyajikan paket npm publik atau repositori GitHub mana pun, sehingga mengizinkan seluruh host berarti semuanya dapat berjalan di instans Anda. URL di host lain diizinkan berdasarkan origin.
- Jika Anda mengonfigurasi URL WASM kustom saat _runtime_ melalui halaman Pengaturan Lanjutan di aplikasi, origin tersebut **tidak** ada di CSP dan browser akan memblokir pengambilannya. Hal ini juga berlaku untuk versi lain dari paket yang sama di `cdn.jsdelivr.net`, karena hanya versi yang diatur saat build yang diizinkan. Konfigurasi runtime ditujukan untuk eksperimen; untuk URL kustom permanen, atur build arg `VITE_*` yang sesuai.
- Deployment air-gapped yang menimpa ketiga nilai `VITE_WASM_*_URL` juga menghapus folder paket `cdn.jsdelivr.net` tersebut dari CSP (setiap default diganti, bukan ditambahkan). Default Tesseract OCR di `cdn.jsdelivr.net` tetap ada di kebijakan sampai Anda juga mengatur ketiga nilai `VITE_TESSERACT_*`. Demikian pula, mengatur `VITE_CORS_PROXY_URL` menggantikan default publik `bentopdf-cors-proxy.bentopdf.workers.dev`.

CSP menyertakan `'unsafe-eval'` di `script-src` karena runtime LibreOffice WASM (digunakan alat konversi Word/Excel/PowerPoint) dan pustaka gambar wasm-vips (digunakan PDF ke TIFF) mengompilasi kode dispatch internal melalui `new Function()`. Menghapusnya akan merusak alat-alat tersebut. Jika Anda build dengan `SIMPLE_MODE` (tanpa LibreOffice) dan tidak memerlukan PDF ke TIFF, Anda dapat mengedit `security-headers.conf` yang dihasilkan secara manual untuk membuang `'unsafe-eval'` demi kebijakan yang lebih ketat.

Untuk OCR, biarkan variabel `VITE_TESSERACT_*` kosong untuk memakai aset online default, atau atur ketiganya sekaligus untuk OCR hosting mandiri/offline. Penimpaan OCR sebagian ditolak karena worker, runtime inti, dan direktori traineddata harus cocok. Untuk keluaran PDF yang dapat dicari secara offline penuh, atur juga `VITE_OCR_FONT_BASE_URL` agar font lapisan teks OCR dimuat dari server internal Anda, bukan dari URL font Noto publik.

`VITE_DEFAULT_LANGUAGE` menentukan bahasa UI untuk pengunjung pertama kali. Nilai yang didukung: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Pengguna tetap dapat berganti bahasa, ini hanya mengubah default.

Contoh:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Branding Kustom

Ganti logo, nama, dan teks footer BentoPDF default dengan milik Anda. Letakkan file logo di folder `public/` (atau gunakan gambar yang sudah ada), lalu berikan variabel branding saat build:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Branding berfungsi di mode penuh maupun Simple Mode, dan dapat dikombinasikan dengan semua opsi build lainnya.

### Menonaktifkan Alat Tertentu

Sembunyikan alat dari UI untuk kebutuhan kepatuhan atau keamanan. Alat yang dinonaktifkan dihapus dari beranda, hasil pencarian, pintasan keyboard, dan workflow builder. Akses URL langsung menampilkan halaman "alat tidak tersedia".

ID alat adalah URL halaman tanpa `.html`. Misalnya, jika alat berada di `bentopdf.com/edit-pdf.html`, ID-nya adalah `edit-pdf`.

#### Menemukan ID Alat

Cara termudah: buka alat apa pun di BentoPDF dan lihat URL-nya. Bagian terakhir dari path (tanpa `.html`) adalah ID alat.

<details>
<summary>Daftar lengkap ID alat</summary>

**Edit & Anotasi:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Konversi ke PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Konversi dari PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Atur & Kelola:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Optimalkan & Perbaiki:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Keamanan:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Opsi 1: Saat build (Docker build arg)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Ini menanamkan daftar yang dinonaktifkan ke dalam bundel JavaScript. Perlu build ulang untuk mengubahnya.

#### Opsi 2: Saat runtime (config.json)

Mount file `config.json` ke direktori yang disajikan, tanpa perlu build ulang:

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

Atau dengan Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Kedua metode dapat digabungkan: daftarnya digabung. Jika sebuah alat muncul di salah satunya, alat itu dinonaktifkan.

#### Menonaktifkan Fitur Editor

Anda juga dapat menonaktifkan fitur tertentu di dalam Editor PDF (mis., redaksi, anotasi, formulir) tanpa menonaktifkan seluruh alat editor. Tambahkan `editorDisabledCategories` ke `config.json` Anda:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Daftar lengkap kategori editor</summary>

**Zoom:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Anotasi:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Bentuk:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Formulir:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Redaksi:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Dokumen:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Halaman:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Panel:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Alat:** `tools`, `pan`, `pointer`, `capture`

**Pilihan:** `selection`, `selection-copy`

**Riwayat:** `history`, `history-undo`, `history-redo`

</details>

Kategori bersifat hierarkis: menonaktifkan induk (mis., `annotation`) menonaktifkan semua turunannya.

### Menonaktifkan Penghitung Bintang GitHub

Navbar menampilkan jumlah bintang GitHub secara langsung, diambil dari `api.github.com` saat halaman dimuat. Ini satu-satunya permintaan eksternal yang tidak melayani fitur PDF. Nonaktifkan saat build untuk menghapus kode pengambilan dari bundel dan membuang `api.github.com` dari Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Build Simple Mode (`bentopdf-simple`) selalu melewati penghitung bintang, flag ini hanya diperlukan pada Commercial build atau build penuh kustom.

### URL WASM Kustom (Air-Gapped / Hosting Mandiri)

> [!IMPORTANT]
> URL WASM ditanamkan ke JavaScript saat **build**. File WASM diunduh oleh **browser pengguna** saat runtime, Docker tidak mengunduhnya selama build. Untuk jaringan air-gapped, Anda harus menghosting file WASM di server internal yang dapat dijangkau browser.

**Alur kerja air-gapped lengkap:**

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

Gunakan kode yang dicetak oleh `bash scripts/prepare-airgap.sh --list-ocr-languages`, atau cari berdasarkan nama dengan `bash scripts/prepare-airgap.sh --search-ocr-language <term>`, untuk `--ocr-languages`. Saat build dengan subset OCR terbatas, berikan kode yang sama ke `VITE_TESSERACT_AVAILABLE_LANGUAGES` agar aplikasi hanya menampilkan bahasa yang disertakan. Untuk keluaran OCR offline penuh, hosting juga direktori `ocr-fonts/` bawaan dan arahkan `VITE_OCR_FONT_BASE_URL` ke sana.

Atur variabel ke string kosong untuk menonaktifkan modul tersebut (pengguna harus mengonfigurasinya secara manual melalui Pengaturan Lanjutan).

## Port Kustom

Secara default, BentoPDF mendengarkan di port `8080` di dalam container. Untuk mengubahnya, atur environment variable `PORT` saat runtime:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Variabel | Deskripsi                      | Default |
| -------- | ------------------------------ | ------- |
| `PORT`   | Port listen Nginx di container | `8080`  |

Ini berfungsi dengan Dockerfile standar maupun nonroot.

## User ID Kustom (PUID/PGID)

Untuk lingkungan yang mengharuskan berjalan sebagai user non-root tertentu (perangkat NAS, Kubernetes dengan security context, kebijakan organisasi), BentoPDF menyediakan Dockerfile terpisah dengan dukungan PUID/PGID ala LSIO.

### Build dan Jalankan

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

### Environment Variable

| Variabel       | Deskripsi                  | Default |
| -------------- | -------------------------- | ------- |
| `PUID`         | User ID untuk menjalankan  | `1000`  |
| `PGID`         | Group ID untuk menjalankan | `1000`  |
| `PORT`         | Port listen Nginx          | `8080`  |
| `DISABLE_IPV6` | Nonaktifkan listener IPv6  | `false` |

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

### Cara Kerjanya

Container dimulai sebagai root, membuat user dengan PUID/PGID yang ditentukan, menyesuaikan kepemilikan pada semua direktori yang dapat ditulis, lalu menurunkan hak akses menggunakan `su-exec`. Proses nginx berjalan sepenuhnya sebagai user yang Anda tentukan.

> [!NOTE]
> `Dockerfile` standar menggunakan `nginx-unprivileged` (UID 101) dan direkomendasikan untuk sebagian besar deployment. Gunakan `Dockerfile.nonroot` hanya jika Anda memerlukan UID/GID tertentu.

> [!WARNING]
> PUID/PGID tidak boleh `0` (root). Entrypoint memvalidasi input dan akan keluar dengan error untuk nilai yang tidak valid.

## Dengan Traefik (Reverse Proxy)

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

## Dengan Caddy (Reverse Proxy)

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

## Batas Sumber Daya

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

## Podman Quadlet (Systemd Integration)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) memungkinkan Anda menjalankan container Podman sebagai layanan systemd. Ini ideal untuk deployment produksi di sistem Linux.

### Penyiapan Quadlet Dasar

Buat file unit container di `~/.config/containers/systemd/bentopdf.container` (user) atau `/etc/containers/systemd/bentopdf.container` (sistem):

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

### Aktifkan dan Mulai

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
> Untuk deployment tingkat sistem, gunakan `systemctl` tanpa flag `--user` dan letakkan file di `/etc/containers/systemd/`.

### Quadlet dengan Health Check

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

### Auto-Update dengan Quadlet

Podman dapat memperbarui container secara otomatis saat image baru tersedia:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Konfigurasi Jaringan Quadlet

Untuk konfigurasi jaringan kustom, buat file jaringan `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Lalu referensikan di file container Anda:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Memperbarui

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
