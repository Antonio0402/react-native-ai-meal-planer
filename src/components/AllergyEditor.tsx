import React, { useState } from "react";
import { Text, View } from "react-native";
import { Button, Chip, Field, s } from "./ui";
import {
  COMMON_ALLERGIES,
  MAX_ALLERGIES,
  MAX_ALLERGY_LENGTH,
  normalizeAllergy,
} from "../services/meal-utils";
import { space } from "../theme";

/**
 * Chọn nhanh nhóm dị ứng phổ biến hoặc nhập tự do.
 * Giá trị được lưu vào AppData.allergies và gửi kèm mọi yêu cầu tạo công thức.
 */
export default function AllergyEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>();
  const selected = value.map(normalizeAllergy);
  const custom = value.filter(
    (a) => !COMMON_ALLERGIES.includes(normalizeAllergy(a)),
  );

  const toggle = (allergy: string) => {
    const key = normalizeAllergy(allergy);
    if (selected.includes(key)) {
      onChange(value.filter((a) => normalizeAllergy(a) !== key));
      return;
    }
    if (value.length >= MAX_ALLERGIES) {
      setError(`Tối đa ${MAX_ALLERGIES} mục dị ứng.`);
      return;
    }
    setError(undefined);
    onChange([...value, key]);
  };

  const addCustom = () => {
    const key = normalizeAllergy(draft);
    if (!key) {
      setError("Nhập tên thực phẩm gây dị ứng.");
      return;
    }
    if (key.length > MAX_ALLERGY_LENGTH) {
      setError(`Tối đa ${MAX_ALLERGY_LENGTH} ký tự.`);
      return;
    }
    if (selected.includes(key)) {
      setError("Mục này đã có trong danh sách.");
      return;
    }
    if (value.length >= MAX_ALLERGIES) {
      setError(`Tối đa ${MAX_ALLERGIES} mục dị ứng.`);
      return;
    }
    setError(undefined);
    setDraft("");
    onChange([...value, key]);
  };

  return (
    <View style={{ marginTop: space.md }}>
      <Text style={s.label}>Dị ứng thực phẩm</Text>
      <View style={[s.row, { marginBottom: space.sm }]}>
        {COMMON_ALLERGIES.map((a) => (
          <Chip
            key={a}
            label={a}
            selected={selected.includes(a)}
            onPress={() => toggle(a)}
            accessibilityLabel={`Dị ứng ${a}`}
          />
        ))}
        {custom.map((a) => (
          <Chip
            key={a}
            label={`${a} ✕`}
            selected
            onPress={() => toggle(a)}
            accessibilityLabel={`Bỏ dị ứng ${a}`}
          />
        ))}
      </View>
      <Field
        label="Thêm dị ứng khác"
        value={draft}
        placeholder="Ví dụ: tôm, kiwi"
        maxLength={MAX_ALLERGY_LENGTH}
        returnKeyType="done"
        onChangeText={(t) => {
          setDraft(t);
          setError(undefined);
        }}
        onSubmitEditing={addCustom}
        error={error}
        helper="AI sẽ loại các nguyên liệu này khi tạo công thức. Gợi ý không thay thế tư vấn y tế."
      />
      <Button label="Thêm dị ứng" variant="secondary" onPress={addCustom} />
    </View>
  );
}
