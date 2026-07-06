import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

export default function EmployeurLayout() {
  const insets = useSafeAreaInsets();

  // 🎯 Détection du mode 3 boutons sur Android (même logique que le layout des tabs)
  const isAndroid3Button = Platform.OS === "android" && insets.bottom >= 24;

  // Espace bas à appliquer sur les écrans "autre/*" (hors tabs)
  const bottomSpace = Platform.OS === "ios"
    ? insets.bottom
    : (isAndroid3Button ? insets.bottom : 0);

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

      <Stack.Screen
        name="autre/EmployerDocumentsScreen"
        options={{ title: "Documents", headerShown: true }}
      />
      <Stack.Screen
        name="autre/EmployerInfoScreen"
        options={{ title: "Information de l'Entreprise", headerShown: true }}
      />
      <Stack.Screen
        name="autre/SubscriptionScreen"
        options={{ title: "Abonnement", headerShown: true }}
      />
      <Stack.Screen
        name="autre/PasswordChange"
        options={{ title: "Changer le mot de passe", headerShown: true }}
      />
      <Stack.Screen
        name="autre/CreateOfferScreen"
        options={{ title: "Créer une commande", headerShown: true }}
      />
      <Stack.Screen
        name="autre/Chat"
        options={{ title: "Messagerie", headerShown: true }}
      />
      <Stack.Screen
        name="autre/Notification"
        options={{ title: "Notifications", headerShown: true }}
      />
    </Stack>
  );
}