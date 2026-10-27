---
title: SVG ke PDF
description: Konversi grafik vektor SVG ke PDF dengan kontrol kualitas, sepenuhnya di browser Anda.
---

# SVG ke PDF

Konversi file Scalable Vector Graphics (SVG) ke PDF. Alat ini merasterisasi setiap SVG melalui mesin rendering browser, lalu menyematkan hasilnya pada resolusi aslinya. Berguna untuk mengubah ikon vektor, diagram, dan ilustrasi menjadi dokumen portabel.

## Format yang Didukung

| Format | Ekstensi |
| :----- | :------- |
| SVG    | `.svg`   |

## Cara Kerja

1. Klik area unggah atau seret dan lepas satu atau beberapa file SVG.
2. Periksa dan kelola daftar file.
3. Pilih tingkat **Kualitas PDF**.
4. Klik **Konversi ke PDF**. Hasilnya diunduh sebagai `from_svgs.pdf`.

Setiap SVG dibaca sebagai teks, dirender ke kanvas pada lebar dan tinggi intrinsiknya (default 800x600 jika tidak ada dimensi yang ditentukan), dan diekspor sebagai PNG. PNG tersebut kemudian disematkan ke PDF menggunakan pdf-lib. Area transparan diisi dengan latar belakang putih.

## Opsi

**Kualitas PDF** mengatur kompresi setelah rasterisasi:

- **Kualitas Tinggi**: paling mendekati rendering asli.
- **Kualitas Sedang** (default): keseimbangan yang baik.
- **Kualitas Rendah**: file terkecil, sebagian detail hilang.

## Kasus Penggunaan

- Mengonversi diagram arsitektur atau teknik dari SVG ke PDF siap cetak
- Mengemas set ikon ke dalam PDF referensi untuk sistem desain
- Mengubah visualisasi data (D3.js, ekspor pustaka grafik) menjadi PDF siap laporan
- Membuat versi cetak dari infografis berbasis SVG

## Tips

- File SVG tanpa atribut `width` dan `height` eksplisit dirender pada 800x600 piksel. Untuk hasil terbaik, atur dimensi di sumber SVG sebelum mengonversi.
- SVG kompleks dengan referensi font eksternal atau gambar tertaut mungkin tidak dirender dengan sempurna. Sematkan semua aset di dalam SVG untuk hasil yang andal.
- Karena SVG dirasterisasi, PDF akan berisi gambar bitmap, bukan jalur vektor. Untuk keluaran PDF vektor sejati, diperlukan alat vektor khusus.

## Alat Terkait

- [Gambar ke PDF](./image-to-pdf)
- [PNG ke PDF](./png-to-pdf)
- [BMP ke PDF](./bmp-to-pdf)
