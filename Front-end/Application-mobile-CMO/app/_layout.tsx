import { Ionicons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";
import { Href, Stack, router } from "expo-router";
import { useEffect } from "react";
import { Platform, TouchableOpacity } from "react-native";

function BackButton({ fallbackRoute }: { fallbackRoute: Href }) {
  return (
    <TouchableOpacity
      onPress={() =>
        router.canGoBack() ? router.back() : router.replace(fallbackRoute)
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
      const configureSystemBars = async () => {
        try {
          // Rend la barre de navigation système visible et opaque
          await NavigationBar.setVisibilityAsync("visible");
          
          // 'relative' force la barre système à être un bloc à part entière (pas de superposition)
          await NavigationBar.setPositionAsync("relative");
          
          // Couleur de fond blanche
          await NavigationBar.setBackgroundColorAsync("#ffffff");
          
          // Force les icônes système (carré, rond, triangle) à devenir sombres/noires
          await NavigationBar.setButtonStyleAsync("dark");
        } catch (error) {
          console.warn("Erreur NavigationBar Android:", error);
        }
      };

      configureSystemBars();
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