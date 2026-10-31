---
title: Kompres PDF
description: Kurangi ukuran file PDF hingga 90% dengan mesin Hyper Compress. Mendukung ukuran file target, pemrosesan batch, dan pengaturan kualitas kustom.
---

# Kompres PDF

Perkecil file PDF Anda tanpa merusaknya. Kompres PDF ditenagai oleh [Hyper Compress](https://www.bentopdf.com/hyper-compress), mesin kompresi milik BentoPDF sendiri. Mesin ini mengompresi ulang gambar, membuat subset dan menggabungkan font, serta membuang beban tak terpakai seperti thumbnail tersemat dan data aplikasi privat. PDF tetap berfungsi penuh: teks tetap dapat dipilih, tautan dan kolom formulir tetap bekerja.

Hyper Compress dikompilasi ke WebAssembly dan disertakan bersama BentoPDF, sehingga kompresi berjalan offline dan di lingkungan air-gapped tanpa pengaturan tambahan.

## Cara Kerja

1. Unggah satu atau beberapa PDF dengan mengklik area unggah atau menyeret file ke dalamnya.
2. Pilih **Tingkat Kompresi**: Rendah, Sedang, Tinggi, atau Lossless.
3. Secara opsional, masukkan **Ukuran File Target**, atau buka **Pengaturan Kustom** untuk kontrol yang lebih rinci, termasuk **Konversi ke skala abu-abu**.
4. Klik **Kompres PDF**. Untuk beberapa file, Anda mendapatkan satu unduhan ZIP.

## Dokumen Khusus

- **PDF yang ditandatangani secara digital** dikembalikan tanpa perubahan, karena setiap perubahan akan membatalkan tanda tangan. Aktifkan **Abaikan perlindungan konten** di Pengaturan Kustom untuk menghapus tanda tangan dan mengompresnya; tanda tangan yang terlihat tetap ada di halaman, tetapi file tidak lagi bertanda tangan.
- **File PDF/A** kehilangan label PDF/A setelah kompresi, sehingga file tidak pernah mengklaim kesesuaian yang tidak lagi dipenuhi. Aktifkan **Pertahankan PDF/A** di Pengaturan Kustom untuk mempertahankan kesesuaian file.
- **PDF yang dilindungi kata sandi** mendapatkan kolom kata sandi pada kartu filenya. Masukkan kata sandi di sana dan Hyper Compress membuka file itu sendiri, tanpa langkah pembukaan kunci terpisah. Dengan dua file terkunci atau lebih, satu kolom bersama membuka semua file yang memakai kata sandi yang sama. Salinan terkompresi tidak memiliki kata sandi; gunakan [Lindungi PDF](./protect-pdf) untuk menambahkannya kembali.
- **Hasil pindai tanpa lapisan teks** dapat menyusut lebih jauh dengan **Rasterisasi halaman menjadi gambar** di Pengaturan Kustom, yang mengganti setiap halaman dengan satu gambar yang dioptimalkan. Opsi ini dilewati untuk dokumen yang memiliki teks yang dapat dipilih, termasuk hasil pindai ber-OCR, kecuali **Abaikan perlindungan konten** aktif. Dalam kasus itu halaman teks juga menjadi gambar, sehingga teks tidak lagi dapat dipilih dan tautan berhenti berfungsi.

## Tingkat Kompresi

| Tingkat      | Kualitas Gambar     | Resolusi Maks. | Paling Cocok Untuk              |
| ------------ | ------------------- | -------------- | ------------------------------- |
| **Rendah**   | 80                  | 200 DPI        | Menjaga kualitas visual         |
| **Sedang**   | 50                  | 150 DPI        | Dokumen sehari-hari             |
| **Tinggi**   | 20                  | 72 DPI         | Lampiran email, unggahan ke web |
| **Lossless** | Gambar tidak diubah | Tidak berubah  | Salinan arsip                   |

Tinggi juga melepas penyematan 14 font PDF standar, ditambah font yang mirip seperti Arial bila aman.

## Ukuran File Target

Masukkan ukuran dalam KB atau MB dan Hyper Compress mencari kualitas gambar terbaik yang masih muat, dimulai dari tingkat yang Anda pilih. Jika dokumen tidak dapat sekecil itu, Anda mendapatkan versi terkecil yang dapat dibuat beserta pesan yang menyatakannya. Halaman khusus seperti [Kompres PDF ke 1MB](https://www.bentopdf.com/compress-pdf-to-1mb) terbuka dengan target yang sudah terisi.

## Pengaturan Kustom

Buka panel Pengaturan Kustom untuk menyesuaikan Hyper Compress secara langsung. Memilih tingkat kompresi mengatur ulang pengaturan ini ke nilai tingkat tersebut, dan mengedit salah satunya mengubah tingkat menjadi Kustom.

- **Abaikan perlindungan konten**: secara default Hyper Compress tidak menyentuh PDF bertanda tangan dan tidak merasterisasi halaman yang memiliki teks. Mengaktifkannya melewati keduanya. Pengaturan ini tetap aktif saat Anda mengubah tingkat.

- **Gambar**: kualitas gambar, resolusi maksimum, resampling paksa, pengurangan warna, pemangkasan area gambar yang tidak terlihat, penghapusan gambar alternatif, penyederhanaan profil warna, JPEG 2000, dan mode lossless
- **Font**: pembuatan subset, penggabungan duplikat, dan pelepasan penyematan font standar serta font yang mirip
- **Konten**: perataan anotasi, kolom formulir, atau tautan
- **Pembersihan**: penghapusan thumbnail, data aplikasi, article thread, informasi web capture, structure tree, atau output intent
- **Rasterisasi**: mengganti halaman dengan gambar, untuk hasil pindai berupa gambar saja; dilewati jika dokumen memiliki teks yang dapat dipilih
- **Keluaran**: Pertahankan PDF/A, dan kompresi Brotli untuk pembaca PDF 2.0 yang mendukungnya

## Kasus Penggunaan

- Menurunkan laporan 50 MB agar di bawah batas lampiran email
- Membuat hasil pindai muat di bawah batas unggah ketat sebuah portal dengan ukuran file target
- Mengoptimalkan PDF pemasaran agar unduhan situs web lebih cepat
- Mengarsipkan kumpulan dokumen besar saat biaya penyimpanan menjadi pertimbangan
- Mengurangi penggunaan data seluler saat membagikan PDF melalui aplikasi perpesanan

## Tips

- Mulailah dengan Sedang. Jika hasilnya masih terlalu besar, tetapkan ukuran file target atau naikkan ke Tinggi.
- Untuk hasil pindai tanpa lapisan teks, aktifkan Rasterisasi halaman menjadi gambar di Pengaturan Kustom.
- Konversi ke skala abu-abu, di Pengaturan Kustom, dapat memangkas ukuran file untuk dokumen yang banyak warna.

## Alat Terkait

- [Linierisasi PDF](./linearize-pdf): optimalkan PDF terkompresi untuk tampilan web yang cepat
- [Rasterisasi PDF](./rasterize-pdf): ubah halaman menjadi gambar pada DPI tertentu, termasuk halaman bertulisan
- [Perbaiki PDF](./repair-pdf): perbaiki PDF yang rusak saat dikompresi di tempat lain
- [Hapus Metadata](./remove-metadata): buang data tersembunyi demi privasi
