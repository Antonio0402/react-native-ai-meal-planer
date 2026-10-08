import React, { useEffect } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text } from "react-native";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Lora_600SemiBold, useFonts } from "@expo-google-fonts/lora";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { supabase } from "../services/supabase";
import { colors } from "../theme";

SplashScreen.preventAutoHideAsync();
if (Platform.OS === "web") WebBrowser.maybeCompleteAuthSession();

function Routes() {
  const { session, ready } = useAuth();

  if (!supabase) {
    return (
      <Text style={styles.message}>
        Thiếu cấu hình Supabase. Hãy đặt EXPO_PUBLIC_SUPABASE_URL và
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY trong .env.local.
      </Text>
    );
  }
  if (!ready)
    return <ActivityIndicator style={styles.loading} color={colors.primary} />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Lora_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null; // lỗi nạp font -> vẫn chạy với font hệ thống

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1 },
  message: { padding: 20, color: colors.errText },
});
