import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, Chip, Pill, PortionStepper, Sheet, Skeleton, s } from '../components/ui';
import { DAYS, MAX_PORTIONS, MEALS, MIN_PORTIONS, fmtQty, matchRecipes, slotKey } from '../services/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { AppData, Recipe, RecipeMatch } from '../types';
import { colors, radius, space, font } from '../theme';

export default function RecipesTab({
  data,
  setData,
  onScan,
  onGoInventory,
  onGoWeek,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  onScan: () => void;
  onGoInventory: () => void;
  onGoWeek: () => void;
}) {
  const [openId, setOpenId] = useState<string>();
  const [target, setTarget] = useState<Recipe>();
  const [day, setDay] = useState(0);
  const [meal, setMeal] = useState(0);
  const [notice, setNotice] = useState<string>();

  const { value: matches, loading, error: loadError, retry } = useApiQuery<RecipeMatch[]>(
    useCallback(signal => matchRecipes(data.inventory, data.portions, data.allergies, signal),
      [data.inventory, data.portions, data.allergies]),
    [],
  );
  const titleOf = (id?: string) => matches.find(m => m.recipe.id === id)?.recipe.title;
  const occupied = target ? data.slots[slotKey(day, meal)] : undefined;

  const addToPlan = () => {
    if (!target) return;
    setData((d) => ({ ...d, slots: { ...d.slots, [slotKey(day, meal)]: target.id } }));
    setNotice(`Đã thêm "${target.title}" vào ${DAYS[day]} • ${MEALS[meal]}. Nhớ "Lưu & tạo đi chợ" ở tab Tuần.`);
    setTarget(undefined);
  };

  return (
    <>
      <Text style={s.h1}>Công thức gợi ý</Text>
      <Text style={[s.muted, { marginBottom: space.md }]}>Sắp xếp theo mức đủ nguyên liệu. Phần còn thiếu hiển thị bên dưới.</Text>

      <Card>
        <PortionStepper value={data.portions} min={MIN_PORTIONS} max={MAX_PORTIONS} onChange={(n) => setData((d) => ({ ...d, portions: n }))} label="Khẩu phần nấu" />
      </Card>

      {notice ? (
        <Card style={{ backgroundColor: colors.okBg }}>
          <Text style={s.body}>{notice}</Text>
          <Button label="Mở tab Tuần" variant="secondary" onPress={onGoWeek} style={{ marginTop: space.sm }} />
        </Card>
      ) : null}

      {data.inventory.length === 0 && (
        <Card>
          <Text style={s.body}>Chưa có nguyên liệu nào, nên mọi món đều đang thiếu. Chụp ảnh hoặc nhập tay để có gợi ý chính xác.</Text>
          <Button label="Chụp nguyên liệu" onPress={onScan} style={{ marginTop: space.sm }} />
        </Card>
      )}

      {loadError ? (
        <Card>
          <Pill tone="err" text={loadError} />
          <Button label="Thử lại" onPress={retry} style={{ marginTop: space.sm }} />
        </Card>
      ) : loading ? (
        <View accessibilityLabel="Đang tìm món phù hợp">
          <Text style={[s.muted, { marginBottom: space.sm }]}>Đang tìm món phù hợp…</Text>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </View>
      ) : matches.length === 0 ? (
        <Card>
          <Text style={s.h2}>Không có món phù hợp</Text>
          <Text style={[s.body, { marginVertical: space.sm }]}>Chưa có công thức nào để gợi ý.</Text>
          <Button label="Về tab Kho" onPress={onGoInventory} />
        </Card>
      ) : (
        matches.map((m) => {
          const open = openId === m.recipe.id;
          const complete = m.missing.length === 0;
          return (
            <Card key={m.recipe.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm }}>
                <Text style={[s.h2, { flex: 1 }]}>{m.recipe.title}</Text>
                <Pill tone={complete ? 'ok' : 'warn'} text={complete ? 'Đủ' : `Thiếu ${m.missing.length}`} />
              </View>
              <Text style={s.muted}>{m.recipe.minutes} phút • {m.servings} người • có {Math.round(m.coverage * 100)}%</Text>
              <View style={{ height: 6, backgroundColor: colors.border, borderRadius: radius.pill, marginVertical: space.sm }}>
                <View style={{ height: 6, width: `${m.coverage * 100}%`, backgroundColor: colors.primary, borderRadius: radius.pill }} />
              </View>
              {m.missing.length > 0 && (
                <View style={{ backgroundColor: colors.warnBg, borderRadius: radius.input, padding: space.md, marginBottom: space.sm }}>
                  <Text style={{ color: colors.warnText, fontFamily: font.semi }}>Cần mua</Text>
                  {m.missing.map((it) => (
                    <Text key={it.name} style={{ color: colors.warnText }}>• {it.name}: {fmtQty(it.quantity)} {it.unit}{it.check ? ' (kiểm tra lượng tồn)' : ''}</Text>
                  ))}
                </View>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                accessibilityLabel={`Xem bước nấu ${m.recipe.title}`}
                onPress={() => setOpenId(open ? undefined : m.recipe.id)}
                style={{ minHeight: 48, justifyContent: 'center' }}
              >
                <Text style={{ color: colors.primary, fontFamily: font.semi }}>{open ? 'Ẩn bước nấu ▴' : 'Xem bước nấu • khẩu phần ▾'}</Text>
              </Pressable>
              {open && (
                <View style={{ marginBottom: space.sm }}>
                  <Text style={[s.body, { fontFamily: font.semi }]}>Nguyên liệu cho {m.servings} người</Text>
                  {m.items.map((it) => <Text key={it.name} style={s.body}>• {it.name} — {fmtQty(it.quantity)} {it.unit}</Text>)}
                  <Text style={[s.body, { fontFamily: font.semi, marginTop: space.sm }]}>Cách làm</Text>
                  {m.recipe.steps.map((st, idx) => <Text key={idx} style={s.body}>{idx + 1}. {st}</Text>)}
                </View>
              )}
              <Button label="Thêm vào thực đơn" variant="secondary" onPress={() => { setTarget(m.recipe); setNotice(undefined); }} />
            </Card>
          );
        })
      )}

      <Sheet visible={!!target} title={`Thêm "${target?.title ?? ''}" vào thực đơn`} onClose={() => setTarget(undefined)}>
        <Text style={s.label}>Ngày</Text>
        <View style={[s.row, { marginBottom: space.md }]}>
          {DAYS.map((d, i) => <Chip key={d} label={d} selected={day === i} onPress={() => setDay(i)} accessibilityLabel={`Ngày ${d}`} />)}
        </View>
        <Text style={s.label}>Bữa</Text>
        <View style={[s.row, { marginBottom: space.md }]}>
          {MEALS.map((m, i) => <Chip key={m} label={m} selected={meal === i} onPress={() => setMeal(i)} accessibilityLabel={`Bữa ${m}`} />)}
        </View>
        {occupied ? <Text style={[s.muted, { marginBottom: space.md }]}>{`Ô này đang có "${titleOf(occupied) ?? 'một món'}" và sẽ được thay thế.`}</Text> : null}
        <Button label={`Thêm vào ${DAYS[day]} • ${MEALS[meal]}`} onPress={addToPlan} />
        <Button label="Hủy" variant="secondary" onPress={() => setTarget(undefined)} style={{ marginTop: space.sm }} />
      </Sheet>
    </>
  );
}
