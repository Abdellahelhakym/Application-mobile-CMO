import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Star, AlertCircle } from 'lucide-react-native';

import {
  getCandidatures,
} from "@/app/candidat/services/CandidateLandingScreen";

// TYPE
interface Application {
  id: number;
  title: string;
  reference: string;
  type: string;
  duration: string;
  region: string;
  category: string;
  description: string;
  applied: boolean;
}

export default function ApplicationsScreen() {

  // STATE
  const [applications, setApplications] = useState<Application[]>([]);

  // GET DATA
  async function getData() {
    try {

      const data: Application[] = await getCandidatures();

      console.log("Candidatures data:", data);

      setApplications(data);

    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        {applications.map((app) => (
          <View key={app.id} style={styles.card}>

            {/* TOP */}
            <View style={styles.topRow}>
              <View style={styles.star}>
                <Star size={16} color="#f7b500" />
              </View>

              <View style={styles.category}>
                <Text style={styles.categoryText}>
                  {app.category}
                </Text>
              </View>
            </View>

            {/* TITLE */}
            <Text style={styles.title}>
              {app.title}
            </Text>

            <Text style={styles.ref}>
              Référence : {app.reference}
            </Text>

            {/* INFO */}
            <Text style={styles.text}>
              <Text style={styles.bold}>Type :</Text> {app.type}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.bold}>Durée :</Text> {app.duration}
            </Text>

            <Text style={styles.text}>
              <Text style={styles.bold}>Région :</Text> {app.region}
            </Text>

            {/* DESC */}
            <Text style={styles.desc}>
              {app.description}
            </Text>

          

          </View>
        ))}

        {/* EMPTY */}
        {applications.length === 0 && (
          <View style={styles.empty}>
            <AlertCircle size={50} color="#aaa" />
            <Text>Aucune candidature</Text>
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

  category: {
    backgroundColor: '#fff1dc',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  categoryText: {
    fontSize: 12,
    color: '#b87900',
  },

  title: {
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