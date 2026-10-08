import type { AppData } from '../types';

const norm = (s: string) => s.trim().toLowerCase();
export const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
export const MEALS = ['sáng', 'trưa', 'tối'];
export const SLOT_COUNT = DAYS.length * MEALS.length; // 21
export const slotKey = (d: number, m: number) => `${d}-${m}`;
export const MIN_PORTIONS = 1;
export const MAX_PORTIONS = 12;


const UNIT_ALIAS: Record<string, string> = { gram: 'g', gr: 'g', kilogram: 'kg', 'lít': 'l', lit: 'l', liter: 'l' };
export const normUnit = (u: string) => {
  const x = norm(u);
  return UNIT_ALIAS[x] ?? x;
};
/** Quy về đơn vị cơ sở. dim = 'g' | 'ml' | tên đơn vị đếm ('quả'...). */
export function toBase(qty: number, unit: string): { dim: string; qty: number } {
  const u = normUnit(unit);
  if (u === 'g') return { dim: 'g', qty };
  if (u === 'kg') return { dim: 'g', qty: qty * 1000 };
  if (u === 'ml') return { dim: 'ml', qty };
  if (u === 'l') return { dim: 'ml', qty: qty * 1000 };
  return { dim: u || '?', qty };
}
export const unitFactor = (unit: string) => (['kg', 'l'].includes(normUnit(unit)) ? 1000 : 1);
/** Làm tròn lên cho đồ đếm / g / ml (mua đủ); 1 chữ số thập phân cho kg / l. */
export const roundUp = (q: number, unit: string) => (unitFactor(unit) === 1 ? Math.ceil(q - 1e-9) : Math.round(q * 10) / 10);
export const fmtQty = (q: number) => String(Math.round(q * 10) / 10);


export function weekStartISO(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // về thứ Hai
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export function weekLabel(startISO: string): string {
  const [y, m, d] = startISO.split('-').map(Number);
  const a = new Date(y, m - 1, d);
  const b = new Date(y, m - 1, d + 6);
  const p = (n: number) => String(n).padStart(2, '0');
  return a.getMonth() === b.getMonth()
    ? `${p(a.getDate())}–${p(b.getDate())}/${p(b.getMonth() + 1)}`
    : `${p(a.getDate())}/${p(a.getMonth() + 1)}–${p(b.getDate())}/${p(b.getMonth() + 1)}`;
}


export const initialData = (): AppData => ({
  inventory: [], portions: 2, allergies: [], weekStart: weekStartISO(),
  slots: {}, savedPlan: undefined, checked: {},
});
