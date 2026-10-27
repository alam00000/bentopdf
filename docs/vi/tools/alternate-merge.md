---
title: Xen kẽ & Trộn trang
description: Gộp các PDF bằng cách xen kẽ trang từ mỗi tệp theo thứ tự luân phiên, giữ nguyên dấu trang.
---

# Xen kẽ & Trộn trang

Xen kẽ các trang từ nhiều tệp PDF để các trang luân phiên giữa các tài liệu. Đây là công cụ bạn cần khi gộp thông thường chỉ nối các tệp nối đuôi nhau, còn bạn cần trang 1 của Tệp A, rồi trang 1 của Tệp B, rồi trang 2 của Tệp A, và cứ thế tiếp tục.

## Cách hoạt động

1. Tải lên ít nhất hai tệp PDF bằng vùng thả tệp.
2. Công cụ hiển thị từng tệp cùng số trang và dung lượng.
3. Kéo các tay nắm để sắp xếp lại tệp nào có trang đứng đầu trong chuỗi xen kẽ.
4. Nhấp **Trộn trang** để tạo đầu ra xen kẽ.
5. Kết quả được tải xuống với tên `alternated-mixed.pdf`.

## Tính năng

- Xen kẽ các trang giữa bất kỳ số lượng PDF nào (tối thiểu hai)
- Kéo thả sắp xếp lại tệp để điều khiển thứ tự ưu tiên xen kẽ
- Giữ nguyên dấu trang từ các tài liệu nguồn
- Hiển thị số trang và dung lượng của từng tệp đã tải lên
- Xử lý qua web worker riêng để giao diện luôn phản hồi

## Trường hợp sử dụng

- Ghép lại các bản quét hai mặt khi trang lẻ và trang chẵn được quét riêng
- Kết hợp phiếu câu hỏi với đáp án để mỗi câu hỏi được theo sau bởi đáp án của nó
- Gộp tài liệu hai ngôn ngữ theo từng trang (ví dụ: tiếng Anh ở một mặt, bản dịch ở mặt kế tiếp)
- Xen kẽ bản quét mặt trước và mặt sau từ máy quét một mặt

## Mẹo

- Nếu các PDF nguồn có số trang khác nhau, trang của tài liệu ngắn hơn sẽ hết trước và các trang còn lại của tài liệu dài hơn sẽ xuất hiện ở cuối.
- Thứ tự tệp rất quan trọng: tệp đầu tiên trong danh sách đóng góp trang đầu tiên của đầu ra. Hãy kéo để sắp xếp lại nếu cần.

## Công cụ liên quan

- [Gộp PDF](./merge-pdf)
- [Sắp xếp & Nhân bản](./organize-pdf)
- [Chia PDF](./split-pdf)
