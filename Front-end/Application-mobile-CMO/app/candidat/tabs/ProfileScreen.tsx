import React from 'react';
import { router, Router } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';

import {
  User,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Settings,
  Lock,
  LogOut,
  Trash2,
  Heart,
} from 'lucide-react-native';




export default function ProfileScreen() {


  function handleLogout() {
    router.replace('/loginCan');
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Suppression compte',
      'Cette action est irréversible. Voulez-vous continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Compte supprimé');
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
            <User size={40} color="#2b5bbb" />
          </View>

          <View>
            <Text style={styles.name}>Abdellah El Hakym</Text>
            <Text style={styles.email}>abdellah5420@gmail.com</Text>
          </View>
        </View>
      </View>

      {/* INFO */}
      <View style={styles.card}>

        <View style={styles.item}>
          <Phone size={18} color="#2b5bbb" />
          <View>
            <Text style={styles.label}>Téléphone</Text>
            <Text style={styles.value}>0650195273</Text>
          </View>
        </View>

        <View style={styles.item}>
          <MapPin size={18} color="#2b5bbb" />
          <View>
            <Text style={styles.label}>Localisation</Text>
            <Text style={styles.value}>France</Text>
          </View>
        </View>

        <View style={styles.item}>
          <Briefcase size={18} color="#2b5bbb" />
          <View>
            <Text style={styles.label}>Secteur</Text>
            <Text style={styles.value}>Mécanicien - Plombier</Text>
          </View>
        </View>

      </View>

      {/* ACTIONS */}
      <View style={styles.card}>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/candidat/tabs/CVScreen')}
        >
          <Settings size={20} color="#2b5bbb" />
          <Text style={styles.btnText}>CV</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn}>
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