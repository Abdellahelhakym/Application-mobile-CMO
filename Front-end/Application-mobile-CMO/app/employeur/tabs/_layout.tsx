import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { View, Text, Image, Platform, StyleSheet } from "react-native";

  

export default function Layout() {

  
 
  const user = {
    name: "Abdellah El Hakym",
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
                  {getTitle(route.name)}
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

        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -3,
        },

        tabBarActiveTintColor: "#2b5bbb",
        tabBarInactiveTintColor: "#7a8ab8",
      })}
    >
     {/* ACCUEIL */}
<Tabs.Screen
  name="EmployerDashboard"
  options={{
    title: "Accueil", 
    

    tabBarIcon: ({ color, focused }) => (
      <View >
        <Feather name="home" size={20} color={color} />
      </View>
    ),
  }}
/>

<Tabs.Screen
  name="MyOffersScreen"
  options={{
    title: "Commandes", 
    

    tabBarIcon: ({ color, focused }) => (
      <View >
       <Feather name="shopping-bag" size={20} color={color} />
      </View>
    ),
  }}
/>

   <Tabs.Screen
  name="CreateOfferScreen"
  options={{
    title: "Ajouter ", 


    tabBarIcon: ({ color, focused }) => (
      <View>
       <Feather name="plus" size={20} color={color} />
      </View>
    ),
  }}
/>

<Tabs.Screen
  name="CVDatabaseScreen"
  options={{
    title: "Candidats", 
    tabBarLabel: ({ color }) => (
      <Text style={[styles.tabLabel, { color }]} numberOfLines={2}>
        Candidats
      </Text>
    ),
    tabBarIcon: ({ color }) => (
      <View>
       <Feather name="user-plus" size={20} color={color} />
      </View>
    ),
  }}
/>
<Tabs.Screen
  name="EmployerProfileScreen"
  options={{
    title: "Profil", 
  

    tabBarIcon: ({ color, focused }) => (
      <View>
       <Feather name="user" size={20} color={color} />
      </View>
    ),
  }}
/>
   

    
    
    </Tabs>
  );

}


/* 🔥 TITRE PAR PAGE */
function getTitle(name: string) {
  switch (name) {
    case "EmployerDashboard":
      return "Accueil";
    case "MyOffersScreen":
      return "Commandes";
    case "EmployerInfoScreen":
      return "Add";
    case "CVDatabaseScreen":
      return "Candidats";
    case "EmployerProfileScreen":
      return "Profil";
    default:
      return "";
  }
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 12,
  },
});