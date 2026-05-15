import React, { useCallback, useEffect, useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { AlertCircle, Star } from 'lucide-react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  addtoFavorites,
  getCandidatures,
  isfavorite
} from "@/app/candidat/services/CandidateLandingScreen";

//(`id`, `titre`, `type_contrat`, `duree`, `lieu`, `categorie`, `descr`, `id_metiers`, `date`, `deleted`)
// type_contrat
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
      console.log("Add to favorites response:", response);
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

  // STATE
  const [applications, setApplications] = useState<Application[]>([]);

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

      console.log("Offres data:", list);

      setApplications(list);
      if (list.length > 0) {
        loadFavorites(list.map((item) => item.id));
      }

    } catch (error) {
      console.log(error);
    }
  }

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
    <ScrollView style={styles.container}>
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
              Référence : {app.reference}
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
            <Text>Aucune offre</Text>
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
    marginBottom: 50,
  },

  content: {
    padding: 15,
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
    borderRadius: 20,
  },

  categorieText: {
    fontSize: 12,
    color: '#b87900',
  },

  titre: {
    fontSize: 16,
    color: '#1b2d5a',
  },

  ref: {
    fontSize: 12,
    marginTop: 5,
    color: '#2b5bbb',
  },

  text: {
    fontSize: 12,
    color: '#1b2d5a',
  },

  bold: {
    fontWeight: 'bold',
  },

  desc: {
    fontSize: 12,
    marginTop: 10,
    color: '#1b2d5a',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  primaryBtn: {
    backgroundColor: '#2b5bbb',
    padding: 10,
    borderRadius: 20,
  },

  primaryText: {
    color: 'white',
    fontSize: 12,
  },

  secondaryBtn: {
    backgroundColor: '#fff1dc',
    padding: 10,
    borderRadius: 20,
  },

  secondaryText: {
    color: '#b87900',
    fontSize: 12,
  },

  empty: {
    alignItems: 'center',
    marginTop: 50,
  },
});