---
title: BMP sang PDF
description: Chuyển đổi ảnh bitmap BMP sang định dạng PDF ngay trong trình duyệt, không cần tải lên bất kỳ máy chủ nào.
---

# BMP sang PDF

Chuyển đổi tệp Windows Bitmap (BMP) sang PDF. BMP là định dạng ảnh không nén vẫn còn gặp trong các hệ thống cũ, chẩn đoán hình ảnh y tế và máy quét công nghiệp. Công cụ này chuyển chúng sang PDF mà không cần cài đặt gì.

## Định dạng được hỗ trợ

| Định dạng | Phần mở rộng |
| :-------- | :----------- |
| BMP       | `.bmp`       |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo thả các tệp BMP của bạn.
2. Xem lại danh sách tệp. Thêm tệp khác hoặc xóa những tệp không cần.
3. Nhấp **Chuyển đổi sang PDF**. Đầu ra được tải xuống với tên `from_bmps.pdf`.

Mỗi BMP được vẽ lên canvas, xuất ra PNG, rồi nhúng vào PDF bằng pdf-lib. Kích thước trang khớp với kích thước ảnh gốc.

## Tùy chọn

Công cụ này không có thêm thiết lập chất lượng. Hình ảnh được nhúng ở độ phân giải gốc dưới dạng PNG không mất dữ liệu trong PDF.

## Trường hợp sử dụng

- Chuyển các tài liệu quét cũ lưu dưới dạng BMP thành PDF lưu trữ
- Biến ảnh chụp màn hình BMP từ các ứng dụng Windows cũ thành tài liệu có thể chia sẻ
- Xử lý đầu ra của máy quét y tế hoặc công nghiệp mặc định là BMP
- Di chuyển các kho ảnh cũ sang định dạng dễ mang theo hơn

## Mẹo

- Tệp BMP không nén nên thường rất lớn. PDF kết quả sẽ nhỏ hơn đáng kể vì hình ảnh được mã hóa lại thành PNG bên trong.
- Nếu bạn có tệp BMP cùng các định dạng ảnh khác, hãy dùng công cụ [Hình ảnh sang PDF](./image-to-pdf) để chuyển đổi tất cả trong một lô.

## Công cụ liên quan

- [Hình ảnh sang PDF](./image-to-pdf)
- [PNG sang PDF](./png-to-pdf)
- [TIFF sang PDF](./tiff-to-pdf)
