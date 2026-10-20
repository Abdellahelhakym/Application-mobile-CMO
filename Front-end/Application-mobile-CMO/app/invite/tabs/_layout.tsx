import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout() {
  const insets = useSafeAreaInsets();

  // Détection du mode 3 boutons sur Android
  const isAndroid3Button =
    Platform.OS === "android" && insets.bottom >= 24;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,

        // Header bleu
        headerStyle: {
          backgroundColor: "#122F78",
        },

        // Titres iOS
        ...(Platform.OS === "ios" && {
          headerTitle: () => null,
          headerLeft: () => (
            <Text style={styles.headerTitle}>
              {getTitle(route.name)}
            </Text>
          ),
        }),

        // Titres Android et Web
        ...(Platform.OS !== "ios" && {
          headerTitleAlign: "left",
          headerTitleStyle: {
            fontSize: 18,
            color: "#ffffff",
            fontWeight: "600",
          },
        }),

        // Profil par défaut, sans API
        headerRight: () => (
          <View style={styles.headerRight}>
            <View style={styles.profileImagePlaceholder}>
              <MaterialCommunityIcons
                name="account-tie"
                size={30}
                color="#2b5bbb"
              />
            </View>

            <Text style={styles.userName}>Invité</Text>
          </View>
        ),

        // Barre de navigation
        tabBarStyle: {
          backgroundColor: "#fff",
          height: isAndroid3Button
            ? 65 + insets.bottom
            : 70,
          paddingBottom: isAndroid3Button
            ? Math.max(0, insets.bottom - 4)
            : 10,
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
      <Tabs.Screen
        name="OffresScreen"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="NosServices"
        options={{
          title: "Nos Services",
          tabBarIcon: ({ color }) => (
            <Feather
              name="shopping-bag"
              size={20}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function getTitle(name: string) {
  switch (name) {
    case "OffresScreen":
      return "Accueil";
    case "NosServices":
      return "Nos Services";
    default:
      return "";
  }
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 15,
  },

  headerRight: {
    marginRight: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  profileImagePlaceholder: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },

  userName: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "500",
  },
});