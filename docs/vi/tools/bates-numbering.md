---
title: Đánh số Bates
description: Áp dụng số Bates cho một hoặc nhiều PDF với mẫu, độ đệm số, phông chữ và vị trí tùy chỉnh.
---

# Đánh số Bates

Đánh số Bates đóng dấu các mã định danh tuần tự lên mọi trang trong PDF của bạn. Đây là phương pháp tiêu chuẩn để gắn nhãn tài liệu trong tố tụng pháp lý, kiểm toán và quy trình tuân thủ. Công cụ này hỗ trợ nhiều tệp, mẫu tùy chỉnh, và tạo các PDF được đánh số riêng lẻ hoặc một tệp nén ZIP duy nhất.

## Cách hoạt động

1. Tải lên một hoặc nhiều tệp PDF. Bạn có thể kéo nhiều tệp cùng lúc.
2. Chọn một kiểu cài sẵn hoặc tạo mẫu tùy chỉnh.
3. Cấu hình vị trí, phông chữ, cỡ chữ, màu sắc và các số bắt đầu.
4. Nhấp **Áp dụng số Bates** để xử lý.
5. Một tệp sẽ được tải xuống trực tiếp. Nhiều tệp sẽ được tải xuống dưới dạng tệp nén ZIP.

## Tùy chọn

- **Kiểu cài sẵn**: Chọn từ các định dạng dựng sẵn:
  - Phụ lục + Vụ + Bates + Trang (ví dụ: "Exhibit 1 Case XYZ 000001 Page 1")
  - Phụ lục + Vụ + Bates (không có số trang)
  - Vụ + Bates
  - Chỉ số Bates (ví dụ: "000001")
  - Tùy chỉnh (tự viết mẫu của bạn)
- **Tùy chỉnh kiểu**: Một chuỗi mẫu dùng các placeholder: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Độ đệm số Bates**: Số chữ số (3 đến 6) cho số Bates được đệm số 0. Chỉ hiển thị ở chế độ tùy chỉnh.
- **Vị trí**: Đầu trang hoặc Chân trang, Trái, Giữa hoặc Phải.
- **Số Bates bắt đầu từ**: Số Bates đầu tiên. Mặc định là 1. Việc đánh số tiếp tục xuyên suốt các tệp.
- **Bộ đếm tệp bắt đầu từ**: Số bắt đầu cho placeholder `[FILE]`.
- **Phông chữ**: Helvetica, Times New Roman hoặc Courier.
- **Cỡ chữ**: Kích thước văn bản được đóng dấu.
- **Màu sắc**: Bộ chọn màu cho văn bản số Bates.

## Tính năng

- Xem trước trực tiếp cách số Bates sẽ xuất hiện trên tất cả các tệp đã tải lên
- Hỗ trợ nhiều tệp với việc đánh số liên tục giữa các tài liệu
- Kéo thả sắp xếp lại tệp để điều khiển thứ tự đánh số
- Sáu tùy chọn vị trí (đầu/chân trang, trái/giữa/phải)
- Tính lề thích ứng, phù hợp với các khổ trang khác nhau
- Đầu ra ZIP cho các lô nhiều tệp
- Placeholder trong mẫu để linh hoạt tối đa

## Trường hợp sử dụng

- Đóng dấu tài liệu thu thập chứng cứ cho tố tụng bằng số hiệu chứng cứ tuần tự
- Đánh số các gói bằng chứng kiểm toán gồm hàng chục tệp
- Áp dụng số tham chiếu quy định cho tài liệu tuân thủ
- Gắn nhãn các phụ lục hồ sơ đăng ký sáng chế bằng mã định danh riêng của vụ việc

## Mẹo

- Kéo các tệp trong danh sách để sắp xếp lại trước khi xử lý. Thứ tự đánh số Bates theo thứ tự này.
- Dùng placeholder `[FILENAME]` để đưa tên tệp gốc vào dấu đóng, giúp truy ngược các trang về tài liệu nguồn.
- Ô xem trước cập nhật theo thời gian thực khi bạn đổi thiết lập, nên bạn có thể kiểm tra định dạng trước khi xử lý.

## Công cụ liên quan

- [Số trang](./page-numbers)
- [Thêm nhãn trang](./add-page-labels)
- [Đầu trang & Chân trang](./header-footer)
