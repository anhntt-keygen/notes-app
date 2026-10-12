# ☕ Cafe Order Manager - Ứng dụng Quản lý Đơn hàng Cafe

Ứng dụng quản lý gọi món, xử lý đơn hàng và thống kê doanh thu thời gian thực dành cho các quán cafe hiện đại. Giao diện được tối ưu hóa hiển thị responsive mượt mà trên cả Mobile (dành cho nhân viên order tại bàn) và Desktop (dành cho thu ngân/nhà bếp).

## 🌟 Tính năng chính

- **[SC-01] Quản lý Menu & Đặt món:** Xem danh sách món phân loại theo danh mục, tìm kiếm món, chọn kích cỡ (S, M, L), tùy chỉnh lượng đường/đá và thêm vào giỏ hàng.
- **[SC-02] Quản lý Trạng thái Đơn hàng:** Theo dõi và chuyển đổi trạng thái đơn hàng (Chờ xử lý ➡️ Đang pha chế ➡️ Hoàn thành ➡️ Hủy đơn) trực quan bằng một click.
- **[SC-03] Thống kê Doanh thu & Dashboard:** Thống kê tổng doanh thu, số đơn hoàn thành, số đơn bị hủy và tìm ra món bán chạy nhất (Best-seller).
- **[SC-04] Lưu trữ & Dữ liệu mẫu:** Tự động đồng bộ và lưu trữ dữ liệu an toàn trong `localStorage`. Tích hợp nút "Khôi phục dữ liệu mẫu" để trải nghiệm thử ứng dụng ngay lập tức.

---

## 🛠️ Hướng dẫn Cài đặt & Khởi chạy

### 1. Yêu cầu hệ thống
- Đã cài đặt **Node.js** (Phiên bản khuyến nghị: >= 16.x)
- Trình duyệt web hiện đại (Chrome, Edge, Firefox, Safari)

### 2. Cài đặt các thư viện phụ thuộc (Dependencies)
Mở terminal tại thư mục chứa dự án và chạy lệnh sau để cài đặt Express server và Playwright (cho việc test tự động):
```bash
npm install
```

### 3. Khởi chạy ứng dụng (Start Server)
Chạy lệnh sau để khởi động server Node.js:
```bash
npm start
```
Sau khi chạy, mở trình duyệt và truy cập: **`http://localhost:3000`**

### 4. Chạy Test tự động (Automation Test)
Để kiểm tra toàn bộ luồng nghiệp vụ của ứng dụng (Từ chọn món, đặt đơn, chuyển trạng thái đến cập nhật doanh thu):
```bash
npm test
```

---

## 📂 Cấu trúc thư mục dự án
```text
cafe-order-manager/
├── package.json         # Định nghĩa dependencies và kịch bản chạy/test
├── server.js            # Node.js Express Server phục vụ ứng dụng static
├── public/              # Thư mục chứa giao diện Frontend
│   ├── index.html       # Giao diện chính của ứng dụng (TailwindCSS)
│   ├── style.css        # Tùy chỉnh CSS giao diện Cafe Cozy tone
│   └── app.js           # Xử lý logic nghiệp vụ, quản lý state & localStorage
└── cafe.test.js         # File kiểm thử tự động bằng Playwright
```
```

---