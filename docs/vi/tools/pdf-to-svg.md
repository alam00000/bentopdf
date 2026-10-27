---
title: PDF sang SVG
description: Chuyển đổi các trang PDF thành đồ họa vector SVG co giãn được. Giữ văn bản và hình dạng dưới dạng đường vector để phóng to vô hạn.
---

# PDF sang SVG

Chuyển mỗi trang của PDF thành một tệp SVG (Scalable Vector Graphics). Khác với các định dạng raster, SVG giữ nguyên đường vector, văn bản và hình dạng nên đầu ra co giãn ở mọi kích thước mà không bị vỡ hạt. Chạy bằng PyMuPDF.

## Cách hoạt động

1. Tải lên một hoặc nhiều PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó. Bạn có thể thêm nhiều tệp và quản lý từng tệp riêng.
2. Nhấp **Chuyển đổi** để xử lý tất cả tệp đã tải lên.
3. Chuyển đổi một tệp một trang được tải xuống dưới dạng `.svg` riêng. Mọi trường hợp khác được tải xuống dưới dạng kho ZIP.

## Tùy chọn

Công cụ này không có tùy chọn cấu hình. Mỗi trang được chuyển sang SVG bằng chức năng xuất vector gốc của PyMuPDF.

## Định dạng đầu ra

- **Một tệp, một trang**: `filename.svg`
- **Một tệp, nhiều trang**: `filename_svg.zip` chứa `page_1.svg`, `page_2.svg`, v.v.
- **Nhiều tệp**: `pdf_to_svg.zip` với các tệp được sắp xếp theo tên tài liệu nguồn.

## Trường hợp sử dụng

- Trích xuất sơ đồ, biểu đồ hoặc hình minh họa vector từ báo cáo PDF để dùng trên trang web.
- Chỉnh sửa nội dung trang PDF trong trình chỉnh sửa vector như Inkscape hoặc Illustrator.
- Nhúng bản xem trước trang co giãn được vào ứng dụng web responsive.
- Trích xuất logo hoặc đồ họa từ brochure PDF mà vẫn giữ cạnh sắc nét.

## Mẹo

- SVG hoạt động tốt nhất với PDF chứa nội dung vector. Tài liệu quét hoặc PDF nhiều ảnh sẽ tạo ra tệp SVG lớn chứa dữ liệu raster nhúng.
- Để có đầu ra raster cho PDF nhiều ảnh, hãy dùng [PDF sang PNG](./pdf-to-png) hoặc [PDF sang JPG](./pdf-to-jpg).
- Công cụ này hỗ trợ chuyển đổi hàng loạt: tải lên nhiều PDF cùng lúc để chuyển tất cả trong một lần chạy.

## Công cụ liên quan

- [PDF sang PNG](./pdf-to-png)
- [PDF sang JPG](./pdf-to-jpg)
- [PDF sang Markdown](./pdf-to-markdown)
