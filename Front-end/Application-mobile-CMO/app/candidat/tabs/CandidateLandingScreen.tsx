import React, { useCallback, useEffect, useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl 
} from 'react-native';

import { AlertCircle, Star } from 'lucide-react-native';

import { useFocusEffect } from 'expo-router';

import {
  addtoFavorites,
  getCandidatures,
  isfavorite
} from "@/app/candidat/services/CandidateLandingScreen";

interface Application {
  id: number;
  titre: string;
  reference: string;
  type_contrat: string;
  duree: string;
  lieu: string;
  categorie: string;
  descr: string;
}

// 🔧 Décodage des entités HTML (gère les accents comme dans "Chef d’équipe restauration rapide")
const decodeHTML = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&euml;/g, 'ë')
    .replace(/&agrave;/g, 'à')
    .replace(/&acirc;/g, 'â')
    .replace(/&icirc;/g, 'î')
    .replace(/&iuml;/g, 'ï')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&ucirc;/g, 'û')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

export default function ApplicationsScreen() {
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [applications, setApplications] = useState<Application[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const isFav = (id: number) => !!favorites[id];

  const toggleExpanded = (id: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  async function loadFavorites(ids: number[]) {
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

      setFavorites(next);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddToFavorites(id: number, titre: string) {
    try {
      const response = await addtoFavorites(id, titre);
      
      const res = await isfavorite(id);
      const isFavorite = !!(
        res?.isFavorite ?? res?.favorite ?? res?.data?.isFavorite
      );

      setFavorites((prev) => ({
        ...prev,
        [id]: isFavorite,
      }));
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  }

  // GET DATA
  async function getData() {
    try {
      const payload = await getCandidatures();

      const list: Application[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.candidatures)
        ? payload.candidatures
        : Array.isArray(payload?.offres)
        ? payload.offres
        : Array.isArray(payload?.offers)
        ? payload.offers
        : Array.isArray(payload?.results)
        ? payload.results
        : [];

      setApplications(list);
      if (list.length > 0) {
        await loadFavorites(list.map((item) => item.id));
      }
    } catch (error) {
      console.log(error);
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
      if (applications.length === 0) {
        getData();
      } else {
        loadFavorites(applications.map((item) => item.id));
      }
    }, [applications])
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

        {applications.map((app) => (
          <View key={app.id} style={styles.card}>

            {/* TOP */}
            <View style={styles.topRow}>

              <TouchableOpacity
                style={styles.star}
                onPress={() => handleAddToFavorites(app.id, app.titre)}
              >
                <Star
                  size={16}
                  color={isFav(app.id) ? "#d8c83b" : "#9ca3af"}
                  fill={isFav(app.id) ? "#d8c83b" : "transparent"}
                />
              </TouchableOpacity>

              <View style={styles.categorie}>
                <Text style={styles.categorieText}>
                  {decodeHTML(app.categorie)}
                </Text>
              </View>
            </View>

            {/* titre */}
            <Text style={styles.titre}>
              {decodeHTML(app.titre)}
            </Text>

            <Text style={styles.ref}>
              Référence : #{'18093' + app.id}
            </Text>

            {/* INFO */}
            <Text style={styles.text}>
              <Text style={styles.bold}>Type de contrat :</Text> {decodeHTML(app.type_contrat)}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.bold}>Durée :</Text> {decodeHTML(app.duree)}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.bold}>Région :</Text> {decodeHTML(app.lieu)}
            </Text>

            {/* DESC - Aperçu ou complet */}
            {expandedCards[app.id] ? (
              <>
                <Text style={styles.desc}>
                  {decodeHTML(app.descr)}
                </Text>
                <TouchableOpacity 
                  style={styles.readMoreBtn}
                  onPress={() => toggleExpanded(app.id)}
                >
                  <Text style={styles.readMoreText}>Réduire</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.desc} numberOfLines={3}>
                  {decodeHTML(app.descr)}
                </Text>
                <TouchableOpacity 
                  style={styles.readMoreBtn}
                  onPress={() => toggleExpanded(app.id)}
                >
                  <Text style={styles.readMoreText}>Lire la suite →</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        ))}

        {/* EMPTY */}
        {applications.length === 0 && (
          <View style={styles.empty}>
            <AlertCircle size={50} color="#aaa" />
            <Text style={{ marginTop: 8, color: '#6b7280' }}>Aucune offre</Text>
          </View>
        )}

      </View>
    </ScrollView>
  );
}

/* ================= STYLE ================= */
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
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  star: {
    backgroundColor: '#f6f8ff',
    padding: 8,
    borderRadius: 20,
  },
  categorie: {
    backgroundColor: '#fff1dc',
    paddingHorizontal: 10,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  categorieText: {
    fontSize: 12,
    color: '#b87900',
  },
  titre: {
    fontSize: 16,
    color: '#1b2d5a',
    fontWeight: '600'
  },
  ref: {
    fontSize: 12,
    marginTop: 5,
    color: '#2b5bbb',
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    color: '#1b2d5a',
    lineHeight: 18,
  },
  bold: {
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 12,
    marginTop: 10,
    color: '#5b6a8e',
    lineHeight: 18,
  },
  readMoreBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2b5bbb',
    borderRadius: 20,
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
  },
});