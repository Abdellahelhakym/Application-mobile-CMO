import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
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
} from 'react-native';

import { fixUtf8Encoding } from "@/app/candidat/services/decode";
import { router, useFocusEffect } from 'expo-router';
import { decode } from 'html-entities';

import {
    FileText,
    Heart,
    Lock,
    LogOut,
    MapPin,
    Menu,
    Phone,
    Settings,
    Trash2,
    UserRoundCheck,
    X // 👈 AJOUT pour l'icône de fermeture
} from 'lucide-react-native';

import { getInformations } from "@/app/candidat/services/CVScreen";
import { getPaysAutoriser, getProfile } from "@/app/candidat/services/ProfileScreen";
import { deleteAccount } from "@/app/candidat/services/deleteAccount";
import { Feather } from '@expo/vector-icons';
import { getImage } from "../services/document";

import url from "@/app/services/url";

// 👈 AJOUT : Récupération des dimensions de l'écran pour l'image zoomée
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState({
    pseudo: '',
    email: '',
    tel: '',
    pays: '',
  });
  const [photo, setPhoto] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // État pour gérer la visibilité du bouton Assistance
  const [isAssistanceAllowed, setIsAssistanceAllowed] = useState(false);

  // 👈 AJOUT : État pour gérer la visibilité du zoom de l'image
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // 👈 AJOUT : État pour gérer l'affichage du menu déroulant
  const [showMenu, setShowMenu] = useState(false);

  const getData = useCallback(async () => {
    try {
      // 1. Appels API en parallèle
      const [profile, imageData, infoData, paysAutorises] = await Promise.all([
        getProfile(),
        getImage(),
        getInformations(),
        getPaysAutoriser(),
      ]);

      // Récupération du pays du candidat depuis getInformations
      const rawUserPays = infoData && infoData.length > 0 ? infoData[0].pays : profile?.pays || '';
      
      const cleanPays = fixUtf8Encoding(decode(rawUserPays));
      const cleanPseudo = fixUtf8Encoding(decode(profile?.pseudo || ''));

      setProfileData({
        ...profile,
        pseudo: cleanPseudo,
        pays: cleanPays,
      });

      // 2. Vérification si le pays de l'utilisateur est autorisé
      if (cleanPays && Array.isArray(paysAutorises)) {
        const isAllowed = paysAutorises.some(
          (item) =>
            item.deleted === 0 &&
            fixUtf8Encoding(decode(item.nom_pays)).trim().toLowerCase() === cleanPays.trim().toLowerCase()
        );
        setIsAssistanceAllowed(isAllowed);
      } else {
        setIsAssistanceAllowed(false);
      }

      const imageUrl = imageData?.image
        ? url() + "documents/photos_candidats/" + imageData.image
        : '';
      setPhoto(imageUrl);
      setHasImageError(false);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  }, [getData]);

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [getData])
  );

  function handleLogout() {
    setShowMenu(false); // Fermer le menu
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => {
            router.replace('/loginCan');
          },
        },
      ]
    );
  }

  const handleDeleteAccount = () => {
    setShowMenu(false); // Fermer le menu
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
            router.replace('/loginCan');
          },
        },
      ]
    );
  };

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      scrollEnabled={!showMenu} // 👈 Désactiver le scroll si le menu est ouvert
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#2b5bbb"]}
          tintColor="#2b5bbb"
        />
      }
    >

      {/* PROFILE CARD */}
      <View style={styles.card}>
        <View style={styles.row}>
          {/* 👈 AJOUT : Rendre l'avatar cliquable */}
          <TouchableOpacity 
            style={styles.avatarBig} 
            onPress={() => photo && !hasImageError && setIsImageZoomed(true)}
            activeOpacity={0.8}
            disabled={!photo || hasImageError}
          >
            {photo && !hasImageError ? (
              <>
                <Image
                  source={{ uri: photo }}
                  style={styles.avatarImage}
                  onLoadStart={() => setAvatarLoading(true)}
                  onLoad={() => setAvatarLoading(false)}
                  onLoadEnd={() => setAvatarLoading(false)}
                  onError={() => {
                    setAvatarLoading(false);
                    setHasImageError(true);
                  }}
                />
                {avatarLoading ? (
                  <View style={styles.avatarLoading}>
                    <ActivityIndicator size="small" color="#2b5bbb" />
                  </View>
                ) : null}
              </>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={24} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profileData.pseudo}</Text>
            <Text style={styles.email}>{profileData.email}</Text>
          </View>

          {/* 👈 AJOUT : Bouton menu en haut à droite */}
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowMenu(!showMenu)}
            >
              <Menu size={24} color="#2b5bbb" />
            </TouchableOpacity>

            {/* 👈 AJOUT : Menu déroulant */}
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

      {/* INFO */}
      <View style={styles.card}>
        <View style={styles.item}>
          <Phone size={18} color="#2b5bbb" />
          <View>
            <Text style={styles.label}>Téléphone</Text>
            <Text style={styles.value}>{profileData.tel}</Text>
          </View>
        </View>

        <View style={[styles.item, { marginBottom: 0 }]}>
          <MapPin size={18} color="#2b5bbb" />
          <View>
            <Text style={styles.label}>Pays</Text>
            <Text style={styles.value}>{profileData.pays}</Text>
          </View>
        </View>
      </View>

      {/* ACTIONS */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/candidat/autre/CvScreenProfile')}
        >
          <Settings size={20} color="#2b5bbb" />
          <Text style={styles.btnText}>CV</Text>
        </TouchableOpacity>

        {isAssistanceAllowed && (
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.push('/candidat/autre/AssistanceCMO')}
          >
            <UserRoundCheck size={20} color="#2b5bbb" />
            <Text style={styles.btnText}>Assistance CMO</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/candidat/autre/PasswordChange')}
        >
          <Lock size={20} color="#2b5bbb" />
          <Text style={styles.btnText}>Changer mot de passe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/candidat/autre/FavoritesScreen')}
        >
          <Heart size={20} color="#2b5bbb" />
          <Text style={styles.btnText}>Favoris</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/candidat/autre/AttestationsScreen')}
        >
          <FileText size={20} color="#2b5bbb" />
          <Text style={styles.btnText}>Attestations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { borderBottomWidth: 0 }]}
          onPress={() =>
            router.push('https://conceptmaindoeuvre.com/nos-offres-emploi#')
          }
        >
          <Feather name="briefcase" size={20} color="#2b5bbb" />
          <Text style={styles.btnText}> Offres d'emploi</Text>
        </TouchableOpacity>
      </View>
{/* LOGOUT */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <LogOut size={20} color="red" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

    

    </ScrollView>

    {/* 👈 AJOUT : Modal de zoom de l'image (Lightbox) */}
    {photo && (
        <Modal
            visible={isImageZoomed}
            transparent={true} // Pour voir l'arrière-plan sombre
            animationType="fade" // Animation douce
            onRequestClose={() => setIsImageZoomed(false)} // Gère le bouton retour Android
        >
            {/* Arrière-plan sombre cliquable pour fermer */}
            <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1} 
                onPress={() => setIsImageZoomed(false)}
            >
                {/* Bouton de fermeture en haut à droite */}
                <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={() => setIsImageZoomed(false)}
                >
                    <X size={28} color="white" />
                </TouchableOpacity>

                {/* L'image zoomée */}
                <Image
                    source={{ uri: photo }}
                    style={styles.zoomedImage}
                    resizeMode="contain" // Adapte l'image sans la couper
                />
            </TouchableOpacity>
        </Modal>
    )}
    </>
  );
}

/* ================= STYLE ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },
  content: {
    padding: 15,
    paddingBottom: 30, // 👈 MODIFIÉ : Réduit puisque plus de boutons en bas
    gap: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBig: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: '#eef3ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    // 👈 AJOUT : Un léger feedback visuel au clic
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#122F78',
  },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(238, 243, 255, 0.7)',
  },
  name: {
    fontSize: 16,
    color: '#1b2d5a',
    fontWeight: '600',
  },
  email: {
    fontSize: 12,
    color: '#5b6a8e',
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
  item: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 11,
    color: '#5b6a8e',
  },
  value: {
    fontSize: 13,
    color: '#1b2d5a',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef3ff',
  },
  btnText: {
    color: '#1b2d5a',
  },
 

 logoutBtn: {
    flexDirection: 'row',    gap: 8,    justifyContent: 'center',    padding: 14,    borderRadius: 16,    borderColor: '#f3d0cb',    backgroundColor: '#ffffff',
  },
  logoutText: {
    color: 'red',
    fontWeight: '500',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Fond noir très opaque
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImage: {
    width: SCREEN_WIDTH * 0.9, // 90% de la largeur de l'écran
    height: SCREEN_HEIGHT * 0.7, // 70% de la hauteur de l'écran
  },
  closeButton: {
    position: 'absolute',
    top: 50, // Ajuster selon la zone de notification (SafeArea)
    right: 20,
    zIndex: 10,
    padding: 10,
  },
});