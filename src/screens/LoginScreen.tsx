import React, { useState } from "react";
import { Text, View } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Button, Card, Field, s } from "../components/ui";
import { supabase } from "../services/supabase";
import { colors, space } from "../theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<"email" | "google" | "apple" | null>(
    null,
  );
  const [error, setError] = useState<string>();

  const submit = async () => {
    if (!supabase || pending) return;
    if (!email.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setError(undefined);
    setPending("email");
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể đăng nhập. Vui lòng thử lại.",
      );
    } finally {
      setPending(null);
    }
  };

  const signInWithSocial = async (provider: "google" | "apple") => {
    if (!supabase || pending) return;
    setError(undefined);
    setPending(provider);
    try {
      const redirectTo = makeRedirectUri({ scheme: "freshplan" });
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (authError) throw authError;
      if (!data.url) throw new Error("Không tạo được liên kết đăng nhập.");

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );
      if (result.type !== "success") return;

      const callback = new URL(result.url);
      const providerError =
        callback.searchParams.get("error_description") ??
        callback.searchParams.get("error");
      if (providerError) throw new Error(providerError);

      const code = callback.searchParams.get("code");
      if (!code) throw new Error("Không nhận được mã xác thực.");
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể đăng nhập. Vui lòng thử lại.",
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: space.lg,
        maxWidth: 440,
        width: "100%",
        alignSelf: "center",
      }}
    >
      <Text style={[s.h1, { color: colors.primary }]}>FRESHPLAN</Text>
      <Text style={[s.muted, { marginBottom: space.xl }]}>
        Từ ảnh tủ lạnh đến bữa ăn mỗi ngày
      </Text>
      <Card>
        <Text style={[s.h2, { marginBottom: space.md }]}>Đăng nhập</Text>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="ban@example.com"
        />
        <Field
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          placeholder="••••••••"
          onSubmitEditing={submit}
        />
        <Button
          label="Đăng nhập"
          onPress={submit}
          loading={pending === "email"}
          disabled={!!pending}
        />
        <Text
          style={[s.muted, { textAlign: "center", marginVertical: space.md }]}
        >
          Hoặc tiếp tục với
        </Text>
        <Button
          label="Google"
          variant="secondary"
          onPress={() => signInWithSocial("google")}
          loading={pending === "google"}
          disabled={!!pending}
        />
        <Button
          label="Apple"
          variant="secondary"
          onPress={() => signInWithSocial("apple")}
          loading={pending === "apple"}
          disabled={!!pending}
          style={{ marginTop: space.sm }}
        />
        {error ? (
          <Text
            accessibilityRole="alert"
            style={[s.error, { marginTop: space.md }]}
          >
            {error}
          </Text>
        ) : null}
      </Card>
    </View>
  );
}
