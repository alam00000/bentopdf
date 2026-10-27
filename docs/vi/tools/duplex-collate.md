---
title: Sắp xếp bản quét hai mặt
description: Sắp xếp lại PDF quét hai mặt có các trang mặt trước và mặt sau nằm trong các khối riêng thành đúng thứ tự trước/sau.
---

# Sắp xếp bản quét hai mặt

Sắp xếp quét hai mặt được thiết kế cho quy trình quét ADF, nơi một PDF chứa hai khối trang:

- tất cả mặt trước trước
- tất cả mặt sau sau

Thay vì tách và ghép lại thủ công, công cụ này xen kẽ hai khối thành thứ tự đọc tự nhiên: mặt trước 1, mặt sau 1, mặt trước 2, mặt sau 2, và cứ thế.

## Cách hoạt động

1. Tải lên một PDF được tạo từ việc quét xấp giấy hai mặt.
2. Đặt điểm chia nơi khối mặt trước kết thúc.
3. Chọn cách xử lý khối mặt sau:
   - **Đảo ngược khối mặt sau** (thường dùng khi xấp giấy được lật trước khi quét mặt sau)
   - **Giữ nguyên khối mặt sau**
4. Nhấp **Sắp xếp PDF** để tải xuống kết quả đã sắp xếp lại.

## Tùy chọn

- **Tự động phát hiện điểm chia (một nửa)**: đặt điểm chia là `ceil(totalPages / 2)`.
- **Cảnh báo số trang lẻ**: cảnh báo khi tổng số trang là số lẻ (thường là do quét lệch).
- **Xác nhận khối không đều**: yêu cầu xác nhận khi kích thước khối mặt trước/mặt sau khác nhau.
- **Xuất theo nhóm**: chia đầu ra đã sắp xếp thành các PDF riêng dựa trên số trang của tài liệu gốc và tải xuống dưới dạng ZIP.

## Hành vi đầu ra

- **Mặc định**: một PDF đầu ra (một PDF đầu vào, một PDF đầu ra).
- **Chế độ theo nhóm**: đầu ra được chia khúc theo giá trị số trang mỗi tài liệu của bạn; nếu tạo ra nhiều khúc, chúng được tải xuống dưới dạng một ZIP, ngược lại tải xuống một PDF.

Nếu kích thước các khối không đều, các trang đã ghép cặp được sắp xếp trước, và các trang còn lại chưa ghép cặp được nối vào cuối.

## Trường hợp sử dụng phổ biến

- Khôi phục thứ tự sau khi quét một chồng biểu mẫu hai mặt trong hai lượt.
- Dựng lại các bộ mặt trước/mặt sau từ máy quét văn phòng xuất tất cả mặt trước rồi đến tất cả mặt sau.
- Hậu xử lý bản quét lưu trữ trước khi chia thành các tệp theo từng tài liệu.

## Mẹo

- Hầu hết các lô quét hai mặt nên có tổng số trang chẵn.
- Nếu mặt sau trông bị ngược, hãy chuyển giữa **Đảo ngược khối mặt sau** và **Giữ nguyên khối mặt sau**.
- Với bản gốc 2 trang (mặt trước + mặt sau), hãy dùng xuất theo nhóm với `2` trang mỗi tài liệu.

## Công cụ liên quan

- [Xen kẽ và trộn trang](./alternate-merge)
- [Chia PDF](./split-pdf)
- [Gộp PDF](./merge-pdf)
- [Sắp xếp và nhân bản](./organize-pdf)
