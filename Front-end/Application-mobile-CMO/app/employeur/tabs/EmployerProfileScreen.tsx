import React from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Database,
  CreditCard,
  FileText,
  Settings,
  Lock,
  LogOut,
  Trash2,
} from "lucide-react-native";

export default function EmployerProfileScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 🏢 ENTREPRISE */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.logo}>
              <Building2 size={40} color="#2b5bbb" />
            </View>

            <View>
              <Text style={styles.company}>SOUF Tech Solutions</Text>
              <Text style={styles.plan}>Plan PRO RECRUT</Text>
            </View>
          </View>
        </View>

        {/* 📄 INFOS */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Mail size={20} color="#2b5bbb" />
            <Text style={styles.value}>contact@souftech.com</Text>
          </View>

          <View style={styles.infoRow}>
            <Phone size={20} color="#2b5bbb" />
            <Text style={styles.value}>07 87 35 19 23</Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={20} color="#2b5bbb" />
            <Text style={styles.value}>Casablanca</Text>
          </View>
        </View>

        {/* ⚙️ MENU */}
        <View style={styles.card}>

         
          <TouchableOpacity style={styles.menuItem} onPress={()=>{router.push("/employeur/autre/SubscriptionScreen")}}>
            <CreditCard size={20} color="#2b5bbb" />
            <Text style={styles.menuText}>Abonnement</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={()=>{router.push("/employeur/autre/EmployerDocumentsScreen")}}>
            <FileText size={20} color="#2b5bbb" />
            <Text style={styles.menuText}>Mes documents</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={()=>{router.push("/employeur/autre/EmployerInfoScreen")}}>
            <Settings size={20} color="#2b5bbb" />
            <Text style={styles.menuText}>Mes informations</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Lock size={20} color="#2b5bbb" />
            <Text style={styles.menuText}>Mot de passe</Text>
          </TouchableOpacity>

        </View>

        {/* 🚪 LOGOUT */}
        <TouchableOpacity style={styles.logout} onPress={() => router.replace("/loginEmp")}>
          <LogOut size={20} color="#1b2d5a" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        {/* ❌ DELETE */}
        <TouchableOpacity style={styles.delete}>
          <Trash2 size={20} color="red" />
          <Text style={styles.deleteText}>Supprimer le compte</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },

  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  logo: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: "#eef3ff",
    justifyContent: "center",
    alignItems: "center",
  },

  company: {
    fontSize: 16,
    color: "#1b2d5a",
  },

  plan: {
    fontSize: 12,
    color: "#7a8ab8",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  value: {
    color: "#1b2d5a",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  menuText: {
    color: "#1b2d5a",
  },

  logout: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
  },

  logoutText: {
    color: "#1b2d5a",
  },

  delete: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
  },

  deleteText: {
    color: "red",
  },
});