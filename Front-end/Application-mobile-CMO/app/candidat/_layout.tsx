import { Stack, router, Href } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function BackButton({ fallbackRoute }: { fallbackRoute: Href }) {
  return (
    <TouchableOpacity
      onPress={() =>
        router.canGoBack()
          ? router.back()
          : router.replace(fallbackRoute)
      }
      style={{ marginLeft: 8 }}
    >
      <Ionicons name="chevron-back" size={24} color="#1b2d5a" />
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="loginCan" />
      <Stack.Screen name="loginEmp" />
      <Stack.Screen name="candidat/tabs" />
      <Stack.Screen name="employeur" />

      <Stack.Screen
        name="RegisterCandidateScreen"
        options={{
          headerShown: true,
          title: "Inscription Candidat",
          headerLeft: () => <BackButton fallbackRoute="/loginCan" />,
        }}
      />

      <Stack.Screen
        name="RegisterEmployerScreen"
        options={{
          headerShown: true,
          title: "Inscription Employeur",
          headerLeft: () => <BackButton fallbackRoute="/loginEmp" />,
        }}
      />
    </Stack>
  );
}