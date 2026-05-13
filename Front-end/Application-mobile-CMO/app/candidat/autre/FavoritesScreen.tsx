import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AlertCircle, Star } from "lucide-react-native";

import { getFavorites } from "@/app/candidat/services/FavoritesScreen";

/* =========================
   TYPE
========================= */
interface Favorite {
  id: number;
  title: string;
  reference: string;
  type: string;
  duration: string;
  region: string;
  description: string;
  salary?: string;
  category: string;
  savedDate?: string;
}

/* =========================
   SCREEN
========================= */
export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  /* =========================
     LOAD FAVORITES FROM API
  ========================= */
  async function loadFavorites() {
    try {
      const data = await getFavorites();

      const list: Favorite[] = Array.isArray(data)
        ? data
        : data?.data || data?.favoris || [];

      console.log("favorites API:", list);

      setFavorites(list);
    } catch (error) {
      console.log("Error loading favorites:", error);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  /* =========================
     RENDER ITEM
  ========================= */
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.star}>
          <Star size={16} color="#d8c83b" fill="#d8c83b" />
        </View>

        <View style={styles.category}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.ref}>Référence : {item.reference}</Text>
        </View>
      </View>

      <Text style={styles.text}>
        <Text style={styles.bold}>Type :</Text> {item.type}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.bold}>Durée :</Text> {item.duration}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.bold}>Région :</Text> {item.region}
      </Text>

      <Text numberOfLines={2} style={styles.desc}>
        {item.description}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AlertCircle size={50} color="#aaa" />
            <Text>Aucun favori</Text>
          </View>
        }
      />
    </View>
  );
}

/* =========================
   STYLE (UNCHANGED)
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  star: {
    backgroundColor: "#f6f8ff",
    padding: 8,
    borderRadius: 20,
  },

  category: {
    backgroundColor: "#fff1dc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  categoryText: {
    fontSize: 12,
    color: "#b87900",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerText: {
    flex: 1,
    paddingRight: 10,
  },

  title: {
    fontSize: 16,
    color: "#1b2d5a",
  },

  ref: {
    fontSize: 12,
    marginTop: 5,
    color: "#2b5bbb",
  },

  text: {
    fontSize: 12,
    color: "#1b2d5a",
  },

  bold: {
    fontWeight: "bold",
  },

  desc: {
    fontSize: 12,
    marginTop: 10,
    color: "#1b2d5a",
  },

  empty: {
    alignItems: "center",
    marginTop: 50,
  },
});