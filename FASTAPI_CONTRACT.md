# Hợp đồng FastAPI của FreshPlan

Chưa có backend trong repository. Tài liệu này là hợp đồng mà FastAPI cần triển khai để app chạy khi `EXPO_PUBLIC_IS_MOCKING` không bằng `true`.

## Cấu hình app

```dotenv
EXPO_PUBLIC_IS_MOCKING=false
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

`IS_MOCKING` được xuất từ `src/services/api.ts`. Chỉ chuỗi `true` bật mock; thiếu biến, `false`, `1` hoặc `TRUE` đều dùng FastAPI. Sau khi đổi `.env.local`, reload app. Cờ và URL là dữ liệu công khai, không đặt API key AI vào biến `EXPO_PUBLIC_*`.

`src/services/http.ts` chỉ cho phép origin dev đã chọn: `http://127.0.0.1:8000`. Khi có backend triển khai, cập nhật `TRUSTED_API_ORIGIN` và URL tới đúng server tin cậy. Không dùng `127.0.0.1` cho điện thoại thật: địa chỉ đó trỏ tới chính điện thoại. Backend production cần HTTPS.

Chế độ mock dùng dữ liệu/thuật toán trong `src/services/mock-api.ts` và AsyncStorage theo tài khoản. Không tự chuyển sang mock khi lỗi mạng. Helper ngày/tuần, đơn vị, định dạng và nhãn UI trong `meal-utils.ts` không cần HTTP.

## Xác thực và cách trả JSON

Mọi endpoint yêu cầu `Authorization: Bearer <Supabase access token>`. Backend xác minh chữ ký, issuer, audience và thời hạn JWT theo dự án Supabase; lấy user ID từ claim `sub`. Không nhận user ID từ client để quyết định quyền truy cập dữ liệu. Các PUT phải giao dịch nguyên tử và chỉ thao tác dữ liệu của tài khoản đó.

JSON dùng camelCase theo `src/types.ts`; các field tùy chọn phải được bỏ khi không có giá trị, không trả `null` (FastAPI: `response_model_exclude_none=True`). Client kiểm tra response qua `src/services/api-schema.ts`. Các endpoint tính toán dưới đây chưa lưu dữ liệu cho tới khi app gửi PUT `/me/data`.

| Method | Path | Request | Response thành công |
| --- | --- | --- | --- |
| GET | `/recipes` | Query `allergies` lặp lại, tùy chọn | `Recipe[]` |
| POST | `/ingredients/detect` | Multipart, field `file` chứa tệp ảnh | `Ingredient[]` |
| POST | `/recipes/match` | `{ inventory: Ingredient[], portions: number, allergies: string[] }` | `RecipeMatch[]` |
| POST | `/plans/generate` | `{ allergies: string[], portions: number, weekStart?: string }` | `Slots` đủ 21 bữa |
| POST | `/shopping/build` | `{ plan: SavedPlan, inventory: Ingredient[] }` | `ShoppingItem[]` |
| GET | `/me/data` | Không body | `{ data: AppData, revision: number }` |
| PUT | `/me/data` | Body `AppData`; header `If-Match` và `Idempotency-Key` | `{ data: AppData, revision: number }` |

Response là array/object trực tiếp, không thêm wrapper `items` hay `success`. Tất cả response thành công có body JSON; không trả 204.

- `Ingredient`: `{ id, name, unit, quantity?, expiry? }`. `quantity` chưa rõ thì bỏ field; không tự đoán lượng từ ảnh. `expiry` theo `DD/MM/YYYY` nếu có. ID phải duy nhất trong kho.
- `Recipe`: `{ id, title, minutes, servings, items: RecipeItem[], steps: string[] }`. `RecipeItem`: `{ name, quantity, unit }`; lượng dương, đơn vị không rỗng.
- `RecipeMatch`: `{ recipe, servings, items, missing, coverage }`. `missing` là `RecipeItem[]` kèm `check?: boolean`; `coverage` trong `[0,1]`. Sắp xếp coverage giảm dần. Chỉ dùng kho đã xác nhận, loại món không an toàn theo dị ứng; thành phần không rõ không được coi là an toàn.
- `Slots`: object có key `dayIndex-mealIndex`, ngày `0..6`, bữa `0..2`; value là ID công thức hợp lệ. Lập tuần trả đủ 21 key, không tham chiếu món mẫu ngoài catalog.
- `SavedPlan`: `{ weekStart, slots, portions, version }`, `weekStart` theo `YYYY-MM-DD`, `version` nguyên dương. Khẩu phần trong `1..12`.
- `ShoppingItem`: `{ key, name, unit, toBuy, group, check }`; `check` luôn là boolean. Tính `max(0, tổng cần − tồn đã xác nhận)`, chỉ đổi đơn vị cùng chiều (`kg/g`, `l/ml`), không đổi đồ đếm sang khối lượng. Lượng tồn chưa rõ/khác chiều phải gắn `check`.
- `AppData`: `{ inventory, portions, allergies, weekStart, slots, savedPlan?, checked }`. `checked` là object key → boolean. Lưu/xóa kho, đổi hồ sơ, sửa thực đơn, lưu kế hoạch và đánh dấu đi chợ đều đi qua PUT này.

Ví dụ GET của tài khoản mới (ngày chỉ là ví dụ; backend dùng tuần hiện tại):

```json
{
  "data": {
    "inventory": [], "portions": 2, "allergies": [],
    "weekStart": "2026-10-05", "slots": {}, "checked": {}
  },
  "revision": 0
}
```

## Ghi đồng thời và thử lại

GET luôn trả trạng thái hợp lệ, kể cả tài khoản mới; không dùng 404 để biểu thị chưa có kho.

PUT gửi `If-Match: "<revision>"` (bao gồm dấu ngoặc kép) và `Idempotency-Key: <UUID>`. Backend kiểm tra khóa idempotency theo tài khoản **trước** kiểm tra revision: cùng khóa/cùng payload trả lại response đã lưu; cùng khóa/khác payload trả 409. Khóa, cập nhật dữ liệu và response phải được commit cùng một giao dịch. Giữ khóa ít nhất trong thời gian bản nháp có thể được thử lại; không tái sử dụng khóa hết hạn để âm thầm ghi lần nữa.

Với khóa mới, revision sai trả 412 và không sửa dữ liệu. Nếu đúng, thay snapshot, tăng revision nguyên không âm, trả lại đúng snapshot đã lưu và revision mới. Client gửi PUT tuần tự và dùng lại payload/key khi timeout; thay đổi mới trong lúc lưu được giữ làm bản nháp kế tiếp.

App giữ bản nháp theo tài khoản trên máy, báo lỗi khi chưa đồng bộ và chặn đăng xuất trong lúc lưu/lỗi đồng bộ. Khôi phục bản nháp sau khởi động lại. Xung đột không tự ghi đè server; người dùng có thể xác nhận bỏ bản nháp để tải lại trạng thái server. Dữ liệu mock cũ không được tự nhập vào backend thật.

## Lỗi, ảnh và CORS

Lỗi dùng status phù hợp (401, 403, 409/412, 413, 422, 5xx), body:

```json
{ "detail": { "code": "blurry", "message": "Ảnh chưa đủ rõ." } }
```

`code` là `blurry`, `timeout` hoặc mã lỗi riêng. Client chỉ hiển thị thông báo an toàn đã định nghĩa, không hiển thị trace/backend secret. Request HTTP timeout sau 60 giây. Không tự retry POST/PUT ngoài thao tác thử lại rõ ràng của người dùng.

Backend phải giới hạn kích thước ảnh, kiểm tra nội dung/MIME thực, chỉ nhận định dạng hỗ trợ và không xem URI cục bộ như URL tải ảnh. App gửi `File/Blob` trên web, tệp URI multipart trên native. Không lưu/phân tích ảnh bằng API key ở client.

CORS phải cho phép origin web dev thực tế, methods GET/POST/PUT và headers `Authorization`, `Content-Type`, `If-Match`, `Idempotency-Key`. Không redirect các endpoint; client yêu cầu `redirect: error`.

## Kiểm tra

`npm run test:api` kiểm tra mock gating, hợp đồng request/response, upload ảnh, lỗi và đồng bộ bằng fetch/storage giả lập, không gửi dữ liệu thật. Chạy thêm `npm run lint` và `node node_modules/typescript/bin/tsc --noEmit`. Cần triển khai FastAPI theo hợp đồng này và kiểm tra thiết bị thật trước khi xác nhận tích hợp live.