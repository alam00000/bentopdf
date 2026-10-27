---
title: Bảo vệ PDF
description: Bảo vệ tệp PDF bằng mật khẩu với mã hóa AES 256-bit. Đặt mật khẩu người dùng và chủ sở hữu cùng các hạn chế sử dụng có thể cấu hình.
---

# Bảo vệ PDF

Khóa PDF của bạn bằng mật khẩu để chỉ những người được ủy quyền mới mở được. BentoPDF dùng mã hóa AES 256-bit, cùng tiêu chuẩn mà ngân hàng và cơ quan chính phủ sử dụng, và được áp dụng hoàn toàn trong trình duyệt của bạn thông qua QPDF.

## Cách hoạt động

1. Tải lên một tệp PDF.
2. Nhập **Mật khẩu người dùng** (bắt buộc). Đây là mật khẩu mọi người cần để mở tệp.
3. Tùy chọn nhập **Mật khẩu chủ sở hữu**. Khi được đặt, PDF sẽ có các hạn chế sử dụng ngăn việc in, chỉnh sửa, sao chép và ghi chú.
4. Nhấp **Mã hóa PDF**.
5. Tải xuống tệp đã mã hóa.

## Các loại mật khẩu

### Mật khẩu người dùng (bắt buộc)

Mật khẩu người dùng là thứ người nhận nhập để mở PDF. Không có nó, tài liệu hoàn toàn không thể truy cập. Mọi PDF được mã hóa đều phải có một mật khẩu này.

### Mật khẩu chủ sở hữu (tùy chọn)

Mật khẩu chủ sở hữu kiểm soát những gì người dùng được ủy quyền có thể làm sau khi mở tệp. Khi bạn đặt một mật khẩu chủ sở hữu khác biệt, BentoPDF tự động áp dụng bộ hạn chế nghiêm ngặt nhất:

- Tắt chỉnh sửa
- Tắt trích xuất/sao chép
- Tắt in
- Tắt ghi chú
- Tắt điền biểu mẫu
- Tắt lắp ráp tài liệu

Nếu bạn để trống mật khẩu chủ sở hữu, PDF vẫn được mã hóa (vẫn cần mật khẩu người dùng để mở) nhưng không có hạn chế sử dụng sau khi mở.

## Chi tiết mã hóa

- **Thuật toán**: AES-256 (Advanced Encryption Standard 256-bit)
- **Độ dài khóa**: 256 bit
- **Tiêu chuẩn**: Mã hóa PDF 2.0 (triển khai của QPDF)

Với công nghệ hiện nay, việc dò AES-256 bằng vét cạn là không khả thi về mặt tính toán. Độ bảo mật của PDF đã mã hóa phụ thuộc hoàn toàn vào độ mạnh của mật khẩu.

## Trường hợp sử dụng

- Bảo vệ các báo cáo tài chính mật trước khi gửi qua email
- Bảo mật tài liệu pháp lý chia sẻ với luật sư phía đối tác
- Thêm mật khẩu cho hồ sơ y tế hoặc thông tin nhận dạng cá nhân
- Phân phối nội dung trả phí (sách điện tử, báo cáo) có kiểm soát truy cập
- Tuân thủ các chính sách bảo vệ dữ liệu yêu cầu mã hóa khi lưu trữ

## Mẹo

- Dùng mật khẩu mạnh và duy nhất. Cụm mật khẩu từ 12 ký tự trở lên gồm chữ hoa, chữ thường, số và ký hiệu là lý tưởng.
- Chia sẻ mật khẩu qua một kênh riêng (điện thoại, tin nhắn), đừng bao giờ gửi cùng email với PDF.
- Nếu bạn chỉ cần hạn chế các hành động (không in, không sao chép) mà không yêu cầu mật khẩu để mở, hãy dùng công cụ Thay đổi quyền.

## Công cụ liên quan

- [Giải mã PDF](./unlock-pdf): gỡ mã hóa khi bạn biết mật khẩu
- [Thay đổi quyền](./change-permissions): sửa các hạn chế sử dụng cụ thể
- [Xóa hạn chế](./remove-restrictions): loại bỏ toàn bộ bảo mật khỏi PDF
- [Làm sạch PDF](./sanitize-pdf): xóa nội dung ẩn trước khi mã hóa
