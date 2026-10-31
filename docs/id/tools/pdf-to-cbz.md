---
title: PDF ke CBZ
description: Konversi PDF menjadi file CBZ (Comic Book Archive) untuk pembaca komik seperti Komga, Kavita, CDisplayEx, dan Calibre.
---

# PDF ke CBZ

Mengonversi PDF menjadi file CBZ (Comic Book ZIP), format standar untuk komik digital dan manga. Setiap halaman PDF menjadi satu gambar di dalam arsip. Alat ini membuat metadata dalam tiga format demi kompatibilitas maksimal: ComicInfo.xml, metadata.opf, dan ComicBookInfo JSON.

## Cara Kerja

1. Unggah PDF dengan mengklik zona lepas atau menyeret file ke dalamnya.
2. Pilih format gambar, kualitas, skala, dan metadata opsional.
3. Klik **Konversi** untuk membuat file CBZ.
4. File `.cbz` diunduh secara otomatis.

## Opsi

| Opsi              | Nilai           | Default  | Deskripsi                                                                                     |
| ----------------- | --------------- | -------- | --------------------------------------------------------------------------------------------- |
| Format Gambar     | JPEG, PNG, WebP | JPEG     | JPEG untuk komik berwarna, PNG untuk manga hitam putih lossless, WebP untuk kompresi terbaik. |
| Kualitas          | 50–100%         | 85%      | Mengatur kompresi JPEG/WebP. Disembunyikan untuk PNG (selalu lossless).                       |
| Skala             | 1.0x–4.0x       | 2.0x     | Skala lebih tinggi menghasilkan gambar lebih tajam untuk layar resolusi tinggi.               |
| Skala abu-abu     | Aktif/Nonaktif  | Nonaktif | Mengonversi halaman ke skala abu-abu. Mengurangi ukuran file untuk konten hitam putih.        |
| Mode manga        | Aktif/Nonaktif  | Nonaktif | Menetapkan arah baca kanan ke kiri pada metadata.                                             |
| Sertakan metadata | Aktif/Nonaktif  | Aktif    | Menyematkan ComicInfo.xml, metadata.opf, dan ComicBookInfo JSON.                              |

## Kolom Metadata

Saat metadata diaktifkan, Anda dapat mengisi:

- **Judul**: Terdeteksi otomatis dari nama file PDF.
- **Seri**: Nama seri (mis., "Naruto").
- **Nomor (#)**: Nomor edisi dalam seri.
- **Volume (Vol.)**: Nomor volume.
- **Penulis**: Nama penulis atau kreator.
- **Penerbit**: Perusahaan penerbit.
- **Tag / Genre**: Tag yang dipisahkan koma (mis., "Action, Adventure").
- **Tahun Terbit**: Tahun publikasi (1900–2100).
- **Peringkat**: Rating komunitas dari 0 sampai 5.

## Kompatibilitas Metadata

Alat ini menulis metadata dalam tiga format agar setiap pembaca dapat menemukannya:

| Format             | Lokasi             | Didukung oleh                               |
| ------------------ | ------------------ | ------------------------------------------- |
| ComicInfo.xml      | File di dalam ZIP  | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | File di dalam ZIP  | Calibre                                     |
| ComicBookInfo JSON | Kolom komentar ZIP | Calibre (cadangan)                          |

## Format Hasil

- `filename.cbz`: Arsip ZIP berisi gambar halaman bernomor dan file metadata.

Gambar halaman diberi nama dengan nomor berawalan nol (`01.jpg`, `02.jpg`, dan seterusnya) agar pembaca menampilkannya dalam urutan yang benar.

## Kasus Penggunaan

- Mengonversi PDF manga atau komik untuk digunakan dengan pembaca komik.
- Membangun pustaka komik digital di Komga, Kavita, atau Calibre.
- Mengonversi komik hasil pindaian ke format yang ramah pembaca.
- Membagikan komik dalam format yang mempertahankan arah baca dan metadata.

## Tips

- Gunakan **JPEG** untuk komik berwarna dan **PNG** untuk manga hitam putih, karena PNG mengompres konten hitam putih dengan sangat efisien.
- Aktifkan **Skala abu-abu** untuk manga guna mengurangi ukuran file secara signifikan.
- Isi kolom **Seri** dan **Nomor** agar pengelola pustaka (Komga, Calibre) dapat mengatur koleksi Anda secara otomatis.
- **WebP** menawarkan kompresi terbaik tetapi pembaca komik yang lebih lama mungkin tidak mendukungnya.

## Alat Terkait

- [PDF ke JPG](./pdf-to-jpg)
- [PDF ke PNG](./pdf-to-png)
- [PDF ke TIFF](./pdf-to-tiff)
- [Ekstrak Gambar](./extract-images)
