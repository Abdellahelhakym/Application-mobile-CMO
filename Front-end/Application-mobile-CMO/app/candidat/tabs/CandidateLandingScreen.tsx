import React, { useCallback, useEffect, useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl // <-- 1. Importation de RefreshControl
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

export default function ApplicationsScreen() {
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [applications, setApplications] = useState<Application[]>([]);
  
  // <-- 2. État pour gérer l'animation du loader
  const [refreshing, setRefreshing] = useState(false);

  const isFav = (id: number) => !!favorites[id];

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

  // <-- 3. Fonction déclenchée lors du swipe vers le bas
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
    /* <-- 4. Intégration du RefreshControl dans la ScrollView */
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#2b5bbb"]} // Android loader color
          tintColor="#2b5bbb"   // iOS loader color
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
                  {app.categorie}
                </Text>
              </View>
            </View>

            {/* titre */}
            <Text style={styles.titre}>
              {app.titre}
            </Text>

            <Text style={styles.ref}>
              Référence : #{'18093' + app.id}
            </Text>

            {/* INFO */}
            <Text style={styles.text}>
              <Text style={styles.bold}>type_contrat :</Text> {app.type_contrat}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.bold}>Durée :</Text> {app.duree}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.bold}>Région :</Text> {app.lieu}
            </Text>

            {/* DESC */}
            <Text style={styles.desc}>
              {app.descr}
            </Text>

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
    paddingBottom: 110, // Le paddingBottom est appliqué ici pour laisser de l'espace à la fin du scroll sans casser le refresh
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
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
  },
});