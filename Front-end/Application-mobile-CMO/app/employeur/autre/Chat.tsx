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
import { useLocalSearchParams } from 'expo-router'; 
import { getMessages, getSousMessages, CreateMessage, sendMessage, ClotureMessage  } from '../../employeur/services/messagerie'; 
import { getRaison } from "../../employeur/services/token_id"; 

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

/**
 * Nettoie le code HTML, décode les entités spéciales (&eacute;, &#039;...)
 * et corrige les erreurs courantes d'encodage (ex: âœ” -> ✔)
 */
const cleanHtml = (htmlStr: string): string => {
  if (!htmlStr) return "";

  let text = htmlStr;

  // 1. Convertir les balises d'entités de base encodées en texte brut (&lt;p&gt; -> <p>)
  text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  // 2. Dictionnaire de conversion pour les entités HTML courantes
  const htmlEntities: { [key: string]: string } = {
    '&eacute;': 'é', '&Eacute;': 'É',
    '&egrave;': 'è', '&Egrave;': 'È',
    '&agrave;': 'à', '&Agrave;': 'À',
    '&ugrave;': 'ù', '&icirc;': 'î', 
    '&iuml;': 'ï',   '&ocirc;': 'ô', 
    '&ecirc;': 'ê',  '&euml;': 'ë', 
    '&ccedil;': 'ç', '&Ccedil;': 'Ç',
    '&nbsp;': ' ',   '&amp;': '&',
    '&quot;': '"',   '&#039;': "'", 
    '&rsquo;': "'",  '&ndash;': '–',
    '&mdash;': '—',  '&deg;': '°',
    '&OElig;': 'Œ',  '&oelig;': 'œ',
    '&euro;': '€'
  };

  // Remplacement de toutes les entités du dictionnaire
  Object.keys(htmlEntities).forEach(entity => {
    const reg = new RegExp(entity, 'g');
    text = text.replace(reg, htmlEntities[entity]);
  });

  // 3. Correction des erreurs d'encodage de caractères (UTF-8 mal interprété)
  text = text.replace(/âœ”/g, '✔');
  text = text.replace(/â€“/g, '–');

  // 4. Suppression complète de toutes les balises HTML (<p>, </p>, <br>, etc.)
  text = text.replace(/<\/?[^>]+(>|$)/g, " ");

  // 5. Nettoyage des espaces multiples et sauts de lignes pour l'aperçu de la notification
  return text.replace(/\s+/g, " ").trim();
};

export default function ChatScreen() {
  const params = useLocalSearchParams(); 
  const { id_msg } = params;

  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'compose'>('home');
  const [selectedRootMessage, setSelectedRootMessage] = useState<MessageItem | null>(null);
  
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [userPseudo, setUserPseudo] = useState<string>('Moi');

  const [mainMessages, setMainMessages] = useState<MessageItem[]>([]);
  const [currentThreadReplies, setCurrentThreadReplies] = useState<SousMessageItem[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Gestion de l'initialisation et de la redirection automatique
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        if (typeof getRaison === 'function') {
          const raison = await getRaison();
          if (raison) setUserPseudo(raison);
        }
        
        const messages = await fetchMainMessages();

        if (id_msg) {
          const targetId = parseInt(id_msg as string, 10);
          const foundMessage = messages.find(m => m.id === targetId);
          
          if (foundMessage) {
            setSelectedRootMessage(foundMessage);
            setSujet(foundMessage.sujet);
            setCurrentView('chat');
            await fetchReplies(targetId);
          } else {
            const mockRootMessage: MessageItem = {
              id: targetId,
              id_user: "",
              type_message: "",
              sujet: "Discussion", 
              description: "",
              date_sujet: "",
              heure_sujet: "",
              statut: 1,
              id_retour: null,
              deleted: 0
            };
            setSelectedRootMessage(mockRootMessage);
            setCurrentView('chat');
            await fetchReplies(targetId);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id_msg]);

  // Récupérer les discussions principales avec nettoyage du texte de l'aperçu
  const fetchMainMessages = async (): Promise<MessageItem[]> => {
    try {
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
                // APPLICATION DU NETTOYAGE SUR L'APERÇU DU DERNIER MESSAGE
                last_message: cleanHtml(lastReply.message),
                last_message_statut: lastReply.statut
              };
            }
          } catch (e) {
            console.log("Erreur sous-message pour l'aperçu", e);
          }
          // Nettoyage de la description par défaut si pas de sous-message
          return { ...msg, description: cleanHtml(msg.description) };
        })
      );

      setMainMessages(messagesWithLastMsg);
      return messagesWithLastMsg;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages principaux:', error);
      return [];
    }
  };

  // Récupérer l'historique des sous-messages et les nettoyer de tout code HTML
  const fetchReplies = async (id_msg: number) => {
    try {
      setLoadingChat(true);
      const data = await getSousMessages(id_msg);
      const repliesList: SousMessageItem[] = Array.isArray(data) ? data : data?.data ?? [];
      
      const filteredReplies = repliesList
        .filter(reply => [1, 2, 3, 4, 10].includes(reply.statut))
        .map(reply => ({
          ...reply,
          // APPLICATION DU NETTOYAGE SUR CHAQUE BULLE DU CHAT
          message: cleanHtml(reply.message)
        }));

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
        setSelectedRootMessage(prev => prev ? { ...prev, statut: 3 } : null);
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

  const getStatusBadge = (statut: number, lastMessageStatut?: number) => {
    const statusToCheck = lastMessageStatut !== undefined ? lastMessageStatut : statut;
    
    switch (statusToCheck) {
      case 4:
        return { text: 'Clôturé', color: '#16a34a', bg: '#dcfce7' };
      case 2:
        return { text: 'reçu', color: '#d97706', bg: '#fef3c7' }; 
      case 3:
        return { text: 'Envoyé', color: '#2563eb', bg: '#dbeafe' }; 
      case 10:
      case 1:
        return { text: 'Envoyé', color: '#2563eb', bg: '#f3e8ff' }; 
      default:
        return { text: 'En cours', color: '#64748b', bg: '#f1f5f9' };
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
    const currentDiscussionStatut = selectedRootMessage.last_message_statut !== undefined ? selectedRootMessage.last_message_statut : selectedRootMessage.statut;
    const isClosed = currentDiscussionStatut === 4;

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
                <Text style={styles.cloturerBtnText}>À cloturer</Text>
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
                      {/* Affichage propre sans HTML */}
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
              const currentStatut = msg.last_message_statut !== undefined ? msg.last_message_statut : msg.statut;
              const isClosedCard = currentStatut === 4;

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

                  {/* L'aperçu ici profite du nettoyage HTML automatique */}
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
  cloturerBtn: { flexDirection: 'row', backgroundColor: '#dcfce7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' }, 
  cloturerBtnText: { color: '#16a34a', fontWeight: '700', fontSize: 13 }, 
  chatScrollContent: { padding: 16, paddingBottom: 24 },
  
  userBubbleWrapper: { width: '100%', marginBottom: 10, alignItems: 'flex-start' }, 
  userBubble: { backgroundColor: '#fffbeb', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fef08a', marginRight: 40 }, 
  userAuthor: { fontSize: 13, color: '#d97706', fontWeight: '600' },
  userText: { fontSize: 14, color: '#0f172a', lineHeight: 20 },

  cmoBubbleWrapper: { width: '100%', marginBottom: 10, alignItems: 'flex-end' }, 
  cmoBubble: { backgroundColor: '#f0f9ff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#bae6fd', marginLeft: 40 }, 
  cmoAuthor: { fontSize: 13, color: '#0284c7', fontWeight: '600' },
  cmoText: { fontSize: 14, color: '#0f172a', lineHeight: 20 },

  bubbleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 10 },
  bubbleDate: { fontSize: 11, color: '#64748b' },
  chatInputContainer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  chatTextInput: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#334155', maxHeight: 90, backgroundColor: '#fff' },
  chatSendIconBtn: { backgroundColor: '#2563eb', width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  closedDiscussionBanner: { flexDirection: 'row', backgroundColor: '#dcfce7', padding: 16, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#bbf7d0' }, 
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