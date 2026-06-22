import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ChatScreen() {
  // Navigation interne simple : 'home' ou 'compose'
  const [currentView, setCurrentView] = useState<'home' | 'compose'>('home');
  
  // États pour le formulaire
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');

  if (currentView === 'compose') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Bouton Retour / Boîte de réception */}
          <TouchableOpacity 
            style={styles.inboxBanner} 
            onPress={() => setCurrentView('home')}
          >
            <Ionicons name="mail" size={18} color="#2b5bbb" style={{ marginRight: 8 }} />
            <Text style={styles.inboxBannerText}>Boîte de réception</Text>
          </TouchableOpacity>

          {/* Formulaire de rédaction */}
          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Le sujet (*) :</Text>
            <TextInput
              style={styles.singleInput}
              value={sujet}
              onChangeText={setSujet}
              placeholder="Entrez le sujet"
              placeholderTextColor="#a0aec0"
            />

            <Text style={styles.inputLabel}>Le message (*) :</Text>
            <TextInput
              style={styles.multiInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Écrivez votre message ici..."
              placeholderTextColor="#a0aec0"
              multiline
              textAlignVertical="top"
            />

            {/* Bouton Envoyer */}
            <TouchableOpacity style={styles.sendBtn} onPress={() => alert('Message envoyé !')}>
              <Text style={styles.sendBtnText}>Envoyer le message</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 2. Bloc Central : Rédiger & Boîte de réception */}
        <View style={styles.actionContainerCard}>
          <TouchableOpacity 
            style={styles.composeBtn} 
            onPress={() => setCurrentView('compose')}
          >
            <Text style={styles.composeBtnText}>Rédiger un message</Text>
          </TouchableOpacity>

          <View style={styles.inboxBanner}>
            <Ionicons name="mail" size={18} color="#2b5bbb" style={{ marginRight: 8 }} />
            <Text style={styles.inboxBannerText}>Boîte de réception</Text>
          </View>
        </View>

        {/* 3. Bloc Vide du bas (pour l'historique ou liste future) */}
        <View style={styles.emptyCard} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf2f9', // Fond bleu très clair uniforme
  },
  content: {
    padding: 16,
  },

  // Carte Conseiller (Vue 1)
  advisorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  advisorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 6,
    backgroundColor: '#fff',
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#1b2d5a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1b2d5a',
    textAlign: 'center',
  },
  advisorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  advisorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b2d5a',
  },
  dividerVertical: {
    width: 1,
    height: 20,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 12,
  },
  packBadge: {
    backgroundColor: '#1b2d5a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  packBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  advisorActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1b2d5a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 8,
  },
  actionOutlineText: {
    color: '#1b2d5a',
    fontSize: 12,
    fontWeight: '500',
  },

  // Bloc central d'actions
  actionContainerCard: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  composeBtn: {
    backgroundColor: '#17d1b1',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 20,
    elevation: 2,
  },
  composeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inboxBanner: {
    flexDirection: 'row',
    backgroundColor: '#fbeee0',
    width: '100%',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  inboxBannerText: {
    color: '#2b5bbb',
    fontWeight: '500',
    fontSize: 14,
  },

  // Bloc vide du bas
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 4,
    height: 60,
  },

  // Formulaire Rédiger Message (Vue 2)
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 16,
    marginTop: 16,
    minHeight: 350,
  },
  inputLabel: {
    fontSize: 14,
    color: '#1b2d5a',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  singleInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#334155',
    backgroundColor: '#fff',
  },
  multiInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#334155',
    backgroundColor: '#fff',
    height: 120,
  },
  sendBtn: {
    backgroundColor: '#1b2d5a',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 24,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});