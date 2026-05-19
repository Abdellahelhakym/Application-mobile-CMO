import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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


import { getImage } from "@/app/candidat/services/CVScreen";
import { deleteAccount, getProfile } from "@/app/candidat/services/ProfileScreen";
import { Feather } from '@expo/vector-icons';

import url from "@/app/services/url";




export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState({
    pseudo: '',
    email: '',
    tel: '',
    pays: '',
  });
  const [photo, setPhoto] = useState('');

  const getData = useCallback(async () => {
    try {
      const [profile, imageData] = await Promise.all([
        getProfile(),
        getImage(),
      ]);

      setProfileData(profile);

      const imageUrl = imageData?.image
        ? url() + "files/img_user/" + imageData.image
        : '';
      setPhoto(imageUrl);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [getData])
  );


  function handleLogout() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'index' }],
      })
    );
  }

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
    >

      {/* PROFILE CARD */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatarBig}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatarImage} />
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

        <View style={styles.item}>
          <MapPin size={18} color="#2b5bbb" />
          <View>
            <Text style={styles.label}>Localisation</Text>
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
          onPress={() => Linking.openURL("https://mycmo.conceptmaindoeuvre.com/mot-de-passe-oublie")}
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
          style={styles.btn}
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

/* STYLE */
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },

  content: {
    padding: 15,
    paddingBottom: 80, // ✅ FIX ESPACE EN BAS
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
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  name: {
    fontSize: 16,
    color: '#1b2d5a',
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
    marginHorizontal: 15,
  },
  deleteText: {
    color: 'red',
  },

  logoutBtn: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 15,
  },

  logoutText: {
    color: '#1b2d5a',
  },
});