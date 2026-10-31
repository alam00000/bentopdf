---
title: Hapus Metadata
description: Hapus semua metadata tersembunyi dari file PDF termasuk penulis, judul, tanggal pembuatan, produser, data XMP, dan ID dokumen.
---

# Hapus Metadata

Setiap PDF membawa metadata yang dapat mengungkap siapa pembuatnya, perangkat lunak yang digunakan, kapan terakhir diubah, dan lainnya. Alat ini menghapus semuanya: info dictionary, aliran metadata XMP, ID dokumen, dan data khusus aplikasi, sehingga dokumen bersih tanpa jejak asalnya.

## Cara Kerja

1. Unggah file PDF.
2. Klik **Hapus Metadata**.
3. Unduh file yang sudah dibersihkan.

Tidak ada opsi yang perlu diatur. Alat ini teliti secara desain: semuanya dibersihkan.

## Yang Dihapus

- **Bidang info dictionary**: Title, Author, Subject, Keywords, Creator, Producer, tanggal pembuatan, tanggal modifikasi
- **Aliran metadata XMP**: Blok metadata berbasis XML yang tersimpan di katalog dokumen
- **ID dokumen**: Pengenal unik di trailer PDF yang dapat digunakan untuk melacak dokumen lintas sistem
- **PieceInfo**: Metadata khusus aplikasi yang ditambahkan program seperti Illustrator atau InDesign

## Yang Tetap Ada

- Semua konten halaman yang terlihat (teks, gambar, grafik)
- Bidang formulir dan anotasi
- Bookmark dan tautan
- Struktur dokumen itu sendiri

## Kasus Penggunaan

- Menghapus nama dan organisasi Anda dari dokumen sebelum dipublikasikan secara anonim
- Menghapus stempel waktu pembuatan yang mengungkap kapan dokumen disiapkan
- Membersihkan string produser yang mengidentifikasi perangkat lunak PDF Anda
- Menyiapkan dokumen untuk pengajuan regulasi yang mewajibkan PDF tanpa metadata
- Menghapus jejak riwayat pengeditan sebelum membagikan dokumen ke pihak luar

## Tips

- Gunakan alat Lihat Metadata terlebih dahulu untuk melihat persis metadata apa yang ada di PDF Anda sebelum menghapusnya.
- Jika Anda perlu menghapus metadata _dan_ JavaScript, anotasi, serta file tertanam, gunakan Sanitasi PDF untuk pembersihan yang lebih menyeluruh.
- Penghapusan metadata bersifat permanen. Simpan file asli Anda jika nanti mungkin memerlukan data tersebut.

## Alat Terkait

- [Sanitasi PDF](./sanitize-pdf): hapus metadata beserta skrip, lampiran, dan lainnya
- [Lindungi PDF](./protect-pdf): lindungi PDF yang sudah dibersihkan dengan kata sandi
- [Kompres PDF](./compress-pdf): penghapusan metadata dapat sedikit mengurangi ukuran file, kompres untuk penghematan lebih besar
