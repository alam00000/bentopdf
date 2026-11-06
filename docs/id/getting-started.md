# Memulai

Selamat datang di Pixel PDF! Panduan ini akan membantu Anda mulai dengan cepat.

## Apa itu Pixel PDF?

Pixel PDF adalah toolkit PDF gratis, sumber terbuka, dan mengutamakan privasi yang berjalan **sepenuhnya di browser Anda**. File Anda tidak pernah meninggalkan perangkat Anda, semua pemrosesan terjadi secara lokal menggunakan teknologi WebAssembly (WASM).

## Mulai Cepat

### Opsi 1: Gunakan Versi Hosting

Kunjungi [pixelpdf.com](https://www.pixelpdf.com) untuk langsung menggunakan Pixel PDF, tanpa perlu instalasi.

### Opsi 2: Hosting Mandiri dengan Docker

> [!IMPORTANT]
> Konversi file Office memerlukan `SharedArrayBuffer`, yang membutuhkan keduanya:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - konteks aman (secure context)
>
> `http://localhost` berfungsi untuk pengujian lokal karena browser menganggap loopback tepercaya. `http://192.168.x.x` atau IP LAN lainnya biasanya tidak, sehingga konversi Word/Excel/PowerPoint memerlukan HTTPS saat diakses dari perangkat lain di jaringan Anda.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/mohammedalhinaki-cloud/pixel-pdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/mohammedalhinaki-cloud/Pixel-PDF/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> Pixel PDF tersedia dalam dua build: **Self-Hosted build** (`pixelpdf-simple`, digunakan di atas) untuk penerapan internal/tim/organisasi, dan **Commercial build** (`pixelpdf:latest`) yang digunakan oleh pixelpdf.com sendiri dan oleh pemegang lisensi komersial yang menjalankan penerapan publik. Keduanya menyertakan alat PDF yang sama, Commercial build menambahkan hero, FAQ, testimoni, dan footer pixelpdf.com. Jika ragu, gunakan Self-Hosted build.

Lalu buka `http://localhost:3000` di browser Anda.

> [!NOTE]
> Jika Anda menyiapkan penerapan OCR air-gapped, Anda harus menghosting font lapisan teks OCR secara internal, selain worker Tesseract, runtime inti, dan file traineddata. Penyiapan lengkapnya didokumentasikan di [Hosting Mandiri](/id/self-hosting/), termasuk `VITE_OCR_FONT_BASE_URL` dan direktori `ocr-fonts/` bawaan.

### Opsi 3: Build dari Sumber

```bash
# Clone the repository
git clone https://github.com/mohammedalhinaki-cloud/Pixel-PDF.git
cd pixelpdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Sekilas Fitur

| Kategori              | Alat                                                               |
| --------------------- | ------------------------------------------------------------------ |
| **Konversi ke PDF**   | Word, Excel, PowerPoint, Gambar, Markdown, EPUB, MOBI, dan lainnya |
| **Konversi dari PDF** | JPG, PNG, Teks, Excel, SVG, dan lainnya                            |
| **Edit & Anotasi**    | Tanda Tangan, Sorot, Redaksi, Isi Formulir, Tambah Stempel         |
| **Atur**              | Gabung, Pisah, Putar, Hapus Halaman, Urutkan Ulang                 |
| **Optimalkan**        | Kompres, Perbaiki, Ratakan, OCR                                    |
| **Keamanan**          | Enkripsi, Dekripsi, Hapus Pembatasan                               |

## Dukungan Browser

Pixel PDF bekerja paling baik di browser modern:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Langkah Selanjutnya

- [Jelajahi semua alat](/id/tools/)
- [Hosting mandiri Pixel PDF](/id/self-hosting/)
- [Berkontribusi pada proyek](/id/contributing)
