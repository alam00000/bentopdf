---
title: JPG sang PDF
description: Chuyển đổi một hoặc nhiều ảnh JPG, JPEG và JPEG 2000 thành một tệp PDF duy nhất ngay trong trình duyệt.
---

# JPG sang PDF

Biến ảnh JPG thành PDF gọn gàng. Tải lên một tệp hoặc nhiều ảnh JPG cùng lúc, mỗi ảnh trở thành một trang kích thước đầy đủ trong tài liệu đầu ra.

## Định dạng được hỗ trợ

| Định dạng | Phần mở rộng    |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo và thả các tệp JPG của bạn. Hỗ trợ chọn nhiều tệp.
2. Xem lại các tệp đã tải lên. Dùng biểu tượng thùng rác để xóa từng tệp, hoặc nhấp **Thêm tệp** để bổ sung vào danh sách.
3. Chọn mức **Chất lượng PDF**.
4. Nhấp **Chuyển sang PDF**. Công cụ nén ảnh theo cài đặt chất lượng của bạn, chuyển đổi qua engine PyMuPDF và tải xuống `from_jpgs.pdf`.

## Tùy chọn

**Chất lượng PDF** điều chỉnh mức nén áp dụng cho từng ảnh trước khi nhúng vào PDF:

- **Chất lượng cao**: giữ tối đa chi tiết. Dùng cho ảnh chụp hoặc in ấn.
- **Chất lượng trung bình** (mặc định): cân bằng tốt giữa độ rõ nét và dung lượng tệp.
- **Chất lượng thấp**: nén mạnh để có đầu ra nhỏ nhất.

## Trường hợp sử dụng

- Chuyển các tài liệu quét lưu dạng JPG thành một PDF duy nhất để nộp
- Đóng gói ảnh sản phẩm thành catalog cho khách hàng
- Biến ảnh y tế hoặc vệ tinh JPEG 2000 thành PDF dễ mang theo
- Tạo album ảnh có thể in từ ảnh xuất ra từ máy ảnh

## Mẹo

- Tệp JPEG 2000 (`.jp2`, `.jpx`) được hỗ trợ đầy đủ, không chỉ JPEG tiêu chuẩn. Điều này hữu ích cho ảnh y tế và dữ liệu không gian địa lý.
- Nếu ảnh JPG của bạn đến từ camera điện thoại, chất lượng Trung bình thường cho tệp nhỏ hơn 40-60% so với Cao mà không thấy khác biệt trên màn hình.

## Công cụ liên quan

- [Hình ảnh sang PDF](./image-to-pdf)
- [PNG sang PDF](./png-to-pdf)
- [WebP sang PDF](./webp-to-pdf)
