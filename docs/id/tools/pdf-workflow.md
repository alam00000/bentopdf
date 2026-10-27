---
title: Pembangun Alur Kerja PDF
description: Bangun pipeline pemrosesan PDF kustom secara visual dengan menghubungkan node di kanvas. Rangkai operasi seperti gabung, kompres, watermark, dan ekspor.
---

# Pembangun Alur Kerja PDF

Pembangun Alur Kerja memungkinkan Anda merangkai beberapa operasi PDF menjadi satu pipeline otomatis. Alih-alih menjalankan alat satu per satu, Anda menyusun grafik visual berisi node (input, pemrosesan, output) dan menjalankan semuanya dengan satu klik. File Anda tidak pernah meninggalkan browser.

## Cara Kerja

Antarmuka terbagi menjadi tiga panel: **kotak alat node** di kiri, **kanvas** di tengah, dan **panel pengaturan** di kanan yang muncul saat Anda memilih node.

1. **Tambah node** dengan mengkliknya di sidebar kiri, atau seret langsung ke kanvas. Gunakan kolom pencarian di bagian atas kotak alat untuk memfilter menurut nama.
2. **Hubungkan node** dengan menyeret dari soket keluaran (bagian bawah node) ke soket masukan (bagian atas node lain). Koneksi mengalir dari atas ke bawah.
3. **Atur pengaturan** dengan mengklik node untuk membuka panel pengaturannya di kanan. Setiap jenis node memiliki opsinya sendiri (rentang halaman, penggeser kualitas, kata sandi, dll.).
4. **Jalankan alur kerja** dengan mengklik tombol **Jalankan** di toolbar. Engine mengeksekusi node dalam urutan topologis, memproses satu per satu. Bilah status di bawah melacak kemajuan.
5. **Unduh hasil**: node Unduh di ujung menyimpan PDF akhir (atau ZIP jika menghasilkan beberapa file).

## Kategori Node

Node diatur dalam enam kategori, masing-masing diberi kode warna di kanvas:

- **Masukan** (biru): Input PDF, Input Gambar, Word/Excel/PowerPoint ke PDF, dan lebih dari 15 konverter format lain yang memasukkan file ke pipeline.
- **Edit & Anotasi** (indigo): Pangkas, Skala Abu-abu, Balik Warna, Watermark, Nomor Halaman, Kepala & Kaki Halaman, Efek Pemindai, Sesuaikan Warna, Warna Latar, Hapus Halaman Kosong, Hapus Anotasi.
- **Atur & Kelola** (violet): Gabung, Pisah, Ekstrak Halaman, Putar, Hapus Halaman, Balik, Tambah Halaman Kosong, Bagi Halaman, N-Up, Perbaiki Ukuran Halaman, Gabung ke Halaman Tunggal, Buklet, Posterisasi, Edit Metadata, Daftar Isi, OCR.
- **Optimalkan & Perbaiki** (kuning amber): Kompres, Rasterisasi, Linearisasi, Luruskan, PDF ke PDF/A, Font ke Outline, Perbaiki.
- **Amankan PDF** (mawar): Enkripsi, Dekripsi, Sanitasi, Ratakan, Tanda Tangan Digital, Redaksi.
- **Keluaran** (teal): Unduh (mendeteksi otomatis PDF tunggal atau ZIP), PDF ke Gambar, PDF ke Teks, PDF ke DOCX, PDF ke XLSX, PDF ke CSV, PDF ke SVG, PDF ke Markdown, Ekstrak Gambar.

## Menyimpan dan Memuat Alur Kerja

Toolbar menyediakan empat opsi penyimpanan:

- **Simpan**: menyimpan alur kerja saat ini sebagai templat bernama di penyimpanan lokal browser Anda. Anda dapat menyimpan beberapa templat.
- **Muat**: membuka modal berisi semua templat tersimpan. Klik Muat untuk memulihkan satu, atau hapus templat yang tidak lagi Anda perlukan.
- **Ekspor**: mengunduh alur kerja sebagai file `.json` agar dapat dibagikan atau dicadangkan.
- **Impor**: memuat file alur kerja `.json` dari disk, memulihkan semua node, posisi, dan koneksi.

Templat bertahan antar sesi di penyimpanan lokal. File JSON yang diekspor portabel antar browser dan mesin.

## Model Eksekusi

Engine membangun grafik dependensi dari koneksi Anda dan mengeksekusi node dalam urutan topologis. Jika ada node yang gagal, eksekusi berhenti dan node yang gagal ditandai merah. Beberapa aturan yang perlu diingat:

- Setiap alur kerja memerlukan setidaknya satu node **Masukan** dan satu node **Keluaran**.
- Engine mendeteksi dependensi melingkar dan memblokir eksekusi dengan pesan error.
- Node **Enkripsi** harus menjadi langkah pemrosesan terakhir sebelum node output. Menempatkannya lebih awal akan memicu peringatan validasi karena node berikutnya tidak dapat beroperasi pada data terenkripsi.
- PDF yang dilindungi kata sandi akan meminta kata sandi saat eksekusi.
- Input multi-PDF didukung: node Gabung dapat menggabungkannya, atau node pemrosesan massal akan memproses tiap PDF secara terpisah.

## Jenis Soket

Koneksi memakai soket bertipe untuk mencegah sambungan yang tidak valid:

- **PDF** (indigo): satu dokumen PDF.
- **MultiPDF** (amber): beberapa dokumen PDF yang dikelompokkan bersama.
- **Image** (hijau): sebuah blob gambar.

## Opsi

Setiap node memiliki konfigurasinya sendiri yang dapat diakses lewat panel pengaturan di kanan. Pola umumnya meliputi:

- **Rentang halaman** pada node Pisah, Ekstrak Halaman, Hapus Halaman
- **Penggeser kualitas** pada node output konversi gambar
- **Kolom kata sandi** pada node Enkripsi dan Dekripsi
- **Input teks** untuk Watermark, Kepala & Kaki Halaman, Edit Metadata
- **Sudut rotasi** pada node Putar
- **Tingkat kompresi** pada node Kompres
- **Pilihan bahasa OCR** pada node OCR

## Kasus Penggunaan

- **Pipeline pemrosesan faktur**: Input PDF -> OCR -> Ekstrak Tabel -> Unduh sebagai CSV.
- **Standardisasi laporan**: Word ke PDF -> Perbaiki Ukuran Halaman -> Tambah Nomor Halaman -> Watermark -> Kompres -> Unduh.
- **Persiapan arsip**: Input PDF -> Perbaiki -> Ratakan -> Sanitasi -> PDF ke PDF/A -> Unduh.
- **Ekstraksi gambar massal**: Input PDF (beberapa file) -> Ekstrak Gambar -> Unduh ZIP.
- **Buklet siap cetak**: Input PDF -> Buklet -> Pangkas -> Kompres -> Unduh.
- **Distribusi aman**: Input PDF -> Redaksi -> Hapus Anotasi -> Enkripsi -> Unduh.

## Tips

- Gunakan **Delete** atau **Backspace** untuk menghapus node terpilih dari kanvas.
- Klik tombol **X** pada bilah status node untuk menghapusnya langsung.
- Geser kanvas dengan mengklik dan menyeret di ruang kosong. Kursor berubah menjadi ikon genggam saat menggeser.
- Di perangkat seluler, gunakan tombol **+** di toolbar untuk menampilkan atau menyembunyikan kotak alat node.
- Jika alur kerja Anda menghasilkan beberapa file output, node Unduh otomatis mengemasnya ke dalam ZIP.
- Mulailah dari yang sederhana: bangun dan uji pipeline dua node sebelum menambah kerumitan.

## Alat Terkait

- [PDF ke Teks](./pdf-to-text)
- [PDF ke Excel](./pdf-to-excel)
- [Ekstrak Gambar](./extract-images)
- [PDF ke Markdown](./pdf-to-markdown)
