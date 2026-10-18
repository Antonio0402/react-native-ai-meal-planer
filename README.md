# FreshPlan Mobile & Web Frontend

Ứng dụng gợi ý món ăn, lập thực đơn tuần và tạo danh sách đi chợ thông minh từ nguyên liệu trong bếp.
Luồng chính: **Chụp / chọn ảnh nguyên liệu → AI nhận diện → Xác nhận kho & dị ứng → Gợi ý công thức → Lập thực đơn 21 bữa/tuần → Danh sách đi chợ tự động**.

- **Công nghệ**: Expo SDK 57, React Native 0.86, Expo Router, TypeScript, Supabase Auth.
- **Nền tảng**: Android, iOS (Expo Go / Dev Build) và Web.
- **Chế độ hoạt động**:
  - **Live Mode** (`EXPO_PUBLIC_IS_MOCKING=false`): Kết nối trực tiếp với FastAPI backend (`../fast-api`), xác thực qua Supabase JWT, nhận diện ảnh và sinh công thức bằng Google Gemini AI, đồng bộ dữ liệu kho/thực đơn vào PostgreSQL kèm cơ chế dự phòng nháp cục bộ (AsyncStorage).
  - **Mock Mode** (`EXPO_PUBLIC_IS_MOCKING=true`): Chạy độc lập hoàn toàn với dữ liệu và thuật toán mẫu tại `src/services/mock-api.ts`.

## Tài khoản đăng nhập chế độ Mock (`EXPO_PUBLIC_IS_MOCKING=true`)

| Email | Mật khẩu |
|---|---|
| `admin@freshplan.local` | `admin123` |

*(Ở chế độ Live, đăng ký hoặc đăng nhập bằng tài khoản Supabase Auth thực tế).*

## Cấu trúc thư mục

```text
fresh-plan/
├─ src/
│  ├─ app/              Expo Router routes & layouts ((app)/(tabs), login, scan)
│  ├─ components/       UI components dùng chung (Button, Card, AllergyEditor, ...)
│  ├─ hooks/            Custom hooks (useApiQuery với quản lý AbortController)
│  ├─ providers/        AuthProvider (Supabase session) & AppDataProvider
│  ├─ screens/          Giao diện các màn hình chính (Inventory, Recipes, Week, Shopping, ScanFlow)
│  ├─ services/         Giao tiếp HTTP, kiểm tra schema runtime, đồng bộ OpenAPI types
│  ├─ state.ts          Quản lý trạng thái kho, thực đơn, hàng đợi đồng bộ PUT tuần tự
│  ├─ theme.ts          Bảng màu, khoảng cách và cấu hình font Lora / Inter
│  └─ types.ts          Type aliases nối trực tiếp với OpenAPI schema từ backend
├─ assets/              Icon, splash screen
├─ scripts/             Script sinh mã OpenAPI & kiểm tra hợp đồng dữ liệu
├─ tests/               Bộ kiểm thử tích hợp API & state (node:test)
├─ FASTAPI_CONTRACT.md  Tài liệu chi tiết hợp đồng giao tiếp với FastAPI backend
├─ SCHEMA_CODEGEN.md    Hướng dẫn đồng bộ kiểu dữ liệu từ backend sang frontend
└─ package.json
```

## Thiết lập môi trường

1. Cài đặt thư viện:
   ```bash
   npm install
   ```
2. Sao chép `.env.example` sang `.env.local` và điền thông tin:
   ```dotenv
   EXPO_PUBLIC_IS_MOCKING=false
   EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
   EXPO_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-or-publishable-key>
   ```
   - Khi chạy với thiết bị thật qua Expo Go trên cùng mạng Wi-Fi, app tự động suy luận địa chỉ IP LAN của máy phát triển nếu `EXPO_PUBLIC_API_URL` đặt là `http://127.0.0.1:8000`.
   - Với máy ảo Android Emulator, hệ thống tự động ánh xạ sang `http://10.0.2.2:8000`.

## Chạy ứng dụng (Development)

```bash
# Khởi chạy Metro Bundler (quét QR bằng Expo Go trên điện thoại)
npx expo start

# Chạy trực tiếp trên trình duyệt Web
npx expo start --web

# Chạy trên máy ảo / thiết bị Android
npx expo run:android
```

## Kiểm tra mã nguồn & Kiểm thử

```bash
# Kiểm tra kiểu TypeScript
npx tsc --noEmit

# Kiểm tra ESLint
npx expo lint

# Chạy bộ kiểm thử hợp đồng API & đồng bộ trạng thái (32 test cases)
npm run test:api
```

## Build APK Release (Android)

1. Sinh thư mục native `android/`:
   ```bash
   npx expo prebuild --platform android
   ```
2. Đảm bảo đã cấu hình `ANDROID_HOME` hoặc `android/local.properties` trỏ tới Android SDK.
3. Thực hiện build:
   ```bash
   cd android
   ./gradlew assembleRelease --no-daemon
   ```
   File APK kết quả nằm tại `android/app/build/outputs/apk/release/app-release.apk`.
