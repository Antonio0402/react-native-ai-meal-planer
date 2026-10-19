# FreshPlan

Ứng dụng gợi ý món ăn và lập danh sách đi chợ từ nguyên liệu trong bếp.
Luồng chính: chụp / chọn ảnh nguyên liệu → nhận diện → xác nhận → gợi ý công thức → lập thực đơn tuần → danh sách đi chợ.

- Công nghệ: Expo SDK 57, React Native 0.86, TypeScript. Chạy trên web và Android.
- Phiên bản: v2.1 (package `com.freshplan.app`).
- **Lưu ý:** đây là bản demo frontend. Nhận diện nguyên liệu đang là **mock** (luôn trả Cà chua 300g, Trứng 4 quả, Sữa 500ml), chưa có backend. Dữ liệu lưu cục bộ bằng AsyncStorage.

## Đăng nhập demo

| Email | Mật khẩu |
|---|---|
| `admin@freshplan.local` | `admin123` |

## Cấu trúc thư mục

```
Source_code/
├─ src/                 Mã nguồn (screens, services, theme, ...)
├─ assets/              Icon, splash
├─ App.tsx, index.ts    Điểm vào của app
├─ app.json             Cấu hình Expo
└─ package.json
```

Thư mục `android/` và file APK **không** nằm trong repo. `android/` được sinh ra bằng `npx expo prebuild` (xem phần build bên dưới).

## Yêu cầu để build

- Node.js 20 trở lên và npm
- JDK 17
- Android SDK (platform + build-tools + NDK, Android Studio cài sẵn là đủ)

## Chạy bản web (dev)

```
npm install
npx expo start --web
```

## Build APK release (Android)

1. Cài thư viện và sinh dự án Android native:
   ```
   npm install
   npx expo prebuild --platform android
   ```
2. Tạo file `android/local.properties` trỏ tới Android SDK:
   ```
   sdk.dir=C:/androidsdk
   ```
   (Đường dẫn dùng dấu `/`.)
3. Build (PowerShell):
   ```
   cd android
   $env:ANDROID_HOME="C:\androidsdk"
   .\gradlew.bat assembleRelease --no-daemon
   ```
4. APK nằm ở `android\app\build\outputs\apk\release\app-release.apk`.

> **Lỗi linker C++ khi build:** xảy ra nếu đường dẫn Android SDK có dấu cách (ví dụ `C:\Users\Thinkpad T14\AppData\...`).
> Cách sửa: tạo junction không có dấu cách rồi dùng nó cho `sdk.dir` và `ANDROID_HOME`:
> ```
> New-Item -ItemType Junction -Path C:\androidsdk -Target "<đường dẫn SDK thật>"
> ```

APK release ký bằng debug keystore mặc định, chỉ dùng để thử nghiệm.

## Chạy trên giả lập / thiết bị qua Expo

```
npx expo run:android
```
(cần thiết bị hoặc giả lập đang kết nối, kiểm tra bằng `adb devices`).

## Kiểm tra mã

```
npx tsc --noEmit
npx expo lint
```

## Nối backend thật (chưa làm)

Trong `src/services/api.ts` đổi `USE_MOCK=false` và đặt `API_URL`. Backend cần có job polling `GET /v1/jobs/{id}`.

## Việc còn lại

- Sửa so khớp tên nguyên liệu không phân biệt dấu ("Ca chua" ≠ "Cà chua").
- Backend FastAPI + model nhận diện thật, Supabase Auth, lưu dữ liệu vào DB.
- Keystore release riêng nếu muốn phát hành (hiện dùng debug keystore).

Chi tiết tiến độ xem `TRACKING.md` ở thư mục `Project/` (bên ngoài `Source_code/`).
