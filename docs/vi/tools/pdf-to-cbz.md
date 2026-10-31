---
title: PDF sang CBZ
description: Chuyển đổi PDF thành tệp CBZ (Comic Book Archive) cho các trình đọc truyện tranh như Komga, Kavita, CDisplayEx và Calibre.
---

# PDF sang CBZ

Chuyển PDF thành tệp CBZ (Comic Book ZIP), định dạng tiêu chuẩn cho truyện tranh và manga kỹ thuật số. Mỗi trang PDF trở thành một ảnh trong kho lưu trữ. Công cụ tạo metadata ở ba định dạng để tương thích tối đa: ComicInfo.xml, metadata.opf và ComicBookInfo JSON.

## Cách hoạt động

1. Tải lên PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó.
2. Chọn định dạng ảnh, chất lượng, tỷ lệ và metadata tùy chọn.
3. Nhấp **Chuyển đổi** để tạo tệp CBZ.
4. Tệp `.cbz` được tải xuống tự động.

## Tùy chọn

| Tùy chọn         | Giá trị         | Mặc định | Mô tả                                                                                 |
| ---------------- | --------------- | -------- | ------------------------------------------------------------------------------------- |
| Định dạng ảnh    | JPEG, PNG, WebP | JPEG     | JPEG cho truyện màu, PNG cho manga đen trắng không mất dữ liệu, WebP để nén tốt nhất. |
| Chất lượng       | 50–100%         | 85%      | Điều khiển mức nén JPEG/WebP. Ẩn với PNG (luôn không mất dữ liệu).                    |
| Tỷ lệ            | 1.0x–4.0x       | 2.0x     | Tỷ lệ cao hơn cho ảnh sắc nét hơn trên màn hình độ phân giải cao.                     |
| Thang xám        | Bật/Tắt         | Tắt      | Chuyển các trang sang thang xám. Giảm dung lượng tệp với nội dung đen trắng.          |
| Chế độ manga     | Bật/Tắt         | Tắt      | Đặt hướng đọc từ phải sang trái trong metadata.                                       |
| Bao gồm metadata | Bật/Tắt         | Bật      | Nhúng ComicInfo.xml, metadata.opf và ComicBookInfo JSON.                              |

## Trường metadata

Khi bật metadata, bạn có thể điền:

- **Tiêu đề**: Tự động lấy từ tên tệp PDF.
- **Bộ truyện**: Tên bộ truyện (ví dụ: "Naruto").
- **Số (#)**: Số tập trong bộ truyện.
- **Quyển (Vol.)**: Số quyển.
- **Tác giả**: Tên người viết hoặc người sáng tạo.
- **Nhà xuất bản**: Công ty xuất bản.
- **Thẻ / Thể loại**: Các thẻ cách nhau bằng dấu phẩy (ví dụ: "Action, Adventure").
- **Năm xuất bản**: Năm xuất bản (1900–2100).
- **Đánh giá**: Điểm đánh giá cộng đồng từ 0 đến 5.

## Khả năng tương thích metadata

Công cụ ghi metadata ở ba định dạng để trình đọc nào cũng tìm thấy:

| Định dạng          | Vị trí               | Được hỗ trợ bởi                             |
| ------------------ | -------------------- | ------------------------------------------- |
| ComicInfo.xml      | Tệp bên trong ZIP    | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | Tệp bên trong ZIP    | Calibre                                     |
| ComicBookInfo JSON | Trường chú thích ZIP | Calibre (dự phòng)                          |

## Định dạng đầu ra

- `filename.cbz`: Kho ZIP chứa các ảnh trang được đánh số và các tệp metadata.

Ảnh trang được đặt tên bằng số có chữ số 0 đứng đầu (`01.jpg`, `02.jpg`, v.v.) để trình đọc hiển thị đúng thứ tự.

## Trường hợp sử dụng

- Chuyển PDF manga hoặc truyện tranh để dùng với trình đọc truyện tranh.
- Xây dựng thư viện truyện tranh kỹ thuật số trong Komga, Kavita hoặc Calibre.
- Chuyển truyện tranh quét sang định dạng thân thiện với trình đọc.
- Chia sẻ truyện tranh ở định dạng giữ nguyên hướng đọc và metadata.

## Mẹo

- Dùng **JPEG** cho truyện màu và **PNG** cho manga đen trắng, vì PNG nén nội dung đen trắng rất hiệu quả.
- Bật **Thang xám** cho manga để giảm đáng kể dung lượng tệp.
- Điền các trường **Bộ truyện** và **Số** để các trình quản lý thư viện (Komga, Calibre) tự động sắp xếp bộ sưu tập của bạn.
- **WebP** nén tốt nhất nhưng các trình đọc truyện tranh cũ có thể không hỗ trợ.

## Công cụ liên quan

- [PDF sang JPG](./pdf-to-jpg)
- [PDF sang PNG](./pdf-to-png)
- [PDF sang TIFF](./pdf-to-tiff)
- [Trích xuất hình ảnh](./extract-images)
