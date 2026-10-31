---
title: OCR PDF
description: Làm cho PDF quét có thể tìm kiếm và sao chép bằng Tesseract OCR với hỗ trợ đa ngôn ngữ và lọc ký tự.
---

# OCR PDF

Biến tài liệu quét thành PDF có thể tìm kiếm và sao chép. Công cụ dùng Tesseract OCR để nhận dạng văn bản trong ảnh và phủ một lớp văn bản vô hình lên các trang gốc, giữ nguyên hình thức hiển thị trong khi làm cho nội dung hoàn toàn có thể tìm kiếm.

## Cách hoạt động

1. Tải lên PDF quét hoặc PDF dạng ảnh.
2. Chọn một hoặc nhiều ngôn ngữ có trong tài liệu từ danh sách ngôn ngữ có thể tìm kiếm.
3. Tùy chọn điều chỉnh cài đặt nâng cao (độ phân giải, nhị phân hóa, danh sách ký tự cho phép).
4. Nhấp **Bắt đầu OCR** và theo dõi tiến trình trên thanh tiến trình thời gian thực.
5. Khi hoàn tất, xem lại văn bản đã trích xuất, rồi tải xuống PDF có thể tìm kiếm hoặc tệp `.txt` thuần.

## Tính năng

- OCR đa ngôn ngữ với bộ chọn ngôn ngữ có thể tìm kiếm
- Lớp văn bản vô hình giữ nguyên diện mạo tài liệu gốc
- Thanh tiến trình thời gian thực và nhật ký đầu ra trong khi xử lý
- Tải kết quả xuống dưới dạng PDF có thể tìm kiếm hoặc tệp văn bản thuần
- Sao chép văn bản đã trích xuất trực tiếp vào clipboard
- Ba mức độ phân giải để cân bằng giữa tốc độ và độ chính xác

## Tùy chọn

| Cài đặt                          | Giá trị                                                                       | Mặc định | Mục đích                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| **Độ phân giải**                 | Chuẩn (192 DPI), Cao (288 DPI), Siêu cao (384 DPI)                            | Cao      | Độ phân giải cao hơn cải thiện độ chính xác với chữ nhỏ nhưng mất nhiều thời gian hơn |
| **Nhị phân hóa ảnh**             | Bật / Tắt                                                                     | Tắt      | Tăng độ tương phản cho bản quét sạch bằng cách chuyển sang đen trắng                  |
| **Mẫu danh sách ký tự cho phép** | Không, Chữ và số, Số + Tiền tệ, Chỉ chữ cái, Chỉ số, Hóa đơn, Form, Tùy chỉnh | Không    | Giới hạn các ký tự được nhận dạng để cải thiện độ chính xác cho từng loại tài liệu    |
| **Danh sách ký tự cho phép**     | Văn bản tự do                                                                 | Trống    | Bộ ký tự thủ công khi mẫu được đặt là Tùy chỉnh                                       |

## Trường hợp sử dụng

- Làm cho hợp đồng và hóa đơn quét có thể tìm kiếm để bạn dùng Ctrl+F
- Trích xuất văn bản từ tài liệu chụp ảnh hoặc hồ sơ giấy cũ
- Xử lý biên lai với mẫu Hóa đơn để ghi nhận chính xác số tiền và ngày tháng
- Tạo PDF dễ tiếp cận từ bản quét chỉ có ảnh để đáp ứng yêu cầu tuân thủ
- Trích xuất hàng loạt nội dung văn bản từ sách hoặc hướng dẫn quét

## Mẹo

- Hãy chọn nhiều ngôn ngữ nếu tài liệu có nội dung pha trộn ngôn ngữ (ví dụ tiêu đề tiếng Anh với nội dung tiếng Nhật).
- Dùng tùy chọn nhị phân hóa cho tài liệu có chữ mờ hoặc độ tương phản thấp, vì nó có thể cải thiện đáng kể độ chính xác nhận dạng.
- Các mẫu danh sách cho phép Hóa đơn và Form giảm mạnh nhận dạng sai trên tài liệu có cấu trúc bằng cách bỏ qua các hình dạng ký tự không liên quan.

## Công cụ liên quan

- [Trích xuất bảng PDF](./extract-tables)
- [Gộp PDF](./merge-pdf)
- [Nén PDF](./compress-pdf)
