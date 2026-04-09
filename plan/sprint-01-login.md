# Sprint 01 Plan: Login MVP

## 1. Mục tiêu sprint

Hoàn thiện chức năng đăng nhập cho `admin-portal` ở mức MVP có thể dùng được nội bộ, bám theo kiến trúc hiện tại:

- Frontend: React + Vite tại `code/frontend/admin-portal`
- Backend chính: NestJS tại `code/backend`
- Cơ chế auth: JWT lưu trong `HttpOnly cookie`
- Mô hình phân quyền: `role-based access control (RBAC)` với `user -> roles -> permissions`

Kết quả mong muốn sau Sprint 1:

- Người dùng đăng nhập bằng email/password thành công từ UI.
- Phiên đăng nhập được duy trì bằng cookie từ backend.
- Các route nội bộ của admin portal được chặn nếu chưa xác thực.
- Hồ sơ người dùng sau đăng nhập phải bao gồm `roles` và `permissions` để làm nền cho kiểm soát truy cập theo role.
- Người dùng đã đăng nhập không bị quay lại màn login một cách thủ công.
- Có logout cơ bản và bộ test tối thiểu cho luồng auth.

## 2. Hiện trạng

Những phần đã có sẵn:

- Backend đã có `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
- Backend đã seed tài khoản admin mặc định qua biến môi trường.
- Backend đã có hạt nhân RBAC với role mặc định như `super_admin`, `viewer` và permission catalog.
- Frontend đã có màn `sign-in` và đã gọi API login.
- Axios frontend đã bật `withCredentials: true`.

Những khoảng trống còn lại:

- Chưa có auth state rõ ràng ở frontend.
- Chưa có route guard cho khu vực `/_main`.
- Chưa có redirect ngược khi user đã đăng nhập mà mở `/auth/sign-in`.
- Chưa có bootstrap phiên bằng `GET /auth/me` khi reload trang.
- Chưa có logout flow gắn vào UI chính.
- Chưa thấy test tích hợp đầy đủ cho login journey.

## 3. Phạm vi Sprint 1

In scope:

- Hoàn thiện login bằng email/password.
- Đồng bộ session frontend dựa trên cookie backend.
- Đồng bộ profile hiện tại kèm `roles` và `permissions` từ backend.
- Bảo vệ route cho admin portal.
- Thêm logout cơ bản.
- Hiển thị lỗi đăng nhập rõ ràng.
- Viết test tối thiểu cho backend và frontend auth flow.
- Cập nhật tài liệu chạy local cho login.

Out of scope:

- Refresh token.
- Forgot password / reset password.
- MFA / 2FA.
- Social login / SSO.
- Quản lý phiên đa thiết bị.
- Phân quyền chi tiết đến từng nút, action hoặc component trong UI.

## 4. User story ưu tiên

### P0

1. Là admin, tôi muốn đăng nhập bằng email và mật khẩu để vào admin portal.
2. Là người dùng chưa đăng nhập, tôi không thể truy cập các route nội bộ như `/`, `/users`, `/roles`, `/permissions`.
3. Là người dùng đã đăng nhập, khi reload trang hệ thống vẫn nhận ra phiên hiện tại.
4. Là người dùng đã đăng nhập, tôi có thể logout để xoá phiên hiện tại.
5. Là hệ thống admin, tôi cần lấy được `roles` và `permissions` của user ngay sau khi login để phục vụ mô hình role-based.

### P1

1. Là người dùng đã đăng nhập, khi mở lại `/auth/sign-in` tôi sẽ được chuyển về khu vực chính.
2. Là người dùng nhập sai thông tin, tôi thấy lỗi rõ ràng và không bị treo form.

## 5. Deliverable cuối sprint

- Login flow hoạt động end-to-end từ UI đến backend.
- Route guard cho toàn bộ khu vực `/_main`.
- Session bootstrap bằng API `auth/me`.
- Auth session thống nhất có chứa `user profile`, `roles`, `permissions`.
- Nút logout ở layout chính.
- Test backend cho login success/failure và `auth/me`.
- Test frontend hoặc checklist test tay có thể lặp lại.
- Tài liệu ngắn mô tả cách chạy và tài khoản mặc định.

## 6. Kế hoạch implementation

### 6.1 Backend

- Rà soát contract response của `login`, `logout`, `me` để frontend dùng ổn định.
- Chốt rõ contract trả về `user.id`, `email`, `roles`, `permissions`.
- Xác nhận cookie config local hoạt động đúng với `FRONTEND_ORIGIN`, `AUTH_COOKIE_*`.
- Đảm bảo lỗi sai email/mật khẩu trả về thông điệp nhất quán.
- Bổ sung hoặc hoàn thiện test cho:
  - login thành công
  - login thất bại
  - `me` khi đã xác thực
  - `me` khi chưa xác thực
  - logout xoá cookie thành công

### 6.2 Frontend

- Tạo lớp quản lý session hiện tại:
  - gọi `GET /auth/me`
  - lưu trạng thái `loading`, `authenticated`, `unauthenticated`
  - cung cấp profile hiện tại cho app, bao gồm `roles` và `permissions`
- Bảo vệ route `/_main`:
  - chưa đăng nhập thì chuyển sang `/auth/sign-in`
  - giữ hành vi nhất quán khi reload trực tiếp URL
- Bảo vệ route `/auth/sign-in`:
  - nếu đã đăng nhập thì chuyển về `/`
- Sau login thành công:
  - refresh session hiện tại
  - điều hướng về dashboard
- Chuẩn bị điểm mở rộng để các màn sau này có thể đọc `roles/permissions` cho role-based UI gating
- Thêm logout action trong `main-layout`
- Chuẩn hoá thông báo lỗi cho login

### 6.3 QA và tài liệu

- Viết checklist test tay cho local flow.
- Cập nhật hướng dẫn chạy:
  - backend
  - frontend
  - tài khoản admin mặc định
  - lưu ý `VITE_BASEURL` và `FRONTEND_ORIGIN`

## 7. Phân rã task đề xuất

| ID | Task | Owner gợi ý | Ưu tiên |
| --- | --- | --- | --- |
| L1 | Rà soát và chốt auth API contract | Backend | P0 |
| L2 | Bổ sung test backend cho login/logout/me | Backend | P0 |
| L3 | Tạo auth session service/query ở frontend có chứa roles/permissions | Frontend | P0 |
| L4 | Thêm route guard cho `/_main` | Frontend | P0 |
| L5 | Redirect khỏi `/auth/sign-in` khi đã login | Frontend | P1 |
| L6 | Hoàn thiện flow submit login và đồng bộ session | Frontend | P0 |
| L7 | Thêm logout UI ở `main-layout` | Frontend | P0 |
| L8 | Viết checklist test tay và cập nhật README | Fullstack | P1 |

## 8. Acceptance criteria

Sprint 1 được xem là hoàn thành khi:

1. Đăng nhập đúng tài khoản hợp lệ từ UI thành công và vào được dashboard.
2. Truy cập trực tiếp `/users`, `/roles`, `/permissions` khi chưa login sẽ bị chuyển về `/auth/sign-in`.
3. Reload trang sau khi login vẫn giữ được phiên bằng cookie.
4. Session hiện tại lấy được `roles` và `permissions` từ backend sau login hoặc sau khi reload.
5. Truy cập `/auth/sign-in` khi đã login sẽ được chuyển về `/`.
6. Logout xong, truy cập lại route nội bộ sẽ bị chặn.
7. Sai email hoặc mật khẩu sẽ hiển thị lỗi rõ ràng, không crash UI.
8. Backend có test tối thiểu cho login flow và bảo vệ endpoint `me`.

## 9. Rủi ro và phụ thuộc

### Phụ thuộc

- PostgreSQL local phải chạy để backend seed tài khoản admin.
- Frontend phải cấu hình đúng `VITE_BASEURL`.
- Backend phải cấu hình đúng `FRONTEND_ORIGIN` để cookie hoạt động qua CORS.

### Rủi ro

- Sai cấu hình cookie `SameSite` hoặc `Secure` có thể làm login tưởng thành công nhưng frontend không giữ phiên.
- Nếu frontend không có lớp bootstrap session rõ ràng, route guard sẽ nháy màn hoặc redirect sai.
- Nếu contract `roles/permissions` không ổn định, Sprint sau sẽ khó mở rộng sang menu gating và action-level authorization.
- Hiện chưa có refresh token, nên Sprint 1 chỉ nên chốt login session cơ bản.

## 10. Thứ tự thực hiện đề xuất

### Ngày 1

- Chốt auth contract backend.
- Kiểm tra login local bằng Swagger/Postman.

### Ngày 2

- Thêm frontend session bootstrap và `auth/me`.

### Ngày 3

- Thêm route guard cho `/_main` và redirect khỏi `/auth/sign-in`.

### Ngày 4

- Thêm logout UI và dọn lỗi/trạng thái loading.

### Ngày 5

- Viết test, chạy regression cơ bản, cập nhật tài liệu.

## 11. Gợi ý phạm vi commit

- Commit 1: auth backend contract + tests
- Commit 2: frontend session bootstrap + route guard
- Commit 3: logout + polish UI + docs

## 12. Định nghĩa hoàn thành

Một build local được xem là "done" cho Sprint 1 khi team có thể:

- chạy backend và frontend theo hướng dẫn,
- đăng nhập bằng tài khoản admin mặc định,
- nhận được profile hiện tại có `roles` và `permissions`,
- vào được khu vực chính,
- reload trang không mất phiên,
- logout và bị chặn khỏi route nội bộ sau đó.
