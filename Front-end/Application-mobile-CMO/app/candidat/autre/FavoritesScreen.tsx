import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AlertCircle, Star, ChevronDown, ChevronUp } from "lucide-react-native";

import { getFavorites } from "@/app/candidat/services/FavoritesScreen";
import {
  removeFavorite,
} from "@/app/candidat/services/CandidateLandingScreen";

/* =========================
   DÉCODAGE DES ENTITÉS HTML
========================= */
function decodeHTML(str?: string | null): string {
  if (!str) return "";
  return str
    // Entités numériques (décimales et hexadécimales)
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Ponctuation et symboles
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&hellip;/g, "…")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    // Accents français
    .replace(/&eacute;/g, "é")
    .replace(/&Eacute;/g, "É")
    .replace(/&egrave;/g, "è")
    .replace(/&Egrave;/g, "È")
    .replace(/&ecirc;/g, "ê")
    .replace(/&Ecirc;/g, "Ê")
    .replace(/&euml;/g, "ë")
    .replace(/&agrave;/g, "à")
    .replace(/&Agrave;/g, "À")
    .replace(/&acirc;/g, "â")
    .replace(/&Acirc;/g, "Â")
    .replace(/&icirc;/g, "î")
    .replace(/&Icirc;/g, "Î")
    .replace(/&iuml;/g, "ï")
    .replace(/&Iuml;/g, "Ï")
    .replace(/&ocirc;/g, "ô")
    .replace(/&Ocirc;/g, "Ô")
    .replace(/&ugrave;/g, "ù")
    .replace(/&Ugrave;/g, "Ù")
    .replace(/&ucirc;/g, "û")
    .replace(/&Ucirc;/g, "Û")
    .replace(/&ccedil;/g, "ç")
    .replace(/&Ccedil;/g, "Ç");
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
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const toggleExpanded = (id: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
    const categoryName = item.categorie || item.metier_titre;
    const rawDescription = item.descr || item.sous_descr || "";
    const descriptionText = decodeHTML(rawDescription.trim());
    const isExpanded = !!expandedCards[item.id];

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
          <>
            <Text 
              numberOfLines={isExpanded ? undefined : 4} 
              ellipsizeMode="tail"
              style={styles.desc}
            >
              {descriptionText}
            </Text>

            <TouchableOpacity 
              style={styles.readMoreBtn}
              onPress={() => toggleExpanded(item.id)}
            >
              <Text style={styles.readMoreText}>
                {isExpanded ? "Réduire " : "Lire la suite "}
              </Text>
              {isExpanded ? 
                <ChevronUp size={14} color="#ffffff" /> : 
                <ChevronDown size={14} color="#ffffff" />
              }
            </TouchableOpacity>
          </>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    fontWeight: "500",
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
    fontSize: 13,
    color: "#1b2d5a",
    lineHeight: 19,
    marginTop: 2,
  },
  bold: {
    fontWeight: "700",
  },
  desc: {
    fontSize: 13,
    marginTop: 10,
    color: "#5b6a8e",
    lineHeight: 18,
  },
  readMoreBtn: {
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 15,
    backgroundColor: "#2b5bbb",
    borderRadius: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
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