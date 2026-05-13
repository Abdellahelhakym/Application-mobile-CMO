import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  MapPin,
  Clock,
  Euro,
  Heart,
  Briefcase,
  Trash2,
} from "lucide-react-native";

const initialFavorites = [
  {
    id: 2,
    title: "Tractoriste polyvalent (H/F)",
    reference: "#18293756",
    type: "CDI",
    duration: "test",
    region: "test",
    description:
      "Nous recrutons un tractoriste polyvalent en CDI afin de réaliser les activités de cultures (élevage de porcs, cultures mécaniques…).",
    salary: "2150€ - 2200€ brut mensuel",
    category: "Agriculture",
    savedDate: "12 mars 2026",
  },
];

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState(initialFavorites);

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      {/* HEADER CARD */}
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Briefcase size={16} color="#1e3a8a" />
            <Text style={styles.category}>{item.category}</Text>
            <Heart size={16} color="red" />
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.ref}>Référence: {item.reference}</Text>
        </View>

        <TouchableOpacity onPress={() => removeFavorite(item.id)}>
          <Trash2 size={20} color="red" />
        </TouchableOpacity>
      </View>

      {/* TAGS */}
      <View style={styles.tags}>
        <View style={styles.tagBlue}>
          <Briefcase size={12} color="#1e3a8a" />
          <Text style={styles.tagText}>{item.type}</Text>
        </View>

        <View style={styles.tagGreen}>
          <Clock size={12} color="#15803d" />
          <Text style={styles.tagTextGreen}>{item.duration}</Text>
        </View>

        <View style={styles.tagPurple}>
          <MapPin size={12} color="#6b21a8" />
          <Text style={styles.tagTextPurple}>{item.region}</Text>
        </View>
      </View>

      {/* DESCRIPTION */}
      <Text numberOfLines={2} style={styles.desc}>
        {item.description}
      </Text>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View>
          <View style={styles.row}>
            <Euro size={16} color="#1e3a8a" />
            <Text style={styles.salary}>{item.salary}</Text>
          </View>

          <Text style={styles.date}>Sauvegardé le {item.savedDate}</Text>
        </View>

        <TouchableOpacity style={styles.applyBtn}>
          <Text style={styles.applyText}>Postuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* LIST */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Heart size={50} color="#ccc" />
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore sauvegardé d'offres.
            </Text>
          </View>
        }
      />
    </View>
  );
}

/* STYLE */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  category: {
    fontSize: 11,
    color: "#6b7280",
  },

  title: {
    fontSize: 15,
    color: "#1e3a8a",
    marginTop: 5,
  },

  ref: {
    fontSize: 11,
    color: "#9ca3af",
  },

  tags: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 10,
    flexWrap: "wrap",
  },

  tagBlue: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: "#dbeafe",
    padding: 5,
    borderRadius: 6,
    alignItems: "center",
  },

  tagGreen: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: "#dcfce7",
    padding: 5,
    borderRadius: 6,
    alignItems: "center",
  },

  tagPurple: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: "#ede9fe",
    padding: 5,
    borderRadius: 6,
    alignItems: "center",
  },

  tagText: {
    fontSize: 10,
    color: "#1e3a8a",
  },

  tagTextGreen: {
    fontSize: 10,
    color: "#15803d",
  },

  tagTextPurple: {
    fontSize: 10,
    color: "#6b21a8",
  },

  desc: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 10,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },

  salary: {
    fontSize: 12,
    color: "#1e3a8a",
  },

  date: {
    fontSize: 10,
    color: "#9ca3af",
  },

  applyBtn: {
    backgroundColor: "#1e3a8a",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  applyText: {
    color: "#fff",
    fontSize: 12,
  },

  empty: {
    alignItems: "center",
    marginTop: 80,
  },

  emptyTitle: {
    fontSize: 16,
    color: "#111827",
    marginTop: 10,
  },

  emptyText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 5,
  },
});