import { supabase } from "./supabase";
import type { paths } from "./generated/api.types";

// Expo chỉ đưa biến EXPO_PUBLIC_* vào bundle; không đặt bí mật trong các biến này.
export const IS_MOCKING = process.env.EXPO_PUBLIC_IS_MOCKING === "true";
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/+$/, "");

/** Chỉ cấu hình lúc build được chọn đích nhận token; HTTP giới hạn mạng nội bộ khi dev. */
function apiOrigin(): URL {
  let base: URL;
  try {
    base = new URL(API_URL);
  } catch {
    throw new ApiError("EXPO_PUBLIC_API_URL không hợp lệ.");
  }
  const octets = base.hostname.split(".").map(Number);
  const privateIp = /^\d+\.\d+\.\d+\.\d+$/.test(base.hostname) &&
    octets.every((part) => part >= 0 && part <= 255) &&
    (octets[0] === 127 || octets[0] === 10 ||
      (octets[0] === 192 && octets[1] === 168) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31));
  const local = privateIp || base.hostname === "localhost" || base.hostname === "[::1]";
  const devHttp = typeof __DEV__ !== "undefined" && __DEV__ &&
    base.protocol === "http:" && local;
  if ((base.protocol !== "https:" && !devHttp) || base.username || base.password ||
      base.pathname !== "/" || base.search || base.hash)
    throw new ApiError("Địa chỉ FastAPI phải là HTTPS; khi phát triển có thể dùng HTTP với IP LAN hoặc localhost.");
  return base;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Backend phải xác minh token Supabase và lấy tài khoản từ token, không từ body. */
export async function request<T>(
  path: keyof paths,
  validate: (value: unknown) => value is T,
  options: RequestInit = {},
): Promise<T> {
  const base = apiOrigin();
  const url = new URL(path, base);
  if (url.origin !== base.origin || url.username || url.password)
    throw new ApiError("Yêu cầu không thuộc địa chỉ FastAPI đã cấu hình.");
  if (!supabase) throw new ApiError("Chưa cấu hình Supabase.");
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session)
    throw new ApiError("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.", 401);
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 60000);
  try {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${data.session.access_token}`);
    if (typeof options.body === "string")
      headers.set("Content-Type", "application/json");
    // FormData tự thiết lập Content-Type kèm boundary. Không theo redirect tới đích khác.
    const response = await fetch(url.toString(), {
      ...options,
      headers,
      signal: controller.signal,
      redirect: "error",
    });
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new ApiError(
        "Máy chủ trả về dữ liệu không hợp lệ.",
        response.status,
      );
    }
    if (!response.ok) {
      const detail =
        body && typeof body === "object" && "detail" in body
          ? body.detail
          : undefined;
      const code =
        detail &&
        typeof detail === "object" &&
        "code" in detail &&
        typeof detail.code === "string"
          ? detail.code
          : undefined;
      const message =
        response.status === 401
          ? "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại."
          : response.status === 409 || response.status === 412
            ? "Dữ liệu đã đổi trên thiết bị khác. Chưa ghi đè thay đổi của bạn."
            : response.status === 413
              ? "Ảnh quá lớn. Hãy chọn ảnh nhỏ hơn."
              : response.status === 422
                ? "Dữ liệu gửi lên chưa hợp lệ."
                : "Không thể xử lý yêu cầu. Vui lòng thử lại.";
      throw new ApiError(message, response.status, code);
    }
    if (!validate(body))
      throw new ApiError(
        "Dữ liệu trả về không đúng hợp đồng API.",
        response.status,
      );
    return body;
  } catch (error) {
    if (timedOut)
      throw new ApiError(
        "Yêu cầu quá lâu. Vui lòng thử lại.",
        undefined,
        "timeout",
      );
    if (controller.signal.aborted || error instanceof ApiError) throw error;
    throw new ApiError("Không kết nối được máy chủ. Kiểm tra mạng và thử lại.");
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}
