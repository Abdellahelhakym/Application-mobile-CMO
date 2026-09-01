import { Ionicons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";
import * as Updates from "expo-updates";
import { Href, Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [isReady, setIsReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Configuration de la barre Android
    if (Platform.OS === "android") {
      const configureSystemBars = async () => {
        try {
          await NavigationBar.setVisibilityAsync("visible");
          await NavigationBar.setPositionAsync("relative");
          await NavigationBar.setBackgroundColorAsync("#ffffff");
          await NavigationBar.setButtonStyleAsync("dark");
        } catch (error) {
          console.warn("Erreur NavigationBar Android:", error);
        }
      };

      configureSystemBars();
    }

    // Vérification de la mise à jour
    const checkForUpdate = async () => {
      try {
        if (__DEV__) {
          setIsReady(true);
          return;
        }

        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          setUpdateAvailable(true);
        } else {
          setIsReady(true);
        }
      } catch (error) {
        console.warn("Erreur lors de la vérification de la mise à jour:", error);
        setIsReady(true);
      }
    };

    checkForUpdate();
  }, []);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);

      // Télécharge la nouvelle version
      await Updates.fetchUpdateAsync();

      // Redémarre l'application avec la nouvelle version
      await Updates.reloadAsync();
    } catch (error) {
      console.warn("Erreur pendant la mise à jour:", error);
      setIsUpdating(false);
    }
  };

  // Écran de chargement initial
  if (!isReady && !updateAvailable) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2b5bbb" />
      </View>
    );
  }

  return (
    <>
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

      {/* Popup de mise à jour obligatoire */}
      <Modal
        visible={updateAvailable}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          // Bloque la touche retour sur Android
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 400,
              backgroundColor: "#ffffff",
              borderRadius: 24,
              padding: 28,
              alignItems: "center",
              elevation: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
            }}
          >
            {/* Icône Ionicons */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#eef4ff",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="cloud-download-outline" size={36} color="#2b5bbb" />
            </View>

            {/* Titre */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#1b2d5a",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Mise à jour requise
            </Text>

            {/* Description obligatoire */}
            <Text
              style={{
                fontSize: 14,
                color: "#666666",
                textAlign: "center",
                lineHeight: 20,
                marginBottom: 24,
              }}
            >
              Une mise à jour importante est requise pour continuer à utiliser l'application.
            </Text>

            {/* Bouton unique de mise à jour */}
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={isUpdating}
              activeOpacity={0.8}
              style={{
                width: "100%",
                height: 50,
                borderRadius: 12,
                backgroundColor: isUpdating ? "#9bb5e8" : "#2b5bbb",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isUpdating ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 16,
                      fontWeight: "600",
                      marginLeft: 10,
                    }}
                  >
                    Mise à jour en cours...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="reload-sharp"
                    size={20}
                    color="#ffffff"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Mettre à jour l'application
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}