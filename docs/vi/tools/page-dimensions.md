---
title: Kích thước trang
description: Phân tích kích thước trang PDF, hướng trang, tỷ lệ khung hình và độ xoay. Phát hiện tài liệu có nhiều kích thước và xuất dữ liệu ra CSV.
---

# Kích thước trang

Công cụ chẩn đoán đọc từng trang trong PDF và báo cáo kích thước chính xác, hướng trang, tên khổ giấy chuẩn, tỷ lệ khung hình, diện tích và độ xoay. Hữu ích để phát hiện các trang khác kích thước trước khi in, hoặc để ghi lại thuộc tính của một PDF bạn nhận được.

## Cách hoạt động

1. Tải lên một tệp PDF. Việc phân tích bắt đầu tự động, không cần nhấn nút nào.
2. Bảng tóm tắt hiển thị tổng số trang, số kích thước trang khác nhau và liệu tài liệu có nhiều kích thước hay không.
3. Duyệt bảng kết quả đầy đủ với chi tiết từng trang.
4. Chuyển đơn vị hiển thị giữa Điểm (Points), Inch, Milimét hoặc Pixel.
5. Nhấp **Xuất ra CSV** để lưu dữ liệu.

## Các trường được báo cáo

| Cột              | Mô tả                                            |
| ---------------- | ------------------------------------------------ |
| Trang số         | Số thứ tự trang                                  |
| Kích thước       | Chiều rộng x Chiều cao theo đơn vị đã chọn       |
| Khổ chuẩn        | Tên khổ khớp (A4, Letter, v.v.) hoặc "Tùy chỉnh" |
| Hướng            | Dọc (Portrait) hoặc Ngang (Landscape)            |
| Tỷ lệ khung hình | Tỷ lệ rộng trên cao dưới dạng số thập phân       |
| Diện tích        | Diện tích trang theo đơn vị đã chọn bình phương  |
| Góc xoay         | Độ xoay của trang tính bằng độ                   |

## Tính năng

- Tự động nhận diện khổ giấy chuẩn (A3, A4, A5, Letter, Legal, Tabloid và nhiều khổ khác)
- Cảnh báo tài liệu nhiều kích thước kèm thống kê các kích thước xuất hiện và số trang dùng mỗi kích thước
- Chuyển đổi đơn vị giữa điểm, inch, milimét và pixel (ở 96 PPI)
- Xuất CSV để dùng trong bảng tính hoặc hệ thống tài liệu

## Trường hợp sử dụng

- Xác minh mọi trang đều là A4 trước khi gửi tài liệu cho tiệm in
- Tìm nguyên nhân PDF đã gộp in ra lề bất ngờ ở một số trang
- Ghi lại bố cục trang của kho lưu trữ PDF lớn cho hồ sơ metadata
- Xác định các trang bị xoay cần chỉnh sửa

## Mẹo

- Nếu phần tóm tắt hiển thị "Nhiều khổ trang", hãy dùng công cụ Sửa kích thước trang để chuẩn hóa trước khi in.
- Trường độ xoay giúp nhận ra các trang hiển thị đúng nhưng có thuộc tính xoay khác 0, điều có thể gây lỗi trong một số quy trình.

## Công cụ liên quan

- [Sửa kích thước trang](./fix-page-size): chuẩn hóa các trang sau khi phát hiện kích thước không đồng nhất
- [Nén PDF](./compress-pdf): tối ưu PDF sau khi sửa các vấn đề về trang
- [Xoay PDF](./rotate-pdf): chỉnh lại các trang bị xoay
