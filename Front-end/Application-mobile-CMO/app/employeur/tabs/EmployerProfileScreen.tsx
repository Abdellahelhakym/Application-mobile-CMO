import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getEmployerInfo } from "@/app/employeur/services/EmployerInfoScreen";
import { deleteAccount } from "@/app/employeur/services/deleteAccount";
import { getImage } from '@/app/employeur/services/documents';
import url from "@/app/services/url.js";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CreditCard,
  FileText,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Settings,
  Trash2,
  X,
} from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function EmployerProfileScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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
    setShowMenu(false);
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: () => router.replace("/loginEmp") },
      ]
    );
  }

  const handleDeleteAccount = () => {
    setShowMenu(false);
    Alert.alert(
      'Suppression compte',
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

  const fetchEmployerData = async (isMounted = true) => {
    try {
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmployerData(true);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      fetchEmployerData(isMounted);

      return () => {
        isMounted = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        scrollEnabled={!showMenu}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={["#2b5bbb"]} 
            tintColor="#2b5bbb" 
          />
        }
      >
        
        {/* 🏢 ENTREPRISE */}
        <View style={styles.card}>
          <View style={styles.row}>
            <TouchableOpacity 
              style={styles.logo}
              activeOpacity={0.8}
              onPress={() => photoUrl && setIsImageZoomed(true)}
              disabled={!photoUrl}
            >
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatar} />
              ) : (
                <MaterialCommunityIcons
                  name="account-tie"
                  size={30}
                  color="#2b5bbb"
                />
              )}
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.company}>
                {employerInfo.companyName}
              </Text>
            </View>

            {/* Menu Button */}
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setShowMenu(!showMenu)}
              >
                <Menu size={24} color="#2b5bbb" />
              </TouchableOpacity>

              {/* Menu Déroulant */}
              {showMenu && (
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={handleLogout}
                  >
                    <LogOut size={18} color="#1b2d5a" />
                    <Text style={styles.dropdownText}>Se déconnecter</Text>
                  </TouchableOpacity>

                  <View style={styles.dropdownDivider} />

                  <TouchableOpacity
                    style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                    onPress={handleDeleteAccount}
                  >
                    <Trash2 size={18} color="#d32f2f" />
                    <Text style={[styles.dropdownText, { color: '#d32f2f' }]}>
                      Supprimer le compte
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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

          <View style={[styles.infoRow, { marginBottom: 0 }]}>
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

          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => router.push("/employeur/autre/PasswordChange")}>
            <Lock size={20} color="#2b5bbb" />
            <Text style={styles.menuText}>Mot de passe</Text>
          </TouchableOpacity>
        </View>

        {/* 🚪 LOGOUT */}
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <LogOut size={20} color="red" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal pour le Zoom de l'Image */}
      <Modal
        visible={isImageZoomed}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageZoomed(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={() => setIsImageZoomed(false)}
          />
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setIsImageZoomed(false)}
          >
            <X size={28} color="#fff" />
          </TouchableOpacity>
          {photoUrl ? (
            <Image 
              source={{ uri: photoUrl }} 
              style={styles.zoomedImage} 
              resizeMode="contain" 
            />
          ) : null}
        </View>
      </Modal>
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
    fontWeight: "600",
  },

  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
  },
  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8eef8',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    minWidth: 180,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4ff',
  },
  dropdownText: {
    fontSize: 14,
    color: '#1b2d5a',
    fontWeight: '500',
  },
  dropdownDivider: {
    height: 0,
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
        flexDirection: 'row',    gap: 8,    justifyContent: 'center',    padding: 14,    borderRadius: 16,    borderColor: '#f3d0cb',    backgroundColor: '#ffffff',

  },

  logoutText: {
    color: 'red',
    fontWeight: '500',
  },

  // Styles pour le Modal de Zoom
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  zoomedImage: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.6,
  },
});