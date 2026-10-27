# Berkontribusi

Terima kasih atas minat Anda untuk berkontribusi pada BentoPDF! Panduan ini akan membantu Anda memulai.

## Memulai

### Prasyarat

- Node.js 18+
- npm 9+
- Git

### Penyiapan

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Struktur Proyek

```
bentopdf/
├── src/
│   ├── js/
│   │   ├── config/       # Tool definitions
│   │   ├── logic/        # Tool page logic
│   │   ├── utils/        # Shared utilities
│   │   └── ui.ts         # UI helpers
│   ├── pages/            # Tool HTML pages
│   └── css/              # Styles
├── public/
│   ├── locales/          # Translations
│   └── pymupdf-wasm/     # WASM modules
├── docs/                 # Documentation (VitePress)
└── scripts/              # Build scripts
```

## Menambahkan Alat Baru

### Langkah 1: Buat File Logika

Buat `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Langkah 2: Buat Halaman HTML

Buat `src/pages/your-tool.html` dengan mengikuti templat alat yang sudah ada.

### Langkah 3: Daftarkan Alat

Tambahkan ke `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Langkah 4: Tambahkan ke Konfigurasi Build

Tambahkan halaman ke `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Langkah 5: Tambahkan Terjemahan

Tambahkan entri ke semua file locale di `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Gaya Kode

- Gunakan TypeScript untuk semua kode baru
- Ikuti pola yang sudah ada agar tetap konsisten
- Jalankan `npm run format` sebelum commit
- Tanpa komentar di kode produksi (komentar dihapus saat build)

## Proses Pull Request

1. Buat branch fitur: `git checkout -b feature/your-feature`
2. Lakukan perubahan Anda
3. Uji secara menyeluruh: `npm run build`
4. Kirim PR dengan deskripsi yang jelas

## Terjemahan

Lihat [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) untuk menambahkan bahasa baru.

## Perjanjian Lisensi Kontributor

Sebelum PR Anda dapat digabungkan, Anda perlu menandatangani CLA kami:

- [Individual CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [Corporate CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Mendapatkan Bantuan

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Komunitas Discord](https://discord.gg/Bgq3Ay3f2w)

## Lisensi

BentoPDF berlisensi ganda:

- **AGPL-3.0** untuk proyek sumber terbuka yang membagikan seluruh kode sumbernya secara publik
- **Lisensi Komersial** untuk aplikasi proprietari/sumber tertutup - [Dapatkan Lisensi Seumur Hidup seharga $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Dengan berkontribusi, Anda menyetujui bahwa kontribusi Anda dilisensikan berdasarkan ketentuan ini.
