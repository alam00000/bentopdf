---
title: PDF sang BMP
description: Chuyển đổi các trang PDF thành ảnh BMP không nén. Hữu ích cho hệ thống cũ và quy trình in yêu cầu đầu vào bitmap.
---

# PDF sang BMP

Chuyển mỗi trang của PDF thành một ảnh BMP (Bitmap). BMP là định dạng không nén, nên đầu ra chính xác đến từng điểm ảnh, không mất chất lượng, nhưng tệp rất lớn.

## Cách hoạt động

1. Tải lên PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó.
2. Nhấp **Chuyển đổi** để xử lý tệp.
3. Một tệp `.bmp` hoặc một tệp ZIP sẽ được tải xuống tự động.

## Tùy chọn

Công cụ này không có tùy chọn cấu hình. Các trang được kết xuất ở tỷ lệ cố định 2x, tạo ra ảnh có kích thước xấp xỉ gấp đôi kích thước gốc của trang PDF.

## Định dạng đầu ra

- **Một trang**: `filename.bmp`
- **Nhiều trang**: `filename_bmps.zip` chứa `page_1.bmp`, `page_2.bmp`, v.v.

## Trường hợp sử dụng

- Đưa các trang PDF vào hệ thống hoặc phần cứng cũ chỉ nhận đầu vào BMP.
- Chuẩn bị ảnh không nén cho một số quy trình in nhất định.
- Dùng đầu ra bitmap làm đầu vào cho các công cụ xử lý ảnh cần dữ liệu điểm ảnh thô.

## Mẹo

- Tệp BMP rất lớn vì lưu dữ liệu điểm ảnh thô không nén. Với hầu hết mục đích, [PDF sang PNG](./pdf-to-png) cho chất lượng không mất dữ liệu với tệp nhỏ hơn nhiều.
- Nếu hệ thống đích chấp nhận PNG hoặc TIFF, hãy ưu tiên các định dạng đó để tiết kiệm dung lượng đĩa.

## Công cụ liên quan

- [PDF sang PNG](./pdf-to-png)
- [PDF sang TIFF](./pdf-to-tiff)
- [PDF sang JPG](./pdf-to-jpg)
