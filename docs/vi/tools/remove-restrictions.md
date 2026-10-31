---
title: Xóa hạn chế
description: Gỡ bảo vệ bằng mật khẩu, hạn chế in, khóa chỉnh sửa và giới hạn sao chép khỏi tệp PDF.
---

# Xóa hạn chế

PDF có thể mang hai loại mật khẩu: mật khẩu người dùng (cần để mở tệp) và mật khẩu chủ sở hữu (kiểm soát những gì bạn có thể làm với tệp). Công cụ này loại bỏ cả hai, cùng mọi hạn chế liên quan: khóa in, chỉnh sửa, sao chép và ghi chú.

## Cách hoạt động

1. Tải lên một tệp PDF.
2. Nếu PDF có mật khẩu chủ sở hữu, hãy nhập vào trường **Mật khẩu chủ sở hữu**. Để trống nếu PDF chỉ có hạn chế sử dụng mà không có mật khẩu.
3. Nhấp **Xóa hạn chế**.
4. Tải xuống PDF không còn hạn chế.

Công cụ dùng các cờ `--decrypt` và `--remove-restrictions` của QPDF để tạo ra một bản sao sạch, không hạn chế.

## Những gì bị xóa

- Bảo vệ bằng mật khẩu (cả mật khẩu người dùng và chủ sở hữu)
- Hạn chế in
- Hạn chế chỉnh sửa
- Hạn chế sao chép văn bản và hình ảnh
- Hạn chế ghi chú và bình luận
- Mọi giới hạn bảo mật khác được mã hóa trong PDF

## Trường hợp sử dụng

- Mở khóa PDF của bạn nhưng mật khẩu đã đặt từ nhiều năm trước
- Gỡ hạn chế in khỏi tài liệu mà bạn có quyền truy cập hợp pháp
- Bật sao chép-dán trên tài liệu tham khảo để ghi chú
- Chuẩn bị PDF cho các công cụ hỗ trợ tiếp cận không xử lý được tài liệu bị hạn chế

## Mẹo

- Bạn phải biết mật khẩu chủ sở hữu nếu có đặt. Công cụ này không bẻ khóa hay dò mật khẩu bằng vét cạn.
- Nếu bạn cần giữ tệp được mã hóa nhưng thay đổi một số quyền cụ thể, hãy dùng công cụ Thay đổi quyền.
- Tệp đầu ra hoàn toàn không có mã hóa: bất kỳ ai nhận được đều có thể mở tự do.

## Công cụ liên quan

- [Giải mã PDF](./unlock-pdf): mở khóa PDF khi bạn biết mật khẩu người dùng
- [Mã hóa PDF](./protect-pdf): áp dụng lại mã hóa với cài đặt mới
- [Thay đổi quyền](./change-permissions): sửa có chọn lọc những hành động được phép
