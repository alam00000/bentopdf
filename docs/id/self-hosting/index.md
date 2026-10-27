# Panduan Self-Hosting

BentoPDF dapat di-host sendiri pada infrastruktur Anda. Panduan ini mencakup berbagai opsi deployment.

## Mulai Cepat dengan Docker / Podman

Cara tercepat untuk self-host BentoPDF:

> [!TIP]
> BentoPDF tersedia dalam dua build:
>
> - **Build Self-Hosted**: `ghcr.io/alam00000/bentopdf-simple:latest`. Semua alat PDF, **tanpa** elemen pemasaran (tanpa hero, FAQ, testimoni, footer). Gunakan ini untuk deployment internal/tim/organisasi. Ini **bukan** versi "lite" dengan fitur yang dikurangi.
> - **Build Commercial**: `ghcr.io/alam00000/bentopdf:latest`. Situs pemasaran lengkap, dipakai oleh bentopdf.com sendiri dan oleh pemegang lisensi komersial yang menjalankan deployment publik.
>
> Jika ragu: gunakan build Self-Hosted.

> [!IMPORTANT]
> Konversi file Office memerlukan `SharedArrayBuffer`, yang berarti aplikasi harus terisolasi lintas origin sekaligus dilayani dari konteks aman (secure context). Image resmi sudah mengirim header COOP/COEP yang diperlukan, tetapi browser tetap menonaktifkan `SharedArrayBuffer` pada origin jaringan lokal HTTP biasa seperti `http://192.168.x.x`.
>
> Gunakan `http://localhost` hanya untuk pengujian di perangkat yang sama. Jika pengguna mengakses BentoPDF melalui IP LAN atau hostname, akhiri koneksi dengan HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Atau dengan Docker Compose / Podman Compose:

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

Jalankan BentoPDF sebagai layanan systemd. Buat `~/.config/containers/systemd/bentopdf.container`:

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

Lihat [panduan deployment Docker](/id/self-hosting/docker) untuk dokumentasi Quadlet lengkap.

## Build dari Source

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Opsi Konfigurasi

### Build Self-Hosted (Simple Mode)

Build Self-Hosted (image `bentopdf-simple`, juga disebut Simple Mode) **secara fungsional identik** dengan build Commercial: semua alat PDF tersedia dan berperilaku sama. Build ini hanya menyembunyikan elemen pemasaran yang hanya masuk akal di bentopdf.com sendiri atau pada deployment komersial yang terbuka untuk publik. **Ini bukan versi dengan fitur yang dikurangi atau "lite".**

**Yang disembunyikan build Self-Hosted** (hanya kosmetik, tidak ada fitur PDF yang dihapus):

- Bilah navigasi, bagian hero, bagian fitur, FAQ, testimoni, footer
- Mengubah judul halaman menjadi "Alat PDF"

**Yang dipertahankan build Self-Hosted** (semua yang benar-benar mengerjakan PDF):

- Semua alat PDF (gabung, pisah, edit, tanda tangan, OCR, konversi Office, dll.)
- Dukungan branding kustom, semua konfigurasi build-time dan runtime

Build Commercial (`ghcr.io/alam00000/bentopdf:latest`) adalah yang menjalankan bentopdf.com sendiri dan dipakai oleh pemegang lisensi komersial yang menjalankan deployment publik. Build ini menambahkan hero, FAQ, testimoni, dan footer yang tidak masuk akal pada alat internal.

Jika Anda self-host BentoPDF untuk tim, organisasi, atau sebagai alat internal, gunakan build Self-Hosted:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Lihat [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) untuk detail lengkap.

### Build Commercial (deployment publik dengan merek Anda sendiri)

Build Commercial (image `bentopdf`, tanpa akhiran `-simple`) adalah yang menjalankan bentopdf.com sendiri. Build ini menyertakan situs pemasaran lengkap (hero, fitur, FAQ, testimoni, footer) di atas semua alat PDF. Gunakan build ini saat Anda ingin **men-deploy BentoPDF sebagai layanan PDF publik dengan merek Anda sendiri**, misalnya:

- Anda menjalankan BentoPDF sebagai SaaS terkelola untuk pengguna akhir di domain Anda sendiri
- Anda menginginkan pengalaman halaman landing (bagian pemasaran + alat), bukan hanya tampilan alat saja
- Anda pemegang lisensi komersial yang menyematkan BentoPDF ke dalam produk komersial

**Jalankan apa adanya** (branding BentoPDF, berguna untuk melihat pratinjau build):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Build dengan merek Anda sendiri** (alur kerja komersial yang umum):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Setiap opsi build-time lainnya (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, override URL WASM, dll.) bekerja dengan cara yang sama seperti pada build Self-Hosted.

::: warning Lisensi
Menjalankan build Commercial diizinkan di bawah salah satu dari dua opsi lisensi BentoPDF:

- **AGPL-3.0** (gratis): diizinkan jika deployment Anda mempublikasikan seluruh source code di bawah AGPL, termasuk modifikasi branding dan logika bisnis di sekitarnya.
- **Lisensi komersial** ($79 seumur hidup): diperlukan untuk deployment sumber tertutup/berpemilik (closed-source/proprietary) di mana Anda tidak membuka source code fork branding atau kode bisnis Anda.

Lihat [halaman Lisensi](https://www.bentopdf.com/licensing) untuk perbandingan lengkap. Modul WASM berlisensi AGPL (PyMuPDF, Ghostscript, CoherentPDF) dimuat dari CDN saat runtime, sehingga tidak masuk ke image Anda dan tidak mengubah posisi lisensi Anda.
:::

### Base URL

Deploy ke subdirektori:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Branding Kustom

Ganti logo, nama, dan teks footer BentoPDF default dengan milik Anda saat build:

| Variabel           | Deskripsi                            | Default                                 |
| ------------------ | ------------------------------------ | --------------------------------------- |
| `VITE_BRAND_NAME`  | Nama merek di header dan footer      | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Path logo relatif terhadap `public/` | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Teks footer/hak cipta kustom         | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Atau melalui Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Branding berfungsi pada mode penuh maupun Simple Mode, dan dapat dikombinasikan dengan semua opsi build-time lainnya (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Menonaktifkan Alat Tertentu

Sembunyikan alat tertentu demi kepatuhan atau keamanan. Alat yang dinonaktifkan dihapus dari beranda, pencarian, pintasan, pembuat alur kerja, dan akses URL langsung.

ID alat adalah URL halaman tanpa `.html`: buka alat apa pun dan lihat URL-nya (misalnya `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Build-time** (tertanam dalam bundle):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Runtime** (tanpa build ulang, mount `config.json`):

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

Kedua metode dapat dikombinasikan, daftarnya digabungkan.

Anda juga dapat menonaktifkan fitur tertentu di dalam Editor PDF (misalnya redaksi) tanpa menonaktifkan seluruh alat dengan menambahkan `editorDisabledCategories` ke `config.json`. Lihat [panduan Docker](/id/self-hosting/docker#menonaktifkan-fitur-editor) untuk daftar lengkap kategori.

## Panduan Deployment

Pilih platform Anda:

- [Vercel](/id/self-hosting/vercel)
- [Netlify](/id/self-hosting/netlify)
- [Cloudflare Pages](/id/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/id/self-hosting/aws)
- [Hostinger](/id/self-hosting/hostinger)
- [Nginx](/id/self-hosting/nginx)
- [Apache](/id/self-hosting/apache)
- [Docker](/id/self-hosting/docker)
- [Kubernetes](/id/self-hosting/kubernetes)
- [CORS Proxy](/id/self-hosting/cors-proxy) - Diperlukan untuk tanda tangan digital

## Masalah Umum

### Word / ODT / Excel / PowerPoint ke PDF Macet (SharedArrayBuffer Tidak Tersedia)

**Gejala**: Konversi dokumen berbasis LibreOffice (Word, ODT, Excel, PowerPoint ke PDF) macet di ~55% atau gagal dimulai. Konsol browser mungkin menampilkan:

> `ReferenceError: SharedArrayBuffer is not defined`

...atau `window.crossOriginIsolated` melaporkan `false`, atau kompilasi WASM melaporkan `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Penyebab**: LibreOffice WASM memerlukan `SharedArrayBuffer`, yang hanya diaktifkan browser ketika halaman **terisolasi lintas origin** DAN dilayani dari **konteks aman (secure context)**. Artinya dua hal harus terpenuhi:

1. Setiap respons menyertakan kedua header berikut:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. Halaman dilayani dari `https://...` atau `http://localhost`. HTTP biasa pada IP LAN (mis. `http://192.168.x.x`) TIDAK dianggap aman: browser menonaktifkan `SharedArrayBuffer` di sana.

Ketidakcocokan `00 61 73 6d / 1f 8b 08 08` adalah sub-gejala tersendiri: file `.wasm.gz` / `.data.gz` yang sudah dikompresi tidak memiliki header respons `Content-Encoding: gzip`, sehingga browser menerima byte gzip mentah, bukan WASM yang sudah didekompresi.

**Solusi**: lihat panduan deployment khusus platform Anda untuk konfigurasi yang tepat:

- [Nginx →](/id/self-hosting/nginx#word-odt-excel-ke-pdf-tidak-berfungsi)
- [Apache →](/id/self-hosting/apache#word-odt-excel-ke-pdf-tidak-berfungsi)
- [AWS S3 + CloudFront →](/id/self-hosting/aws#langkah-3b-response-headers-policy-diperlukan-untuk-libreoffice-wasm)
- [Cloudflare Pages →](/id/self-hosting/cloudflare#file-konfigurasi) (`_headers` file)
- [Netlify →](/id/self-hosting/netlify#word-odt-excel-ke-pdf-macet-di-55) (`netlify.toml`)
- [Vercel →](/id/self-hosting/vercel#word-odt-excel-ke-pdf-tidak-berfungsi) (`vercel.json`)
- [Hostinger →](/id/self-hosting/hostinger#alat-libreoffice-tidak-berfungsi) (`.htaccess`)
- [Kubernetes →](/id/self-hosting/kubernetes#memastikan-header-sharedarraybuffer-tetap-berfungsi-ingress-gateway)
- **Docker**: ditangani otomatis oleh konfigurasi nginx bawaan, tidak perlu tindakan.

**Verifikasi**: buka Konsol DevTools di halaman BentoPDF mana pun dan jalankan:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Jika halaman menggunakan HTTPS atau `http://localhost` DAN kedua header COEP/COOP ada pada setiap respons, kedua pemeriksaan lulus. Jika Anda berada di `http://192.168.x.x` atau origin HTTP non-loopback lainnya, akhiri koneksi dengan HTTPS: tidak ada solusi yang hanya berupa header.

### File `.mjs` Dilayani sebagai `application/octet-stream`

**Gejala**: Tanda Tangani PDF / Form Filler / beberapa alat lain menampilkan penampil kosong atau gagal dimuat. Konsol browser melaporkan:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Penyebab**: Web server atau reverse proxy Anda tidak memiliki pemetaan MIME-type untuk file `.mjs` (penampil PDF bawaan menyertakan modul ES dengan ekstensi itu). Banyak konfigurasi server bawaan menggunakan `application/octet-stream` untuk ekstensi yang tidak dikenali, yang menolak dieksekusi browser sebagai modul ES.

**Solusi**: lihat panduan deployment khusus platform Anda untuk potongan konfigurasi yang tepat:

- [Nginx →](/id/self-hosting/nginx#tanda-tangani-pdf-atau-form-filler-menampilkan-penampil-kosong-error-mime-mjs)
- [Apache →](/id/self-hosting/apache#tanda-tangani-pdf-atau-form-filler-menampilkan-penampil-kosong-error-mime-mjs)
- [AWS S3 + CloudFront →](/id/self-hosting/aws#langkah-2-build-dan-unggah) (lihat `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/id/self-hosting/kubernetes#error-mime-type-mjs-iframe-tanda-tangani-pdf-form-filler-kosong)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: ditangani otomatis, tidak perlu tindakan.

**Verifikasi**: buka DevTools → tab Network, cari permintaan `.mjs` yang gagal, periksa header respons `Content-Type`. Seharusnya `application/javascript`. Jika masih `application/octet-stream`, reverse proxy atau CDN di luar mungkin mendeteksi ulang tipenya: periksa setiap lapisan dalam rantai layanan Anda.

## Konfigurasi WASM (Komponen AGPL)

BentoPDF **tidak menyertakan** pustaka pemrosesan berlisensi AGPL dalam source code-nya, tetapi **sudah mengonfigurasi URL CDN** sehingga semua fitur langsung berfungsi tanpa pengaturan manual.

::: tip Tanpa Konfigurasi secara Default
Sejak v2.0.0, modul WASM sudah dikonfigurasi untuk dimuat dari CDN jsDelivr melalui variabel lingkungan. Semua fitur lanjutan langsung berfungsi tanpa konfigurasi pengguna.
:::

| Komponen        | Lisensi  | Fitur                                                         |
| --------------- | -------- | ------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | Konversi EPUB/MOBI/FB2/XPS, ekstraksi gambar, ekstraksi tabel |
| **Ghostscript** | AGPL-3.0 | Konversi PDF/A, kompresi, deskewing, rasterisasi              |
| **CoherentPDF** | AGPL-3.0 | Daftar isi, lampiran, penggabungan PDF dengan bookmark        |

### Variabel Lingkungan Default

Variabel ini diatur di `.env.production` dan tertanam dalam build:

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

### Menimpa URL WASM

Anda dapat menimpa nilai default saat build untuk deployment kustom:

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

Untuk menonaktifkan sebuah modul sepenuhnya (memerlukan konfigurasi manual pengguna melalui Pengaturan Lanjutan), atur variabelnya ke string kosong.

Untuk OCR, biarkan semua variabel `VITE_TESSERACT_*` kosong dan gunakan aset online default, atau atur URL worker/core/lang bersamaan untuk OCR self-hosted/offline. Jika Anda hanya menyertakan bahasa OCR tertentu, atur juga `VITE_TESSERACT_AVAILABLE_LANGUAGES` dengan kode yang sama (dipisahkan koma) agar UI hanya menawarkan bahasa yang terpasang dan pilihan yang tidak didukung gagal dengan pesan error yang jelas. Untuk keluaran PDF yang dapat dicari sepenuhnya offline, atur juga `VITE_OCR_FONT_BASE_URL` ke direktori internal yang melayani font OCR bawaan.

Pengguna juga dapat menimpa nilai default ini kapan saja melalui **Pengaturan Lanjutan** di UI. Penimpaan pengguna yang tersimpan di browser lebih diprioritaskan daripada default lingkungan.

### Deployment Air-Gapped / Offline

Untuk jaringan tanpa akses internet (pemerintah, kesehatan, keuangan, dll.). URL WASM tertanam ke dalam JavaScript pada **waktu build**, sedangkan file WASM sebenarnya diunduh oleh **browser pengguna** saat runtime. Jadi Anda perlu menyiapkan semuanya di mesin yang terhubung internet, lalu memindahkannya ke jaringan terisolasi.

#### Skrip Otomatis (Disarankan)

Skrip `prepare-airgap.sh` yang disertakan mengotomatiskan seluruh proses: mengunduh paket WASM, membangun image Docker, dan menghasilkan bundel mandiri beserta skrip setup.

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

Ini menghasilkan direktori bundel:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Pindahkan bundel ke jaringan air-gapped melalui USB, repositori artefak internal, atau metode yang disetujui. Lalu jalankan skrip setup yang disertakan:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Skrip setup memuat image Docker, mengekstrak file WASM, dan secara opsional memulai kontainer.

**Opsi skrip:**

| Flag                           | Deskripsi                                          | Default                           |
| ------------------------------ | -------------------------------------------------- | --------------------------------- |
| `--wasm-base-url <url>`        | Tempat WASM akan di-host secara internal           | _(wajib, ditanyakan jika kosong)_ |
| `--image-name <name>`          | Tag image Docker                                   | `bentopdf`                        |
| `--output-dir <path>`          | Direktori bundel keluaran                          | `./bentopdf-airgap-bundle`        |
| `--simple-mode`                | Aktifkan Simple Mode                               | mati                              |
| `--base-url <path>`            | Base URL subdirektori (mis. `/pdf/`)               | `/`                               |
| `--language <code>`            | Bahasa UI default (mis. `fr`, `de`)                | _(tidak ada)_                     |
| `--brand-name <name>`          | Nama merek kustom                                  | _(tidak ada)_                     |
| `--brand-logo <path>`          | Path logo relatif terhadap `public/`               | _(tidak ada)_                     |
| `--footer-text <text>`         | Teks footer kustom                                 | _(tidak ada)_                     |
| `--ocr-languages <list>`       | Bahasa OCR yang disertakan, dipisahkan koma        | `eng`                             |
| `--list-ocr-languages`         | Cetak kode dan nama OCR yang didukung, lalu keluar | mati                              |
| `--search-ocr-language <term>` | Cari kode OCR berdasarkan nama atau singkatan      | mati                              |
| `--dockerfile <path>`          | Dockerfile yang digunakan                          | `Dockerfile`                      |
| `--skip-docker`                | Lewati build dan ekspor Docker                     | mati                              |
| `--skip-wasm`                  | Lewati unduhan WASM (pakai ulang file `.tgz`)      | mati                              |

Prompt interaktif juga menerima `list` untuk mencetak daftar lengkap kode Tesseract yang didukung dan `search <term>` untuk mencari kecocokan seperti `search german` atau `search chi`.

::: warning Persyaratan Same-Origin
File WASM harus dilayani dari **origin yang sama** dengan aplikasi BentoPDF. Web Worker menggunakan `importScripts()` yang tidak dapat memuat skrip lintas origin. Misalnya, jika BentoPDF berjalan di `https://internal.example.com`, base URL WASM juga harus `https://internal.example.com/wasm`.
:::

#### Langkah Manual

<details>
<summary>Jika Anda lebih suka melakukannya secara manual tanpa skrip</summary>

**Langkah 1: Unduh paket WASM dan OCR** (di mesin yang terhubung internet)

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

**Langkah 2: Build image Docker dengan URL internal**

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

**Langkah 3: Ekspor image Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**Langkah 4: Pindahkan ke jaringan air-gapped**

Salin melalui USB, repositori artefak internal, atau metode transfer yang disetujui:

- `bentopdf.tar`: image Docker
- Kelima paket WASM/OCR `.tgz` dari Langkah 1
- Direktori `tesseract-langdata/` dari Langkah 1
- Direktori `ocr-fonts/` dari Langkah 1

**Langkah 5: Siapkan di dalam jaringan air-gapped**

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

Pastikan file dapat diakses pada URL yang Anda konfigurasikan di Langkah 2, termasuk `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data`, dan `.../ocr/fonts`.

</details>

::: info Build dari source, bukan Docker?
Atur variabel di `.env.production` sebelum menjalankan `npm run build`:

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

### Menjalankan Proxy WASM Sendiri

Jika Anda perlu melayani file WASM AGPL dengan header CORS yang tepat, Anda dapat men-deploy proxy sederhana. Lihat [panduan Cloudflare WASM Proxy](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) untuk contoh implementasi.

::: tip Mengapa Dipisah?
Pemisahan ini memastikan:

- Kepatuhan hukum yang jelas bagi pengguna komersial
- Inti BentoPDF tetap berada di bawah lisensi ganda (AGPL-3.0 / Commercial)
- File WASM dimuat saat runtime, tidak disertakan dalam source
  :::

## Persyaratan Sistem

| Persyaratan | Minimum                         |
| ----------- | ------------------------------- |
| Penyimpanan | ~100 MB (inti tanpa modul AGPL) |
| RAM         | 512 MB                          |
| CPU         | Prosesor modern apa pun         |

::: tip
BentoPDF adalah situs statis, tidak diperlukan database atau server backend!
:::
