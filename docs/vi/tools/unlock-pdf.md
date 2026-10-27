---
title: Mở khóa PDF
description: Xóa bảo vệ mật khẩu khỏi các PDF đã mã hóa. Hỗ trợ giải mã hàng loạt với một mật khẩu cho nhiều tệp.
---

# Mở khóa PDF

Nếu bạn có mật khẩu của một PDF đã mã hóa, công cụ này sẽ loại bỏ hoàn toàn lớp mã hóa, tạo ra một bản đã mở khóa mà ai cũng có thể mở mà không cần thông tin xác thực. Công cụ hỗ trợ giải mã hàng loạt khi nhiều PDF dùng chung một mật khẩu.

## Cách hoạt động

1. Tải lên một hoặc nhiều tệp PDF đã mã hóa.
2. Nhập **mật khẩu** đã dùng để bảo vệ các tệp.
3. Nhấp **Giải mã PDF**.
4. Một tệp sẽ được tải xuống trực tiếp. Nhiều tệp sẽ tạo ra một tệp ZIP chứa tất cả PDF đã mở khóa.

## Tính năng

- Giải mã từng tệp và hàng loạt
- Xử lý được cả mật khẩu người dùng và mật khẩu chủ sở hữu
- Tạo đầu ra hoàn toàn không mã hóa, không còn hạn chế nào
- Báo lỗi rõ ràng khi mật khẩu sai hoặc tệp bị hỏng
- Theo dõi thành công/thất bại cho từng tệp ở chế độ hàng loạt

## Khác biệt so với Xóa hạn chế

**Giải mã PDF** cần mật khẩu và xóa toàn bộ mã hóa. **Xóa hạn chế** nhắm đến các hạn chế sử dụng (in, sao chép, chỉnh sửa) và có thể không cần mật khẩu nếu chỉ đặt mật khẩu chủ sở hữu. Hãy dùng Giải mã khi PDF hoàn toàn không mở được nếu thiếu mật khẩu.

## Trường hợp sử dụng

- Mở khóa vĩnh viễn các PDF bạn đã mã hóa trước đây khi không còn cần mật khẩu
- Gỡ mã hóa khỏi một loạt tài liệu lưu trữ để dễ truy cập lâu dài
- Chuẩn bị các PDF có mật khẩu cho hệ thống quản lý tài liệu không hỗ trợ tệp mã hóa
- Mở khóa PDF trước khi gộp với các tài liệu khác (nhiều công cụ gộp không xử lý được đầu vào đã mã hóa)

## Mẹo

- Trường mật khẩu áp dụng cho tất cả tệp đã tải lên. Nếu các PDF có mật khẩu khác nhau, hãy xử lý chúng trong các lô riêng.
- Nếu gặp lỗi "Mật khẩu không đúng", hãy kiểm tra lại khoảng trắng ở cuối hoặc phím caps lock.
- Sau khi giải mã, đầu ra không còn bảo mật. Hãy mã hóa lại bằng Mã hóa PDF nếu bạn cần áp dụng mật khẩu mới.

## Công cụ liên quan

- [Mã hóa PDF](./protect-pdf): áp dụng lại mã hóa với mật khẩu mới
- [Xóa hạn chế](./remove-restrictions): xóa hạn chế sử dụng mà không cần giải mã hoàn toàn
- [Thay đổi quyền](./change-permissions): chỉnh sửa các quyền cụ thể trên PDF đã mã hóa
