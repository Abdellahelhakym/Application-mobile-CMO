import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl // <-- 1. Importation de RefreshControl
} from 'react-native';

import { router, useFocusEffect } from 'expo-router'; // <-- 2. Nettoyage et utilisation de expo-router

import {
  FileText,
  Heart,
  Lock,
  LogOut,
  MapPin,
  Phone,
  Settings,
  Trash2,
  User
} from 'lucide-react-native';

import { Feather } from '@expo/vector-icons';
import { getImage } from "../services/document";
import { getProfile } from "@/app/candidat/services/ProfileScreen";
import { deleteAccount } from "@/app/candidat/services/deleteAccount";
import url from "@/app/services/url";

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState({
    pseudo: '',
    email: '',
    tel: '',
    pays: '',
  });
  const [photo, setPhoto] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  
  // <-- 3. État pour gérer l'animation du loader de rafraîchissement
  const [refreshing, setRefreshing] = useState(false);

  const getData = useCallback(async () => {
    try {
      const [profile, imageData] = await Promise.all([
        getProfile(),
        getImage(),
      ]);

      setProfileData(profile);

      const imageUrl = imageData?.image
        ? url() + "documents/photos_candidats/" + imageData.image
        : '';
      setPhoto(imageUrl);
    } catch (error) {
      console.log(error);
    }
  }, []);

  // <-- 4. Fonction exécutée lors du Pull-to-Refresh
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      // <-- 5. Intégration du RefreshControl
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#2b5bbb"]} // Android
          tintColor="#2b5bbb"   // iOS
        />
      }
    >

      {/* PROFILE CARD */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatarBig}>
            {photo ? (
              <>
                <Image
                  source={{ uri: photo }}
                  style={styles.avatarImage}
                  onLoadStart={() => setAvatarLoading(true)}
                  onLoad={() => setAvatarLoading(false)}
                  onLoadEnd={() => setAvatarLoading(false)}
                  onError={() => setAvatarLoading(false)}
                />
                {avatarLoading ? (
                  <View style={styles.avatarLoading}>
                    <ActivityIndicator size="small" color="#2b5bbb" />
                  </View>
                ) : null}
              </>
            ) : (
              <User size={40} color="#2b5bbb" />
            )}
          </View>

          <View>
            <Text style={styles.name}>{profileData.pseudo}</Text>
            <Text style={styles.email}>{profileData.email}</Text>
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
          <Text style={styles.btnText}> Offres d’emploi</Text>
        </TouchableOpacity>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <LogOut size={20} color="#1b2d5a" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      {/* DELETE */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={handleDeleteAccount}
      >
        <Trash2 size={20} color="red" />
        <Text style={styles.deleteText}>Supprimer mon compte</Text>
      </TouchableOpacity>

    </ScrollView>
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
    paddingBottom: 110, // Un peu plus d'espace en bas pour le confort de scroll
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
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  deleteBtn: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3d0cb',
    backgroundColor: '#fff',
  },
  deleteText: {
    color: 'red',
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  logoutText: {
    color: '#1b2d5a',
    fontWeight: '500',
  },
});