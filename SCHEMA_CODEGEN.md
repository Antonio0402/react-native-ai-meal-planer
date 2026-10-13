# Đồng bộ schema

Chạy tại `fresh-plan` (Node 24+, Python virtualenv ở `../fast-api/.venv`):

```powershell
npm run setup:schemas
npm run login:supabase
npm run generate:api
```

`generate:api` thực hiện tuần tự:

1. Đọc `.env`, `.env.local` của hai repo; biến môi trường tiến trình có ưu tiên cao nhất.
   Frontend URL, backend URL và tenant `DATABASE_URL` phải cùng project Supabase.
   Chỉ nhận URL chuẩn `https://<ref>.supabase.co`, DB direct hoặc pooler của project,
   database `postgres`. Nếu có `SUPABASE_PROJECT_ID`, nó cũng phải khớp.
   Hỗ trợ `${DATABASE_PASSWORD}` trong DSN, URL-encode mật khẩu trước khi chèn.
2. CLI xác nhận tài khoản có project đó. Dùng `supabase login` hoặc biến môi trường
   riêng `SUPABASE_ACCESS_TOKEN` cho CI; không dùng publishable/service-role key.
3. Đọc metadata `public` trong transaction PostgreSQL READ ONLY; kiểm tra các bảng
   snapshot/mutation/recipe mà mobile dùng có column, kiểu, NOT NULL và RLS cần thiết,
   không cấp quyền cho `anon`/`authenticated`/PUBLIC.
4. Supabase CLI sinh `src/services/generated/database.types.ts` từ `--project-id` và
   `../fast-api/app/schemas/database_types.py` từ chính `DATABASE_URL` đã xác minh.
   DSN chỉ truyền trong bộ nhớ tới CLI; không ghi credentials vào artifact/log.
5. Lưu metadata vào `../fast-api/database.schema.json`. Chạy lại kiểm tra live để
   đảm bảo database types và snapshot không đổi giữa các lần sinh.
6. Xuất OpenAPI từ source backend, sinh `src/services/generated/api.types.ts`.

Package codegen riêng dùng TypeScript 5 do peer dependency của openapi-typescript;
app Expo vẫn dùng TypeScript 6. File lock của cả hai package phải được giữ trong Git.
Codegen dùng `.schema-codegen.lock` để chặn hai lần ghi artifact đồng thời; nếu
tiến trình bị dừng đột ngột, chỉ xóa khóa sau khi xác minh không còn codegen chạy.

## Drift và baseline

```powershell
npm run verify:supabase      # chỉ cấu hình, chưa xác nhận database live
npm run check:database       # đọc live, fail nếu khác/thiếu artifact; không ghi file
npm run generate:database    # cập nhật database types/baseline; cần review diff
npm run generate:api:offline # chỉ hợp đồng FastAPI; không xác nhận database live
npm run test:schemas
```

Baseline lần đầu phản ánh schema remote hiện tại. `check:database` phát hiện thay đổi
tables/columns/defaults/constraints/indexes/RLS/policies/table grants nhìn thấy bởi
DB role, generated types và hash file migration. Nó không chứng minh mọi migration
đã chạy, không kiểm tra dữ liệu JSONB hoặc toàn bộ function/trigger/enum/schema khác.
Guard của các bảng mobile chỉ xác nhận hợp đồng tối thiểu đã mô tả ở bước 3.

Sau thay đổi database có chủ đích, review drift, cập nhật migration/Pydantic/logic
nếu cần rồi chạy lại generate và review artifact. Không có watcher tự áp dụng DB
hoặc commit. Không chạy migration trên Supabase để kiểm tra codegen.

Frontend runtime còn dùng type/validator hiện tại; chuyển sang API types ở bước 4.
FastAPI hiện đọc `.env` khi chạy thông thường; nếu dùng `.env.local`, phải khởi động
backend với `uvicorn --env-file .env.local ...` để runtime dùng cùng cấu hình codegen.
