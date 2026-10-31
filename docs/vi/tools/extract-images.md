---
title: Trích xuất hình ảnh
description: Trích xuất tất cả hình ảnh nhúng từ tệp PDF. Xem trước trong lưới và tải xuống từng ảnh hoặc dưới dạng kho ZIP.
---

# Trích xuất hình ảnh

Lấy ra mọi hình ảnh nhúng từ một hoặc nhiều tệp PDF. Các hình ảnh đã trích xuất được hiển thị trong lưới xem trước, nơi bạn có thể tải xuống từng ảnh hoặc lấy tất cả cùng lúc dưới dạng ZIP. Được cung cấp bởi PyMuPDF.

## Cách hoạt động

1. Tải lên một hoặc nhiều PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó. Thêm tệp hoặc xóa từng tệp khi cần.
2. Nhấp **Trích xuất** để bắt đầu xử lý.
3. Công cụ quét mọi trang của mọi PDF đã tải lên, tìm và trích xuất các hình ảnh nhúng.
4. Các hình ảnh đã trích xuất xuất hiện trong lưới với ảnh thu nhỏ. Mỗi hình ảnh có một nút tải xuống.
5. Nhấp **Tải xuống tất cả** để lưu mọi thứ dưới dạng kho ZIP.

## Tùy chọn

Công cụ này không có tùy chọn cấu hình. Tất cả hình ảnh nhúng được trích xuất ở định dạng gốc (thường là PNG, JPEG hoặc định dạng nào được dùng khi hình ảnh được nhúng vào PDF).

## Định dạng đầu ra

- Hình ảnh hiển thị trong lưới xem trước với tên `image_1.png`, `image_2.jpg`, v.v.
- **Tải xuống tất cả** tạo ra `extracted-images.zip` chứa mọi hình ảnh.
- Có thể tải xuống từng hình ảnh một từ lưới.

## Trường hợp sử dụng

- Khôi phục ảnh hoặc đồ họa từ PDF để dùng lại trong dự án khác.
- Trích xuất ảnh sản phẩm từ PDF danh mục cho danh sách thương mại điện tử.
- Lấy sơ đồ từ tài liệu kỹ thuật để dùng trong bài thuyết trình.
- Kiểm tra những hình ảnh nào được nhúng trong tài liệu trước khi chia sẻ.

## Mẹo

- Công cụ trích xuất hình ảnh đúng như được lưu trong PDF. Nó không kết xuất lại các trang thành hình ảnh: để làm vậy, hãy dùng [PDF sang PNG](./pdf-to-png) hoặc [PDF sang JPG](./pdf-to-jpg).
- Nếu công cụ báo "Không tìm thấy hình ảnh", PDF có thể dùng đồ họa vector thay vì hình ảnh raster nhúng, hoặc là tài liệu quét mà cả trang là một hình ảnh lớn.
- Xử lý hàng loạt hoạt động trên nhiều PDF. Tất cả hình ảnh từ mọi tệp được gộp vào một lưới và một ZIP.

## Công cụ liên quan

- [PDF sang PNG](./pdf-to-png)
- [PDF sang JPG](./pdf-to-jpg)
- [Trình tạo quy trình PDF](./pdf-workflow)
