import React, { useRef, useState } from "react";
import { ActivityIndicator, Image, Platform, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Button, Card, ConfirmDialog, Field, Pill, s } from "../components/ui";
import { DetectError, detectIngredients } from "../services/api";
import { Ingredient } from "../types";
import { colors, radius, space } from "../theme";
import { validExpiry } from "./InventoryTab";

type Step = "capture" | "analyzing" | "confirm" | "error";
type ErrInfo = {
  message: string;
  kind: "blurry" | "timeout" | "unknown" | "permission";
};

export default function ScanFlow({
  onConfirm,
  onCancel,
  landing,
  onSkip,
}: {
  onConfirm: (items: Ingredient[], scanId: string) => void;
  onCancel: () => void;
  landing?: boolean; // màn đầu sau đăng nhập: chỉ chụp
  onSkip?: () => void; // chỉ hiện ở màn đầu khi đã có kho lưu sẵn
}) {
  const [step, setStep] = useState<Step>("capture");
  const [uri, setUri] = useState<string>();
  const [items, setItems] = useState<Ingredient[]>([]);
  const [error, setError] = useState<ErrInfo>();
  const [showErrors, setShowErrors] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [scanId] = useState(() => `scan-${Date.now()}`); // một lần quét = một id, xác nhận lặp không lưu trùng
  const submitted = useRef(false);
  const dirty = useRef(false);
  const imageAsset = useRef<ImagePicker.ImagePickerAsset | undefined>(
    undefined,
  );

  const analyze = async (
    imageUri: string,
    asset?: ImagePicker.ImagePickerAsset,
  ) => {
    if (asset) imageAsset.current = asset;
    setUri(imageUri);
    setError(undefined);
    setStep("analyzing");
    try {
      setItems(await detectIngredients(imageUri, imageAsset.current));
      dirty.current = false;
      setStep("confirm");
    } catch (e: any) {
      setError({
        kind: e instanceof DetectError ? e.kind : "unknown",
        message: e?.message ?? "Phân tích thất bại, thử lại.",
      });
      setStep("error");
    }
  };

  const takePhoto = async () => {
    if (Platform.OS !== "web") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setError({
          kind: "permission",
          message:
            "Chưa có quyền camera. Hãy chọn ảnh từ thư viện hoặc nhập tay.",
        });
        return;
      }
    }
    // Trên web, launchCameraAsync mở webcam/hộp chọn file của trình duyệt.
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      exif: false,
    });
    if (!res.canceled) analyze(res.assets[0].uri, res.assets[0]);
  };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      exif: false,
    });
    if (!res.canceled) analyze(res.assets[0].uri, res.assets[0]);
  };

  const manual = () => {
    setItems([
      { id: `m${Date.now()}`, name: "", quantity: undefined, unit: "g" },
    ]);
    setUri(undefined);
    setError(undefined);
    setStep("confirm");
  };

  const update = (id: string, patch: Partial<Ingredient>) => {
    dirty.current = true;
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const invalid = (i: Ingredient) =>
    i.quantity === undefined ||
    !i.name.trim() ||
    !i.unit.trim() ||
    !validExpiry(i.expiry ?? "");

  const confirm = () => {
    if (submitted.current) return; // chống bấm đúp
    if (items.length === 0 || items.some(invalid)) {
      setShowErrors(true);
      return;
    }
    submitted.current = true;
    onConfirm(
      items.map((i) => ({
        ...i,
        name: i.name.trim(),
        unit: i.unit.trim(),
        expiry: i.expiry?.trim() || undefined,
      })),
      scanId,
    );
  };

  const cancel = () =>
    step === "confirm" && dirty.current ? setDiscard(true) : onCancel();

  if (step === "analyzing")
    return (
      <View
        style={{ alignItems: "center", padding: space.xxl }}
        accessibilityLiveRegion="polite"
      >
        {uri ? (
          <Image
            source={{ uri }}
            accessibilityLabel="Ảnh nguyên liệu đang phân tích"
            style={{
              width: "100%",
              aspectRatio: 4 / 3,
              borderRadius: radius.card,
              marginBottom: space.lg,
            }}
          />
        ) : null}
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[s.body, { marginTop: space.md }]}>
          Đang phân tích ảnh…
        </Text>
      </View>
    );

  if (step === "error")
    return (
      <View>
        <Text style={s.h2}>Chưa nhận diện được</Text>
        {uri ? (
          <Image
            source={{ uri }}
            accessibilityLabel="Ảnh bạn đã chọn"
            style={{
              width: "100%",
              aspectRatio: 4 / 3,
              borderRadius: radius.card,
              marginVertical: space.md,
            }}
          />
        ) : null}
        <View style={{ marginBottom: space.md }}>
          <Pill tone="err" text={error?.message ?? "Có lỗi xảy ra."} />
        </View>
        {error?.kind !== "blurry" && uri ? (
          <Button label="Thử lại" onPress={() => analyze(uri)} />
        ) : null}
        <Button
          label="Chụp lại"
          variant={error?.kind === "blurry" ? "primary" : "secondary"}
          onPress={takePhoto}
          style={{ marginTop: space.sm }}
        />
        <Button
          label="Chọn từ thư viện"
          variant="secondary"
          onPress={pickPhoto}
          style={{ marginTop: space.sm }}
        />
        <Button
          label="Nhập tay"
          variant="secondary"
          onPress={manual}
          style={{ marginTop: space.sm }}
        />
        <Button
          label="Hủy"
          variant="secondary"
          onPress={onCancel}
          style={{ marginTop: space.sm }}
        />
      </View>
    );

  if (step === "confirm")
    return (
      <View>
        <Text style={s.h2}>AI gợi ý — hãy kiểm tra</Text>
        <Text style={[s.muted, { marginBottom: space.md }]}>
          Chỉ nguyên liệu bạn xác nhận mới được dùng để gợi ý món. AI chỉ gợi ý
          tên; lượng do bạn nhập.
        </Text>
        {uri ? (
          <Image
            source={{ uri }}
            accessibilityLabel="Ảnh nguyên liệu"
            style={{
              width: "100%",
              aspectRatio: 4 / 3,
              borderRadius: radius.card,
              marginBottom: space.md,
            }}
          />
        ) : null}
        {items.map((i) => (
          <Card key={i.id}>
            <View style={{ marginBottom: space.sm }}>
              <Pill
                tone={i.quantity === undefined ? "warn" : "ok"}
                text={
                  i.quantity === undefined ? "Cần nhập lượng" : "Cần kiểm tra"
                }
              />
            </View>
            <Field
              label="Tên"
              value={i.name}
              onChangeText={(t) => update(i.id, { name: t })}
              error={
                showErrors && !i.name.trim()
                  ? "Cần nhập tên nguyên liệu"
                  : undefined
              }
            />
            <View style={{ flexDirection: "row", gap: space.md }}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Số lượng"
                  keyboardType="numeric"
                  value={i.quantity === undefined ? "" : String(i.quantity)}
                  placeholder="?"
                  onChangeText={(t) => {
                    const n = Number(t.replace(",", "."));
                    update(i.id, {
                      quantity:
                        t.trim() === "" || isNaN(n) || n < 0 ? undefined : n,
                    });
                  }}
                  error={
                    showErrors && i.quantity === undefined
                      ? "Cần nhập số lượng"
                      : undefined
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Đơn vị"
                  value={i.unit}
                  onChangeText={(t) => update(i.id, { unit: t })}
                  error={
                    showErrors && !i.unit.trim() ? "Cần nhập đơn vị" : undefined
                  }
                />
              </View>
            </View>
            <Field
              label="Hạn dùng (tùy chọn)"
              value={i.expiry ?? ""}
              placeholder="DD/MM/YYYY"
              onChangeText={(t) => update(i.id, { expiry: t })}
              error={
                showErrors && !validExpiry(i.expiry ?? "")
                  ? "Nhập theo dạng DD/MM/YYYY"
                  : undefined
              }
            />
            <Button
              label="Xóa"
              variant="secondary"
              onPress={() => {
                dirty.current = true;
                setItems((a) => a.filter((x) => x.id !== i.id));
              }}
            />
          </Card>
        ))}
        <Button
          label="+ Thêm nguyên liệu"
          variant="secondary"
          onPress={() => {
            dirty.current = true;
            setItems((a) => [
              ...a,
              {
                id: `m${Date.now()}`,
                name: "",
                quantity: undefined,
                unit: "g",
              },
            ]);
          }}
          style={{ marginBottom: space.md }}
        />
        {showErrors && items.some(invalid) ? (
          <View style={{ marginBottom: space.md }}>
            <Pill
              tone="err"
              text="Còn mục chưa hợp lệ — xem các ô báo lỗi phía trên."
            />
          </View>
        ) : null}
        <Button
          label="Xác nhận & lưu vào kho"
          onPress={confirm}
          disabled={items.length === 0}
        />
        <Button
          label="Hủy"
          variant="secondary"
          onPress={cancel}
          style={{ marginTop: space.sm }}
        />
        <ConfirmDialog
          visible={discard}
          title="Bỏ thay đổi?"
          message="Các chỉnh sửa bạn vừa nhập sẽ không được lưu vào kho."
          confirmLabel="Bỏ thay đổi"
          onCancel={() => setDiscard(false)}
          onConfirm={() => {
            setDiscard(false);
            onCancel();
          }}
        />
      </View>
    );

  return (
    <View>
      <Text style={landing ? s.h1 : s.h2}>
        {landing ? "Chụp nguyên liệu của bạn" : "Đưa nguyên liệu vào khung"}
      </Text>
      {landing ? (
        <Text style={[s.muted, { marginTop: space.xs }]}>
          Chụp ảnh tủ lạnh hoặc bàn bếp. FreshPlan nhận diện nguyên liệu, bạn
          xác nhận, rồi app gợi ý món và lập thực đơn tuần.
        </Text>
      ) : null}
      <View
        accessibilityLabel="Vùng xem trước ảnh, tỉ lệ 4:3"
        style={{
          width: "100%",
          aspectRatio: 4 / 3,
          marginVertical: space.md,
          borderRadius: radius.card,
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surface,
        }}
      >
        <Text style={s.muted}>[ Vùng xem trước ảnh 4:3 ]</Text>
      </View>
      <Text style={[s.muted, { marginBottom: space.md }]}>
        Chụp rõ nhãn, tránh ánh sáng yếu. Ảnh chỉ được gửi đến AI khi bạn đồng
        ý.
      </Text>
      {error ? (
        <View style={{ marginBottom: space.md }}>
          <Pill tone="err" text={error.message} />
        </View>
      ) : null}
      <Button label="Chụp ảnh" onPress={takePhoto} />
      <Button
        label="Chọn từ thư viện"
        variant="secondary"
        onPress={pickPhoto}
        style={{ marginTop: space.sm }}
      />
      <Button
        label="Nhập tay"
        variant="secondary"
        onPress={manual}
        style={{ marginTop: space.sm }}
      />
      {landing ? (
        onSkip ? (
          <Button
            label="Xem kho đã lưu"
            variant="secondary"
            onPress={onSkip}
            style={{ marginTop: space.sm }}
          />
        ) : null
      ) : (
        <Button
          label="Hủy"
          variant="secondary"
          onPress={onCancel}
          style={{ marginTop: space.sm }}
        />
      )}
    </View>
  );
}
