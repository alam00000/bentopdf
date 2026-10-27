---
title: XPS sang PDF
description: Chuyển đổi tài liệu XPS và OXPS sang định dạng PDF ngay trong trình duyệt. Không tải lên, không cần đăng ký, hoàn toàn riêng tư.
---

# XPS sang PDF

Chuyển đổi tài liệu Microsoft XPS và OXPS thành tệp PDF chuẩn. XPS (XML Paper Specification) là câu trả lời của Microsoft cho PDF, nhưng sự hỗ trợ dành cho nó đã giảm dần trên các nền tảng. Công cụ này giúp những tài liệu đó đọc được trở lại ở mọi nơi.

## Định dạng được hỗ trợ

| Định dạng | Phần mở rộng | Ghi chú                                |
| :-------- | :----------- | :------------------------------------- |
| XPS       | `.xps`       | Định dạng XPS gốc của Microsoft        |
| OXPS      | `.oxps`      | Open XPS, biến thể theo chuẩn ECMA-388 |

## Cách hoạt động

1. Nhấp vào khu vực tải lên hoặc kéo và thả các tệp XPS/OXPS của bạn. Bạn có thể chọn nhiều tệp cùng lúc.
2. Xem lại danh sách tệp. Xóa từng tệp bằng biểu tượng thùng rác, hoặc nhấp **Thêm tệp** để thêm tài liệu.
3. Nhấp **Chuyển sang PDF**. Engine PyMuPDF xử lý từng tài liệu cục bộ ngay trong trình duyệt của bạn.
4. Một tệp sẽ được tải xuống trực tiếp dưới dạng PDF. Nhiều tệp được gói vào một tệp ZIP có tên `xps-converted.zip`.

## Tùy chọn

Công cụ này thực hiện chuyển đổi định dạng trực tiếp mà không cần cấu hình bổ sung. Đầu ra giữ nguyên kích thước trang, đồ họa vector, phông chữ và ảnh gốc từ nguồn XPS.

## Trường hợp sử dụng

- Mở các tệp XPS nhận từ hệ thống Windows cũ từng mặc định dùng trình điều khiển in XPS
- Chuyển tài liệu OXPS từ Windows 10/11 để chia sẻ với người dùng macOS hoặc Linux
- Lưu trữ các tệp XPS cũ sang định dạng được hỗ trợ rộng rãi hơn
- Giúp người nhận bên ngoài truy cập được các tài liệu chính phủ hoặc doanh nghiệp dạng XPS

## Mẹo

- Cả hai phần mở rộng `.xps` và `.oxps` đều được xử lý tự động, bạn có thể trộn chúng trong cùng một lô.
- Nếu tệp XPS gốc được tạo từ trình điều khiển in độ phân giải cao, PDF kết quả giữ nguyên chất lượng đó. Không có việc lấy mẫu lại.

## Công cụ liên quan

- [Word sang PDF](./word-to-pdf)
- [XML sang PDF](./xml-to-pdf)
