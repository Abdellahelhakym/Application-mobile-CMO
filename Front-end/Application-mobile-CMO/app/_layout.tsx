import { Ionicons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";
import { Href, Stack, router } from "expo-router";
import { useEffect } from "react";
import { Platform, TouchableOpacity } from "react-native";

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
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
  }, []);

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

      <Stack.Screen
        name="ForgotPasswordScreen"
        options={{
          headerShown: true,
          title: "Mot de passe oublié",
          headerLeft: () => <BackButton fallbackRoute="/loginCan" />,
        }}
      />
    </Stack>
  );
}