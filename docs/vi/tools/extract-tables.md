---
title: Trích xuất bảng
description: Phát hiện và trích xuất bảng từ tài liệu PDF. Xuất ra CSV, JSON hoặc Markdown theo từng bảng.
---

# Trích xuất bảng

Phát hiện tất cả bảng trong PDF và cho phép bạn xuất chúng ở định dạng tùy chọn: CSV, JSON hoặc Markdown. Mỗi bảng được trích xuất riêng kèm metadata về trang và vị trí. Được cung cấp bởi engine phát hiện bảng của PyMuPDF.

## Cách hoạt động

1. Tải PDF lên bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó.
2. Chọn **định dạng xuất** ưa thích: CSV, JSON hoặc Markdown.
3. Nhấp **Trích xuất** để bắt đầu xử lý.
4. Nếu tìm thấy một bảng, nó được tải xuống dưới dạng một tệp. Nhiều bảng tạo ra kho ZIP với một tệp cho mỗi bảng.

## Tùy chọn

- **Định dạng xuất**: chọn giữa:
  - **CSV**: giá trị phân tách bằng dấu phẩy với dấu trích dẫn đúng cho các trường chứa dấu phẩy, dấu ngoặc kép hoặc xuống dòng. Phù hợp cho bảng tính và cơ sở dữ liệu.
  - **JSON**: cấu trúc mảng của các mảng, in đẹp với thụt lề 2 dấu cách. Phù hợp để xử lý bằng chương trình.
  - **Markdown**: định dạng bảng phân tách bằng dấu gạch đứng do PyMuPDF tạo ra. Phù hợp cho tài liệu và tệp README.

## Định dạng đầu ra

- **Một bảng**: `filename_table.csv` (hoặc `.json` / `.md`)
- **Nhiều bảng**: `filename_tables.zip` chứa các tệp tên `table_1_page3.csv`, `table_2_page5.csv`, v.v.

## Trường hợp sử dụng

- Trích xuất các bảng cụ thể từ báo cáo PDF dài mà không lấy dữ liệu của cả tài liệu.
- Lấy bảng ở định dạng Markdown để dán trực tiếp vào issue GitHub, wiki hoặc tài liệu.
- Lấy dữ liệu JSON có cấu trúc từ bảng PDF cho tích hợp API hoặc script.
- So sánh bảng giữa các phiên bản PDF khác nhau bằng cách xuất cả hai ra CSV rồi diff.

## Mẹo

- Công cụ này cho bạn quyền kiểm soát theo từng bảng. Nếu bạn chỉ muốn dồn tất cả bảng vào một CSV, hãy dùng [PDF sang CSV](./pdf-to-csv). Để có cả sổ làm việc Excel, hãy dùng [PDF sang Excel](./pdf-to-excel).
- Các bảng trải dài nhiều trang có thể bị phát hiện thành các bảng riêng cho mỗi trang. Bạn có thể cần nối chúng thủ công.
- Nếu không phát hiện bảng nào, PDF có thể là ảnh quét. Hãy chạy OCR trước để thêm lớp văn bản.

## Công cụ liên quan

- [PDF sang CSV](./pdf-to-csv)
- [PDF sang Excel](./pdf-to-excel)
- [PDF sang văn bản](./pdf-to-text)
