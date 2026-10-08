import React from "react";
import { ScrollView } from "react-native";
import { useIsFocused } from "expo-router";
import { space } from "../theme";

export default function ScreenScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const focused = useIsFocused();
  if (!focused) return null;

  return (
    <ScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        padding: space.lg,
        paddingTop: space.sm,
        paddingBottom: space.xxl,
        maxWidth: 720,
        width: "100%",
        alignSelf: "center",
      }}
    >
      {children}
    </ScrollView>
  );
}
