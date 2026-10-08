import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, space, font } from '../theme';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const off = disabled || loading;
  const filled = variant !== 'secondary';
  const fg = filled ? colors.onPrimary : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [
        s.btn,
        variant === 'primary' && s.btnPrimary,
        variant === 'secondary' && s.btnSecondary,
        variant === 'destructive' && s.btnDestructive,
        pressed && !off && { opacity: 0.85 },
        off && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} style={{ marginRight: space.sm }} /> : null}
      <Text style={[s.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Field(props: TextInputProps & { label: string; error?: string; helper?: string }) {
  const { label, error, helper, style, ...rest } = props;
  return (
    <View style={{ marginBottom: space.md }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        accessibilityLabel={label}
        style={[s.input, error ? { borderColor: colors.errText } : null, style]}
        {...rest}
      />
      {error ? <Text style={s.error}>{error}</Text> : helper ? <Text style={[s.muted, { marginTop: space.xs }]}>{helper}</Text> : null}
    </View>
  );
}

export function Pill({ text, tone = 'ok' }: { text: string; tone?: 'ok' | 'warn' | 'err' }) {
  const map = {
    ok: { bg: colors.okBg, fg: colors.primary },
    warn: { bg: colors.warnBg, fg: colors.warnText },
    err: { bg: colors.errBg, fg: colors.errText },
  }[tone];
  return (
    <View style={[s.pill, { backgroundColor: map.bg }]}>
      <Text style={{ color: map.fg, fontSize: 13, fontFamily: font.semi }}>{text}</Text>
    </View>
  );
}

/** Chip chọn được; trạng thái chọn thể hiện bằng dấu ✓ chứ không chỉ bằng màu. */
export function Chip({ label, selected, onPress, accessibilityLabel }: { label: string; selected?: boolean; onPress: () => void; accessibilityLabel?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[s.chip, selected && s.chipOn]}
    >
      <Text style={{ color: selected ? colors.onPrimary : colors.primary, fontFamily: font.semi }}>{selected ? '✓ ' : ''}{label}</Text>
    </Pressable>
  );
}

export function PortionStepper({ value, onChange, min = 1, max = 12, label = 'Số khẩu phần' }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label?: string }) {
  const btn = (text: string, aLabel: string, next: number, off: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={aLabel}
      accessibilityState={{ disabled: off }}
      onPress={off ? undefined : () => onChange(next)}
      style={[s.stepBtn, off && { opacity: 0.4 }]}
    >
      <Text style={{ fontSize: 22, fontFamily: font.semi, color: colors.primary }}>{text}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={[s.body, { flex: 1 }]}>{label}</Text>
      {btn('−', 'Giảm khẩu phần', value - 1, value <= min)}
      <Text accessibilityLabel={`${value} khẩu phần`} style={[s.h2, { minWidth: 44, textAlign: 'center' }]}>{value}</Text>
      {btn('+', 'Tăng khẩu phần', value + 1, value >= max)}
    </View>
  );
}

/** Khối chờ tĩnh (không animation, tôn trọng reduce motion) + chữ trạng thái. */
export function Skeleton({ height = 96 }: { height?: number }) {
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height, backgroundColor: colors.border, borderRadius: radius.card, marginBottom: space.md, opacity: 0.6 }} />;
}

export function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
        <Pressable accessibilityLabel="Đóng" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.sheet}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.md }}>
            <Text style={[s.h2, { flex: 1 }]}>{title}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Đóng" onPress={onClose} style={{ minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, color: colors.muted }}>✕</Text>
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: space.lg }}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ConfirmDialog({ visible, title, message, confirmLabel, onConfirm, onCancel }: { visible: boolean; title: string; message: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onCancel}>
      <View style={{ flex: 1, justifyContent: 'center', padding: space.lg, backgroundColor: colors.overlay }}>
        <View accessibilityViewIsModal style={[s.card, { marginBottom: 0, maxWidth: 440, width: '100%', alignSelf: 'center' }]}>
          <Text style={s.h2}>{title}</Text>
          <Text style={[s.body, { marginVertical: space.md }]}>{message}</Text>
          <Button label={confirmLabel} variant="destructive" onPress={onConfirm} />
          <Button label="Hủy" variant="secondary" onPress={onCancel} style={{ marginTop: space.sm }} />
        </View>
      </View>
    </Modal>
  );
}

export const s = StyleSheet.create({
  btn: {
    minHeight: 48,
    paddingHorizontal: space.lg,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary },
  btnDestructive: { backgroundColor: colors.errText },
  btnText: { fontSize: 16, fontFamily: font.semi },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    marginBottom: space.md,
  },
  label: { fontSize: 14, lineHeight: 20, fontFamily: font.medium, color: colors.text, marginBottom: space.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: space.md,
    fontFamily: font.regular,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  error: { fontFamily: font.regular, color: colors.errText, fontSize: 14, marginTop: space.xs },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  chip: {
    minHeight: 48,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.primary },
  stepBtn: { width: 48, height: 48, borderRadius: radius.input, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    padding: space.lg,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  h1: { fontSize: 28, lineHeight: 36, fontFamily: font.head, color: colors.text },
  h2: { fontSize: 22, lineHeight: 28, fontFamily: font.head, color: colors.text },
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: colors.text },
  muted: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
});
