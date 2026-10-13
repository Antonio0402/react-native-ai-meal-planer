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
4. So sánh metadata với `../fast-api/database.schema.json`. Thiếu baseline hoặc có drift thì dừng, không ghi baseline và không sinh lại type để che mất thay đổi.
5. `scripts.schema_contract api` xuất OpenAPI qua stdout từ route/model Pydantic, openapi-typescript sinh duy nhất `src/services/generated/api.types.ts`. Không giữ bản JSON OpenAPI trung gian hoặc sinh database types không có nơi dùng.

`src/types.ts` chỉ alias các model từ file được sinh. `api.ts` lấy request/response theo path/method và header của PUT từ cùng hợp đồng. `http.ts` chỉ nhận path có trong OpenAPI. Validator runtime ở `api-schema.ts` giữ kiểm tra JSON, finite numbers, unique IDs, slot keys và ngày hợp lệ; type TypeScript không thay thế các kiểm tra này.
Quy ước client vẫn là field tùy chọn vắng mặt, không phải null; ClientValue chỉ thu hẹp type theo validator đang dùng, không âm thầm chuyển đổi response.

Supabase không sinh kiểu API mobile: app chỉ dùng Supabase Auth và gọi FastAPI.
CLI được giữ để xác minh quyền vào đúng project; PostgreSQL catalog được dùng cho drift. Các field JSONB và response route thuộc Pydantic, không suy ra từ table types.

Package codegen riêng dùng TypeScript 5 do peer dependency của openapi-typescript;
app Expo vẫn dùng TypeScript 6. File lock của cả hai package phải được giữ trong Git.
Codegen dùng `.schema-codegen.lock` để chặn hai lần ghi artifact đồng thời; nếu
tiến trình bị dừng đột ngột, chỉ xóa khóa sau khi xác minh không còn codegen chạy.

## Drift và baseline

```powershell
npm run verify:supabase      # chỉ cấu hình, chưa xác nhận database live
npm run check:database       # đọc live, fail nếu khác/thiếu artifact; không ghi file
npm run snapshot:database    # chấp nhận baseline mới có chủ đích; cần review diff
npm run generate:api:offline # chỉ hợp đồng FastAPI; không xác nhận database live
npm run test:schemas
```

Baseline lần đầu phản ánh schema remote hiện tại. `check:database` phát hiện thay đổi
tables/columns/defaults/constraints/indexes/RLS/policies/table grants nhìn thấy bởi
DB role và hash file migration. Nó không chứng minh mọi migration
đã chạy, không kiểm tra dữ liệu JSONB hoặc toàn bộ function/trigger/enum/schema khác.
Guard của các bảng mobile chỉ xác nhận hợp đồng tối thiểu đã mô tả ở bước 3.

Sau thay đổi database có chủ đích, review drift, cập nhật migration/Pydantic/logic
nếu cần, chạy `snapshot:database`, review diff baseline rồi chạy `generate:api`.
Không có watcher tự áp dụng DB
hoặc commit. Không chạy migration trên Supabase để kiểm tra codegen.

FastAPI hiện đọc `.env` khi chạy thông thường; nếu dùng `.env.local`, phải khởi động
backend với `uvicorn --env-file .env.local ...` để runtime dùng cùng cấu hình codegen.
