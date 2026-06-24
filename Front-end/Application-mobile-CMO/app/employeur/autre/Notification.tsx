import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { Bell, Briefcase, MessageSquare, CheckCircle, Clock } from "lucide-react-native";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'message' | 'recrutement' | 'validation' | 'info';
  isRead: boolean;
}

const DATA_MOCK: NotificationItem[] = [
  {
    id: "1",
    title: "Nouveau message du candidat",
    description: "Amine El Amrani vous a envoyé un message concernant l'entretien de demain.",
    time: "Il y a 5 min",
    type: "message",
    isRead: false,
  },
  {
    id: "2",
    title: "Commande validée !",
    description: "Votre commande de poste pour 'Développeur React Native' a été validée par nos équipes.",
    time: "Il y a 1 heure",
    type: "validation",
    isRead: false,
  },
  {
    id: "3",
    title: "Candidat proposé",
    description: "Un nouveau profil correspond à votre recherche pour le poste de Commercial.",
    time: "Hier",
    type: "recrutement",
    isRead: true,
  },
  {
    id: "4",
    title: "Rappel Entretien",
    description: "N'oubliez pas votre entretien planifié aujourd'hui à 14h00 avec Sarah Latifi.",
    time: "Hier",
    type: "info",
    isRead: true,
  },
];

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DATA_MOCK);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(item => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare size={20} color="#2b5bbb" />;
      case "validation":
        return <CheckCircle size={20} color="#2e7d5c" />;
      case "recrutement":
        return <Briefcase size={20} color="#b87400" />;
      default:
        return <Bell size={20} color="#1b2d5a" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
          >
            {/* Icône à gauche */}
            <View style={styles.iconContainer}>{renderIcon(item.type)}</View>

            {/* Contenu textuel */}
            <View style={styles.textContainer}>
              <View style={styles.row}>
                <Text style={[styles.title, !item.isRead && styles.unreadText]}>
                  {item.title}
                </Text>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.description}>{item.description}</Text>
              
              <View style={styles.timeRow}>
                <Clock size={12} color="#7a8baf" />
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },
  listContent: {
    padding: 15,
    gap: 12,
  },
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
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2b5bbb",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eef3ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a5568",
    flex: 1,
  },
  unreadText: {
    color: "#1b2d5a",
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2b5bbb",
    marginLeft: 8,
  },
  description: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: "#7a8baf",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    gap: 10,
  },
  emptyText: {
    color: "#7a8baf",
    fontSize: 14,
  },
});