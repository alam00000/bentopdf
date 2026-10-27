---
title: WebP sang PDF
description: Chuyển đổi ảnh WebP sang PDF ngay trong trình duyệt với chất lượng nén có thể điều chỉnh.
---

# WebP sang PDF

Chuyển đổi định dạng ảnh WebP của Google sang PDF. Công cụ đặc biệt hữu ích khi bạn tải ảnh từ web ở định dạng WebP và cần một định dạng được chấp nhận rộng rãi hơn để in hoặc chia sẻ.

## Định dạng được hỗ trợ

| Định dạng | Phần mở rộng |
| :-------- | :----------- |
| WebP      | `.webp`      |

## Cách hoạt động

1. Nhấp vào khu vực tải lên hoặc kéo và thả các tệp WebP của bạn.
2. Xem lại danh sách tệp và xóa những tệp bạn không cần.
3. Chọn mức **Chất lượng PDF**.
4. Nhấp **Chuyển sang PDF**. Đầu ra được tải xuống với tên `from_webps.pdf`.

Bên trong, mỗi ảnh WebP được giải mã qua canvas API của trình duyệt, rồi được nhúng vào PDF bằng pdf-lib. Điều này có nghĩa là việc chuyển đổi hoạt động trên mọi trình duyệt hỗ trợ giải mã WebP (tất cả trình duyệt hiện đại đều hỗ trợ).

## Tùy chọn

**Chất lượng PDF** điều khiển mức nén khi nhúng ảnh:

- **Chất lượng cao**: giữ lại nhiều chi tiết nhất.
- **Chất lượng trung bình** (mặc định): đầu ra cân bằng.
- **Chất lượng thấp**: kích thước tệp nhỏ nhất.

## Trường hợp sử dụng

- Chuyển các ảnh tải từ web được lưu dạng WebP thành PDF có thể in
- Gói ảnh chụp màn hình WebP từ Chrome hoặc Edge vào tài liệu
- Tạo danh mục PDF từ ảnh xuất ra bởi các công cụ thiết kế mặc định dùng WebP
- Lưu trữ ảnh WebP ở định dạng dễ đọc rộng rãi hơn

## Mẹo

- WebP được giải mã nội bộ sang PNG trước khi nhúng vào PDF, nên ảnh WebP không mất dữ liệu giữ nguyên chất lượng ở mức Cao.
- Nếu bạn có hỗn hợp WebP và các định dạng ảnh khác, hãy dùng công cụ [Ảnh sang PDF](./image-to-pdf), công cụ này nhận tất cả trong một lần.

## Công cụ liên quan

- [Ảnh sang PDF](./image-to-pdf)
- [PNG sang PDF](./png-to-pdf)
- [JPG sang PDF](./jpg-to-pdf)
