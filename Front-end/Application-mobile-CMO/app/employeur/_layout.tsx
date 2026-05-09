import { Stack } from "expo-router";

export default function EmployeurLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen
        name="autre/EmployerDocumentsScreen"
        options={{ title: "Documents", headerShown: true }}
      />
      <Stack.Screen
        name="autre/EmployerInfoScreen"
        options={{ title: "Informations", headerShown: true }}
      />
      <Stack.Screen
        name="autre/SubscriptionScreen"
        options={{ title: "Abonnement", headerShown: true }}
      />
    </Stack>
  );
}
