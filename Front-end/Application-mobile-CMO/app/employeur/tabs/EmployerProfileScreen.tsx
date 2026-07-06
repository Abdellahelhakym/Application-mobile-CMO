import React, { useState, useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import {
  View,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl, // 👈 Ajout de l'import RefreshControl
} from "react-native";

import {
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Settings,
  Lock,
  LogOut,
  Trash2,
} from "lucide-react-native";
import { getEmployerInfo } from "@/app/employeur/services/EmployerInfoScreen";
import { getImage } from '@/app/employeur/services/documents';
import url from "@/app/services/url.js";
import { deleteAccount } from "@/app/employeur/services/deleteAccount";

export default function EmployerProfileScreen() {
  const [refreshing, setRefreshing] = useState(false); // 👈 État pour l'animation de rafraîchissement

  const [employerInfo, setEmployerInfo] = useState({
    companyName: "",
    city: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
  });

  const [photoUrl, setPhotoUrl] = useState("");

  function handleLogout() {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: () => router.replace("/loginEmp") },
      ]
    );
  }

  // 1. Isoler la logique de récupération des données
  const fetchEmployerData = async (isMounted = true) => {
    try {
      // Récupération des infos textuelles
      const response = await getEmployerInfo();
      if (!isMounted) return;

      setEmployerInfo({
        companyName: response.raison_social || "",
        city: response.ville || "",
        email: response.email || "",
        phone: response.num_tel || "",
        firstName: response.prenom_responsable || "",
        lastName: response.responsable || "",
      });

      // Récupération de l'image
      try {
        const imageData = await getImage();
        if (!isMounted) return;

        if (imageData?.image) {
          const currentPhotoUrl = url() + "documents/photos_employeur/" + imageData.image + "?t=" + Date.now();
          setPhotoUrl(currentPhotoUrl); 
        }
      } catch (imgError) {
        console.log("Pas d'image ou erreur de récupération :", imgError);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 2. Gestionnaire du Pull-to-Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmployerData(true);
    setRefreshing(false);
  };

  // 3. Exécution automatique à l'affichage de l'écran
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      fetchEmployerData(isMounted);

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleDeleteAccount = () => {
    Alert.alert(
      ' Suppression compte',
      'Cette action est irréversible. Voulez-vous continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
            router.replace('/loginEmp');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={["#2b5bbb"]} // Android spinner color
            tintColor="#2b5bbb"  // iOS spinner color
          />
        }
      >
        
        {/* 🏢 ENTREPRISE */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.logo}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatar} />
              ) : (
                <Building2 size={40} color="#2b5bbb" />
              )}
            </View>

            <Text style={styles.company}>
              {employerInfo.companyName}
            </Text>
          </View>
        </View>

        {/* 📄 INFOS */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Mail size={20} color="#2b5bbb" />
            <Text style={styles.value}>{employerInfo.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Phone size={20} color="#2b5bbb" />
            <Text style={styles.value}>{employerInfo.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={20} color="#2b5bbb" />
            <Text style={styles.value}>{employerInfo.city}</Text>
          </View>
        </View>

        {/* ⚙️ MENU */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/employeur/autre/SubscriptionScreen")}>
            <CreditCard size={20} color="#2b5bbb" />
            <Text style={styles.menuText}>Abonnement</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/employeur/autre/EmployerDocumentsScreen")}>
            <FileText size={20} color="#2b5bbb" />
            <Text style={styles.menuText}>Mes documents</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/employeur/autre/EmployerInfoScreen")}>
            <Settings size={20} color="#2b5bbb" />
            <Text style={styles.menuText}>Information de l'Entreprise</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/employeur/autre/PasswordChange")}>
            <Lock size={20} color="#2b5bbb" />
            <Text style={styles.menuText}>Mot de passe</Text>
          </TouchableOpacity>
        </View>

        {/* 🚪 LOGOUT */}
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <LogOut size={20} color="#1b2d5a" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        {/* ❌ DELETE */}
        <TouchableOpacity style={styles.delete} onPress={handleDeleteAccount}>
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
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  company: {
    fontSize: 16,
    color: "#1b2d5a",
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