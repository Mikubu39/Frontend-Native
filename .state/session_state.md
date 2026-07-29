# Session State – React Native

## Mission
Ship a fast, stable, accessible React Native application aligned with the roadmap.

## Session Goal
Đồng bộ hóa Frontend với Backend về hệ thống Năng lượng (Energy) và Tim (Hearts) cho bài kiểm tra (Jump Test).

## Plan
- [x] Tạo `GamificationContext` để lưu trữ Năng lượng (Energy) và Hearts tạm thời cho FE.
- [x] Cập nhật màn hình `(tabs)/index.tsx` để hiển thị động các thông số Gamification thay vì hardcode.
- [x] Tích hợp logic trừ Năng lượng khi vào bài học trong `quiz/[id].tsx`.
- [x] Tích hợp logic trừ Tim (Hearts) cho `JUMP_TEST` và nộp bài thất bại khi hết Tim vào `quiz/[id].tsx`.
- [x] Hiển thị UI Tim (Hearts) trên `quiz-header.tsx`.
- [x] Xử lý trạng thái `IN_PROGRESS` (thất bại) ở `quiz/result.tsx`.

## Progress
- Done: Đã tạo Context và tích hợp hoàn chỉnh hệ thống Năng lượng/Tim vào luồng học (Quiz flow) trên Frontend. Đã khắc phục lỗi cú pháp (`SyntaxError`) ở `signup.tsx`, `login.tsx`, và `quiz-result-card.tsx`. Các tính năng kiểm tra lỗi TypeScript (`tsc --noEmit`) đều pass 100%.
- In progress: N/A
- Blocked: N/A

## Next Steps
- Xác minh dữ liệu và luồng mở khoá bài học tiếp theo trên thiết bị thật / máy ảo.
- Đợi Backend hỗ trợ endpoint `/api/v1/users/me` nếu cần đồng bộ gốc các thông số trên.

## Blockers
- N/A

## Decisions
- Lưu tạm Gamification Stats thông qua React Context trên Frontend cho tới khi Backend cung cấp endpoint khởi tạo.
- Phạm vi Frontend-Native hoàn toàn tập trung vào Học viên (End-User), sử dụng JWT token cho các request.
