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
  RefreshControl
} from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { decode } from 'html-entities'; // 👈 Importation du décodeur HTML
import { fixUtf8Encoding } from "@/app/candidat/services/decode"; 

import {
  Bot,
  FileText,
  Heart,
  Lock,
  LogOut,
  MapPin,
  Phone,
  Settings,
  Trash2,
  User,
  UserRoundCheck
} from 'lucide-react-native';

import { getInformations } from "@/app/candidat/services/CVScreen";
import { Feather } from '@expo/vector-icons';
import { getImage } from "../services/document";
import { getProfile, getPaysAutoriser } from "@/app/candidat/services/ProfileScreen";
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
  const [refreshing, setRefreshing] = useState(false);
  
  // État pour gérer la visibilité du bouton Assistance
  const [isAssistanceAllowed, setIsAssistanceAllowed] = useState(false);

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
      
      // 👈 Décodage HTML puis correction de l'encodage UTF-8 (mojibake)
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

        {/* Condition basée sur le résultat du contrôle API */}
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
    paddingBottom: 110,
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