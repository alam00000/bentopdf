---
title: Thay đổi quyền
description: Đặt hoặc sửa quyền sử dụng PDF cho việc in, sao chép, chỉnh sửa và chú thích. Dùng mã hóa AES 256-bit.
---

# Thay đổi quyền

Tinh chỉnh những gì người nhận có thể làm với PDF của bạn. Khác với mã hóa cơ bản chỉ khóa tệp bằng mật khẩu, công cụ này cho phép bạn chọn cho phép hoặc từ chối việc in, sao chép, chỉnh sửa, chú thích, điền biểu mẫu, ghép tài liệu và trích xuất trang, tất cả đều được thực thi qua mã hóa AES 256-bit.

## Cách hoạt động

1. Tải lên một tệp PDF.
2. Nếu PDF đã được mã hóa, nhập **Mật khẩu hiện tại**.
3. Đặt **Mật khẩu người dùng mới** (bắt buộc để mở tệp) và/hoặc **Mật khẩu chủ sở hữu mới** (kiểm soát quyền).
4. Bật hoặc tắt từng quyền bằng các ô chọn.
5. Nhấp **Thay đổi quyền**.
6. Tải xuống PDF đã cập nhật.

Nếu bạn để trống cả hai ô mật khẩu mới, công cụ sẽ giải mã hoàn toàn PDF, gỡ bỏ mọi mã hóa và hạn chế.

## Các điều khiển quyền

| Quyền                         | Kiểm soát điều gì                                          |
| ----------------------------- | ---------------------------------------------------------- |
| **Cho phép in**               | Tài liệu có thể được in hay không                          |
| **Cho phép sao chép**         | Văn bản và hình ảnh có thể được chọn và sao chép hay không |
| **Cho phép chỉnh sửa**        | Nội dung tài liệu có thể được chỉnh sửa hay không          |
| **Cho phép chú thích**        | Có thể thêm bình luận, đánh dấu và con dấu hay không       |
| **Cho phép điền biểu mẫu**    | Các trường biểu mẫu tương tác có thể được điền hay không   |
| **Cho phép ghép tài liệu**    | Có thể chèn, xóa hoặc xoay trang hay không                 |
| **Cho phép trích xuất trang** | Từng trang riêng lẻ có thể được trích xuất hay không       |

Mọi quyền đều cần mật khẩu chủ sở hữu để được thực thi. Nếu không có mật khẩu chủ sở hữu, hầu hết trình đọc PDF sẽ bỏ qua các cờ quyền.

## Quyền hoạt động như thế nào trong PDF

Quyền PDF là một phần của đặc tả mã hóa. Chúng được lưu dưới dạng cờ bit trong từ điển mã hóa và được các trình đọc PDF tuân thủ thực thi. Điểm khác biệt chính:

- **Mật khẩu người dùng**: Bắt buộc để mở tệp.
- **Mật khẩu chủ sở hữu**: Bắt buộc để thay đổi quyền hoặc gỡ bỏ hạn chế. Nếu không có, các cờ quyền kiểm soát những thao tác người dùng được thực hiện.

Nếu bạn chỉ đặt mật khẩu chủ sở hữu (không có mật khẩu người dùng), ai cũng mở được tệp nhưng chỉ được thực hiện các thao tác cho phép. Nếu đặt cả hai, tệp cần mật khẩu để mở và bị hạn chế sau khi xác thực.

## Trường hợp sử dụng

- Phân phối báo cáo có thể xem và in nhưng không thể chỉnh sửa hoặc sao chép
- Chia sẻ mẫu hợp đồng mà người nhận có thể điền nhưng không thể sửa
- Xuất bản danh mục PDF đã tắt khả năng sao chép hình ảnh
- Cho phép chú thích trên bản nháp cần duyệt nhưng ngăn thay đổi cấu trúc

## Mẹo

- Để có hiệu lực, hãy luôn đặt mật khẩu chủ sở hữu. Quyền không có mật khẩu chủ sở hữu không thể thực thi.
- Một số công cụ PDF của bên thứ ba bỏ qua cờ quyền. Để bảo vệ mạnh hơn, hãy cân nhắc chuyển PDF thành ảnh raster hoặc dùng DRM.
- Dùng công cụ này để nâng cấp PDF cũ mã hóa RC4 lên AES-256.

## Công cụ liên quan

- [Mã hóa PDF](./protect-pdf): bảo vệ bằng mật khẩu đơn giản, không có quyền chi tiết
- [Giải mã PDF](./unlock-pdf): gỡ bỏ hoàn toàn mã hóa
- [Xóa hạn chế](./remove-restrictions): gỡ mọi hạn chế khi bạn có mật khẩu chủ sở hữu
