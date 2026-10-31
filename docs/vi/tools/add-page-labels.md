---
title: Thêm nhãn trang
description: Thêm nhãn trang PDF với số La Mã, tiền tố chữ cái, đánh số tùy chỉnh và nhiều quy tắc trong một tài liệu.
---

# Thêm nhãn trang

Nhãn trang điều khiển cách số trang hiển thị trong trình xem PDF (số hiển thị trên thanh công cụ, không in trên trang). Công cụ này cho phép bạn gán các kiểu nhãn khác nhau cho các phạm vi trang khác nhau: số La Mã cho phần đầu sách, số thập phân cho phần nội dung, phụ lục đánh chữ cái, v.v.

## Cách hoạt động

1. Tải lên tệp PDF của bạn.
2. Bảng tùy chọn xuất hiện với một quy tắc nhãn theo mặc định.
3. Cấu hình từng quy tắc với phạm vi trang, kiểu, tiền tố tùy chọn và giá trị bắt đầu.
4. Nhấp **Thêm quy tắc** để tạo thêm quy tắc cho các phần khác nhau.
5. Nhấp **Thêm nhãn trang** để áp dụng mọi quy tắc và tải kết quả xuống.

## Tùy chọn

Mỗi quy tắc nhãn có các thiết lập sau:

- **Phạm vi trang**: Các trang mà quy tắc áp dụng. Để trống nếu áp dụng cho mọi trang. Hỗ trợ các phạm vi như `1-4`, `7`, `odd` hoặc `1-9,30-40`.
- **Kiểu nhãn**: Số Ả Rập thập phân, số La Mã chữ thường (i, ii, iii), số La Mã chữ hoa (I, II, III), chữ cái thường (a, b, c), chữ cái hoa (A, B, C), hoặc Không nhãn (chỉ tiền tố).
- **Tiền tố nhãn**: Văn bản tùy chọn đặt trước mỗi nhãn, chẳng hạn "A-" để tạo các nhãn như A-1, A-2, A-3.
- **Giá trị bắt đầu**: Số bắt đầu đếm. Mặc định là 1. Đặt là 0 để đánh số từ 0.
- **Đánh số liên tục qua các phạm vi rời nhau**: Bật tùy chọn này khi một quy tắc nhắm đến các trang không liền kề (như `1-9,30-40` hoặc `odd`) và bạn muốn đánh số tiếp tục tuần tự.
- **Xóa nhãn trang hiện có**: Được chọn theo mặc định. Xóa mọi nhãn trước đó trước khi áp dụng các quy tắc mới.

## Tính năng

- Nhiều quy tắc nhãn trong một tài liệu cho các sơ đồ đánh số phức tạp
- Sáu kiểu nhãn bao quát mọi hệ thống đánh số chuẩn
- Hỗ trợ tiền tố tùy chỉnh để gắn nhãn theo từng phần
- Hỗ trợ phạm vi rời nhau với đánh số liên tiếp
- Tùy chọn giữ lại hoặc xóa các nhãn hiện có

## Trường hợp sử dụng

- Đặt nhãn số La Mã (i, ii, iii) cho lời nói đầu của một cuốn sách và nhãn thập phân cho phần nội dung chính
- Gắn nhãn các trang phụ lục bằng tiền tố chữ cái như "A-1", "A-2", "B-1", "B-2"
- Sửa nhãn trang trong tài liệu quét mà số trang thực tế không khớp với thứ tự trang PDF
- Thêm cách đánh số bắt đầu từ 0 cho tài liệu kỹ thuật

## Mẹo

- Nhãn trang là siêu dữ liệu mà trình xem PDF hiển thị trên thanh điều hướng. Chúng không được in trên trang thực tế. Để có số hiển thị trên trang, hãy dùng [Số trang](./page-numbers).
- Công cụ này yêu cầu CoherentPDF (CPDF) được cấu hình trong Cài đặt WASM của bạn. Nếu chưa thiết lập, bạn sẽ được nhắc cấu hình.

## Công cụ liên quan

- [Số trang](./page-numbers)
- [Đánh số Bates](./bates-numbering)
- [Chỉnh sửa Bookmark](./bookmark)
