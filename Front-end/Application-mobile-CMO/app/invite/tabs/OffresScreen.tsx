import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { getOffres } from "@/app/invite/services/offres";

// --- UTILITAIRE DE DÉCODAGE HTML ---
const NAMED_ENTITIES: Record<string, string> = {
  rsquo: "'", lsquo: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…",
  quot: '"', apos: "'", amp: "&", lt: "<", gt: ">",
  eacute: "é", Eacute: "É", egrave: "è", Egrave: "È", ecirc: "ê", Ecirc: "Ê", euml: "ë",
  agrave: "à", Agrave: "À", acirc: "â", Acirc: "Â",
  icirc: "î", Icirc: "Î", iuml: "ï", Iuml: "Ï",
  ocirc: "ô", Ocirc: "Ô", ugrave: "ù", Ugrave: "Ù", ucirc: "û", Ucirc: "Û",
  ccedil: "ç", Ccedil: "Ç",
};

const decodeHTML = (str: string | number | undefined | null): string => {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m)
    .replace(/<[^>]+>/g, " ") // retire d'éventuelles balises HTML
    .replace(/\s+/g, " ")
    .trim();
};

interface Offre {
  id: number;
  titre: string;
  type_contrat: string;
  ville: string;
  code_postal: number | string | null;
  descr: string;
  region_titre: string;
  // Champs optionnels (utilisés s'ils existent dans l'API)
  categorie?: string;
  duree?: string;
  url?: string;
}

// --- CARTE D'UNE OFFRE ---
const OffreCard = ({ item }: { item: Offre }) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [favori, setFavori] = useState(false);

  const categorie = decodeHTML(item.categorie) || decodeHTML(item.type_contrat) || "Offre";
  const region = decodeHTML(item.region_titre) || "Toute la France";
  const codePostal = item.code_postal ? String(item.code_postal) : "N'est pas mentionné";

  return (
    <View style={styles.card}>
      {/* En-tête : favori + catégorie */}
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={() => setFavori(!favori)} hitSlop={10}>
          <Text style={styles.star}>{favori ? "★" : "☆"}</Text>
        </TouchableOpacity>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {categorie}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{decodeHTML(item.titre)}</Text>

      {/* Infos */}
      <Text style={styles.infoLine}>
        <Text style={styles.infoLabel}>Référence : </Text>#{item.id}
      </Text>
      <Text style={styles.infoLine}>
        <Text style={styles.infoLabel}>Type de contrat : </Text>
        {decodeHTML(item.type_contrat) || "N'est pas mentionné"}
      </Text>
      {!!item.duree && (
        <Text style={styles.infoLine}>
          <Text style={styles.infoLabel}>Durée : </Text>
          {decodeHTML(item.duree)}
        </Text>
      )}
      <Text style={styles.infoLine}>
        <Text style={styles.infoLabel}>Région : </Text>
        {region}
      </Text>
      <Text style={styles.infoLine}>
        <Text style={styles.infoLabel}>Code postal : </Text>
        {codePostal}
      </Text>

      <Text style={styles.description} numberOfLines={expanded ? undefined : 3}>
        {decodeHTML(item.descr)}
      </Text>

      {/* Boutons */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => router.push("/loginCan")}
        >
          <Text style={styles.applyText}>Postuler ↗</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton} onPress={() => setExpanded(!expanded)}>
          <Text style={styles.moreText}>{expanded ? "Réduire ←" : "Lire la suite ⟶"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function OffresScreen() {
  const router = useRouter();
  const [offres, setOffres] = useState<Offre[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOffres, setTotalOffres] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchOffres(page);
  }, [page]);

  const fetchOffres = async (pageNumber: number) => {
    try {
      setLoading(true);
      const response = await getOffres(pageNumber);
      if (response && response.success) {
        setOffres(response.offres);
        setTotalPages(response.pages);
        // Adapter au nom du champ renvoyé par votre API
        const total = response.total ?? response.total_offres ?? response.count;
        if (total !== undefined) setTotalOffres(Number(total));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des offres :", error);
    } finally {
      setLoading(false);
    }
  };

  // Pages visibles : 1 … (page-2 → page+2) … dernière
  const visiblePages = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("ellipsis");
    }
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/")}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Offres d'emploi</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des offres...</Text>
        </View>
      ) : (
        <FlatList
          data={offres}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <OffreCard item={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Barre de pagination */}
      <View style={styles.paginationBar}>
        <Text style={styles.paginationInfo}>
          {totalOffres !== null ? `${totalOffres} offres disponibles • ` : ""}
          Page {page} / {totalPages}
        </Text>

        <View style={styles.pagesRow}>
          {page > 1 && (
            <TouchableOpacity style={styles.pageItem} onPress={() => setPage(page - 1)}>
              <Text style={styles.pageText}>‹</Text>
            </TouchableOpacity>
          )}

          {visiblePages.map((p, idx) =>
            p === "ellipsis" ? (
              <Text key={`e${idx}`} style={styles.ellipsis}>
                …
              </Text>
            ) : (
              <TouchableOpacity
                key={p}
                style={[styles.pageItem, p === page && styles.pageItemActive]}
                onPress={() => setPage(p)}
              >
                <Text style={[styles.pageText, p === page && styles.pageTextActive]}>{p}</Text>
              </TouchableOpacity>
            )
          )}

          {page < totalPages && (
            <TouchableOpacity style={styles.pageItem} onPress={() => setPage(page + 1)}>
              <Text style={styles.pageText}>›</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const COLORS = {
  background: "#EEF1FF",
  card: "#FFFFFF",
  primary: "#435D9E",
  navy: "#14286B",
  peach: "#FFF1E0",
  star: "#E3B93C",
  muted: "#6B7280",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 16,
    marginBottom: 8,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  // Carte
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 14,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  star: {
    fontSize: 26,
    color: COLORS.star,
    lineHeight: 28,
  },
  categoryPill: {
    flexShrink: 1,
    backgroundColor: COLORS.peach,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: "auto",
  },
  categoryText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.primary,
    lineHeight: 30,
    marginBottom: 14,
  },
  infoLine: {
    fontSize: 14,
    color: COLORS.navy,
    lineHeight: 24,
  },
  infoLabel: {
    fontWeight: "700",
    color: COLORS.navy,
  },
  description: {
    fontSize: 14,
    color: COLORS.navy,
    lineHeight: 24,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  applyText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  moreButton: {
    backgroundColor: COLORS.peach,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  moreText: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: "700",
  },

  // Chargement
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.muted,
  },

  // Pagination
  paginationBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    rowGap: 8,
  },
  paginationInfo: {
    color: COLORS.navy,
    fontSize: 14,
  },
  pagesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pageItem: {
    minWidth: 40,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  pageItemActive: {
    backgroundColor: COLORS.primary,
  },
  pageText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "700",
  },
  pageTextActive: {
    color: "#FFFFFF",
  },
  ellipsis: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 4,
  },
});