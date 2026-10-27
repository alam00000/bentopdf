---
title: PowerPoint ke PDF
description: Konversi presentasi PowerPoint (PPT, PPTX) dan file ODP ke PDF dengan format slide tetap terjaga.
---

# PowerPoint ke PDF

Konversi file presentasi ke PDF. Setiap slide menjadi satu halaman di dokumen hasil, dengan teks, gambar, bentuk, dan transisi dirender melalui mesin LibreOffice berbasis browser. Mendukung format PowerPoint modern dan lama, serta format OpenDocument Presentation.

## Format yang Didukung

| Format                    | Ekstensi |
| :------------------------ | :------- |
| PowerPoint (modern)       | `.pptx`  |
| PowerPoint (lama)         | `.ppt`   |
| OpenDocument Presentation | `.odp`   |

## Cara Kerja

1. Klik area unggah atau seret dan lepas file presentasi Anda.
2. Periksa daftar file. Tambahkan atau hapus file sesuai kebutuhan.
3. Klik **Konversi ke PDF**. Mesin LibreOffice dimuat saat pertama kali digunakan, lalu mengonversi setiap file.
4. Satu file diunduh langsung sebagai PDF. Beberapa file dikemas dalam `powerpoint-converted.zip`.

## Opsi

Alat ini tidak memiliki pengaturan tambahan. Slide dirender pada dimensi aslinya.

## Hasil

| Jumlah Input | Hasil                                                           |
| :----------- | :-------------------------------------------------------------- |
| 1 file       | Unduhan satu PDF (nama file asli dengan ekstensi `.pdf`)        |
| 2+ file      | Arsip ZIP (`powerpoint-converted.zip`) berisi satu PDF per file |

## Kasus Penggunaan

- Mengonversi presentasi ke PDF sebelum dibagikan kepada audiens yang mungkin tidak memiliki PowerPoint
- Membuat versi handout siap cetak dari slide deck untuk konferensi atau lokakarya
- Mengarsipkan presentasi dalam format yang tampil identik di setiap perangkat
- Mengonversi sekaligus pustaka presentasi ODP dari LibreOffice Impress ke PDF
- Membuat versi PDF dari pitch deck untuk lampiran email

## Tips

- Animasi dan transisi slide tidak ditampilkan di PDF. Setiap slide diambil sebagai halaman statis.
- Video yang disematkan tidak akan muncul di hasil. Gantikan dengan tangkapan layar atau gambar pengganti jika perlu.
- Catatan pembicara tidak disertakan dalam ekspor PDF default. Jika Anda memerlukan catatan, coba ekspor dari tampilan "Print Notes" bawaan PowerPoint terlebih dahulu.
- Mesin LibreOffice disimpan di cache setelah dimuat pertama kali, sehingga mengonversi presentasi kedua dalam sesi yang sama jauh lebih cepat.

## Alat Terkait

- [Word ke PDF](./word-to-pdf)
- [Excel ke PDF](./excel-to-pdf)
- [Gambar ke PDF](./image-to-pdf)
