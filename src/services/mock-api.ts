// Dữ liệu và thuật toán mẫu; chỉ được nạp khi IS_MOCKING bật.
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DAYS,
  MEALS,
  slotKey,
  initialData,
  toBase,
  unitFactor,
  roundUp,
} from "./meal-utils";
import {
  AppData,
  Ingredient,
  MissingItem,
  Recipe,
  RecipeItem,
  RecipeMatch,
  SavedPlan,
  ShoppingItem,
  Slots,
} from "../types";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const norm = (s: string) => s.trim().toLowerCase();

// ---------- Nguyên liệu: nhóm đi chợ + dị ứng (mapping kiểm duyệt) ----------
const ING_INFO: Record<string, { group: string; allergen?: string }> = {
  trứng: { group: "Trứng & sữa", allergen: "trứng" },
  sữa: { group: "Trứng & sữa", allergen: "sữa" },
  "cà chua": { group: "Rau củ" },
  "hành lá": { group: "Rau củ" },
  "dầu ăn": { group: "Gia vị & đồ khô" },
  gạo: { group: "Gia vị & đồ khô" },
  "bột mì": { group: "Gia vị & đồ khô", allergen: "gluten" },
  "đậu phụ": { group: "Đạm", allergen: "đậu nành" },
  tôm: { group: "Đạm", allergen: "hải sản" },
  "thịt bò": { group: "Đạm" },
};
export const ALLERGENS = ["trứng", "sữa", "gluten", "đậu nành", "hải sản"];
const groupOf = (name: string) => ING_INFO[norm(name)]?.group ?? "Khác";

export const RECIPES: Recipe[] = [
  {
    id: "r1",
    title: "Trứng sốt cà chua",
    minutes: 20,
    servings: 2,
    items: [
      { name: "Trứng", quantity: 3, unit: "quả" },
      { name: "Cà chua", quantity: 200, unit: "g" },
      { name: "Hành lá", quantity: 20, unit: "g" },
      { name: "Dầu ăn", quantity: 15, unit: "ml" },
    ],
    steps: [
      "Đánh trứng với chút muối.",
      "Xào cà chua đến mềm.",
      "Cho trứng vào đảo đều, rắc hành lá.",
    ],
  },
  {
    id: "r2",
    title: "Canh cà chua trứng",
    minutes: 20,
    servings: 3,
    items: [
      { name: "Trứng", quantity: 2, unit: "quả" },
      { name: "Cà chua", quantity: 250, unit: "g" },
      { name: "Hành lá", quantity: 10, unit: "g" },
    ],
    steps: [
      "Phi thơm hành, xào cà chua.",
      "Thêm nước, đun sôi.",
      "Đánh trứng, rót vòng tròn vào nồi.",
    ],
  },
  {
    id: "r3",
    title: "Bánh kếp sữa trứng",
    minutes: 25,
    servings: 2,
    items: [
      { name: "Trứng", quantity: 2, unit: "quả" },
      { name: "Sữa", quantity: 200, unit: "ml" },
      { name: "Bột mì", quantity: 150, unit: "g" },
    ],
    steps: [
      "Trộn bột, trứng, sữa thành hỗn hợp mịn.",
      "Chiên từng chiếc trên chảo chống dính.",
    ],
  },
  {
    id: "r4",
    title: "Cơm chiên trứng",
    minutes: 15,
    servings: 2,
    items: [
      { name: "Gạo", quantity: 200, unit: "g" },
      { name: "Trứng", quantity: 2, unit: "quả" },
      { name: "Hành lá", quantity: 10, unit: "g" },
      { name: "Dầu ăn", quantity: 10, unit: "ml" },
    ],
    steps: [
      "Nấu cơm và để nguội.",
      "Phi hành, đập trứng vào đảo.",
      "Cho cơm vào chiên đều tay.",
    ],
  },
  {
    id: "r5",
    title: "Đậu phụ sốt cà chua",
    minutes: 25,
    servings: 2,
    items: [
      { name: "Đậu phụ", quantity: 300, unit: "g" },
      { name: "Cà chua", quantity: 200, unit: "g" },
      { name: "Hành lá", quantity: 10, unit: "g" },
      { name: "Dầu ăn", quantity: 15, unit: "ml" },
    ],
    steps: [
      "Chiên vàng đậu phụ.",
      "Xào cà chua thành sốt.",
      "Cho đậu vào đun nhỏ lửa 5 phút.",
    ],
  },
  {
    id: "r6",
    title: "Tôm rang hành",
    minutes: 20,
    servings: 2,
    items: [
      { name: "Tôm", quantity: 250, unit: "g" },
      { name: "Hành lá", quantity: 20, unit: "g" },
      { name: "Dầu ăn", quantity: 10, unit: "ml" },
    ],
    steps: [
      "Ướp tôm với chút muối.",
      "Rang tôm đến khi đổi màu.",
      "Cho hành lá vào đảo nhanh.",
    ],
  },
  {
    id: "r7",
    title: "Bò xào cà chua",
    minutes: 20,
    servings: 2,
    items: [
      { name: "Thịt bò", quantity: 250, unit: "g" },
      { name: "Cà chua", quantity: 200, unit: "g" },
      { name: "Hành lá", quantity: 10, unit: "g" },
      { name: "Dầu ăn", quantity: 15, unit: "ml" },
    ],
    steps: [
      "Thái bò mỏng, ướp chút muối tiêu.",
      "Xào nhanh bò lửa lớn rồi múc ra.",
      "Xào cà chua, cho bò vào đảo đều, rắc hành lá.",
    ],
  },
  {
    id: "r8",
    title: "Cơm chiên thịt bò",
    minutes: 20,
    servings: 2,
    items: [
      { name: "Gạo", quantity: 200, unit: "g" },
      { name: "Thịt bò", quantity: 150, unit: "g" },
      { name: "Trứng", quantity: 1, unit: "quả" },
      { name: "Hành lá", quantity: 10, unit: "g" },
      { name: "Dầu ăn", quantity: 15, unit: "ml" },
    ],
    steps: [
      "Nấu cơm và để nguội.",
      "Xào bò thái hạt lựu, đập trứng vào đảo.",
      "Cho cơm vào chiên đều, rắc hành lá.",
    ],
  },
  {
    id: "r9",
    title: "Canh bò cà chua",
    minutes: 30,
    servings: 3,
    items: [
      { name: "Thịt bò", quantity: 200, unit: "g" },
      { name: "Cà chua", quantity: 250, unit: "g" },
      { name: "Hành lá", quantity: 10, unit: "g" },
    ],
    steps: [
      "Phi thơm hành, xào bò sơ.",
      "Thêm cà chua và nước, đun sôi.",
      "Hầm nhỏ lửa 15 phút, rắc hành lá.",
    ],
  },
];

// ---------- Đơn vị: chỉ quy đổi cùng chiều (kg↔g, l↔ml); đếm không đổi sang khối lượng ----------
// ---------- Kho ----------
type StockEntry = { byDim: Map<string, number>; unknown: boolean };
function buildStock(inventory: Ingredient[]): Map<string, StockEntry> {
  const stock = new Map<string, StockEntry>();
  for (const i of inventory) {
    const key = norm(i.name);
    if (!key) continue;
    const e = stock.get(key) ?? {
      byDim: new Map<string, number>(),
      unknown: false,
    };
    if (i.quantity === undefined) e.unknown = true;
    else {
      const b = toBase(i.quantity, i.unit);
      e.byDim.set(b.dim, (e.byDim.get(b.dim) ?? 0) + b.qty);
    }
    stock.set(key, e);
  }
  return stock;
}
/** Có trong kho nhưng không so sánh được (chưa rõ lượng hoặc khác chiều đơn vị) -> cần kiểm tra. */
const needsCheck = (e: StockEntry | undefined, dim: string) =>
  !!e && (e.unknown || (e.byDim.size > 0 && !e.byDim.has(dim)));

// ---------- Dị ứng ----------
/** Món an toàn: không chứa dị ứng; thành phần không rõ -> loại khi người dùng có khai báo dị ứng. */
export function isRecipeSafe(recipe: Recipe, allergies: string[]): boolean {
  if (allergies.length === 0) return true;
  return recipe.items.every((it) => {
    const info = ING_INFO[norm(it.name)];
    if (!info) return false;
    return !(info.allergen && allergies.includes(info.allergen));
  });
}
export const safeRecipes = (allergies: string[]) =>
  RECIPES.filter((r) => isRecipeSafe(r, allergies));

// ---------- Chụp & nhận diện (MOCK) ----------
export class DetectError extends Error {
  kind: "blurry" | "timeout" | "unknown";
  constructor(kind: "blurry" | "timeout" | "unknown", message: string) {
    super(message);
    this.kind = kind;
  }
}
/** Chỉ để kiểm thử lỗi giao diện (ảnh mờ / timeout) mà không cần backend. */
export const mockControl: { failNext?: "blurry" | "timeout" } = {};

/** Gửi ảnh -> AI trả về ứng viên nguyên liệu (người dùng sẽ xác nhận/sửa). */
export async function detectIngredients(
  _imageUri: string,
): Promise<Ingredient[]> {
  await wait(1800); // giả lập thời gian model phân tích
  const fail = mockControl.failNext;
  if (fail) {
    mockControl.failNext = undefined;
    throw fail === "blurry"
      ? new DetectError(
          "blurry",
          "Ảnh bị mờ nên chưa nhận diện được. Hãy chụp lại gần và đủ sáng hơn.",
        )
      : new DetectError(
          "timeout",
          "Phân tích quá lâu. Ảnh của bạn vẫn được giữ — hãy thử lại.",
        );
  }
  return [
    { id: "i1", name: "Cà chua", quantity: 300, unit: "g" },
    { id: "i2", name: "Trứng", quantity: 4, unit: "quả" },
    { id: "i3", name: "Sữa", quantity: 500, unit: "ml" },
  ];
}

// ---------- Công thức ----------
/** So khớp kho với công thức theo khẩu phần; chỉ dùng nguyên liệu đã xác nhận, không đoán lượng. */
export function matchRecipes(
  inventory: Ingredient[],
  portions: number,
  allergies: string[],
): RecipeMatch[] {
  const stock = buildStock(inventory);
  return safeRecipes(allergies)
    .map((recipe) => {
      const factor = portions / recipe.servings;
      const items: RecipeItem[] = recipe.items.map((it) => ({
        ...it,
        quantity: roundUp(it.quantity * factor, it.unit),
      }));
      const missing: MissingItem[] = [];
      let covered = 0;
      for (const it of items) {
        const need = toBase(it.quantity, it.unit);
        const entry = stock.get(norm(it.name));
        const have = entry?.byDim.get(need.dim) ?? 0;
        covered += Math.min(1, have / need.qty);
        if (have < need.qty) {
          const gap = roundUp((need.qty - have) / unitFactor(it.unit), it.unit);
          missing.push({
            name: it.name,
            unit: it.unit,
            quantity: gap,
            check: needsCheck(entry, need.dim) || undefined,
          });
        }
      }
      return {
        recipe,
        servings: portions,
        items,
        missing,
        coverage: covered / items.length,
      };
    })
    .sort((a, b) => b.coverage - a.coverage);
}

// ---------- Tuần ----------
/** Lập 21 bữa (MOCK job). Lỗi -> ném, nơi gọi giữ plan cũ. Chỉ dùng món an toàn với dị ứng. */
export async function generatePlan(allergies: string[]): Promise<Slots> {
  await wait(1200);
  const pool = safeRecipes(allergies);
  if (pool.length === 0)
    throw new Error(
      "Không có món nào phù hợp với bộ lọc dị ứng. Hãy đổi bộ lọc ở tab Kho.",
    );
  const slots: Slots = {};
  let n = 0;
  for (let d = 0; d < DAYS.length; d++)
    for (let m = 0; m < MEALS.length; m++) {
      slots[slotKey(d, m)] = pool[n % pool.length].id; // xoay vòng: không lặp liền kề khi có ≥2 món
      n++;
    }
  return slots;
}

// ---------- Đi chợ ----------
/**
 * Tổng cần = Σ qty_recipe × servings_slot / servings_recipe, gộp theo nguyên liệu + chiều đơn vị.
 * Cần mua = max(0, tổng cần − tồn đã xác nhận). Thiếu lượng tồn -> gắn nhãn kiểm tra, không đoán.
 */
export function buildShopping(
  plan: SavedPlan | undefined,
  inventory: Ingredient[],
): ShoppingItem[] {
  if (!plan) return [];
  const need = new Map<string, { name: string; dim: string; qty: number }>();
  for (const recipeId of Object.values(plan.slots)) {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) continue;
    const factor = plan.portions / recipe.servings;
    for (const it of recipe.items) {
      const b = toBase(it.quantity * factor, it.unit);
      const key = `${norm(it.name)}|${b.dim}`;
      const cur = need.get(key);
      if (cur) cur.qty += b.qty;
      else need.set(key, { name: it.name, dim: b.dim, qty: b.qty });
    }
  }
  const stock = buildStock(inventory);
  const out: ShoppingItem[] = [];
  need.forEach((n, key) => {
    const entry = stock.get(norm(n.name));
    const toBuy = Math.max(0, n.qty - (entry?.byDim.get(n.dim) ?? 0));
    const check = needsCheck(entry, n.dim);
    if (toBuy <= 1e-9 && !check) return;
    let unit = n.dim;
    let qty = Math.ceil(toBuy - 1e-9);
    if ((n.dim === "g" || n.dim === "ml") && qty >= 1000) {
      unit = n.dim === "g" ? "kg" : "l";
      qty = Math.round((toBuy / 1000) * 10) / 10;
    }
    out.push({
      key,
      name: n.name,
      unit,
      toBuy: qty,
      group: groupOf(n.name),
      check,
    });
  });
  return out.sort(
    (a, b) =>
      a.group.localeCompare(b.group, "vi") ||
      a.name.localeCompare(b.name, "vi"),
  );
}

export async function getAppData(userId: string) {
  const raw = await AsyncStorage.getItem("freshplan.v2." + userId);
  return {
    data: raw
      ? ({ ...initialData(), ...JSON.parse(raw) } as AppData)
      : initialData(),
    revision: 0,
  };
}
export async function saveAppData(userId: string, data: AppData) {
  await AsyncStorage.setItem("freshplan.v2." + userId, JSON.stringify(data));
  return { data, revision: 0 };
}
