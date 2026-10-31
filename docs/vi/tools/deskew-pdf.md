---
title: Chỉnh nghiêng PDF
description: Tự động chỉnh thẳng các trang bị nghiêng trong PDF quét bằng phát hiện độ nghiêng của OpenCV. Có thể điều chỉnh ngưỡng và DPI.
---

# Chỉnh nghiêng PDF

Tài liệu quét hiếm khi thẳng hoàn hảo. Chỉ một độ nghiêng nhỏ cũng làm OCR kém chính xác và bản in trông cẩu thả. Công cụ này dùng các thuật toán xử lý ảnh của OpenCV để phát hiện góc nghiêng của từng trang và xoay nó về ngang bằng.

## Cách hoạt động

1. Tải lên một hoặc nhiều PDF quét.
2. Đặt **Ngưỡng độ nghiêng**: các trang có độ nghiêng phát hiện được thấp hơn giá trị này sẽ được giữ nguyên.
3. Chọn **Chất lượng xử lý (DPI)**: DPI cao hơn giúp phát hiện chính xác hơn nhưng mất nhiều thời gian hơn.
4. Nhấp **Chỉnh thẳng PDF**.
5. Sau khi xử lý, bảng kết quả hiển thị góc phát hiện được của từng trang và trang đó có được chỉnh hay không.

## Tùy chọn

| Cài đặt               | Giá trị               | Mặc định |
| --------------------- | --------------------- | -------- |
| **Ngưỡng độ nghiêng** | 0.1, 0.5, 1.0, 2.0 độ | 0.5      |
| **DPI xử lý**         | 100, 150, 200, 300    | 150      |

## Cách phát hiện độ nghiêng hoạt động

Công cụ kết xuất từng trang thành ảnh ở DPI đã chọn, sau đó dùng OpenCV để phát hiện các góc đường chủ đạo trong nội dung. Nếu độ nghiêng phát hiện được vượt ngưỡng, trang được xoay theo góc ngược lại để làm thẳng. Các trang dưới ngưỡng được giữ nguyên.

## Trường hợp sử dụng

- Dọn dẹp hợp đồng hoặc tài liệu pháp lý quét hàng loạt
- Chuẩn bị biên lai hoặc hóa đơn quét cho xử lý OCR
- Chỉnh thẳng các trang từ máy quét phẳng khi giấy đặt không đồng đều
- Cải thiện chất lượng hình ảnh của tài liệu lưu trữ đã số hóa

## Mẹo

- Hạ ngưỡng xuống 0.1 độ nếu bạn cần căn chỉnh chính xác từng điểm ảnh cho OCR.
- 150 DPI nhanh và chính xác với hầu hết tài liệu. Dùng 300 DPI cho văn bản rất nhỏ hoặc trang nhiều chi tiết.
- Chỉnh thẳng hoạt động tốt nhất với tài liệu có các dòng văn bản ngang rõ ràng. Nó có thể gặp khó với các trang chủ yếu là hình ảnh hoặc có yếu tố thiết kế đường chéo.

## Công cụ liên quan

- [Raster hóa PDF](./rasterize-pdf): chuyển đầu ra đã chỉnh thẳng thành PDF dạng ảnh phẳng
- [Nén PDF](./compress-pdf): giảm dung lượng tệp sau khi chỉnh thẳng
- [Sửa chữa PDF](./repair-pdf): sửa lỗi cấu trúc trong PDF quét
