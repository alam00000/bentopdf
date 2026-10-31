---
title: Sanitasi PDF
description: Hapus konten tersembunyi dan berpotensi berbahaya dari PDF termasuk metadata, JavaScript, file tertanam, anotasi, dan layer.
---

# Sanitasi PDF

PDF dapat membawa jauh lebih banyak daripada yang terlihat di layar. Metadata tersembunyi, JavaScript tertanam, lampiran file, data formulir, dan informasi layer dapat membocorkan data sensitif atau menimbulkan risiko keamanan. Sanitasi menghapus semuanya, sehingga Anda mendapatkan dokumen bersih yang aman dibagikan secara publik.

## Cara Kerja

1. Unggah file PDF.
2. Pilih elemen yang akan dihapus dari daftar centang.
3. Klik **Sanitasi PDF**.
4. Unduh file yang sudah dibersihkan.

## Opsi Sanitasi

Semua opsi aktif secara default. Hapus centang pada opsi yang ingin Anda pertahankan.

| Opsi                     | Yang Dihapus                                                                    |
| ------------------------ | ------------------------------------------------------------------------------- |
| **Ratakan Formulir**     | Mengubah bidang formulir interaktif menjadi konten statis                       |
| **Hapus Metadata**       | Menghapus penulis, judul, tanggal pembuatan, info perangkat lunak, dan data XMP |
| **Hapus Anotasi**        | Menghapus komentar, sorotan, catatan tempel, dan markup                         |
| **Hapus JavaScript**     | Menghilangkan skrip tertanam yang dapat berjalan saat dibuka                    |
| **Hapus File Tertanam**  | Menghapus lampiran file yang tertanam di dalam PDF                              |
| **Hapus Layer (OCG)**    | Meratakan grup konten opsional menjadi satu layer                               |
| **Hapus Tautan**         | Menghapus hyperlink dan referensi URL                                           |
| **Hapus Pohon Struktur** | Menghapus struktur dokumen yang digunakan untuk penandaan aksesibilitas         |
| **Hapus MarkInfo**       | Menghapus informasi konten bertanda                                             |
| **Hapus Font**           | Menghapus data font tertanam (gunakan dengan hati-hati)                         |

## Kasus Penggunaan

- Menyiapkan PDF untuk rilis publik dengan menghapus metadata internal (nama penulis, versi perangkat lunak, riwayat pengeditan)
- Menghapus JavaScript dari PDF yang diterima dari sumber tidak tepercaya sebelum membukanya
- Membersihkan PDF sebelum dikirim ke klien yang tidak boleh melihat komentar tertanam atau nama bidang formulir
- Menghapus layer tersembunyi dari gambar arsitektur sebelum membagikan versi final
- Memenuhi persyaratan minimisasi data berdasarkan regulasi privasi

## Tips

- Biarkan "Hapus Font" tidak dicentang kecuali Anda yakin PDF tetap dirender dengan benar. Menghapus font dapat membuat teks tidak terlihat di beberapa penampil.
- Jika Anda hanya perlu menghapus metadata, alat Hapus Metadata khusus lebih cepat dan lebih terfokus.
- Sanitasi tidak dapat dibatalkan. Simpan file asli Anda.

## Alat Terkait

- [Hapus Metadata](./remove-metadata): hapus metadata saja tanpa menyentuh konten lain
- [Ratakan PDF](./flatten-pdf): ratakan formulir dan anotasi secara khusus
- [Lindungi PDF](./protect-pdf): tambahkan perlindungan kata sandi setelah sanitasi
- [Rasterisasi PDF](./rasterize-pdf): opsi pamungkas, konversi ke gambar untuk menghilangkan semua konten tersembunyi
