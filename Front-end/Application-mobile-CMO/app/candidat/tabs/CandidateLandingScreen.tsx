import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Alert
} from 'react-native';
import { AlertCircle, Star, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { getToutMobilite } from "@/app/candidat/services/CVScreen";
import {
  addtoFavorites,
  removeFavorite,
  getCandidatures
} from "@/app/candidat/services/CandidateLandingScreen";

// --- INTERFACES ---
interface Application {
  id: number;
  titre: string;
  type_contrat: string;
  duree: string;
  sous_descr: string | null;
  lieu: string | number;
  metier_titre: string | null;
  metier_icone: string | null;
  region_titre: string | null;
  date_postulation: string;
  favori_id: number | null;
}

interface Mobilite {
  id: number;
  titre: string;
  deleted: number;
}

// --- UTILITAIRE DE DÉCODAGE HTML ---
const decodeHTML = (str: string | undefined | null): string => {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&euml;/g, 'ë')
    .replace(/&agrave;/g, 'à')
    .replace(/&acirc;/g, 'â')
    .replace(/&icirc;/g, 'î')
    .replace(/&Icirc;/g, 'Î')
    .replace(/&iuml;/g, 'ï')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&ucirc;/g, 'û')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

// --- COMPOSANT PRINCIPAL ---
export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [mobilites, setMobilites] = useState<Record<number, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const toggleExpanded = (id: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // --- GESTION DES FAVORIS ---
  const handleToggleFavorite = async (app: Application) => {
    const isFav = app.favori_id !== null;
    const oldFavoriId = app.favori_id;

    // 1. Mise à jour VISUELLE IMMÉDIATE (Optimistic UI)
    setApplications((prevApps) =>
      prevApps.map((item) => {
        if (item.id === app.id) {
          return {
            ...item,
            favori_id: isFav ? null : 999, // bascule entre null et une valeur non-null
          };
        }
        return item;
      })
    );

    // 2. Appel API en arrière-plan
    try {
      if (isFav) {
        console.log("Suppression favori ID :", app.id);
        await removeFavorite(app.id, app.titre);
      } else {
        console.log("Ajout favori ID :", app.id);
        await addtoFavorites(app.id, app.titre);
      }
    } catch (error) {
      console.error("Erreur API favoris :", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le favori.");

      // 3. Annulation en cas d'erreur de l'API (Retour à l'état précédent)
      setApplications((prevApps) =>
        prevApps.map((item) => {
          if (item.id === app.id) {
            return {
              ...item,
              favori_id: oldFavoriId,
            };
          }
          return item;
        })
      );
    }
  };

  // Helper pour trouver le libellé du lieu
  const getLieuLabel = (lieu: string | number): string => {
    if (lieu === null || lieu === undefined) return '';

    const lieuId = Number(lieu);
    if (!isNaN(lieuId) && mobilites[lieuId]) {
      return decodeHTML(mobilites[lieuId]);
    }

    return decodeHTML(String(lieu));
  };

  // Récupération des données
  async function getData() {
    try {
      const [payload, mobilitesRes] = await Promise.all([
        getCandidatures(),
        getToutMobilite().catch(() => [])
      ]);

      // Traitement des mobilités
      const mobList: Mobilite[] = Array.isArray(mobilitesRes)
        ? mobilitesRes
        : Array.isArray(mobilitesRes?.data)
        ? mobilitesRes.data
        : [];

      const mobMap: Record<number, string> = {};
      mobList.forEach((m) => {
        mobMap[m.id] = m.titre;
      });
      setMobilites(mobMap);

      // Traitement des candidatures
      const list: Application[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.candidatures)
        ? payload.candidatures
        : [];

      setApplications(list);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    getData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#2b5bbb"]} 
          tintColor="#2b5bbb"   
        />
      }
    >
      <View style={styles.content}>

        {applications.map((app) => {
          const isFav = app.favori_id !== null;
          const isExpanded = !!expandedCards[app.id];

          return (
            <View key={app.id} style={styles.card}>

              {/* SECTION HAUTE : Favori et Métier */}
              <View style={styles.topRow}>
                <TouchableOpacity
                  style={styles.star}
                  activeOpacity={0.6}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => handleToggleFavorite(app)}
                >
                  <Star
                    size={20}
                    color={isFav ? "#d8c83b" : "#9ca3af"}
                    fill={isFav ? "#d8c83b" : "transparent"}
                  />
                </TouchableOpacity>

                {app.metier_titre && (
                  <View style={styles.categorie}>
                    <Text style={styles.categorieText}>
                      {decodeHTML(app.metier_titre)}
                    </Text>
                  </View>
                )}
              </View>

              {/* TITRE ET RÉFÉRENCE */}
              <Text style={styles.titre}>
                {decodeHTML(app.titre)}
              </Text>
              <Text style={styles.ref}>
                Référence : #{'18093' + app.id}
              </Text>

              {/* INFORMATIONS CLÉS */}
              <Text style={styles.text}>
                <Text style={styles.bold}>Type de contrat :</Text> {decodeHTML(app.type_contrat)}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>Durée :</Text> {decodeHTML(app.duree)}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>Lieu :</Text> {getLieuLabel(app.lieu)}
              </Text>

              {/* DESCRIPTION (sous_descr) */}
              {app.sous_descr && (
                <>
                  <Text 
                    style={styles.sousDescr}
                    numberOfLines={isExpanded ? undefined : 4} 
                    ellipsizeMode="tail"
                  >
                    {decodeHTML(app.sous_descr)}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.readMoreBtn}
                    onPress={() => toggleExpanded(app.id)}
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
              )}

            </View>
          );
        })}

        {/* ÉTAT VIDE */}
        {applications.length === 0 && (
          <View style={styles.empty}>
            <AlertCircle size={50} color="#aaa" />
            <Text style={{ marginTop: 8, color: '#6b7280' }}>Aucune candidature trouvée</Text>
          </View>
        )}

      </View>
    </ScrollView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },
  content: {
    padding: 15,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: 'white',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  star: {
    backgroundColor: '#f6f8ff',
    padding: 8,
    borderRadius: 20,
    zIndex: 10, // S'assure que le bouton est cliquable
  },
  categorie: {
    backgroundColor: '#fff1dc',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categorieText: {
    fontSize: 12,
    color: '#b87900',
    fontWeight: '500',
  },
  titre: {
    fontSize: 16,
    color: '#1b2d5a',
    fontWeight: '600',
    marginBottom: 2,
  },
  ref: {
    fontSize: 12,
    color: '#2b5bbb',
    marginBottom: 8,
    fontWeight: '500',
  },
  text: {
    fontSize: 13,
    color: '#1b2d5a',
    lineHeight: 19,
    marginBottom: 2,
  },
  bold: {
    fontWeight: '700',
    color: '#1b2d5a',
  },
  sousDescr: {
    fontSize: 13,
    marginTop: 12,
    color: '#5b6a8e',
    lineHeight: 18,
  },
  readMoreBtn: {
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 15,
    backgroundColor: '#2b5bbb',
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 20,
  },
});