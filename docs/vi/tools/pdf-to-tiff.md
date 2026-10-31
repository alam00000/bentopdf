---
title: PDF sang TIFF
description: Chuyển đổi các trang PDF thành ảnh TIFF, thường dùng trong in ấn, fax và lưu trữ. Tự động chuyển sang PNG nếu mã hóa thất bại.
---

# PDF sang TIFF

Chuyển mỗi trang của PDF thành một ảnh TIFF. TIFF là định dạng tiêu chuẩn cho sản xuất in, hệ thống fax và lưu trữ tài liệu. Công cụ dùng nén PackBits để mã hóa TIFF và chuyển sang PNG nếu một trang mã hóa thất bại.

## Cách hoạt động

1. Tải lên PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó.
2. Nhấp **Chuyển đổi** để xử lý tệp.
3. Một tệp TIFF hoặc một kho ZIP được tải xuống tự động.

## Tùy chọn

Công cụ này không có tùy chọn cấu hình. Các trang được kết xuất ở tỷ lệ cố định 2x.

## Định dạng đầu ra

- **Một trang**: `filename.tiff`
- **Nhiều trang**: `filename_tiffs.zip` chứa `page_1.tiff`, `page_2.tiff`, v.v.

Nếu mã hóa TIFF thất bại ở một trang cụ thể (do vấn đề nén), trang đó sẽ được lưu thành tệp `.png`. Khi đó ZIP sẽ chứa cả tệp TIFF lẫn PNG.

## Trường hợp sử dụng

- Nộp tài liệu cho cơ quan chính phủ hoặc hệ thống pháp lý yêu cầu định dạng TIFF.
- Chuẩn bị các trang để gửi fax qua dịch vụ fax kỹ thuật số.
- Lưu trữ tài liệu quét ở định dạng không mất dữ liệu được hỗ trợ rộng rãi.
- Đưa các trang vào hệ thống quản lý tài liệu doanh nghiệp.

## Mẹo

- Tệp TIFF lớn. Nếu bạn chỉ cần chất lượng không mất dữ liệu cho web hoặc màn hình, [PDF sang PNG](./pdf-to-png) là lựa chọn tốt hơn.
- Hãy kiểm tra nội dung ZIP nếu một số trang phải dùng PNG dự phòng, bạn có thể muốn chuyển đổi riêng những trang đó.

## Công cụ liên quan

- [PDF sang PNG](./pdf-to-png)
- [PDF sang BMP](./pdf-to-bmp)
- [PDF sang JPG](./pdf-to-jpg)
