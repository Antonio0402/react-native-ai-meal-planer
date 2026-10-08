import { Tabs } from "expo-router";
import { colors, font } from "../../../theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 56 },
        tabBarLabelStyle: { fontFamily: font.semi, fontSize: 14 },
      }}
    >
      <Tabs.Screen name="inventory" options={{ title: "Kho" }} />
      <Tabs.Screen name="recipes" options={{ title: "Công thức" }} />
      <Tabs.Screen name="week" options={{ title: "Tuần" }} />
      <Tabs.Screen name="shopping" options={{ title: "Đi chợ" }} />
    </Tabs>
  );
}
