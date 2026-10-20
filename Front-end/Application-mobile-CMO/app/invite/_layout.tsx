import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

export default function EmployeurLayout() {
  const insets = useSafeAreaInsets();

  // 🎯 Détection du mode 3 boutons sur Android (même logique que le layout des tabs)
  const isAndroid3Button = Platform.OS === "android" && insets.bottom >= 24;

  // Espace bas à appliquer sur les écrans "autre/*" (hors tabs)
  const bottomSpace =
    Platform.OS === "ios"
      ? insets.bottom
      : isAndroid3Button
        ? insets.bottom
        : 0;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#fff",
          paddingBottom: bottomSpace,
        },
      }}
    >
      {/* 👇 tabs garde son propre espacement, on ne touche pas à contentStyle ici */}
      <Stack.Screen
        name="tabs"
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: "#fff", paddingBottom: 0 },
        }}
      />

     
    </Stack>
  );
}