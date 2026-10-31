---
title: PDF ke PDF/A
description: Konversi PDF standar ke format PDF/A untuk pengarsipan jangka panjang. Mendukung tingkat kesesuaian PDF/A-1b, PDF/A-2b, dan PDF/A-3b.
---

# PDF ke PDF/A

PDF/A adalah subset PDF terstandar ISO yang dirancang untuk pelestarian digital jangka panjang. Alat ini mengonversi PDF standar Anda menjadi dokumen yang sesuai PDF/A menggunakan Ghostscript yang berjalan langsung di browser Anda.

## Cara Kerja

1. Unggah satu atau beberapa file PDF.
2. Pilih **Versi PDF/A** dari menu tarik-turun.
3. Secara opsional aktifkan **Pra-ratakan PDF** untuk file kompleks yang gagal dikonversi secara normal.
4. Klik **Konversi ke PDF/A**. Beberapa file menghasilkan arsip ZIP.

## Versi PDF/A

| Versi        | Pembatasan                                          | Terbaik Untuk                                    |
| ------------ | --------------------------------------------------- | ------------------------------------------------ |
| **PDF/A-1b** | Paling ketat. Tanpa transparansi, tanpa layer.      | Kompatibilitas maksimal dengan sistem arsip lama |
| **PDF/A-2b** | Mengizinkan transparansi dan JPEG2000.              | Pengarsipan serbaguna (direkomendasikan)         |
| **PDF/A-3b** | Mengizinkan lampiran tersemat dalam format apa pun. | Mengarsipkan dokumen beserta file data sumber    |

PDF/A-2b dipilih secara default dan sesuai untuk sebagian besar kebutuhan pengarsipan.

## Opsi Pra-ratakan

Beberapa PDF memiliki fitur yang menghalangi konversi PDF/A yang bersih, seperti encoding font tidak umum, tumpukan transparansi kompleks, atau struktur internal yang rusak. Mengaktifkan **Pra-ratakan** merasterisasi PDF pada 300 DPI sebelum konversi, yang menjamin kesesuaian dengan konsekuensi teks tidak dapat dipilih. Gunakan sebagai cadangan saat konversi standar menghasilkan error.

Pra-ratakan memerlukan engine WASM PyMuPDF.

## Kasus Penggunaan

- Memenuhi persyaratan pengarsipan pemerintah atau hukum (banyak yurisdiksi mewajibkan PDF/A untuk berkas pengadilan)
- Mengirim dokumen ke repositori institusi atau perpustakaan digital
- Melestarikan catatan bisnis yang perangkat lunak aslinya mungkin tidak ada lagi sepuluh tahun ke depan
- Menyiapkan faktur untuk standar e-invoicing yang memerlukan PDF/A-3b dengan lampiran XML

## Tips

- Coba konversi tanpa pra-ratakan terlebih dahulu. Aktifkan hanya jika muncul error.
- PDF/A menyematkan semua font, sehingga file hasil sering lebih besar daripada aslinya.
- Validasi hasilnya di validator PDF/A khusus jika alur kerja Anda memerlukan kesesuaian yang ketat.

## Alat Terkait

- [Kompres PDF](./compress-pdf): kecilkan ukuran file setelah konversi
- [Ratakan PDF](./flatten-pdf): ratakan formulir sebelum dikonversi ke PDF/A
- [Hapus Metadata](./remove-metadata): bersihkan metadata sebelum pengarsipan
