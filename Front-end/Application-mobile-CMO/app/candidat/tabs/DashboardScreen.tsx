import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function DashboardScreen() {
  const candidatureStats = {
    sent: 2,
    replied: 0,
    favorites: 1,
  };

  const sectors = [
    { name: 'Agriculture', color: '#3b82f6' },
    { name: 'Transport', color: '#22c55e' },
  ];

  const total =
    candidatureStats.sent +
    candidatureStats.replied +
    candidatureStats.favorites;

  const sentPercent = total > 0 ? (candidatureStats.sent / total) * 100 : 0;

  const documents = [
    'cni',
    'passeport',
    'carte_securite_sociale',
    'titre_sejour',
    'permis_conduire',
    'certificat_travail',
  ];

  return (
    <ScrollView style={styles.container}>

      {/* ❌ HEADER SUPPRIMÉ */}

      <View style={styles.content}>

        {/* WELCOME CARD */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Feather name="check-circle" size={26} color="#2b5bbb" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                Bonjour, Abdellah El Hakym
              </Text>

              <Text style={styles.subtitle}>
                Félicitations, votre compte est vérifier
              </Text>
            </View>
          </View>
        </View>

        {/* STATUS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>État de l'inscription</Text>

          <View style={styles.grid}>
            {['Informations', 'Attestations', 'Compétences'].map((item) => (
              <View key={item} style={styles.statusBox}>
                <Feather name="check-circle" size={20} color="#22c55e" />
                <Text style={styles.statusText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CANDIDATURES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mes candidatures</Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.item}>● {candidatureStats.sent} Envoyées</Text>
              <Text style={styles.item}>● {candidatureStats.replied} Répondu</Text>
              <Text style={styles.item}>● {candidatureStats.favorites} Favoris</Text>
            </View>

            <View style={styles.circle}>
              <Text style={styles.circleText}>
                {Math.round(sentPercent)}%
              </Text>
            </View>
          </View>
        </View>

        {/* SECTORS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Mes secteurs d'activités
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              {sectors.map((s) => (
                <Text key={s.name} style={styles.item}>
                  ● {s.name}
                </Text>
              ))}
            </View>

            <View style={styles.circleBlue}>
              <Text style={{ color: '#fff' }}>100%</Text>
            </View>
          </View>
        </View>

        {/* DOCUMENTS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Documents manquants</Text>

          {documents.map((doc) => (
            <View key={doc} style={styles.docRow}>
              <Text style={styles.docText}>{doc}</Text>

              <TouchableOpacity style={styles.uploadBtn}>
                <Feather name="upload" size={16} color="#2b5bbb" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>© 2026 CMO</Text>

      </View>
    </ScrollView>
  );
}

/* STYLE */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },

  content: {
    padding: 15,
    gap: 15,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#eef3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  title: {
    fontSize: 16,
    color: '#1b2d5a',
  },

  subtitle: {
    fontSize: 12,
    color: '#5b6a8e',
  },

  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#1b2d5a',
    fontWeight: '600',
  },

  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statusBox: {
    alignItems: 'center',
    flex: 1,
  },

  statusText: {
    fontSize: 11,
    marginTop: 5,
    color: '#1b2d5a',
  },

  item: {
    fontSize: 12,
    color: '#1b2d5a',
    marginVertical: 2,
  },

  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 10,
    borderColor: '#2b5bbb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleText: {
    fontSize: 12,
    color: '#5b6a8e',
  },

  circleBlue: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2b5bbb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f6f8ff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },

  docText: {
    fontSize: 12,
    color: '#1b2d5a',
  },

  uploadBtn: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
  },

  footer: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7a8ab8',
    fontSize: 12,
  },
});