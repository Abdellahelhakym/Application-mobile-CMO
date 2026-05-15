import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AlertCircle, Star } from "lucide-react-native";

import { getFavorites } from "@/app/candidat/services/FavoritesScreen";

import {
  addtoFavorites,
  isfavorite
} from "@/app/candidat/services/CandidateLandingScreen";


/* =========================
   TYPE
========================= */
interface Favorite {
  id: number;
  titre: string;
  type_contrat: string;
  duree: string;
  lieu: string;
  categorie: string;
  descr: string;
  date: string;
}

/* =========================
   SCREEN
========================= */
export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteState, setFavoriteState] = useState<Record<number, boolean>>({});
  const isFav = (id: number) => !!favoriteState[id];

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

  useEffect(() => {
    if (favorites.length > 0) {
      refreshFavoriteState(favorites.map((item) => item.id));
    }
  }, [favorites]);

  async function refreshFavoriteState(ids: number[]) {
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await isfavorite(id);
          const isFavorite = !!(
            res?.isFavorite ?? res?.favorite ?? res?.data?.isFavorite
          );
          return [id, isFavorite] as const;
        })
      );

      const next: Record<number, boolean> = {};
      results.forEach(([id, isFavorite]) => {
        if (isFavorite) {
          next[id] = true;
        }
      });

      setFavoriteState(next);
    } catch (error) {
      console.log("Error loading favorite state:", error);
    }
  }

  async function handleToggleFavorite(id: number, titre: string) {
    try {
      const response = await addtoFavorites(id, titre);
      console.log("Toggle favorite response:", response);

      const res = await isfavorite(id);
      const isFavorite = !!(
        res?.isFavorite ?? res?.favorite ?? res?.data?.isFavorite
      );

      setFavoriteState((prev) => ({
        ...prev,
        [id]: isFavorite,
      }));
    } catch (error) {
      console.log("Error toggling favorite:", error);
    }
  }

  /* =========================
     RENDER ITEM
  ========================= */
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.star}
          onPress={() => handleToggleFavorite(item.id, item.titre)}
        >
          <Star
            size={16}
            color={isFav(item.id) ? "#d8c83b" : "#9ca3af"}
            fill={isFav(item.id) ? "#d8c83b" : "transparent"}
          />
        </TouchableOpacity>

        <View style={styles.category}>
          <Text style={styles.categoryText}>{item.categorie}</Text>
        </View>
      </View>

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{item.titre}</Text>
          <Text style={styles.ref}>Date : {item.date}</Text>
        </View>
      </View>

      <Text style={styles.text}>
        <Text style={styles.bold}>Type contrat :</Text> {item.type_contrat}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.bold}>Duree :</Text> {item.duree}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.bold}>Lieu :</Text> {item.lieu}
      </Text>

      <Text numberOfLines={3} style={styles.desc}>
        {item.descr}
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