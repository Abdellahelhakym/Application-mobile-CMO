import { Stack } from "expo-router";

export default function EmployeurLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen
        name="autre/FavoritesScreen"
        options={{ title: "Favoris", headerShown: true }}
      />
      <Stack.Screen
        name="autre/AttestationsScreen"
        options={{ title: "Attestations", headerShown: true }}
      />
      

    </Stack>
  );
}
