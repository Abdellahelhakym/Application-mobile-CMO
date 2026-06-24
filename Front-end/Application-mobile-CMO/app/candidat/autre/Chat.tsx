import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMessages, getSousMessages, CreateMessage, sendMessage, ClotureMessage } from '../../candidat/services/messagerie'; // Ajustez le chemin selon votre projet
import { getPsaudo } from "../../candidat/services/token_id"; // Ajustez le chemin selon votre projet

interface MessageItem {
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
  last_message?: string;
  last_message_statut?: number;
}

interface SousMessageItem {
  id: number;
  type_msg: string;
  id_msg: number;
  id_user: string;
  message: string;
  statut: number;
  date_msg: string;
  heure_msg: string;
  id_retour: number | null;
  deleted: number;
}

export default function ChatScreen() {
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'compose'>('home');
  const [selectedRootMessage, setSelectedRootMessage] = useState<MessageItem | null>(null);
  
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [userPseudo, setUserPseudo] = useState<string>('Moi');

  // États pour les données de l'API
  const [mainMessages, setMainMessages] = useState<MessageItem[]>([]);
  const [currentThreadReplies, setCurrentThreadReplies] = useState<SousMessageItem[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      if (typeof getPsaudo === 'function') {
        const pseudo = await getPsaudo();
        if (pseudo) setUserPseudo(pseudo);
      }
      await fetchMainMessages();
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les discussions principales
  const fetchMainMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages();
      const messagesList: MessageItem[] = Array.isArray(data) ? data : data?.data ?? [];
      
      const messagesWithLastMsg = await Promise.all(
        messagesList.map(async (msg) => {
          try {
            const subData = await getSousMessages(msg.id);
            const replies: SousMessageItem[] = Array.isArray(subData) ? subData : subData?.data ?? [];
            const filtered = replies.filter(r => [1, 2, 3, 4, 10].includes(r.statut));
            if (filtered.length > 0) {
              const lastReply = filtered[filtered.length - 1];
              return { 
                ...msg, 
                last_message: lastReply.message,
                last_message_statut: lastReply.statut
              };
            }
          } catch (e) {
            console.log("Erreur sous-message pour l'aperçu", e);
          }
          return msg;
        })
      );

      setMainMessages(messagesWithLastMsg);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages principaux:', error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer l'historique des sous-messages
  const fetchReplies = async (id_msg: number) => {
    try {
      setLoadingChat(true);
      const data = await getSousMessages(id_msg);
      const repliesList: SousMessageItem[] = Array.isArray(data) ? data : data?.data ?? [];
      
      const filteredReplies = repliesList.filter(reply => 
        reply.statut === 10 || reply.statut === 1 || reply.statut === 3 || reply.statut === 2 || reply.statut === 4
      );

      setCurrentThreadReplies(filteredReplies);
    } catch (error) {
      console.error('Erreur lors de la récupération des sous-messages:', error);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleNewMessage = () => {
    setSujet('');
    setMessage('');
    setCurrentView('compose');
  };

  const handleOpenDiscussion = async (rootMsg: MessageItem) => {
    setSelectedRootMessage(rootMsg);
    setSujet(rootMsg.sujet);
    setMessage('');
    setCurrentView('chat');
    await fetchReplies(rootMsg.id);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || (!sujet.trim() && currentView === 'compose')) {
      Alert.alert('Champs requis', 'Veuillez remplir les champs obligatoires.');
      return;
    }

    try {
      setIsSending(true);
      
      if (currentView === 'compose') {
        await CreateMessage(message.trim(), sujet.trim());
        setSujet('');
        setCurrentView('home');
        await fetchMainMessages();
      } else if (currentView === 'chat' && selectedRootMessage) {
        const rootId = selectedRootMessage.id;
        await sendMessage(message.trim(), rootId);
        setMessage('');
        await fetchReplies(rootId);
      }

      Alert.alert('Succès', 'Votre message a bien été envoyé !');
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      Alert.alert('Erreur', "Impossible d'envoyer le message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCloturer = () => {
    if (!selectedRootMessage) return;

    Alert.alert('Clôture', 'Voulez-vous clôturer cette discussion ?', [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Oui, Clôturer', 
        onPress: async () => {
          try {
            setIsSending(true);
            const rootId = selectedRootMessage.id;
            
            await ClotureMessage(rootId);
            
            Alert.alert('Succès', 'La discussion a été clôturée avec succès.');
            setMessage('');
            setCurrentView('home');
            await fetchMainMessages();
          } catch (error) {
            console.error("Erreur lors de la clôture du message:", error);
            Alert.alert('Erreur', "Impossible de clôturer la discussion.");
          } finally {
            setIsSending(false);
          }
        } 
      }
    ]);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.startsWith('1899')) return 'En cours';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatHeure = (heureStr: string) => {
    return heureStr ? heureStr.substring(0, 5) : '';
  };

  // --- Gestion du statut : CLÔTURÉ EN VERT MAINTENANT ---
  const getStatusBadge = (statut: number, lastMessageStatut?: number) => {
    const statusToCheck = lastMessageStatut !== undefined ? lastMessageStatut : statut;
    
    switch (statusToCheck) {
      case 4:
        return { text: 'Clôturé', color: '#16a34a', bg: '#dcfce7' }; // Vert pour Clôturé
      case 2:
        return { text: 'Reçu', color: '#d97706', bg: '#fef3c7' }; // Orange pour Reçu (CMO)
      case 1: 
      case 3: 
      case 10:
      default:
        return { text: 'Envoyé', color: '#2563eb', bg: '#dbeafe' }; // Bleu pour Envoyé
    }
  };

  // --- RENDU 1 : CRÉER UN NOUVEAU SUJET ---
  if (currentView === 'compose') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity 
            style={styles.backBanner} 
            onPress={() => {
              setCurrentView('home');
              fetchMainMessages();
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#2b5bbb" style={{ marginRight: 8 }} />
            <Text style={styles.backBannerText}>Retour à l'historique</Text>
          </TouchableOpacity>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Le sujet (*) :</Text>
            <TextInput
              style={styles.singleInput}
              value={sujet}
              onChangeText={setSujet}
              placeholder="Entrez le sujet"
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.inputLabel}>Le message (*) :</Text>
            <TextInput
              style={styles.multiInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Écrivez votre message ici..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={[styles.sendBtn, isSending && styles.disabledBtn]} onPress={handleSendMessage} disabled={isSending}>
              {isSending ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.sendBtnText}>Envoyer le message</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- RENDU 2 : VUE CHAT DÉTAILLÉ (LECTURE / RÉPONSE) ---
  if (currentView === 'chat' && selectedRootMessage) {
    const isClosed = selectedRootMessage.statut === 4;

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 70}
        >
          <View style={styles.chatHeaderNav}>
            <TouchableOpacity 
              style={styles.chatBackBtn} 
              onPress={() => {
                setCurrentView('home');
                fetchMainMessages();
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#1b2d5a" />
              <Text style={styles.chatHeaderTitle} numberOfLines={1}>{selectedRootMessage.sujet}</Text>
            </TouchableOpacity>
            
            {!isClosed && (
              <TouchableOpacity style={styles.cloturerBtn} onPress={handleCloturer} disabled={isSending}>
                <Text style={styles.cloturerBtnText}>Clôturer</Text>
              </TouchableOpacity>
            )}
          </View>

          {loadingChat ? (
            <View style={[styles.container, styles.centerItem]}>
              <ActivityIndicator size="large" color="#2b5bbb" />
            </View>
          ) : (
            <ScrollView 
              ref={scrollViewRef}
              contentContainerStyle={styles.chatScrollContent}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {currentThreadReplies.map((subMsg) => {
                const isCMO = subMsg.statut === 2 || subMsg.type_msg === 'Conseiller';

                return (
                  <View key={subMsg.id} style={isCMO ? styles.cmoBubbleWrapper : styles.userBubbleWrapper}>
                    <View style={isCMO ? styles.cmoBubble : styles.userBubble}>
                      <View style={styles.bubbleHeaderRow}>
                        <Text style={isCMO ? styles.cmoAuthor : styles.userAuthor}>
                          {isCMO ? 'CMO' : userPseudo.toLowerCase()}
                        </Text>
                        <Text style={styles.bubbleDate}>
                          {formatDate(subMsg.date_msg)} {formatHeure(subMsg.heure_msg)}
                        </Text>
                      </View>
                      <Text style={isCMO ? styles.cmoText : styles.userText}>{subMsg.message}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {!isClosed ? (
            <View style={styles.chatInputContainer}>
              <Text style={styles.inputLabelSmall}>Le message (*) :</Text>
              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatTextInput}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Écrivez votre réponse..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  editable={!isSending}
                />
                <TouchableOpacity style={[styles.chatSendIconBtn, isSending && styles.disabledBtn]} onPress={handleSendMessage} disabled={isSending}>
                  {isSending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.closedDiscussionBanner}>
              <Ionicons name="lock-closed" size={16} color="#16a34a" style={{ marginRight: 8 }} />
              <Text style={styles.closedDiscussionText}>Cette discussion est clôturée</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // --- RENDU 3 : HISTORIQUE PRINCIPAL (HOME) ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.actionContainerCard}>
          <TouchableOpacity style={styles.composeBtn} onPress={handleNewMessage}>
            <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.composeBtnText}>Rédiger un message</Text>
          </TouchableOpacity>

          <View style={styles.inboxBanner}>
            <Ionicons name="mail" size={18} color="#2b5bbb" style={{ marginRight: 8 }} />
            <Text style={styles.inboxBannerText}>Boîte de réception</Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.historyTitle}>Historique des échanges</Text>

          {loading ? (
            <View style={styles.centerItem}>
              <ActivityIndicator size="small" color="#1b2d5a" />
            </View>
          ) : mainMessages.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucune discussion ouverte.</Text>
            </View>
          ) : (
            mainMessages.map((msg) => {
              const statusInfo = getStatusBadge(msg.statut, msg.last_message_statut);
              const texteApercu = msg.last_message || msg.description;
              const isClosedCard = (msg.last_message_statut !== undefined ? msg.last_message_statut : msg.statut) === 4;

              return (
                <TouchableOpacity 
                  key={msg.id} 
                  style={[styles.messageCard, isClosedCard && { borderLeftColor: '#16a34a' }]} 
                  onPress={() => handleOpenDiscussion(msg)}
                >
                  <View style={styles.messageHeader}>
                    <View style={[styles.badgeType, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.badgeTypeText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                    </View>
                    <Text style={styles.messageDate}>
                      {formatDate(msg.date_sujet)} à {formatHeure(msg.heure_sujet)}
                    </Text>
                  </View>

                  <View style={styles.sujetRow}>
                    <Text style={styles.sujetLabel}>Sujet : </Text>
                    <Text style={styles.sujetText} numberOfLines={1}>{msg.sujet}</Text>
                  </View>

                  <Text style={styles.msgPreview} numberOfLines={2}>
                    {texteApercu}
                  </Text>
                  
                  <View style={styles.openDiscussionHint}>
                    <Text style={styles.openDiscussionHintText}>Ouvrir la discussion</Text>
                    <Ionicons name="chevron-forward" size={14} color="#2b5bbb" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  actionContainerCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 20, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  composeBtn: { flexDirection: 'row', backgroundColor: '#17d1b1', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 50, marginBottom: 16, alignItems: 'center', shadowColor: '#17d1b1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  composeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  inboxBanner: { flexDirection: 'row', backgroundColor: '#fef3c7', width: '100%', padding: 12, borderRadius: 12, alignItems: 'center' },
  inboxBannerText: { color: '#b45309', fontWeight: '600', fontSize: 14 },
  backBanner: { flexDirection: 'row', backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  backBannerText: { color: '#2b5bbb', fontWeight: '600', fontSize: 14 },
  listContainer: { gap: 12, marginBottom: 20 },
  historyTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 8, paddingLeft: 4 },
  centerItem: { padding: 40, alignItems: 'center' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  emptyText: { color: '#64748b', fontSize: 14 },
  messageCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderLeftWidth: 5, borderLeftColor: '#2b5bbb', marginBottom: 12, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badgeType: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeTypeText: { fontSize: 11, fontWeight: '700' },
  messageDate: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  sujetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sujetLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  sujetText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  msgPreview: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  openDiscussionHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  openDiscussionHintText: { fontSize: 12, color: '#2b5bbb', fontWeight: '600', marginRight: 4 },
  chatHeaderNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  chatBackBtn: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  chatHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginLeft: 6 },
  cloturerBtn: { flexDirection: 'row', backgroundColor: '#dcfce7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' }, // Fond vert clair
  cloturerBtnText: { color: '#16a34a', fontWeight: '700', fontSize: 13 }, // Texte vert foncé
  chatScrollContent: { padding: 16, paddingBottom: 24 },
  userBubbleWrapper: { width: '100%', marginBottom: 10, justifyContent: 'flex-start' },
  cmoBubbleWrapper: { width: '100%', marginBottom: 10, justifyContent: 'flex-end' },
  userBubble: { backgroundColor: '#fffbeb', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 0, borderWidth: 1, borderColor: '#fef08a', marginRight: 40 },
  cmoBubble: { backgroundColor: '#f0f9ff', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 0, borderWidth: 1, borderColor: '#e0f2fe', marginLeft: 40 },
  bubbleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userAuthor: { fontSize: 16, color: '#0ea5e9', fontWeight: '600' },
  cmoAuthor: { fontSize: 16, color: '#0ea5e9', fontWeight: '600' },
  bubbleDate: { fontSize: 13, color: '#334155' },
  userText: { fontSize: 14, color: '#0f172a', lineHeight: 22 },
  cmoText: { fontSize: 14, color: '#0f172a', lineHeight: 22 },
  chatInputContainer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  chatTextInput: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#334155', maxHeight: 90, backgroundColor: '#fff' },
  chatSendIconBtn: { backgroundColor: '#2563eb', width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  closedDiscussionBanner: { flexDirection: 'row', backgroundColor: '#dcfce7', padding: 16, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#bbf7d0' }, // Bannière verte
  closedDiscussionText: { color: '#16a34a', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, minHeight: 300, borderWidth: 1, borderColor: '#e2e8f0' },
  inputLabel: { fontSize: 14, color: '#0f172a', fontWeight: '600', marginTop: 12, marginBottom: 6 },
  inputLabelSmall: { fontSize: 13, color: '#0f172a', fontWeight: '500' },
  singleInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, backgroundColor: '#fff', color: '#334155' },
  multiInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, height: 140, backgroundColor: '#fff', color: '#334155' },
  sendBtn: { backgroundColor: '#1b2d5a', paddingVertical: 14, borderRadius: 4, alignItems: 'center', marginTop: 24 },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  disabledBtn: { backgroundColor: '#cbd5e1' },
});