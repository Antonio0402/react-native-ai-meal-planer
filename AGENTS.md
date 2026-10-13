This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Project structure

- `src/app/` contains Expo Router routes and layouts only. `(app)/(tabs)/` owns the four tabs; `welcome` and `scan` are stack routes.
- `src/providers/` owns the Supabase session and per-user app data shared by routes.
- `src/screens/` keeps reusable screen content outside the route tree.

## FastAPI và mock

- `src/services/api.ts` là API bất đồng bộ; mock chỉ bật khi `EXPO_PUBLIC_IS_MOCKING=true`. Không fallback sang mock khi HTTP lỗi.
- `src/services/http.ts` kiểm tra origin tin cậy, gửi phiên Supabase, timeout và xử lý lỗi; `api-schema.ts` kiểm tra JSON từ backend.
- `src/services/mock-api.ts` chứa dữ liệu mẫu; `meal-utils.ts` chứa helper thuần; `src/hooks/useApiQuery.ts` hủy request cũ và hỗ trợ retry.
- `src/state.ts` đọc/lưu tài khoản qua FastAPI, tuần tự hóa PUT và giữ bản nháp AsyncStorage theo tài khoản khi lỗi.
- Hợp đồng request/response và revision/idempotency nằm trong `FASTAPI_CONTRACT.md`; mẫu cấu hình ở `.env.example`.
- FastAPI ở `../fast-api` dùng `/api/v1`, lưu snapshot và công thức AI theo tài khoản trong migration `002_app_data.sql`; không seed công thức mẫu khi mock tắt.
- `npm run test:api` chạy kiểm thử cô lập trong `tests/api.test.cjs`, không gửi token/ảnh thật. Chạy cùng lint và typecheck sau khi đổi hợp đồng API.
- Scan chuyển HEIC/HEIF sang JPEG trước upload: `expo-image-manipulator` trên native, `heic2any` trên web; chỉ nạp converter khi cần. Backend giữ giới hạn 20 nguyên liệu, lỗi `AI_TIMEOUT`, `AI_RATE_LIMITED`, `AI_OUTPUT_INVALID`; UI không mở xác nhận khi kết quả rỗng và chỉ nhận số lượng hữu hạn không âm.

## Sinh schema

- `tools/schema-codegen/` là package Node riêng, khóa openapi-typescript/TypeScript 5 và Supabase CLI; không đổi TypeScript 6 của Expo app. Cài bằng `npm run setup:schemas`.
- `npm run generate:api` xác minh project/tenant, đọc metadata PostgreSQL, sinh database types, kiểm tra drift rồi xuất OpenAPI và sinh `src/services/generated/api.types.ts`.
- `npm run login:supabase` xác thực CLI trên máy; không dùng publishable/service-role key thay Personal Access Token. Token không thuộc repo hoặc `EXPO_PUBLIC_*`.
- `npm run check:database` chỉ kiểm tra so với baseline đã lưu; không ghi artifact. `generate:database` cập nhật baseline và cần review diff.
- `npm run generate:api:offline` chỉ sinh hợp đồng API, không xác nhận database live. Chạy `npm run test:schemas`, lint và typecheck sau đổi công cụ.
- Database types, metadata snapshot và API types là artifact riêng: JSONB vẫn cần Pydantic. Không sửa artifact thủ công, không tự chạy migration khi codegen.
