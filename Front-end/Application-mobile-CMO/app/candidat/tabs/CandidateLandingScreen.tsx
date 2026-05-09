import React from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Star, AlertCircle } from 'lucide-react-native';

const applications = [
  {
    id: 1,
    title: 'Ouvrier viticole (H/F)',
    reference: '#18293758',
    type: 'CDD',
    duration: '4 à 6 mois',
    region: 'Bourgogne-Franche-Comté',
    category: 'Viticulture',
    description:
      "Nous recrutons un ouvrier viticole en CDD afin de realiser les travaux saisonniers de la vigne.",
    applied: true,
  },
  {
    id: 2,
    title: 'Tractoriste polyvalent (H/F)',
    reference: '#18293756',
    type: 'CDI',
    duration: 'Indéterminé',
    region: 'Occitanie',
    category: 'Viticulture',
    description:
      "Nous recrutons un tractoriste polyvalent en CDI afin de realiser les activites agricoles.",
    applied: false,
  },
];

export default function ApplicationsScreen() {
  return (
    <ScrollView style={styles.container}>

      {/* LIST */}
      <View style={styles.content}>
        {applications.map((app) => (
          <View key={app.id} style={styles.card}>

            {/* TOP */}
            <View style={styles.topRow}>
              <View style={styles.star}>
                <Star size={16} color="#f7b500" />
              </View>

              <View style={styles.category}>
                <Text style={styles.categoryText}>{app.category}</Text>
              </View>
            </View>

            {/* TITLE */}
            <Text style={styles.title}>{app.title}</Text>

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
            <Text style={styles.desc}>{app.description}</Text>

            {/* BUTTONS */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.primaryBtn}>
                <Text style={styles.primaryText}>
                  {app.applied ? 'Déjà postulé' : 'Postuler'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn}>
                <Text style={styles.secondaryText}>Lire +</Text>
              </TouchableOpacity>
            </View>

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