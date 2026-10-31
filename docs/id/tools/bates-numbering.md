---
title: Penomoran Bates
description: Terapkan nomor Bates ke satu atau beberapa PDF dengan templat, padding, font, dan posisi yang dapat disesuaikan.
---

# Penomoran Bates

Penomoran Bates membubuhkan pengenal berurutan pada setiap halaman PDF Anda. Ini adalah metode standar untuk memberi label dokumen dalam proses hukum, audit, dan alur kerja kepatuhan. Alat ini mendukung banyak file, templat yang dapat disesuaikan, dan menghasilkan PDF bernomor terpisah atau satu arsip ZIP.

## Cara Kerja

1. Unggah satu atau beberapa file PDF. Anda dapat menyeret banyak file sekaligus.
2. Pilih preset gaya atau buat templat kustom.
3. Atur posisi, font, ukuran, warna, dan nomor awal.
4. Klik **Terapkan Nomor Bates** untuk memproses.
5. Satu file diunduh langsung. Beberapa file diunduh sebagai arsip ZIP.

## Opsi

- **Preset Gaya** -- Pilih dari format bawaan:
  - Exhibit + Case + Bates + Page (misalnya "Exhibit 1 Case XYZ 000001 Page 1")
  - Exhibit + Case + Bates (tanpa nomor halaman)
  - Case + Bates
  - Hanya Nomor Bates (misalnya "000001")
  - Kustom (tulis templat Anda sendiri)
- **Sesuaikan Gaya** -- String templat yang menggunakan placeholder: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Padding Bates** -- Jumlah digit (3 hingga 6) untuk nomor Bates yang diberi nol di depan. Hanya terlihat pada mode kustom.
- **Posisi** -- Header atau Footer, Kiri, Tengah, atau Kanan.
- **Bates Dimulai Dari** -- Nomor Bates pertama. Default 1. Penomoran berlanjut di seluruh file.
- **Penghitung File Dimulai Dari** -- Nomor awal untuk placeholder `[FILE]`.
- **Font** -- Helvetica, Times New Roman, atau Courier.
- **Ukuran Font** -- Ukuran teks yang dibubuhkan.
- **Warna** -- Pemilih warna untuk teks nomor Bates.

## Fitur

- Pratinjau langsung yang menunjukkan tampilan nomor Bates di semua file yang diunggah
- Dukungan banyak file dengan penomoran berkelanjutan di seluruh dokumen
- Pengaturan ulang urutan file dengan seret dan lepas untuk mengatur urutan penomoran
- Enam opsi posisi (header/footer, kiri/tengah/kanan)
- Perhitungan margin adaptif yang menyesuaikan ukuran halaman berbeda
- Keluaran ZIP untuk batch multi-file
- Placeholder templat untuk fleksibilitas maksimal

## Kasus Penggunaan

- Membubuhkan nomor exhibit berurutan pada dokumen discovery untuk litigasi
- Menomori paket bukti audit yang terdiri dari puluhan file
- Menerapkan nomor referensi regulasi pada dokumentasi kepatuhan
- Memberi label exhibit permohonan paten dengan pengenal khusus perkara

## Tips

- Seret file dalam daftar file untuk mengatur ulang urutannya sebelum diproses. Urutan penomoran Bates mengikuti urutan ini.
- Gunakan placeholder `[FILENAME]` untuk menyertakan nama file asli dalam stempel, yang membantu melacak halaman kembali ke dokumen sumber.
- Kotak pratinjau diperbarui secara real time saat Anda mengubah pengaturan, sehingga Anda dapat memeriksa format sebelum memproses.

## Alat Terkait

- [Nomor Halaman](./page-numbers)
- [Tambahkan Label Halaman](./add-page-labels)
- [Kepala & Kaki Halaman](./header-footer)
