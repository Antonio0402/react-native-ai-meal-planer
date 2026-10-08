export type Ingredient = {
  id: string;
  name: string;
  quantity?: number; // undefined = chưa nhập lượng
  unit: string;
  expiry?: string; // DD/MM/YYYY, nhập thủ công
};

export type RecipeItem = { name: string; quantity: number; unit: string };
export type MissingItem = RecipeItem & { check?: boolean }; // check = có trong kho nhưng chưa rõ lượng/đơn vị

export type Recipe = {
  id: string;
  title: string;
  minutes: number;
  servings: number;
  items: RecipeItem[];
  steps: string[];
};

export type RecipeMatch = {
  recipe: Recipe;
  servings: number; // khẩu phần đã quy đổi
  items: RecipeItem[]; // nguyên liệu theo khẩu phần đã chọn
  missing: MissingItem[];
  coverage: number; // 0..1
};

/** key = `${dayIndex}-${mealIndex}` -> recipeId */
export type Slots = Record<string, string>;

export type SavedPlan = {
  weekStart: string;
  slots: Slots;
  portions: number;
  version: number;
};

export type ShoppingItem = {
  key: string;
  name: string;
  unit: string;
  toBuy: number;
  group: string;
  check: boolean; // thiếu lượng tồn -> cần kiểm tra, không đoán
};

export type AppData = {
  inventory: Ingredient[];
  portions: number;
  allergies: string[];
  weekStart: string;
  slots: Slots;
  savedPlan?: SavedPlan;
  checked: Record<string, boolean>;
};
