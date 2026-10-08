import type {
  AppData,
  Ingredient,
  Recipe,
  RecipeItem,
  RecipeMatch,
  SavedPlan,
  ShoppingItem,
  Slots,
} from "../types";
import { MAX_PORTIONS, MIN_PORTIONS } from "./meal-utils";

// Kiểm tra dữ liệu tại biên HTTP, không tin kiểu TypeScript của JSON từ backend.
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string" && !!v.trim();
const number = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;
const portions = (v: unknown): v is number =>
  number(v) && Number.isInteger(v) && v >= MIN_PORTIONS && v <= MAX_PORTIONS;
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(text);
const optional = (v: unknown, check: (v: unknown) => boolean) =>
  v === undefined || check(v);
const list =
  <T>(check: (v: unknown) => v is T) =>
  (v: unknown): v is T[] =>
    Array.isArray(v) && v.every(check);
const uniqueIds = (v: { id: string }[]) =>
  new Set(v.map((i) => i.id)).size === v.length;
const ingredient = (v: unknown): v is Ingredient =>
  object(v) &&
  text(v.id) &&
  text(v.name) &&
  text(v.unit) &&
  optional(v.quantity, number) &&
  optional(v.expiry, text);
export const ingredients = (v: unknown): v is Ingredient[] =>
  list(ingredient)(v) && uniqueIds(v);
const recipeItem = (v: unknown): v is RecipeItem =>
  object(v) &&
  text(v.name) &&
  number(v.quantity) &&
  v.quantity > 0 &&
  text(v.unit);
const recipe = (v: unknown): v is Recipe =>
  object(v) &&
  text(v.id) &&
  text(v.title) &&
  number(v.minutes) &&
  portions(v.servings) &&
  list(recipeItem)(v.items) &&
  v.items.length > 0 &&
  strings(v.steps) &&
  v.steps.length > 0;
export const recipes = (v: unknown): v is Recipe[] =>
  list(recipe)(v) && uniqueIds(v);
const match = (v: unknown): v is RecipeMatch =>
  object(v) &&
  recipe(v.recipe) &&
  portions(v.servings) &&
  list(recipeItem)(v.items) &&
  list(
    (i): i is RecipeItem & { check?: boolean } =>
      object(i) &&
      optional(i.check, (x) => typeof x === "boolean") &&
      recipeItem(i),
  )(v.missing) &&
  number(v.coverage) &&
  v.coverage <= 1;
export const matches = list(match);
export const slots = (v: unknown): v is Slots =>
  object(v) &&
  Object.entries(v).every(
    ([key, value]) => /^[0-6]-[0-2]$/.test(key) && text(value),
  );
const isoDate = (v: unknown): v is string => {
  if (!text(v) || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const date = new Date(v + "T00:00:00Z");
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === v
  );
};
const plan = (v: unknown): v is SavedPlan =>
  object(v) &&
  isoDate(v.weekStart) &&
  slots(v.slots) &&
  portions(v.portions) &&
  number(v.version) &&
  Number.isInteger(v.version) &&
  v.version > 0;
export const appData = (v: unknown): v is AppData =>
  object(v) &&
  ingredients(v.inventory) &&
  portions(v.portions) &&
  strings(v.allergies) &&
  isoDate(v.weekStart) &&
  slots(v.slots) &&
  optional(v.savedPlan, plan) &&
  object(v.checked) &&
  Object.values(v.checked).every((x) => typeof x === "boolean");
const shoppingItem = (v: unknown): v is ShoppingItem =>
  object(v) &&
  text(v.key) &&
  text(v.name) &&
  text(v.unit) &&
  number(v.toBuy) &&
  text(v.group) &&
  typeof v.check === "boolean";
export const shopping = list(shoppingItem);
export type AppDataResponse = { data: AppData; revision: number };
export const appDataResponse = (v: unknown): v is AppDataResponse =>
  object(v) &&
  appData(v.data) &&
  number(v.revision) &&
  Number.isSafeInteger(v.revision);
