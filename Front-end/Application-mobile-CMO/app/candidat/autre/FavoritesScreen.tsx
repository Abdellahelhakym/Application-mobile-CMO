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
  removeFavorite,
} from "@/app/candidat/services/CandidateLandingScreen";

/* =========================
   DÉCODAGE DES ENTITÉS HTML
========================= */
function decodeHTML(str?: string): string {
  if (!str) return "";
  return str
    .replace(/&agrave;/g, "à")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&ecirc;/g, "ê")
    .replace(/&ocirc;/g, "ô")
    .replace(/&icirc;/g, "î")
    .replace(/&rsquo;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/* =========================
   TYPE RÉEL DE L'API
========================= */
interface Favorite {
  id: number;
  titre: string;
  type_contrat: string;
  duree: string;
  lieu: string;
  descr?: string;
  date?: string;
  categorie?: string;
  // Champs optionnels au cas où l'API évolue ou si vous les recevez sur d'autres endpoints
  sous_descr?: string;
  metier_titre?: string | null;
  region_titre?: string | null;
}

/* =========================
   SCREEN
========================= */
export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  /* =========================
     LOAD FAVORITES FROM API
  ========================= */
  async function loadFavorites() {
    try {
      const data = await getFavorites();

      const list: Favorite[] = Array.isArray(data)
        ? data
        : data?.data || data?.favoris || [];

      setFavorites(list);
    } catch (error) {
      console.log("Error loading favorites:", error);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  /* =========================
     SUPPRIMER UN FAVORI
  ========================= */
  async function handleRemoveFavorite(id: number, titre: string) {
    const previousFavorites = [...favorites];
    setFavorites((prev) => prev.filter((item) => item.id !== id));

    try {
      await removeFavorite(id, titre);
    } catch (error) {
      console.log("Error removing favorite:", error);
      setFavorites(previousFavorites);
    }
  }

  /* =========================
     RENDER ITEM
  ========================= */
  const renderItem = ({ item }: { item: Favorite }) => {
    // Récupération de la catégorie (soit categorie, soit metier_titre)
    const categoryName = item.categorie || item.metier_titre;

    // Récupération de la description (soit descr, soit sous_descr)
    const rawDescription = item.descr || item.sous_descr || "";
    const descriptionText = decodeHTML(rawDescription.trim());

    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.star}
            onPress={() => handleRemoveFavorite(item.id, item.titre)}
          >
            <Star size={16} color="#d8c83b" fill="#d8c83b" />
          </TouchableOpacity>

          {categoryName ? (
            <View style={styles.category}>
              <Text style={styles.categoryText}>
                {decodeHTML(categoryName)}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{decodeHTML(item.titre)}</Text>
          </View>
        </View>

        {item.type_contrat ? (
          <Text style={styles.text}>
            <Text style={styles.bold}>Type contrat :</Text>{" "}
            {decodeHTML(item.type_contrat)}
          </Text>
        ) : null}

        {item.duree ? (
          <Text style={styles.text}>
            <Text style={styles.bold}>Durée :</Text> {decodeHTML(item.duree)}
          </Text>
        ) : null}

        <Text style={styles.text}>
          <Text style={styles.bold}>Lieu :</Text>{" "}
          {decodeHTML(item.region_titre || item.lieu)}
        </Text>

        {descriptionText ? (
          <Text numberOfLines={3} style={styles.desc}>
            {descriptionText}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AlertCircle size={50} color="#aaa" />
            <Text style={styles.emptyText}>Aucun favori</Text>
          </View>
        }
      />
    </View>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },
  listContent: {
    padding: 15,
    paddingBottom: 60,
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
    alignItems: "center",
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
    marginBottom: 5,
  },
  headerText: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1b2d5a",
  },
  text: {
    fontSize: 12,
    color: "#1b2d5a",
    marginTop: 2,
  },
  bold: {
    fontWeight: "bold",
  },
  desc: {
    fontSize: 12,
    marginTop: 10,
    color: "#4a5568",
  },
  empty: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: "#6b7280",
  },
});