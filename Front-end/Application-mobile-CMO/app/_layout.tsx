import { Ionicons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";
import { Href, Stack, router } from "expo-router";
import { useCallback, useEffect } from "react";
import { AppState, Platform, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const isThreeButtonNav = Platform.OS === "android" && insets.bottom >= 24;

  const applyAndroidNavBar = useCallback(async (useThreeButtonNav: boolean) => {
    if (useThreeButtonNav) {
      await NavigationBar.setVisibilityAsync("visible");
      await NavigationBar.setBehaviorAsync("inset-swipe");
      await NavigationBar.setPositionAsync("relative");
      await NavigationBar.setBackgroundColorAsync("#ffffff");
      return;
    }

    await NavigationBar.setVisibilityAsync("hidden");
    await NavigationBar.setBehaviorAsync("overlay-swipe");
    await NavigationBar.setPositionAsync("absolute");
    await NavigationBar.setBackgroundColorAsync("#00000000");
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      applyAndroidNavBar(isThreeButtonNav);

      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          applyAndroidNavBar(isThreeButtonNav);
        }
      });

      return () => subscription.remove();
    }
  }, [applyAndroidNavBar, isThreeButtonNav]);

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