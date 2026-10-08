import React, { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button, Card, Pill, PortionStepper, Sheet, s } from "../components/ui";
import {
  DAYS,
  MAX_PORTIONS,
  MEALS,
  MIN_PORTIONS,
  getRecipes,
  SLOT_COUNT,
  generatePlan,
  slotKey,
  weekLabel,
} from "../services/api";
import { AppData, Recipe } from "../types";
import { colors, space, font } from "../theme";

import { useApiQuery } from "../hooks/useApiQuery";

export default function WeekTab({
  data,
  setData,
  onSaved,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  onSaved: () => void;
}) {
  const [picking, setPicking] = useState<{ d: number; m: number }>();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>(); // lỗi lập tuần (đầu trang)
  const [saveError, setSaveError] = useState<string>(); // lỗi lưu (sát nút Lưu)

  const {
    value: pool,
    loading: loadingRecipes,
    error: recipeError,
    retry,
  } = useApiQuery<Recipe[]>(
    useCallback(
      (signal) => getRecipes(data.allergies, signal),
      [data.allergies],
    ),
    [],
  );
  const titleOf = (id?: string) => pool.find((r) => r.id === id)?.title;

  const filled = Object.keys(data.slots).length;
  const saved = data.savedPlan;
  const dirty =
    !saved ||
    saved.portions !== data.portions ||
    JSON.stringify(saved.slots) !== JSON.stringify(data.slots);

  const autoPlan = async () => {
    setError(undefined);
    setGenerating(true);
    try {
      const slots = await generatePlan(
        data.allergies,
        data.portions,
        data.weekStart,
      );
      setData((d) => ({ ...d, slots }));
    } catch (e: any) {
      setError(
        `${e?.message ?? "Không lập được tuần."} Kế hoạch hiện tại được giữ nguyên.`,
      ); // AI lỗi -> giữ plan cũ
    } finally {
      setGenerating(false);
    }
  };

  const save = () => {
    if (generating) return;
    if (filled === 0) {
      setSaveError(
        'Chưa chọn bữa nào. Hãy chạm vào một ô hoặc bấm "Tự động lập tuần".',
      );
      return;
    }
    setSaveError(undefined);
    setData((d) => ({
      ...d,
      savedPlan: {
        weekStart: d.weekStart,
        slots: { ...d.slots },
        portions: d.portions,
        version: (d.savedPlan?.version ?? 0) + 1,
      },
    }));
    onSaved();
  };

  const setSlot = (d: number, m: number, recipeId?: string) => {
    setData((cur) => {
      const slots = { ...cur.slots };
      if (recipeId) slots[slotKey(d, m)] = recipeId;
      else delete slots[slotKey(d, m)];
      return { ...cur, slots };
    });
    setPicking(undefined);
  };

  return (
    <>
      <Text style={s.h1}>Thực đơn tuần</Text>
      <Text style={[s.muted, { marginBottom: space.md }]}>
        Tuần {weekLabel(data.weekStart)} • {data.portions} người • 3 bữa × 7
        ngày. Chạm vào ô để đổi món.
      </Text>

      <Card>
        <PortionStepper
          value={data.portions}
          min={MIN_PORTIONS}
          max={MAX_PORTIONS}
          onChange={(n) => setData((d) => ({ ...d, portions: n }))}
          label="Số người ăn"
        />
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: space.sm,
            marginTop: space.md,
          }}
        >
          <Pill
            tone={filled === SLOT_COUNT ? "ok" : "warn"}
            text={`Đã chọn ${filled}/${SLOT_COUNT} bữa`}
          />
          <Pill
            tone={dirty ? "warn" : "ok"}
            text={
              saved
                ? dirty
                  ? `Chưa lưu thay đổi (đang là bản ${saved.version})`
                  : `Đã lưu bản ${saved.version}`
                : "Chưa lưu"
            }
          />
        </View>
        <Button
          label="Tự động lập tuần"
          variant="secondary"
          loading={generating}
          onPress={autoPlan}
          style={{ marginTop: space.md }}
        />
        {generating ? (
          <Text style={[s.muted, { marginTop: space.sm }]}>
            Đang lập 21 bữa…
          </Text>
        ) : null}
      </Card>

      {recipeError ? (
        <Card>
          <Pill tone="err" text={recipeError} />
          <Button label="Tải lại công thức" onPress={retry} />
        </Card>
      ) : null}
      {loadingRecipes ? <Text style={s.muted}>Đang tải công thức…</Text> : null}
      {error ? (
        <View style={{ marginBottom: space.md }}>
          <Pill tone="err" text={error} />
        </View>
      ) : null}
      {filled > 0 && filled < SLOT_COUNT ? (
        <View
          style={{
            backgroundColor: colors.warnBg,
            borderRadius: 12,
            padding: space.md,
            marginBottom: space.md,
          }}
        >
          <Text style={{ color: colors.warnText }}>
            Còn {SLOT_COUNT - filled} ô trống. Danh sách đi chợ chỉ tính các bữa
            đã chọn.
          </Text>
        </View>
      ) : null}

      {DAYS.map((day, d) => (
        <Card key={day}>
          <Text style={[s.h2, { marginBottom: space.xs }]}>{day}</Text>
          {MEALS.map((meal, m) => {
            const id = data.slots[slotKey(d, m)];
            const title = titleOf(id);
            return (
              <Pressable
                key={meal}
                accessibilityRole="button"
                accessibilityLabel={`${day} bữa ${meal}: ${title ?? "chưa chọn"}. Chạm để đổi món`}
                onPress={() => setPicking({ d, m })}
                style={{
                  minHeight: 48,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: space.sm,
                  borderTopWidth: m === 0 ? 0 : 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={[s.muted, { width: 52 }]}>{meal}</Text>
                <Text
                  style={[
                    s.body,
                    {
                      flex: 1,
                      color: title ? colors.text : colors.primary,
                      fontFamily: title ? font.medium : font.semi,
                    },
                  ]}
                >
                  {title ?? (id ? "Món chưa tải được" : "+ Chọn món")}
                </Text>
              </Pressable>
            );
          })}
        </Card>
      ))}

      {saveError ? (
        <View style={{ marginBottom: space.md }}>
          <Pill tone="err" text={saveError} />
        </View>
      ) : null}
      <Button label="Lưu & tạo đi chợ" onPress={save} disabled={generating} />

      <Sheet
        visible={!!picking}
        title={picking ? `${DAYS[picking.d]} • bữa ${MEALS[picking.m]}` : ""}
        onClose={() => setPicking(undefined)}
      >
        {pool.length === 0 ? (
          <Text style={s.body}>Chưa có công thức nào để chọn.</Text>
        ) : (
          pool.map((r) => {
            const current = picking
              ? data.slots[slotKey(picking.d, picking.m)] === r.id
              : false;
            return (
              <Pressable
                key={r.id}
                accessibilityRole="button"
                accessibilityState={{ selected: current }}
                accessibilityLabel={`Chọn ${r.title}`}
                onPress={() => picking && setSlot(picking.d, picking.m, r.id)}
                style={{
                  minHeight: 56,
                  justifyContent: "center",
                  borderBottomWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={[s.body, { fontFamily: font.semi }]}>
                  {current ? "✓ " : ""}
                  {r.title}
                </Text>
                <Text style={s.muted}>
                  {r.minutes} phút • công thức cho {r.servings} người
                </Text>
              </Pressable>
            );
          })
        )}
        {picking && data.slots[slotKey(picking.d, picking.m)] ? (
          <Button
            label="Xóa món khỏi ô này"
            variant="secondary"
            onPress={() => setSlot(picking.d, picking.m)}
            style={{ marginTop: space.md }}
          />
        ) : null}
        <Button
          label="Hủy"
          variant="secondary"
          onPress={() => setPicking(undefined)}
          style={{ marginTop: space.sm }}
        />
      </Sheet>
    </>
  );
}
