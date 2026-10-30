# TOÀN BỘ KHÓA HỌC & DỰ ÁN HỌC TẬP LEARNING (BÀI TẬP 58)

Kho lưu trữ toàn bộ mã nguồn học tập và thực hành phát triển web, bao gồm đầy đủ các chương học, bài tập về nhà và đồ án **Bài 58 - Fashion Tổng Hợp**.

---

## 📁 CẤU TRÚC THƯ MỤC CHÍNH

```
Learning/
├── HomeWork/                           # Thư mục tổng hợp các bài tập về nhà
│   ├── fashion-slug/                   # Module Fashion Slug & Cột IdF độc nhất
│   └── ...                             # Các bài tập thực hành theo từng chương
│
├── LearnAgolar/                        # Thư mục học tập Angular & MongoDB chính
│   ├── my-app/                         # Ứng dụng Angular 22 hoàn chỉnh (Client + Admin)
│   │   ├── src/app/bai58-fashion-client/  # Tạp chí thời trang Vogue Editorial (Bài 58)
│   │   ├── src/app/bai58-fashion-admin/   # Quản trị hệ thống thời trang WYSIWYG (Bài 58)
│   │   ├── src/app/home-work/             # Hệ thống menu và bài tập điều hướng
│   │   └── ...
│   ├── my-server-mongodb/              # Backend server Node.js kết nối MongoDB FashionData
│   ├── my-server/                      # Server thực hành bài tập
│   └── Fashion.json                    # Dữ liệu nguồn MongoDB FashionData
│
└── server-fashion/                     # Backend RESTful API độc lập cho Bài 58 Fashion
    ├── index.js                        # Express server với các route /fashions, /fashions/slug/:slug
    ├── seed.js                         # Script khởi tạo và chuẩn hóa dữ liệu MongoDB
    └── package.json
```

---

## 🌟 NỘI DUNG NỔI BẬT: BÀI 58 - FASHION TỔNG HỢP

### 1. Client Tạp Chí Vogue Editorial (`/bai58-fashion-client`)
- Thanh danh mục động: `ALL STORIES`, `STREET STYLE`, `TRENDS`, `CELEBRITY STYLE`, `FASHION WEEK`, `RUNWAY` với hiệu ứng chuyển vạch gạch chân đen và lọc bài viết tức thì.
- Tìm kiếm phong cách thời trang ("TRY 'STREET STYLE'") và bộ lọc dropdownlist / quick chips.
- Bố cục lưới 4 ảnh (Vogue Grid) có camera icon overlay và hiệu ứng hover zoom.
- Chi tiết bài viết với nút "QUAY LẠI TRANG BỘ SƯU TẬP" cố định tự nhiên ở đầu trang và bài viết hiển thị HTML đầy đủ qua SafeHtmlPipe.

### 2. Admin Quản Trị Hệ Thống Fashion (`/bai58-fashion-admin`)
- Bảng danh sách bài viết thời trang có **Cột IdF** và **Slug SEO**.
- Bộ soạn thảo trực quan **WYSIWYG Editor** đầy đủ công cụ: định dạng phông chữ, in đậm/nghiêng/gạch chân, cỡ chữ, màu sắc, chèn liên kết, tải ảnh Base64, tạo bảng, chế độ xem trước trực tiếp và sửa mã nguồn HTML.
- Modal xem chi tiết bài viết và Modal xác nhận xóa bài viết.

### 3. Cột IdF & Hệ Thống Tự Động Phân Tích Slug SEO (`/fashion-slug-list`)
- **Cột IdF duy nhất**: Mỗi sản phẩm được cấp phát một mã số nguyên dương duy nhất (`#1`, `#2`, `#3`...), tự động tăng dần khi tạo mới để không bao giờ bị trùng lặp.
- **Quy tắc sinh Slug**: `toSlug(tiêu đề) + "-" + IdF`.
- **Tự động phân tích Slug**: Hệ thống giải mã bóc tách `IdF` và `baseSlug` từ đường dẫn URL để truy vấn và hiển thị chính xác Fashion Detail mong muốn.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY

### 1. Khởi động Backend Server
```bash
cd server-fashion
npm install
npm start
```
*API Server chạy tại cổng `http://localhost:4000/fashions`*

### 2. Khởi động Frontend Angular Client
```bash
cd LearnAgolar/my-app
npm install
npm start
```
*Ứng dụng chạy tại cổng `http://localhost:4200/`*
