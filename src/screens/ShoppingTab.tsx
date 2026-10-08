import React, { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button, Card, Chip, Pill, s } from "../components/ui";
import { buildShopping, fmtQty } from "../services/api";
import { AppData, ShoppingItem } from "../types";
import { useApiQuery } from "../hooks/useApiQuery";
import { space } from "../theme";

export default function ShoppingTab({
  data,
  setData,
  onGoWeek,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  onGoWeek: () => void;
}) {
  const [group, setGroup] = useState<string>();
  const {
    value: items,
    loading,
    error: loadError,
    retry,
  } = useApiQuery<ShoppingItem[]>(
    useCallback(
      (signal) => buildShopping(data.savedPlan, data.inventory, signal),
      [data.savedPlan, data.inventory],
    ),
    [],
  );
  const groups = useMemo(
    () => [...new Set(items.map((i) => i.group))],
    [items],
  );
  const activeGroup = group && groups.includes(group) ? group : undefined; // nhóm biến mất khi đổi món -> về "Tất cả"
  const shown = activeGroup
    ? items.filter((i) => i.group === activeGroup)
    : items;
  const done = items.filter((i) => data.checked[i.key]).length;
  const allShownChecked =
    shown.length > 0 && shown.every((i) => data.checked[i.key]);

  const toggle = (key: string) =>
    setData((d) => ({
      ...d,
      checked: { ...d.checked, [key]: !d.checked[key] },
    }));
  const markShown = () =>
    setData((d) => {
      const checked = { ...d.checked };
      shown.forEach((i) => {
        checked[i.key] = !allShownChecked;
      });
      return { ...d, checked };
    });

  return (
    <>
      <Text style={s.h1}>Đi chợ</Text>
      <Text style={[s.muted, { marginBottom: space.md }]}>
        {data.savedPlan
          ? `Cần mua cho tuần này (theo kế hoạch bản ${data.savedPlan.version}, ${data.savedPlan.portions} người).`
          : "Gộp phần còn thiếu từ kế hoạch tuần đã lưu."}
      </Text>

      {!data.savedPlan ? (
        <Card>
          <Text style={s.body}>
            {
              'Chưa có danh sách. Lập thực đơn ở tab Tuần rồi bấm "Lưu & tạo đi chợ".'
            }
          </Text>
          <Button
            label="Mở tab Tuần"
            onPress={onGoWeek}
            style={{ marginTop: space.sm }}
          />
        </Card>
      ) : loadError ? (
        <Card>
          <Pill tone="err" text={loadError} />
          <Button label="Thử lại" onPress={retry} />
        </Card>
      ) : loading ? (
        <Text style={s.muted}>Đang tính danh sách đi chợ…</Text>
      ) : items.length === 0 ? (
        <Card>
          <Text style={s.body}>
            Kho đã đủ cho kế hoạch này — không cần mua gì thêm.
          </Text>
        </Card>
      ) : (
        <>
          <Card>
            <Text style={s.h2}>
              Đã mua {done}/{items.length}
            </Text>
            <Text style={[s.muted, { marginTop: space.xs }]}>
              Đánh dấu đã mua không tự cộng vào kho. Sau khi mua, hãy chụp hoặc
              nhập lại nguyên liệu.
            </Text>
            {groups.length > 1 ? (
              <View style={[s.row, { marginTop: space.md }]}>
                <Chip
                  label="Tất cả"
                  selected={!activeGroup}
                  onPress={() => setGroup(undefined)}
                />
                {groups.map((g) => (
                  <Chip
                    key={g}
                    label={g}
                    selected={activeGroup === g}
                    onPress={() => setGroup(g)}
                  />
                ))}
              </View>
            ) : null}
          </Card>

          {shown.map((it) => (
            <Pressable
              key={it.key}
              onPress={() => toggle(it.key)}
              accessibilityRole="checkbox"
              accessibilityLabel={`${it.name}, ${fmtQty(it.toBuy)} ${it.unit}`}
              accessibilityState={{ checked: !!data.checked[it.key] }}
            >
              <Card
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  minHeight: 48,
                }}
              >
                <Text style={{ fontSize: 22, marginRight: space.md }}>
                  {data.checked[it.key] ? "☑" : "☐"}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      s.body,
                      {
                        textDecorationLine: data.checked[it.key]
                          ? "line-through"
                          : "none",
                      },
                    ]}
                  >
                    {it.name}
                  </Text>
                  {it.check ? (
                    <View style={{ marginTop: space.xs }}>
                      <Pill tone="warn" text="Kiểm tra lượng tồn" />
                    </View>
                  ) : null}
                </View>
                <Text style={s.muted}>
                  {it.toBuy > 0 ? `${fmtQty(it.toBuy)} ${it.unit}` : "—"}
                </Text>
              </Card>
            </Pressable>
          ))}
          <Button
            label={allShownChecked ? "Bỏ đánh dấu" : "Đánh dấu đã mua"}
            variant="secondary"
            onPress={markShown}
          />
        </>
      )}
    </>
  );
}
