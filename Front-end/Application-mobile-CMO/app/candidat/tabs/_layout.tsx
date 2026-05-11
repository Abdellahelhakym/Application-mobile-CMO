import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { View, Text, Image, Platform, StyleSheet } from "react-native";
import {
 
  getUserPseudo,
} from "@/app/candidat/services/DashboardScreen";

const TITLES: Record<string, string> = {
  DashboardScreen: "Accueil",
  JobsScreen: "Offres",
  CandidateLandingScreen: "Candidatures",
  CVScreen: "CV",
  ProfileScreen: "Profil",
};

export default function Layout() {

  async function test_pseudo() {
    const pseudo = await getUserPseudo();
   return pseudo;
  }

  const user = {
    name: test_pseudo() || "Utilisateur",
    avatar: "https://i.pravatar.cc/100",
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,

        // ✅ Sur iOS : on vide le titre natif et on le met dans headerLeft
        // ✅ Sur Android/Web : comportement normal
        ...(Platform.OS === "ios" && {
          headerTitle: () => null,
          headerLeft: () => (
            <Text
              style={{
                fontSize: 18,
                color: "#1b2d5a",
                fontWeight: "600",
                marginLeft: 15,
              }}
            >
              {TITLES[route.name] ?? ""}
            </Text>
          ),
        }),

        // Sur Android et Web : titre aligné à gauche normalement
        ...(Platform.OS !== "ios" && {
          headerTitleAlign: "left",
          headerTitleStyle: {
            fontSize: 18,
            color: "#1b2d5a",
            fontWeight: "600",
          },
        }),

        // 👤 HEADER RIGHT
        headerRight: () => (
          <View
            style={{
              marginRight: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: "#1b2d5a",
                marginRight: 10,
                fontWeight: "500",
              }}
            >
              {user.name}
            </Text>

            <Image
              source={{ uri: user.avatar }}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: "#e7eeff",
              }}
            />
          </View>
        ),

        headerStyle: {
          backgroundColor: "#fff",
        },

        headerShadowVisible: false,

        tabBarStyle: {
          backgroundColor: "#fff",
          height: 70,
          borderTopWidth: 1,
          borderTopColor: "#e7edf7",
          elevation: 6,
          shadowColor: "#0f1b3d",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
        },

        tabBarActiveTintColor: "#2b5bbb",
        tabBarInactiveTintColor: "#7a8ab8",

        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -3,
        },
      })}
    >

      <Tabs.Screen
        name="DashboardScreen"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />


      <Tabs.Screen
        name="CandidateLandingScreen"
        options={{
          title: "Candidatures",
          tabBarLabel: ({ color }) => (
            <Text style={[styles.tabLabel, { color }]} numberOfLines={2}>
              Candidatures
            </Text>
          ),
          tabBarIcon: ({ color }) => (
            <Feather name="send" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="CVScreen"
        options={{
          title: "Informations",
          tabBarIcon: ({ color }) => (
            <Feather name="file-text" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 12,
  },
});