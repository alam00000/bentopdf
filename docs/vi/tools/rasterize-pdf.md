---
title: Raster hóa PDF
description: Chuyển các trang PDF thành PDF dạng hình ảnh. Làm phẳng mọi layer, loại bỏ văn bản có thể chọn, và kiểm soát DPI và định dạng ảnh.
---

# Raster hóa PDF

Rasterize chuyển mỗi trang của PDF thành một hình ảnh rồi ghép các hình ảnh đó lại thành PDF. Kết quả trông giống hệt bản gốc nhưng không còn văn bản có thể chọn, không có phần tử tương tác và không có layer chỉnh sửa được. Về cơ bản nó là một bản photocopy chất lượng cao.

## Cách hoạt động

1. Tải lên một hoặc nhiều tệp PDF.
2. Đặt **DPI** (độ phân giải) cho đầu ra rasterize.
3. Chọn **Định dạng ảnh**: PNG cho chất lượng không mất dữ liệu hoặc JPEG cho tệp nhỏ hơn.
4. Tùy chọn chọn **Chuyển sang thang xám**.
5. Nhấp **Raster hóa PDF**. Nhiều tệp được tải xuống dưới dạng ZIP.

## Tùy chọn

| Cài đặt           | Giá trị                                 | Mặc định |
| ----------------- | --------------------------------------- | -------- |
| **DPI**           | 72, 150, 200, 300, 600                  | 150      |
| **Định dạng ảnh** | PNG (không mất dữ liệu), JPEG (nhỏ hơn) | PNG      |
| **Thang xám**     | Bật/Tắt                                 | Tắt      |

## Hướng dẫn chọn DPI

- **72**: Chỉ xem trên màn hình, kích thước tệp nhỏ nhất
- **150**: Cân bằng tốt cho mục đích chung
- **200**: Văn bản sắc nét hơn, kích thước tệp vừa phải
- **300**: Đầu ra chất lượng in
- **600**: Lưu trữ chất lượng cao hoặc in chuyên nghiệp

## Trường hợp sử dụng

- Ngăn việc trích xuất văn bản từ tài liệu mật trước khi chia sẻ
- Loại bỏ vấn đề phụ thuộc phông chữ bằng cách chuyển văn bản thành điểm ảnh
- Tạo phiên bản "phẳng" của PDF có layer hoặc độ trong suốt phức tạp hiển thị khác nhau giữa các trình xem
- Chuẩn bị PDF cho hệ thống chỉ nhận đầu vào dạng hình ảnh
- Loại bỏ nội dung ẩn (như thay đổi được theo dõi hoặc dữ liệu biểu mẫu) bằng cách rút PDF về thuần hình ảnh

## Mẹo

- 150 DPI với PNG là mặc định vững chắc. Chỉ tăng cao hơn nếu bạn cần đầu ra để in hoặc cần phóng to các chi tiết nhỏ.
- JPEG cho tệp nhỏ hơn rõ rệt nhưng gây ra nhiễu nén ở các cạnh văn bản sắc nét.
- Rasterize không thể hoàn tác, hãy giữ PDF gốc nếu sau này bạn có thể cần văn bản chỉnh sửa được.

## Công cụ liên quan

- [Nén PDF](./compress-pdf): giảm kích thước tệp PDF đã rasterize
- [Chỉnh nghiêng PDF](./deskew-pdf): làm thẳng các trang trước khi rasterize tài liệu quét
- [Phông chữ thành đường viền](./font-to-outline): chuyển phông chữ thành đường vector nếu bạn muốn giữ khả năng co giãn
- [Làm phẳng PDF](./flatten-pdf): làm phẳng biểu mẫu mà không chuyển thành hình ảnh
