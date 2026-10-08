import { Platform } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import type {
  AppData,
  Ingredient,
  Recipe,
  RecipeMatch,
  SavedPlan,
  ShoppingItem,
  Slots,
} from "../types";
import { ApiError, IS_MOCKING, request, API_URL } from "./http";
import * as schema from "./api-schema";
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
    public kind: "blurry" | "timeout" | "unknown",
    message: string,
  ) {
    super(message);
    this.name = "DetectError";
  }
}

/** Chỉ nạp dữ liệu mẫu khi cờ môi trường bật; lỗi mạng không được thay bằng mẫu. */
const mock = () => import("./mock-api");

export async function getRecipes(
  allergies: string[] = [],
  signal?: AbortSignal,
): Promise<Recipe[]> {
  if (IS_MOCKING) return (await mock()).safeRecipes(allergies);
  const query = new URLSearchParams();
  allergies.forEach((a) => query.append("allergies", a));
  return request(
    "/recipes" + (query.toString() ? "?" + query.toString() : ""),
    schema.recipes,
    { signal },
  );
}

/** Gửi tệp ảnh thật bằng multipart, không gửi URI cục bộ cho backend. */
export async function detectIngredients(
  imageUri: string,
  image?: Pick<ImagePickerAsset, "file" | "fileName" | "mimeType">,
): Promise<Ingredient[]> {
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
    const name =
      image?.fileName ||
      imageUri.split("/").pop()?.split("?")[0] ||
      "photo.jpg";
    if (Platform.OS === "web") {
      const file = image?.file ?? (await (await fetch(imageUri)).blob());
      form.append("file", file, name);
    } else {
      const extension = name.split(".").pop()?.toLowerCase();
      const mime =
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
      // React Native FormData nhận tệp cục bộ qua URI; kiểu DOM chỉ khai báo Blob.
      form.append("file", {
        uri: imageUri,
        name,
        type: mime,
      } as unknown as Blob);
    }
    return await request("/ingredients/detect", schema.ingredients, {
      method: "POST",
      body: form,
    });
  } catch (error) {
    const kind =
      error instanceof ApiError &&
      (error.code === "blurry" || error.code === "timeout")
        ? error.code
        : "unknown";
    throw new DetectError(
      kind,
      kind === "blurry"
        ? "Ảnh bị mờ. Hãy chụp lại gần và đủ sáng hơn."
        : error instanceof Error
          ? error.message
          : "Phân tích thất bại.",
    );
  }
}

export async function matchRecipes(
  inventory: Ingredient[],
  portions: number,
  allergies: string[],
  signal?: AbortSignal,
): Promise<RecipeMatch[]> {
  if (IS_MOCKING)
    return (await mock()).matchRecipes(inventory, portions, allergies);
  return request("/recipes/match", schema.matches, {
    method: "POST",
    body: JSON.stringify({ inventory, portions, allergies }),
    signal,
  });
}

export async function generatePlan(
  allergies: string[],
  portions = 2,
  weekStart?: string,
): Promise<Slots> {
  if (IS_MOCKING) return (await mock()).generatePlan(allergies);
  const result = await request("/plans/generate", schema.slots, {
    method: "POST",
    body: JSON.stringify({ allergies, portions, weekStart }),
  });
  if (Object.keys(result).length !== 21)
    throw new ApiError("Máy chủ chưa tạo đủ 21 bữa.");
  return result;
}

export async function buildShopping(
  plan: SavedPlan | undefined,
  inventory: Ingredient[],
  signal?: AbortSignal,
): Promise<ShoppingItem[]> {
  if (!plan) return [];
  if (IS_MOCKING) return (await mock()).buildShopping(plan, inventory);
  return request("/shopping/build", schema.shopping, {
    method: "POST",
    body: JSON.stringify({ plan, inventory }),
    signal,
  });
}

export async function getAppData(
  userId: string,
  signal?: AbortSignal,
): Promise<schema.AppDataResponse> {
  if (IS_MOCKING) return (await mock()).getAppData(userId);
  return request("/me/data", schema.appDataResponse, { signal });
}

/** Revision và khóa idempotency bảo vệ ghi đồng thời và thử lại sau timeout. */
export async function saveAppData(
  userId: string,
  data: AppData,
  revision: number,
  mutationId: string,
  signal?: AbortSignal,
): Promise<schema.AppDataResponse> {
  if (!schema.appData(data)) throw new ApiError("Dữ liệu cần lưu chưa hợp lệ.");
  if (IS_MOCKING) return (await mock()).saveAppData(userId, data);
  return request("/me/data", schema.appDataResponse, {
    method: "PUT",
    body: JSON.stringify(data),
    signal,
    headers: { "If-Match": `"${revision}"`, "Idempotency-Key": mutationId },
  });
}
