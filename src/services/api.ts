import { Platform } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import type {
  ApiHeaders,
  ApiRequest,
  ApiResponse,
  AppData,
  Ingredient,
  SavedPlan,
} from "../types";
import { ApiError, IS_MOCKING, request } from "./http";
import * as schema from "./api-schema";
export { ApiError, IS_MOCKING } from "./http";
export {
  DAYS,
  MEALS,
  SLOT_COUNT,
  slotKey,
  MIN_PORTIONS,
  MAX_PORTIONS,
  toBase,
  fmtQty,
  weekStartISO,
  weekLabel,
} from "./meal-utils";

export class DetectError extends Error {
  constructor(
    public kind: "blurry" | "timeout" | "no_food" | "unknown",
    message: string,
  ) {
    super(message);
    this.name = "DetectError";
  }
}

/** Chỉ nạp dữ liệu mẫu khi cờ môi trường bật; lỗi mạng không được thay bằng mẫu. */
const mock = () => import("./mock-api");

/** Chỉ hiển thị thông báo đã biết, không đưa lỗi nội bộ của provider ra UI. */
function recipeError(error: unknown): never {
  if (error instanceof ApiError) {
    const messages: Record<string, string> = {
      AI_TIMEOUT: "Tạo công thức quá lâu. Vui lòng thử lại.",
      timeout: "Tải công thức quá lâu. Vui lòng thử lại.",
      AI_RATE_LIMITED: "Dịch vụ tạo công thức đang quá tải. Vui lòng thử lại sau.",
      AI_OUTPUT_INVALID: "AI trả về công thức không hợp lệ. Vui lòng thử lại.",
      AI_CONFIG_ERROR: "Dịch vụ tạo công thức chưa được cấu hình.",
      AI_PROVIDER_UNAVAILABLE: "Dịch vụ tạo công thức tạm thời không khả dụng.",
      NO_SAFE_INGREDIENTS: "Chưa có nguyên liệu phù hợp với dị ứng đã chọn. Hãy kiểm tra lại kho và thông tin dị ứng.",
      RECIPE_INVALID: "Công thức cũ không hợp lệ. Hãy chọn món mới trong tab Công thức.",
    };
    if (error.code && messages[error.code])
      throw new ApiError(messages[error.code], error.status, error.code);
  }
  throw error;
}

export async function getRecipes(
  allergies: string[] = [],
  signal?: AbortSignal,
  inventory: Ingredient[] = [],
): Promise<ApiResponse<"/api/v1/recipes/generated", "post">> {
  if (IS_MOCKING) return (await mock()).safeRecipes(allergies);
  const body = { inventory, allergies } satisfies ApiRequest<"/api/v1/recipes/generated", "post">;
  return request(
    "/api/v1/recipes/generated",
    schema.recipes,
    { method: "POST", body: JSON.stringify(body), signal },
  ).catch(recipeError);
}

/** Tải tên các món đã chọn, kể cả khi kho hiện tại tạo ra bộ công thức mới. */
export async function getSelectedRecipes(
  ids: string[],
  signal?: AbortSignal,
): Promise<ApiResponse<"/api/v1/recipes/by-ids", "post">> {
  if (ids.length === 0) return [];
  if (IS_MOCKING)
    return (await mock()).RECIPES.filter((recipe) => ids.includes(recipe.id));
  const body = { ids } satisfies ApiRequest<"/api/v1/recipes/by-ids", "post">;
  return request("/api/v1/recipes/by-ids", schema.recipes, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  }).catch(recipeError);
}

/** Gửi tệp ảnh thật bằng multipart, không gửi URI cục bộ cho backend. */
export async function detectIngredients(
  imageUri: string,
  image?: Pick<ImagePickerAsset, "file" | "fileName" | "mimeType">,
): Promise<ApiResponse<"/api/v1/scan-jobs/detect", "post">> {
  if (IS_MOCKING) {
    try {
      return await (await mock()).detectIngredients(imageUri);
    } catch (error) {
      const module = await mock();
      if (error instanceof module.DetectError)
        throw new DetectError(error.kind, error.message);
      throw error;
    }
  }
  try {
    const form = new FormData();
    let name =
      image?.fileName ||
      image?.file?.name ||
      imageUri.split("/").pop()?.split("?")[0] ||
      "photo.jpg";
    const extension = name.split(".").pop()?.toLowerCase();
    const needsJpeg = (mime?: string) =>
      /^image\/hei[cf](?:-sequence)?$/i.test(mime ?? "") ||
      extension === "heic" || extension === "heif";
    const jpegName = () => name.replace(/\.[^.]*$/, "") + ".jpg";
    if (Platform.OS === "web") {
      let file: Blob = image?.file ?? (await (await fetch(imageUri)).blob());
      if (needsJpeg(image?.mimeType) || needsJpeg(file.type)) {
        try {
          // Một số picker đã chuyển ảnh sang JPEG nhưng giữ tên HEIC gốc.
          if (file.type !== "image/jpeg") {
            const { default: heic2any } = await import("heic2any");
            const converted = await heic2any({
              blob: file,
              toType: "image/jpeg",
              quality: 0.8,
            });
            file = Array.isArray(converted) ? converted[0] : converted;
          }
          if (!file || file.type !== "image/jpeg") throw new Error();
          name = jpegName();
        } catch {
          throw new DetectError("unknown", "Không chuyển được ảnh HEIC/HEIF. Hãy chọn ảnh JPEG, PNG hoặc WebP.");
        }
      }
      form.append("file", file, name);
    } else {
      let uploadUri = imageUri;
      let mime =
        image?.mimeType ||
        (
          {
            png: "image/png",
            heic: "image/heic",
            heif: "image/heif",
            webp: "image/webp",
          } as Record<string, string>
        )[extension ?? ""] ||
        "image/jpeg";
      if (needsJpeg(mime)) {
        try {
          const { ImageManipulator, SaveFormat } = await import("expo-image-manipulator");
          const context = ImageManipulator.manipulate(imageUri);
          try {
            const rendered = await context.renderAsync();
            try {
              const converted = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
              uploadUri = converted.uri;
            } finally {
              rendered.release();
            }
          } finally {
            context.release();
          }
          name = jpegName();
          mime = "image/jpeg";
        } catch {
          throw new DetectError("unknown", "Không chuyển được ảnh HEIC/HEIF. Hãy chọn ảnh JPEG, PNG hoặc WebP.");
        }
      }
      // React Native FormData nhận tệp cục bộ qua URI; kiểu DOM chỉ khai báo Blob.
      form.append("file", {
        uri: uploadUri,
        name,
        type: mime,
      } as unknown as Blob);
    }
    return await request("/api/v1/scan-jobs/detect", schema.scanCandidates, {
      method: "POST",
      body: form,
    });
  } catch (error) {
    if (error instanceof DetectError) throw error;
    const code = error instanceof ApiError ? error.code : undefined;
    const kind =
      code === "blurry" || code === "IMAGE_BLURRY"
        ? "blurry"
        : code === "timeout" || code === "AI_TIMEOUT"
          ? "timeout"
          : "unknown";
    const messages: Record<string, string> = {
      AI_RATE_LIMITED: "Dịch vụ nhận diện đang quá tải. Vui lòng thử lại sau.",
      AI_OUTPUT_INVALID: "AI trả về kết quả không hợp lệ. Vui lòng thử lại.",
      AI_CONFIG_ERROR: "Dịch vụ nhận diện chưa được cấu hình.",
      AI_PROVIDER_UNAVAILABLE: "Dịch vụ nhận diện tạm thời không khả dụng.",
    };
    throw new DetectError(
      kind,
      kind === "blurry"
        ? "Ảnh bị mờ. Hãy chụp lại gần và đủ sáng hơn."
        : kind === "timeout"
          ? "Nhận diện ảnh quá lâu. Vui lòng thử lại."
          : (code && messages[code]) || (error instanceof Error ? error.message : "Phân tích thất bại."),
    );
  }
}

export async function matchRecipes(
  inventory: Ingredient[],
  portions: number,
  allergies: string[],
  signal?: AbortSignal,
): Promise<ApiResponse<"/api/v1/recipes/match", "post">> {
  if (IS_MOCKING)
    return (await mock()).matchRecipes(inventory, portions, allergies);
  const body = { inventory, portions, allergies } satisfies ApiRequest<"/api/v1/recipes/match", "post">;
  return request("/api/v1/recipes/match", schema.matches, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  }).catch(recipeError);
}

export async function generatePlan(
  allergies: string[],
  portions = 2,
  weekStart?: string,
  inventory: Ingredient[] = [],
): Promise<ApiResponse<"/api/v1/weekly-plans/generate-from-inventory", "post">> {
  if (IS_MOCKING) return (await mock()).generatePlan(allergies);
  const body = { allergies, portions, weekStart, inventory } satisfies ApiRequest<"/api/v1/weekly-plans/generate-from-inventory", "post">;
  let result: ApiResponse<"/api/v1/weekly-plans/generate-from-inventory", "post">;
  try {
    result = await request("/api/v1/weekly-plans/generate-from-inventory", schema.slots, {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const messages: Record<string, string> = {
        AI_TIMEOUT: "Lập thực đơn quá lâu. Vui lòng thử lại.",
        AI_RATE_LIMITED: "Dịch vụ lập thực đơn đang quá tải. Vui lòng thử lại sau.",
        AI_OUTPUT_INVALID: "AI trả về thực đơn không hợp lệ. Vui lòng thử lại.",
        AI_CONFIG_ERROR: "Dịch vụ lập thực đơn chưa được cấu hình.",
        AI_PROVIDER_UNAVAILABLE: "Dịch vụ lập thực đơn tạm thời không khả dụng.",
      };
      if (error.code && messages[error.code])
        throw new ApiError(messages[error.code], error.status, error.code);
    }
    throw error;
  }
  if (Object.keys(result).length !== 21)
    throw new ApiError("Máy chủ chưa tạo đủ 21 bữa.");
  return result;
}

export async function buildShopping(
  plan: SavedPlan | undefined,
  inventory: Ingredient[],
  signal?: AbortSignal,
): Promise<ApiResponse<"/api/v1/weekly-plans/shopping/build", "post">> {
  if (!plan) return [];
  if (IS_MOCKING) return (await mock()).buildShopping(plan, inventory);
  const body = { plan, inventory } satisfies ApiRequest<"/api/v1/weekly-plans/shopping/build", "post">;
  return request("/api/v1/weekly-plans/shopping/build", schema.shopping, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}

export async function getAppData(
  userId: string,
  signal?: AbortSignal,
): Promise<ApiResponse<"/api/v1/users/me/data", "get">> {
  if (IS_MOCKING) return (await mock()).getAppData(userId);
  return request("/api/v1/users/me/data", schema.appDataResponse, { signal });
}

/** Revision và khóa idempotency bảo vệ ghi đồng thời và thử lại sau timeout. */
export async function saveAppData(
  userId: string,
  data: AppData,
  revision: number,
  mutationId: string,
  signal?: AbortSignal,
): Promise<ApiResponse<"/api/v1/users/me/data", "put">> {
  if (!schema.appData(data)) throw new ApiError("Dữ liệu cần lưu chưa hợp lệ.");
  if (IS_MOCKING) return (await mock()).saveAppData(userId, data);
  const body = data satisfies ApiRequest<"/api/v1/users/me/data", "put">;
  const headers = { "If-Match": `"${revision}"`, "Idempotency-Key": mutationId } satisfies ApiHeaders<"/api/v1/users/me/data", "put">;
  return request("/api/v1/users/me/data", schema.appDataResponse, {
    method: "PUT",
    body: JSON.stringify(body),
    signal,
    headers,
  });
}
