import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
import { getMessages, sendMessage } from '@/app/employeur/services/messagerie';

// 1. Structure d'une réponse dans le tableau "reponses"
interface ReponseData {
  id: number;
  type_msg: string;
  id_msg: number;
  id_user: string;
  repondre: string;
  message: string;
  statut: number;
  date_msg: string;
  heure_msg: string;
  id_retour: number | null;
  deleted: number;
}

// 2. Structure du message principal
interface MessageDetails {
  id: number;
  id_user: string;
  type_message: string;
  sujet: string;
  description: string;
  date_sujet: string;
  heure_sujet: string;
  statut: number;
  id_retour: number | null;
  deleted: number;
}

// 3. Structure globale reçue de l'API (un tableau de cet objet)
interface ChatItemData {
  message: MessageDetails;
  reponses: ReponseData[];
}

export default function ChatScreen() {
  const [currentView, setCurrentView] = useState<'home' | 'compose'>('home');
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');

  // États pour la gestion des requêtes API
  const [chatItems, setChatItems] = useState<ChatItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false); // Loader pour la soumission

  // Charger les messages au montage de l'écran
  useEffect(() => {
    fetchUserMessages();
  }, []);

  const fetchUserMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages();
      setChatItems(Array.isArray(data) ? data : data?.data ?? []);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Soumission du formulaire au backend
  const handleSendMessage = async () => {
    if (!sujet.trim() || !message.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir le sujet et le message.');
      return;
    }

    try {
      setIsSending(true);
      
      // Appel de l'API avec les arguments attendus (message, sujet)
      await sendMessage(message.trim(), sujet.trim());

      Alert.alert('Succès', 'Votre message a bien été envoyé !');
      
      // Réinitialisation du formulaire et retour à la boîte de réception
      setSujet('');
      setMessage('');
      setCurrentView('home');
      
      // Rafraîchir l'historique pour afficher le nouveau message
      fetchUserMessages();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      Alert.alert('Erreur', "Impossible d'envoyer le message. Veuillez réessayer.");
    } finally {
      setIsSending(false);
    }
  };

  // Formatage de la date en fr-FR (ex: 22/06/2026)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (currentView === 'compose') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity 
            style={styles.inboxBanner} 
            onPress={() => setCurrentView('home')}
            disabled={isSending}
          >
            <Ionicons name="mail" size={18} color="#2b5bbb" style={{ marginRight: 8 }} />
            <Text style={styles.inboxBannerText}>Boîte de réception</Text>
          </TouchableOpacity>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Le sujet (*) :</Text>
            <TextInput
              style={styles.singleInput}
              value={sujet}
              onChangeText={setSujet}
              placeholder="Entrez le sujet"
              placeholderTextColor="#a0aec0"
              editable={!isSending}
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
              editable={!isSending}
            />

            <TouchableOpacity 
              style={[styles.sendBtn, isSending && styles.disabledBtn]} 
              onPress={handleSendMessage}
              disabled={isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendBtnText}>Envoyer le message</Text>
              )}
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

        {/* 3. Historique / Liste des discussions */}
        <View style={styles.listContainer}>
          <Text style={styles.historyTitle}>Historique des échanges</Text>

          {loading ? (
            <View style={styles.centerItem}>
              <ActivityIndicator size="small" color="#1b2d5a" />
            </View>
          ) : chatItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun message dans votre boîte de réception.</Text>
            </View>
          ) : (
            chatItems.map((item) => {
              const msg = item.message;
              const aDesReponses = item.reponses && item.reponses.length > 0;

              return (
                <View key={msg.id} style={styles.messageCard}>
                  {/* En-tête du message principal (Type + Date/Heure) */}
                  <View style={styles.messageHeader}>
                    <View style={styles.badgeType}>
                      <Text style={styles.badgeTypeText}>{msg.type_message}</Text>
                    </View>
                    <Text style={styles.messageDate}>
                      {formatDate(msg.date_sujet)} à {msg.heure_sujet ? msg.heure_sujet.substring(0, 5) : ''}
                    </Text>
                  </View>

                  {/* Ligne du Sujet */}
                  <View style={styles.sujetRow}>
                    <Text style={styles.sujetLabel}>Sujet : </Text>
                    <Text style={styles.sujetText}>{msg.sujet}</Text>
                  </View>

                  {/* Contenu du message (Description) */}
                  <View style={styles.msgBody}>
                    <Text style={styles.msgLabel}>Mon message :</Text>
                    <Text style={styles.msgContent}>{msg.description}</Text>
                  </View>

                  {/* Affichage des réponses ou état d'attente */}
                  {aDesReponses ? (
                    item.reponses.map((rep) => (
                      <View key={rep.id} style={styles.replyBox}>
                        <View style={styles.replyHeader}>
                          <Ionicons name="chatbubble-ellipses" size={14} color="#17d1b1" style={{ marginRight: 4 }} />
                          <Text style={styles.replyLabel}>Réponse du conseiller :</Text>
                          <Text style={styles.replyDate}>
                            ({formatDate(rep.date_msg)} à {rep.heure_msg.substring(0, 5)})
                          </Text>
                        </View>
                        <Text style={styles.replyContent}>{rep.repondre}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.pendingBox}>
                      <Ionicons name="time-outline" size={14} color="#718096" style={{ marginRight: 4 }} />
                      <Text style={styles.pendingText}>En attente de réponse</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf2f9',
  },
  content: {
    padding: 16,
  },
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
  listContainer: {
    gap: 12,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b2d5a',
    marginBottom: 4,
  },
  centerItem: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#718096',
    fontSize: 14,
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#2b5bbb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6,
  },
  badgeType: {
    backgroundColor: '#edf2f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeTypeText: {
    fontSize: 11,
    color: '#2b5bbb',
    fontWeight: '600',
  },
  messageDate: {
    fontSize: 12,
    color: '#718096',
  },
  sujetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sujetLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b2d5a',
  },
  sujetText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  msgBody: {
    marginBottom: 10,
  },
  msgLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 2,
  },
  msgContent: {
    fontSize: 14,
    color: '#2d3748',
    lineHeight: 18,
  },
  replyBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    padding: 10,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#17d1b1',
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  replyDate: {
    fontSize: 11,
    color: '#475569',
    marginLeft: 6,
  },
  replyContent: {
    fontSize: 13,
    color: '#14532d',
    lineHeight: 18,
  },
  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#f7fafc',
    padding: 6,
    borderRadius: 4,
  },
  pendingText: {
    fontSize: 12,
    color: '#718096',
    fontStyle: 'italic',
  },
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
  disabledBtn: {
    backgroundColor: '#94a3b8',
  },
});