import { getDashboardData ,getPsaudo} from "@/app/candidat/services/DashboardScreen";

import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fixUtf8Encoding } from "@/app/candidat/services/decode"; 

const TITLES: Record<string, string> = {
  DashboardScreen: "Accueil",
  JobsScreen: "Offres",
  CandidateLandingScreen: "Candidatures",
  CVScreen: "CV",
  ProfileScreen: "Profil",
};

export default function Layout() {
  const [userName, setUserName] = useState("Utilisateur");
  const insets = useSafeAreaInsets();
  
  // 🎯 Détection du mode 3 boutons sur Android uniquement
  const isAndroid3Button = Platform.OS === "android" && insets.bottom >= 24;

  useEffect(() => {
    let isMounted = true;

    const loadUserName = async () => {
      try {
        const cached = await getPsaudo();

        console.log("PSEUDO RESPONSE:", cached);
        console.log("PSEUDO TYPE:", typeof cached?.pseudo);

        if (
          isMounted &&
          cached &&
          typeof cached.pseudo === "string"
        ) {
          // 👈 Utilisation de fixUtf8Encoding pour corriger les accents du pseudo
          setUserName(fixUtf8Encoding(cached.pseudo));
        }

        const data = await getDashboardData();
        const fetched = data?.user?.nom;

        if (
          isMounted &&
          typeof fetched === "string"
        ) {
          // 👈 Utilisation de fixUtf8Encoding pour le nom venant du dashboard
          setUserName(fixUtf8Encoding(fetched));
        }
      } catch (error) {
        console.error("Erreur loadUserName:", error);
      }
    };

    loadUserName();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,

        // 🔵 Fond bleu du Header
        headerStyle: {
          backgroundColor: "#122F78",
        },

        // ⚪ Titres et Texte du Header en BLANC sur iOS
        ...(Platform.OS === "ios" && {
          headerTitle: () => null,
          headerLeft: () => (
            <Text style={{ fontSize: 18, color: "#ffffff", fontWeight: "600", marginLeft: 15 }}>
              {TITLES[route.name] ?? ""}
            </Text>
          ),
        }),

        // ⚪ Titres en BLANC sur Android
        ...(Platform.OS !== "ios" && {
          headerTitleAlign: "left",
          headerTitleStyle: {
            fontSize: 18,
            color: "#ffffff",
            fontWeight: "600",
          },
        }),

        headerRight: () => (
          <View style={{ marginRight: 15, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: "#ffffff", marginRight: 10, fontWeight: "500" }}>
              {userName}
            </Text>
          </View>
        ),

        headerShadowVisible: false,

        // ⚪ Configuration de la Barre de Navigation
        tabBarStyle: {
          backgroundColor: "#fff",
          
          // 📱 Hauteur fixe de 70 pour iPhone (pas de grand vide) et Android classique
          height: Platform.OS === "ios" 
            ? 70 
            : (isAndroid3Button ? 65 + insets.bottom : 70),
          
          // 📱 Alignement ajusté des icônes (sans l'espace safe area d'iOS)
          paddingBottom: Platform.OS === "ios" 
            ? 12 
            : (isAndroid3Button ? insets.bottom - 4 : 10),
            
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
        tabBarActiveTintColor: "#2b5bbb",
        tabBarInactiveTintColor: "#7a8ab8",
        tabBarLabelStyle: { fontSize: 11, marginTop: -3 },
      })}
    >
      <Tabs.Screen name="DashboardScreen" options={{ title: "Accueil", tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} /> }} />
      <Tabs.Screen 
        name="CandidateLandingScreen" 
        options={{ 
            title: "Candidatures", 
            tabBarLabel: ({ color }) => <Text style={[styles.tabLabel, { color }]} numberOfLines={2}>Candidatures</Text>,
            tabBarIcon: ({ color }) => <Feather name="send" size={22} color={color} /> 
        }} 
      />
      <Tabs.Screen name="CVScreen" options={{ title: "Informations", tabBarIcon: ({ color }) => <Feather name="file-text" size={22} color={color} /> }} />
      <Tabs.Screen name="ProfileScreen" options={{ title: "Profil", tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: { fontSize: 10, textAlign: "center", lineHeight: 12 },
});