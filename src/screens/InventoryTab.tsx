import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, ConfirmDialog, Field, Pill, PortionStepper, Sheet, s } from '../components/ui';
import { MAX_PORTIONS, MIN_PORTIONS } from '../services/api';
import { AppData, Ingredient } from '../types';
import { colors, space, font } from '../theme';

const fmt = (i: Ingredient) => (i.quantity === undefined ? 'chưa nhập lượng' : `${i.quantity} ${i.unit}`);

/** DD/MM/YYYY hợp lệ (ngày thật). Rỗng = hợp lệ vì hạn dùng là tùy chọn. */
export function validExpiry(v: string): boolean {
  if (!v.trim()) return true;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v.trim());
  if (!m) return false;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
}

export default function InventoryTab({ data, setData, onScan }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; onScan: () => void }) {
  const [editing, setEditing] = useState<Ingredient>();
  const [draft, setDraft] = useState({ name: '', qty: '', unit: '', expiry: '' });
  const [showErr, setShowErr] = useState(false);
  const [deleting, setDeleting] = useState<Ingredient>();
  const [clearing, setClearing] = useState(false);

  const openEdit = (i: Ingredient) => {
    setEditing(i);
    setDraft({ name: i.name, qty: i.quantity === undefined ? '' : String(i.quantity), unit: i.unit, expiry: i.expiry ?? '' });
    setShowErr(false);
  };

  const qtyNum = draft.qty.trim() === '' ? undefined : Number(draft.qty.replace(',', '.'));
  const qtyBad = qtyNum !== undefined && (isNaN(qtyNum) || qtyNum < 0);
  const errors = {
    name: !draft.name.trim() ? 'Cần nhập tên nguyên liệu' : undefined,
    qty: qtyBad ? 'Số lượng phải là số không âm' : undefined,
    unit: !draft.unit.trim() ? 'Cần nhập đơn vị (g, ml, quả…)' : undefined,
    expiry: !validExpiry(draft.expiry) ? 'Nhập theo dạng DD/MM/YYYY, ví dụ 25/12/2026' : undefined,
  };

  const saveEdit = () => {
    if (Object.values(errors).some(Boolean)) {
      setShowErr(true);
      return;
    }
    const next: Ingredient = { ...editing!, name: draft.name.trim(), quantity: qtyNum, unit: draft.unit.trim(), expiry: draft.expiry.trim() || undefined };
    setData((d) => ({ ...d, inventory: d.inventory.map((x) => (x.id === next.id ? next : x)) }));
    setEditing(undefined);
  };

  const hasStock = data.inventory.length > 0;

  return (
    <>
      <Text style={s.h1}>Xin chào, hôm nay nấu gì?</Text>

      <Button label="Chụp nguyên liệu" onPress={onScan} style={{ marginTop: space.md }} />

      <Card style={{ marginTop: space.md }}>
        <Text style={[s.h2, { marginBottom: space.sm }]}>Hồ sơ của bạn</Text>
        {hasStock ? (
          <>
            <Text style={[s.muted, { marginBottom: space.sm }]}>AI đã nhận diện {data.inventory.length} nguyên liệu.</Text>
            <PortionStepper value={data.portions} min={MIN_PORTIONS} max={MAX_PORTIONS} onChange={(n) => setData((d) => ({ ...d, portions: n }))} />
          </>
        ) : (
          <Text style={s.muted}>Chưa có dữ liệu. Chụp ảnh nguyên liệu để AI nhận diện.</Text>
        )}
      </Card>

      <Text style={[s.muted, { marginVertical: space.md }]}>Kho của bạn</Text>
      {data.inventory.length === 0 ? (
        <Card>
          <Text style={s.body}>Kho đang trống. Chụp ảnh nguyên liệu để AI nhận diện tên và số lượng.</Text>
        </Card>
      ) : (
        data.inventory.map((i) => (
          <Card key={i.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm }}>
              <Text style={[s.body, { flex: 1, fontFamily: font.semi }]}>{i.name}</Text>
              <Pill tone={i.quantity === undefined ? 'warn' : 'ok'} text={i.quantity === undefined ? 'Cần kiểm tra' : 'Đã xác nhận'} />
            </View>
            <Text style={s.body}>{fmt(i)}</Text>
            {i.expiry ? <Text style={s.muted}>Hạn dùng: {i.expiry}</Text> : null}
            <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Sửa ${i.name}`} onPress={() => openEdit(i)} style={{ minHeight: 48, justifyContent: 'center', paddingRight: space.lg }}>
                <Text style={{ color: colors.primary, fontFamily: font.semi }}>Sửa</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Xóa ${i.name}`} onPress={() => setDeleting(i)} style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: space.lg }}>
                <Text style={{ color: colors.errText, fontFamily: font.semi }}>Xóa</Text>
              </Pressable>
            </View>
          </Card>
        ))
      )}
      {hasStock && <Button label="Xóa toàn bộ kho" variant="secondary" onPress={() => setClearing(true)} style={{ marginTop: space.sm }} />}

      <Sheet visible={!!editing} title="Sửa nguyên liệu" onClose={() => setEditing(undefined)}>
        <Field label="Tên" value={draft.name} onChangeText={(t) => setDraft((x) => ({ ...x, name: t }))} error={showErr ? errors.name : undefined} />
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Field label="Số lượng" keyboardType="numeric" value={draft.qty} placeholder="?" onChangeText={(t) => setDraft((x) => ({ ...x, qty: t }))} error={showErr ? errors.qty : undefined} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Đơn vị" value={draft.unit} onChangeText={(t) => setDraft((x) => ({ ...x, unit: t }))} error={showErr ? errors.unit : undefined} />
          </View>
        </View>
        <Field label="Hạn dùng (tùy chọn)" value={draft.expiry} placeholder="DD/MM/YYYY" onChangeText={(t) => setDraft((x) => ({ ...x, expiry: t }))} error={showErr ? errors.expiry : undefined} helper="Nhập thủ công; app không tự đoán độ tươi từ ảnh." />
        <Button label="Lưu thay đổi" onPress={saveEdit} />
        <Button label="Hủy" variant="secondary" onPress={() => setEditing(undefined)} style={{ marginTop: space.sm }} />
      </Sheet>

      <ConfirmDialog
        visible={!!deleting}
        title="Xóa nguyên liệu?"
        message={`Xóa "${deleting?.name ?? ''}" khỏi kho. Thao tác này không hoàn tác được.`}
        confirmLabel="Xóa"
        onCancel={() => setDeleting(undefined)}
        onConfirm={() => {
          const id = deleting!.id;
          setData((d) => ({ ...d, inventory: d.inventory.filter((x) => x.id !== id) }));
          setDeleting(undefined);
        }}
      />
      <ConfirmDialog
        visible={clearing}
        title="Xóa toàn bộ kho?"
        message="Toàn bộ nguyên liệu trong kho sẽ bị xóa. Kế hoạch tuần vẫn được giữ."
        confirmLabel="Xóa toàn bộ"
        onCancel={() => setClearing(false)}
        onConfirm={() => {
          setData((d) => ({ ...d, inventory: [] }));
          setClearing(false);
        }}
      />
    </>
  );
}
