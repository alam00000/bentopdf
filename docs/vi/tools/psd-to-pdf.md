---
title: PSD sang PDF
description: Chuyển đổi tệp Photoshop (PSD) sang PDF ngay trong trình duyệt. Miễn phí, riêng tư, không cần phần mềm Adobe.
---

# PSD sang PDF

Chuyển đổi tệp Adobe Photoshop PSD thành tài liệu PDF. PSD là định dạng gốc của Photoshop, và thông thường để mở nó cần phần mềm Adobe đắt tiền. Công cụ này hiển thị ảnh tổng hợp đã làm phẳng của tệp PSD thành một trang PDF với độ phân giải đầy đủ.

## Định dạng được hỗ trợ

| Định dạng       | Phần mở rộng | Ghi chú                            |
| :-------------- | :----------- | :--------------------------------- |
| Adobe Photoshop | `.psd`       | Hiển thị ảnh tổng hợp đã làm phẳng |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo và thả các tệp PSD của bạn. Hỗ trợ nhiều tệp.
2. Xem lại danh sách tệp. Xóa tệp không muốn bằng biểu tượng thùng rác, hoặc dùng **Thêm tệp** để bổ sung.
3. Nhấp **Chuyển đổi sang PDF**. Engine PyMuPDF đọc tệp PSD và nhúng ảnh tổng hợp vào một trang PDF ở độ phân giải gốc.
4. Một tệp PSD tạo ra một PDF. Khi bạn tải lên nhiều tệp PSD, chúng được gộp thành một PDF nhiều trang duy nhất tên `psd_to_pdf.pdf`, mỗi PSD là một trang.

## Tùy chọn

Không cần cài đặt. Bộ chuyển đổi dùng dữ liệu ảnh đã làm phẳng từ tệp PSD.

## Trường hợp sử dụng

- Xem trước thiết kế Photoshop mà không cần mở Photoshop
- Gửi bản duyệt thiết kế cho khách hàng không có Adobe Creative Suite
- In tác phẩm độ phân giải cao từ tệp PSD
- Tạo hồ sơ năng lực PDF từ nhiều tệp thiết kế PSD, mỗi tệp trở thành một trang trong một tài liệu

## Mẹo

- Quá trình chuyển đổi hiển thị chế độ xem tổng hợp (đã làm phẳng) của PSD. Các layer riêng lẻ, layer điều chỉnh và hiệu ứng layer không được giữ lại như các thành phần riêng trong PDF.
- Nhiều tệp PSD được gộp thành một PDF nhiều trang thay vì các PDF riêng lẻ. Điều này hữu ích khi xây dựng hồ sơ năng lực hoặc lookbook.
- Tệp PSD có độ phân giải rất cao (tệp in 300+ DPI) sẽ tạo ra PDF lớn. Công cụ giữ nguyên toàn bộ độ phân giải.

## Công cụ liên quan

- [Hình ảnh sang PDF](./image-to-pdf)
- [PNG sang PDF](./png-to-pdf)
- [VSD sang PDF](./vsd-to-pdf)
