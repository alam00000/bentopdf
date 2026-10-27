---
title: TIFF sang PDF
description: Chuyển đổi ảnh TIFF một trang và nhiều trang sang định dạng PDF trong trình duyệt, hỗ trợ đầy đủ các trang.
---

# TIFF sang PDF

Chuyển đổi tệp TIFF sang PDF, gồm cả TIFF nhiều trang. Mỗi trang (hay "IFD") trong tệp TIFF trở thành một trang riêng trong PDF đầu ra. Điều này đặc biệt hữu ích với tài liệu quét, fax và hình ảnh y tế thường được lưu dưới dạng TIFF nhiều trang.

## Định dạng được hỗ trợ

| Định dạng | Phần mở rộng    |
| :-------- | :-------------- |
| TIFF      | `.tiff`, `.tif` |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo và thả các tệp TIFF của bạn.
2. Xem lại danh sách tệp và quản lý nếu cần.
3. Nhấp **Chuyển đổi sang PDF**. Kết quả được tải xuống dưới dạng `from_tiff.pdf`.

Công cụ giải mã từng tệp TIFF bằng bộ giải mã TIFF JavaScript, trích xuất dữ liệu điểm ảnh RGBA thô của từng trang. Mỗi trang được hiển thị lên canvas, xuất thành PNG và nhúng vào PDF. Kích thước trang khớp với các trang TIFF gốc.

## Tùy chọn

Công cụ này không có thêm cài đặt chất lượng. Hình ảnh được nhúng ở độ phân giải gốc.

## Trường hợp sử dụng

- Chuyển tài liệu fax nhiều trang (TIFF-F) sang định dạng PDF di động hơn
- Biến kho tài liệu quét lưu dạng TIFF thành PDF có thể tìm kiếm (sau đó kết hợp với công cụ OCR)
- Xử lý tệp hình ảnh y tế (tiêu bản bệnh lý, xuất từ chẩn đoán hình ảnh) dùng TIFF
- Chuyển tệp TIFF GIS hoặc ảnh vệ tinh thành tài liệu có thể chia sẻ

## Mẹo

- TIFF nhiều trang được hỗ trợ đầy đủ. TIFF 10 trang sẽ tạo PDF 10 trang. Bạn không cần chia TIFF trước.
- Tệp TIFF rất lớn (hàng trăm megabyte) có thể mất nhiều thời gian xử lý hơn vì toàn bộ tệp phải được giải mã trong bộ nhớ trình duyệt.
- Nếu bạn cần OCR cho PDF kết quả, hãy chạy qua công cụ [OCR PDF](./ocr-pdf) sau khi chuyển đổi.

## Công cụ liên quan

- [Hình ảnh sang PDF](./image-to-pdf)
- [BMP sang PDF](./bmp-to-pdf)
- [JPG sang PDF](./jpg-to-pdf)
