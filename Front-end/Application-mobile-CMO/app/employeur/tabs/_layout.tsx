import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Tabs } from "expo-router";
import React, { useCallback, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getPsaudo } from "@/app/employeur/services/token_id";

export default function Layout() {
  const insets = useSafeAreaInsets();
  
  // 🎯 Détection du mode 3 boutons UNIQUEMENT sur Android
  const isAndroid3Button = Platform.OS === "android" && insets.bottom >= 24;

  const [userName, setUserName] = useState("Utilisateur");

  const refreshPseudo = useCallback(() => {
    const pseudo = getPsaudo();
    setUserName(pseudo || "Utilisateur");
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshPseudo();
    }, [refreshPseudo])
  );

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,

        // 🔵 Fond bleu du Header
        headerStyle: {
          backgroundColor: "#122F78",
        },

        // ⚪ Titres en BLANC sur iOS
        ...(Platform.OS === "ios" && {
          headerTitle: () => null,
          headerLeft: () => (
            <Text style={{ fontSize: 18, color: "#ffffff", fontWeight: "600", marginLeft: 15 }}>
              {getTitle(route.name)}
            </Text>
          ),
        }),

        // ⚪ Titres en BLANC sur Android/Web
        ...(Platform.OS !== "ios" && {
          headerTitleAlign: "left",
          headerTitleStyle: {
            fontSize: 18,
            color: "#ffffff",
            fontWeight: "600",
          },
        }),

        // ⚪ Nom utilisateur en BLANC
        headerRight: () => (
          <View style={{ marginRight: 15, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: "#ffffff", marginRight: 10, fontWeight: "500" }}>
              {userName}
            </Text>
          </View>
        ),

        // ⚪ Configuration de la Barre de Navigation
        tabBarStyle: {
          backgroundColor: "#fff",
          
          // 🛠️ Hauteur de 70 partout, SAUF sur Android en mode 3 boutons
          height: isAndroid3Button ? 65 + insets.bottom : 70,
          
          // 🛠️ Padding de 10 partout (parfait pour iPhone), ajusté uniquement pour les 3 boutons Android
          paddingBottom: isAndroid3Button ? insets.bottom - 4 : 10,
            
          borderTopWidth: 1,
          borderTopColor: "#e7edf7",
          elevation: 6,
          shadowColor: "#0f1b3d",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -3,
        },

        tabBarActiveTintColor: "#2b5bbb",
        tabBarInactiveTintColor: "#7a8ab8",
      })}
    >
      <Tabs.Screen name="EmployerDashboard" options={{ title: "Accueil", tabBarIcon: ({ color }) => <Feather name="home" size={20} color={color} /> }} />
      <Tabs.Screen name="MyOffersScreen" options={{ title: "Commandes", tabBarIcon: ({ color }) => <Feather name="shopping-bag" size={20} color={color} /> }} />
      <Tabs.Screen name="EmployeurCandidatures" options={{ title: "Candidatures", tabBarIcon: ({ color }) => <Feather name="users" size={20} color={color} /> }} />
 
      <Tabs.Screen name="CVDatabaseScreen" options={{ title: "Park CV", tabBarIcon: ({ color }) => <Feather name="user-plus" size={20} color={color} /> }} />
      <Tabs.Screen name="EmployerProfileScreen" options={{ title: "Plus", tabBarIcon: ({ color }) => <Feather name="menu" size={20} color={color} /> }} />
    </Tabs>
  );
}

function getTitle(name: string) {
  switch (name) {
    case "EmployerDashboard": return "Accueil";
    case "MyOffersScreen": return "Commandes";
    case "EmployeurCandidatures": return "Candidatures";
    case "CVDatabaseScreen": return "Candidats";
    case "EmployerProfileScreen": return "Profil";
    default: return "";
  }
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 12,
  },
});