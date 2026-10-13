import type { components, paths } from "./services/generated/api.types";

/** Validator HTTP hiện tại nhận field tùy chọn vắng mặt, từ chối null. */
type ClientValue<T> = T extends null
  ? never
  : T extends (infer Item)[]
    ? ClientValue<Item>[]
    : T extends object
      ? { [Key in keyof T]: ClientValue<T[Key]> }
      : T;

type Schemas = components["schemas"];

export type Ingredient = ClientValue<Schemas["Ingredient"]>;
export type RecipeItem = Schemas["RecipeItem"];
export type MissingItem = ClientValue<Schemas["MissingItem"]>;
export type Recipe = Schemas["Recipe"];
export type RecipeMatch = ClientValue<Schemas["RecipeMatch"]>;
export type SavedPlan = Schemas["SavedPlan"];
/** key = `${dayIndex}-${mealIndex}` -> recipeId */
export type Slots = SavedPlan["slots"];
export type ShoppingItem = Schemas["ShoppingItem"];
export type AppData = ClientValue<Schemas["AppData"]>;
export type AppDataResponse = ClientValue<Schemas["AppDataResponse"]>;

/** Body JSON lấy từ đúng path/method của hợp đồng FastAPI. */
export type ApiRequest<Path extends keyof paths, Method extends keyof paths[Path]> =
  NonNullable<paths[Path][Method]> extends {
    requestBody: { content: { "application/json": infer Body } };
  } ? Body : never;

/** Response thành công được validator HTTP kiểm tra theo quy ước ClientValue. */
export type ApiResponse<Path extends keyof paths, Method extends keyof paths[Path]> =
  NonNullable<paths[Path][Method]> extends {
    responses: { 200: { content: { "application/json": infer Body } } };
  } ? ClientValue<Body> : never;

export type ApiHeaders<Path extends keyof paths, Method extends keyof paths[Path]> =
  NonNullable<paths[Path][Method]> extends { parameters: { header: infer Headers } }
    ? Headers : never;
