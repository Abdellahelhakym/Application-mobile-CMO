import {
  getDashboardData,
  getPsaudo,
} from "@/app/candidat/services/DashboardScreen";
import { getImage } from "../services/document";
import url from "@/app/services/url";

import { fixUtf8Encoding } from "@/app/candidat/services/decode";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TITLES: Record<string, string> = {
  DashboardScreen: "Accueil",
  JobsScreen: "Offres",
  CandidateLandingScreen: "Candidatures",
  Cv: "Informations",
  ProfileScreen: "Profil",
};

export default function Layout() {
  const [userName, setUserName] = useState("Utilisateur");
  const [profileImage, setProfileImage] = useState("");
  const [hasImageError, setHasImageError] = useState(false);
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === "android" ? insets.bottom : 0;

  useEffect(() => {
    let isMounted = true;

    const loadUserName = async () => {
      try {
        // =========================
        // Récupération du pseudo
        // =========================
        const cached = await getPsaudo();

        console.log("PSEUDO RESPONSE:", cached);
        console.log(
          "PSEUDO TYPE:",
          typeof cached?.pseudo
        );

        if (
          isMounted &&
          cached &&
          typeof cached.pseudo === "string"
        ) {
          setUserName(
            fixUtf8Encoding(cached.pseudo)
          );
        }

        // =========================
        // Récupération du nom
        // =========================
        const data = await getDashboardData();
        const fetched = data?.user?.nom;

        if (
          isMounted &&
          typeof fetched === "string"
        ) {
          setUserName(
            fixUtf8Encoding(fetched)
          );
        }

        // =========================
        // Récupération de l'image de profil
        // =========================
        try {
          const imageData = await getImage();
          const imageUrl = imageData?.image
            ? url() + "documents/photos_candidats/" + imageData.image
            : '';
          
          if (isMounted && imageUrl) {
            setProfileImage(imageUrl);
            setHasImageError(false);
          }
        } catch (imageError) {
          console.error("Erreur loadImage:", imageError);
        }
      } catch (error) {
        console.error(
          "Erreur loadUserName:",
          error
        );
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
        // =========================
        // HEADER
        // =========================
        headerShown: true,

        headerStyle: {
          backgroundColor: "#122F78",
        
        },

        // =========================
        // HEADER iOS
        // =========================
        ...(Platform.OS === "ios" && {
          headerTitle: () => null,

          headerLeft: () => (
            <Text style={styles.headerTitle}>
              {TITLES[route.name] ?? ""}
            </Text>
          ),
        }),

        // =========================
        // HEADER ANDROID
        // =========================
        ...(Platform.OS !== "ios" && {
          headerTitleAlign: "left",

          headerTitleStyle: {
            fontSize: 18,
            color: "#ffffff",
            fontWeight: "600",
          },
        }),

        // =========================
        // NOM UTILISATEUR + IMAGE
        // =========================
        headerRight: () => (
          <View style={styles.headerRight}>
            {profileImage && !hasImageError ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                onError={() => setHasImageError(true)}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Feather
                  name="user"
                  size={16}
                  color="#ffffff"
                />
              </View>
            )}
            <Text style={styles.userName}>
              {userName}
            </Text>
          </View>
        ),

        headerShadowVisible: false,

        // =========================
        // TAB BAR
        // =========================
        tabBarStyle: {
          backgroundColor: "#ffffff",

          height:
            Platform.OS === "ios"
              ? 70
              : 70 + bottomInset,

          paddingBottom:
            Platform.OS === "ios"
              ? 12
              : 10 + bottomInset,

          borderTopWidth: 1,
          borderTopColor: "#e7edf7",

          elevation: 6,

          shadowColor: "#0f1b3d",
          shadowOpacity: 0.08,
          shadowRadius: 8,

          shadowOffset: {
            width: 0,
            height: -2,
          },

          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },

        tabBarActiveTintColor: "#2b5bbb",
        tabBarInactiveTintColor: "#7a8ab8",

        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -3,
        },
      })}
    >

      {/* =========================
          ACCUEIL
          ========================= */}
      <Tabs.Screen
        name="DashboardScreen"
        options={{
          title: "Accueil",
          tabBarLabel: "Accueil",

          tabBarIcon: ({ color }) => (
            <Feather
              name="home"
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* =========================
          CANDIDATURES
          ========================= */}
      <Tabs.Screen
        name="CandidateLandingScreen"
        options={{
          title: "Candidatures",

          tabBarLabel: ({ color }) => (
            <Text
              style={[
                styles.tabLabel,
                { color },
              ]}
              numberOfLines={2}
            >
              Candidatures
            </Text>
          ),

          tabBarIcon: ({ color }) => (
            <Feather
              name="send"
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* =========================
          CV / INFORMATIONS
          ========================= */}
        <Tabs.Screen
          name="Cv"
        options={{
          title: "Informations",
          tabBarLabel: "Informations",

          tabBarIcon: ({ color }) => (
            <Feather
              name="file-text"
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* =========================
          PROFIL
          ========================= */}
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profil",
          tabBarLabel: "Profil",

          tabBarIcon: ({ color }) => (
            <Feather
              name="user"
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* =========================
          CACHER JobsScreen
          ========================= */}
      <Tabs.Screen
        name="JobsScreen"
        options={{
          href: null,
        }}
      />

    </Tabs>
  );
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

  profileImage: {
    width: 35,
    height: 35,
    marginBottom: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },

  profileImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
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

  tabLabel: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 12,
  },
});