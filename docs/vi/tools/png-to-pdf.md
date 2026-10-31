---
title: PNG sang PDF
description: Chuyển một hoặc nhiều ảnh PNG thành tài liệu PDF với chất lượng có thể điều chỉnh, hoàn toàn trong trình duyệt của bạn.
---

# PNG sang PDF

Chuyển ảnh PNG sang PDF mà vẫn giữ nguyên độ phân giải gốc. Mỗi PNG trở thành một trang riêng, có kích thước khớp với kích thước ảnh gốc. Độ trong suốt được xử lý tự động.

## Định dạng được hỗ trợ

| Định dạng | Phần mở rộng |
| :-------- | :----------- |
| PNG       | `.png`       |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo và thả các tệp PNG. Bạn có thể chọn nhiều tệp cùng lúc.
2. Quản lý danh sách tệp: xóa tệp không cần hoặc thêm tệp.
3. Chọn mức **Chất lượng PDF** từ danh sách thả xuống.
4. Nhấp **Chuyển đổi sang PDF**. Đầu ra được tải xuống với tên `from_jpgs.pdf`.

Công cụ dùng pdf-lib để nhúng trực tiếp từng ảnh. Nếu một PNG không thể nhúng gốc (ví dụ do hồ sơ màu bất thường), công cụ sẽ chuyển sang kết xuất lại qua canvas dưới dạng JPEG.

## Tùy chọn

**Chất lượng PDF** điều khiển mức nén áp dụng trước khi nhúng:

- **Chất lượng cao**: nén tối thiểu, dung lượng lớn nhất.
- **Chất lượng trung bình** (mặc định): cân bằng tốt giữa dung lượng và độ rõ nét.
- **Chất lượng thấp**: nén tối đa, đầu ra nhỏ nhất.

## Trường hợp sử dụng

- Chuyển ảnh chụp màn hình thành PDF nhiều trang cho báo cáo lỗi hoặc tài liệu
- Đóng gói các bản xuất thiết kế UI thành một tệp để xem xét
- Biến bản xuất sơ đồ (draw.io, Excalidraw) thành PDF có thể chia sẻ
- Tập hợp một bộ ảnh biểu đồ thành báo cáo

## Mẹo

- PNG có độ trong suốt sẽ có nền trắng trong PDF. Nếu cần nền khác, hãy chỉnh sửa ảnh trước.
- Với ảnh chụp màn hình và sơ đồ có cạnh sắc nét và văn bản, chất lượng Cao tránh được lỗi nén JPEG. Chất lượng Trung bình hoặc Thấp có thể chuyển sang JPEG nội bộ.

## Công cụ liên quan

- [Hình ảnh sang PDF](./image-to-pdf)
- [JPG sang PDF](./jpg-to-pdf)
- [SVG sang PDF](./svg-to-pdf)
