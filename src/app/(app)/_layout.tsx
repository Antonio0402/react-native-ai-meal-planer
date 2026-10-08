import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Pressable,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { Button, ConfirmDialog, s } from "../../components/ui";
import {
  AppDataProvider,
  useAppDataContext,
} from "../../providers/AppDataProvider";
import { useAuth } from "../../providers/AuthProvider";
import { colors, space } from "../../theme";

function AppShell() {
  const { ready, saving, syncError, conflict, retrySync, discardDraft } = useAppDataContext();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const { session, signOut, signOutError } = useAuth();
  const metadata = session?.user.user_metadata;
  const avatarUrl = [metadata?.avatar_url, metadata?.picture].find(
    (value): value is string => typeof value === "string" && /^https?:\/\//i.test(value),
  );
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string>();

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: space.lg,
          paddingBottom: space.sm,
        }}
      >
        <Text style={[s.h2, { color: colors.primary }]}>FRESHPLAN</Text>
        <Pressable
          onPress={signOut}
          disabled={saving || !!syncError || !ready}
          accessibilityState={{ disabled: saving || !!syncError || !ready }}
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
          style={{
            minHeight: 48,
            minWidth: 48,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: space.sm,
          }}
        >
          {avatarUrl && avatarUrl !== failedAvatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
              resizeMode="cover"
              accessible={false}
              onError={() => setFailedAvatarUrl(avatarUrl)}
            />
          ) : null}
          <View accessible={false} style={{ width: 24, height: 24 }}>
            <View
              style={{
                position: "absolute", left: 2, top: 3,
                width: 10, height: 18, borderWidth: 2,
                borderColor: colors.primary, borderRightWidth: 0,
              }}
            />
            <View
              style={{
                position: "absolute", left: 9, top: 11,
                width: 13, height: 2, backgroundColor: colors.primary,
              }}
            />
            <View
              style={{
                position: "absolute", right: 2, top: 8,
                width: 8, height: 8, borderTopWidth: 2, borderRightWidth: 2,
                borderColor: colors.primary, transform: [{ rotate: "45deg" }],
              }}
            />
          </View>
        </Pressable>
      </View>
      {signOutError ? (
        <Text
          accessibilityRole="alert"
          style={{ padding: space.lg, color: colors.errText }}
        >
          {signOutError}
        </Text>
      ) : null}
      {saving ? <Text style={[s.muted, { paddingHorizontal: space.lg }]} accessibilityLiveRegion="polite">Đang lưu thay đổi…</Text> : null}
      {syncError ? (
        <View style={{ padding: space.lg }}>
          <Text style={{ color: colors.errText }} accessibilityRole="alert">{syncError}</Text>
          {conflict ? (
            <Button label="Bỏ bản nháp và tải dữ liệu máy chủ" onPress={() => setConfirmDiscard(true)} />
          ) : <Button label="Thử lại" onPress={retrySync} />}
        </View>
      ) : null}
      <ConfirmDialog
        visible={confirmDiscard}
        title="Bỏ bản nháp chưa lưu?"
        message="Các thay đổi chưa đồng bộ trên máy này sẽ bị xóa. App sẽ tải lại dữ liệu từ máy chủ."
        confirmLabel="Bỏ bản nháp"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => { setConfirmDiscard(false); void discardDraft(); }}
      />
      {ready ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="scan" />
        </Stack>
      ) : (
        <View style={{ padding: space.xxl, alignItems: "center" }}>
          {!syncError ? <ActivityIndicator color={colors.primary} /> : null}
          <Text style={[s.muted, { marginTop: space.sm }]}>
            {syncError ? 'Chưa tải được dữ liệu tài khoản.' : 'Đang tải dữ liệu…'}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

export default function AppLayout() {
  const { session } = useAuth();
  if (!session) return null;

  return (
    <AppDataProvider key={session.user.id} userId={session.user.id}>
      <AppShell />
    </AppDataProvider>
  );
}
