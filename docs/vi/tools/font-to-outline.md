---
title: Phông chữ thành đường viền
description: Chuyển mọi phông chữ trong PDF thành đường viền vector để hiển thị nhất quán trên mọi thiết bị. Loại bỏ vấn đề phụ thuộc phông chữ.
---

# Phông chữ thành đường viền

Chuyển phông chữ thành đường viền sẽ biến mỗi ký tự từ glyph dựa trên phông chữ thành một đường vector. PDF không còn phụ thuộc vào bất kỳ phông chữ nào được cài đặt, nên hiển thị giống hệt nhau trên mọi thiết bị, mọi hệ điều hành và mọi máy in. Đây là bước tiêu chuẩn trong quy trình tiền in ấn.

## Cách hoạt động

1. Tải lên một hoặc nhiều tệp PDF.
2. Nhấp **Chuyển thành đường viền**.
3. Ghostscript chuyển toàn bộ văn bản thành đường vector.
4. Tải kết quả xuống. Nhiều tệp sẽ tạo thành một tệp ZIP.

Không có cài đặt nào cần cấu hình. Công cụ dùng Ghostscript (WebAssembly) để chuyển mọi tham chiếu phông chữ thành đường viền trong một lượt.

## Những gì thay đổi

- Ký tự văn bản trở thành đường cong vector (đường bezier)
- Không cần nhúng phông chữ nữa, PDF tự chứa đầy đủ ở cấp độ glyph
- Dung lượng tệp có thể tăng vì đường vector thường lớn hơn tham chiếu phông chữ
- Hình thức hiển thị được giữ nguyên chính xác

## Những gì bạn mất

- Chọn và sao chép dán văn bản
- Khả năng tìm kiếm văn bản (Ctrl+F không còn hoạt động)
- Khả năng chỉnh sửa nội dung văn bản
- Khả năng truy cập qua trình đọc màn hình

## Trường hợp sử dụng

- Gửi PDF cho xưởng in yêu cầu phông chữ đã chuyển thành đường viền
- Chia sẻ tài liệu dùng phông chữ tùy chỉnh hoặc có bản quyền với người không có các phông chữ đó
- Ngăn việc thay thế phông chữ làm thay đổi diện mạo tài liệu trên hệ thống khác
- Chuẩn bị PDF cho quy trình khắc laser hoặc cắt CNC cần đầu vào vector
- Đảm bảo PDF nhiều logo hiển thị đúng trên mọi nền tảng

## Mẹo

- Hãy giữ lại PDF gốc. Chuyển thành đường viền là không thể hoàn tác, bạn không thể chuyển đường vector trở lại văn bản có thể chỉnh sửa.
- Nếu cần văn bản vẫn tìm kiếm được, hãy cân nhắc dùng công cụ Raster hóa PDF rồi chạy OCR sau đó.
- PDF đã chuyển thành đường viền thường lớn hơn. Hãy chạy Nén PDF sau đó nếu dung lượng tệp quan trọng.

## Công cụ liên quan

- [Làm phẳng PDF](./flatten-pdf): làm phẳng form và ghi chú mà không động đến phông chữ
- [Raster hóa PDF](./rasterize-pdf): chuyển thành PDF dạng ảnh thay vì đường viền vector
- [Nén PDF](./compress-pdf): giảm dung lượng tệp sau khi chuyển thành đường viền
- [PDF sang PDF/A](./pdf-to-pdfa): chuyển đổi để lưu trữ sau khi đảm bảo không phụ thuộc phông chữ
