import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { Bell, Briefcase, MessageSquare, CheckCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { getNotification } from '../../candidat/services/messagerie'; 

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'message' | 'recrutement' | 'validation' | 'info';
  isRead: boolean;
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

export default function NotificationScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getNotification();
      if (response && response.success) {
        const formattedData: NotificationItem[] = response.ids_msg.map((id: number, index: number) => {
          const rawMessage = response.messages[index] || "Vous avez reçu un nouveau message.";
          
          return {
            id: id.toString(),
            title: "Nouveau message reçu",
            // Traitement complet de la chaîne de caractères
            description: cleanHtml(rawMessage), 
            type: "message",
            isRead: false,
            time: "", 
          };
        });
        setNotifications(formattedData);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageSquare size={20} color="#2b5bbb" />;
      case "validation": return <CheckCircle size={20} color="#2e7d5c" />;
      case "recrutement": return <Briefcase size={20} color="#b87400" />;
      default: return <Bell size={20} color="#1b2d5a" />;
    }
  };

  const handlePress = (item: NotificationItem) => {
    if (item.type === 'message') {
      router.push({
        pathname: "/candidat/autre/Chat",
        params: { id_msg: item.id }
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2b5bbb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.counterText}>
          Vous avez {notifications.length} {notifications.length > 1 ? "Notifications" : "Notification"}
        </Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={48} color="#cfd9ee" />
            <Text style={styles.emptyText}>Aucune notification pour le moment.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>{renderIcon(item.type)}</View>
            <View style={styles.textContainer}>
              <View style={styles.row}>
                <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              {/* Le texte s'affiche ici de manière propre sur un maximum de 2 lignes */}
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef3ff" },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 10 },
  counterText: { fontSize: 14, color: '#64748b', marginTop: 5 },
  listContent: { padding: 15, gap: 12 },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    shadowColor: "#1b2d5a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: "#2b5bbb" },
  iconContainer: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: "#eef3ff", justifyContent: "center",
    alignItems: "center", marginRight: 12,
  },
  textContainer: { flex: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 14, fontWeight: "600", color: "#4a5568", flex: 1 },
  unreadText: { color: "#1b2d5a", fontWeight: "700" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2b5bbb", marginLeft: 8 },
  description: { fontSize: 13, color: "#64748b", lineHeight: 18, marginBottom: 6 },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 40, gap: 10 },
  emptyText: { color: "#7a8baf", fontSize: 14 },
});