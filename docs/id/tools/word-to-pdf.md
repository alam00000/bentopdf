---
title: Word ke PDF
description: Konversi dokumen Word (DOC, DOCX), ODT, dan RTF ke PDF di browser Anda dengan format yang terjaga sepenuhnya.
---

# Word ke PDF

Konversi dokumen Microsoft Word dan format yang kompatibel ke PDF. Alat ini memakai mesin LibreOffice berbasis browser yang menangani file DOC, DOCX, ODT, dan RTF, dengan mempertahankan format, tabel, gambar, header, footer, dan gaya pada hasil.

## Format yang Didukung

| Format            | Ekstensi |
| :---------------- | :------- |
| Word (modern)     | `.docx`  |
| Word (lama)       | `.doc`   |
| OpenDocument Text | `.odt`   |
| Rich Text Format  | `.rtf`   |

## Cara Kerja

1. Klik area unggah atau seret dan lepas dokumen Word Anda. Beberapa file bisa dipilih sekaligus.
2. Tinjau dan kelola daftar file.
3. Klik **Konversi ke PDF**. Mesin LibreOffice dimuat saat pertama digunakan (indikator progres menampilkan status inisialisasi), lalu setiap file dikonversi.
4. Satu file langsung diunduh sebagai PDF. Beberapa file dikemas dalam `word-converted.zip`.

## Opsi

Alat ini tidak memiliki pengaturan tambahan. Mesin LibreOffice menghasilkan keluaran dengan profil ekspor PDF default-nya.

## Keluaran

| Jumlah Masukan | Keluaran                                                           |
| :------------- | :----------------------------------------------------------------- |
| 1 file         | Satu PDF diunduh (nama file asli dengan ekstensi `.pdf`)           |
| 2+ file        | Arsip ZIP (`word-converted.zip`) berisi satu PDF untuk setiap file |

## Kasus Penggunaan

- Mengonversi resume atau surat lamaran dari DOCX ke PDF sebelum melamar kerja
- Mengonversi sekumpulan kontrak atau proposal ke PDF secara massal untuk dikirim ke klien
- Mengubah file `.doc` lama menjadi PDF modern untuk pengarsipan jangka panjang
- Mengonversi dokumen kolaboratif dari Google Docs (diekspor sebagai DOCX) ke PDF
- Membuat PDF siap cetak dari templat Word yang dipakai untuk pembuatan dokumen otomatis

## Tips

- Mesin LibreOffice diunduh sekali per sesi dan di-cache. Harap tunggu beberapa detik saat konversi pertama, dan konversi berikutnya jauh lebih cepat.
- Format yang kompleks (makro, kontrol ActiveX, SmartArt tingkat lanjut) mungkin tidak terkonversi dengan sempurna. Elemen dokumen standar (teks, tabel, gambar, header, catatan kaki) terkonversi dengan andal.
- Karena alat ini juga menerima ODT dan RTF, Anda bisa memakainya sebagai konverter serbaguna untuk semua format pengolah kata.

## Alat Terkait

- [ODT ke PDF](./odt-to-pdf)
- [RTF ke PDF](./rtf-to-pdf)
- [Excel ke PDF](./excel-to-pdf)
- [PowerPoint ke PDF](./powerpoint-to-pdf)
