---
title: Lihat Metadata
description: Periksa semua properti metadata PDF termasuk info dokumen, data XMP, dan detail struktural.
---

# Lihat Metadata

Periksa properti tersembunyi yang tertanam dalam file PDF. Alat ini menampilkan informasi dokumen (judul, penulis, tanggal), metadata XMP, dimensi halaman, dan data struktural lainnya dalam format yang mudah dibaca.

## Cara Kerja

1. Unggah file PDF.
2. Alat langsung mengurai file dan menampilkan semua metadata yang tersedia dalam bagian-bagian terorganisasi.
3. Tinjau kamus info dokumen, pohon metadata XMP, dan properti struktural.
4. Tidak perlu langkah pemrosesan: metadata ditampilkan segera setelah file dimuat.

## Fitur

- Menampilkan kolom info dokumen standar: Judul, Penulis, Subjek, Kata Kunci, Pembuat, Produsen
- Menampilkan tanggal pembuatan dan modifikasi dalam format yang mudah dibaca
- Mengurai dan merender seluruh pohon metadata XMP dengan namespace bersarang
- Mengonversi format tanggal PDF (`D:20240101120000Z`) menjadi tanggal yang mudah dibaca
- Disusun dalam bagian yang bisa dilipat agar mudah dinavigasi

## Bagian Metadata

| Bagian               | Isi                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------- |
| **Info Dokumen**     | Judul, Penulis, Subjek, Kata Kunci, Pembuat, Produsen, Tanggal Pembuatan, Tanggal Modifikasi |
| **Metadata XMP**     | Pohon metadata berbasis XML lengkap dengan namespace Dublin Core, XAP, PDF, dan kustom       |
| **Properti Dokumen** | Jumlah halaman, versi PDF, ukuran file, status enkripsi                                      |

## Kasus Penggunaan

- Memeriksa siapa yang menulis PDF dan kapan terakhir diubah
- Memastikan metadata sudah diatur dengan benar sebelum menerbitkan dokumen
- Mengaudit PDF untuk privasi dengan memeriksa informasi pribadi apa yang tertanam
- Menyelidiki perangkat lunak yang dipakai untuk membuat atau mengubah PDF (lewat kolom Produsen)
- Meninjau metadata XMP untuk kepatuhan manajemen aset digital

## Tips

- String tanggal PDF yang diawali `D:` otomatis dikonversi ke format zona waktu lokal Anda.
- Jika kolom metadata tampak kosong, berarti pembuat PDF memang tidak mengisinya. Tidak semua PDF memiliki metadata yang kaya.
- Untuk mengubah metadata setelah memeriksanya, gunakan [Edit Metadata](./edit-metadata). Untuk menghapusnya sepenuhnya, gunakan Hapus Metadata.

## Alat Terkait

- [Edit Metadata](./edit-metadata)
- [Lapisan OCG PDF](./pdf-layers)
- [Bandingkan PDF](./compare-pdfs)
