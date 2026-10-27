---
title: HEIC sang PDF
description: Chuyển đổi ảnh HEIC và HEIF từ iPhone và iPad sang định dạng PDF ngay trong trình duyệt.
---

# HEIC sang PDF

Chuyển đổi ảnh HEIC/HEIF sang PDF. HEIC là định dạng ảnh mặc định trên iPhone và iPad từ iOS 11. Công cụ này giúp bạn biến những bức ảnh đó thành PDF mà không cần cài phần mềm máy tính hay tải tệp lên máy chủ.

## Định dạng được hỗ trợ

| Định dạng | Phần mở rộng |
| :-------- | :----------- |
| HEIC      | `.heic`      |
| HEIF      | `.heif`      |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo và thả các tệp HEIC/HEIF của bạn.
2. Xem lại danh sách tệp và xóa những tệp không cần.
3. Nhấp **Chuyển sang PDF**. Kết quả được tải xuống với tên `from_heic.pdf`.

Mỗi tệp HEIC được giải mã bằng thư viện heic2any, chuyển thành PNG với chất lượng 92%. Sau đó PNG được nhúng vào PDF bằng pdf-lib, mỗi ảnh nằm trên một trang riêng với độ phân giải đầy đủ.

## Tùy chọn

Công cụ này không có thêm cài đặt. Ảnh HEIC được chuyển thành PNG ở chất lượng cao (0.92) trước khi nhúng.

## Trường hợp sử dụng

- Tạo PDF từ ảnh iPhone để đính kèm vào hồ sơ bồi thường bảo hiểm hoặc báo cáo
- Chuyển ảnh HEIC của một tin đăng bất động sản thành một tài liệu có thể in
- Biến ảnh chụp màn hình iPad (định dạng HEIF) thành PDF có thể chia sẻ
- Chuyển đổi hàng loạt ảnh du lịch cho nhật ký hành trình

## Mẹo

- Việc giải mã HEIC diễn ra hoàn toàn trong trình duyệt bằng WebAssembly. Lần chuyển đổi đầu tiên có thể mất một lúc để tải bộ giải mã.
- Nếu cần kết hợp HEIC với các định dạng ảnh khác (JPG, PNG, v.v.), hãy dùng công cụ [Hình ảnh sang PDF](./image-to-pdf), hỗ trợ HEIC cùng mọi định dạng khác.
- Tệp HEIC từ iPhone thường chứa dữ liệu EXIF, bao gồm tọa độ GPS. PDF đầu ra không mang theo metadata này.

## Công cụ liên quan

- [Hình ảnh sang PDF](./image-to-pdf)
- [JPG sang PDF](./jpg-to-pdf)
- [PNG sang PDF](./png-to-pdf)
