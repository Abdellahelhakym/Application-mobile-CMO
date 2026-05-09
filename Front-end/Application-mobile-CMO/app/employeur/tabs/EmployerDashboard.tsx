import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { Search, UserCheck, FileText, Award } from 'lucide-react-native';

export default function EmployerDashboard() {
  const recruitmentPhases = [
    {
      id: 2,
      title: 'PHASE 2 : Sourcing et Preselection',
      icon: Search,
      stats: [
        { label: 'Candidats proposes', value: 0, color: '#e8f0ff', text: '#2b5bbb' },
        { label: 'Candidats contactes', value: 0, color: '#dff1ff', text: '#2778b8' },
        { label: 'Candidats interesses', value: 0, color: '#ffe9cf', text: '#b87400' },
        { label: 'Candidats acceptes', value: 0, color: '#dfeee2', text: '#2e7d5c' },
      ],
    },
    {
      id: 3,
      title: 'PHASE 3 : Entretien et Validation',
      icon: UserCheck,
      stats: [
        { label: 'Entretien programme', value: 0, color: '#dff1ff', text: '#2778b8' },
        { label: 'Candidat retenu', value: 0, color: '#dfeee2', text: '#2e7d5c' },
        { label: 'Non retenu', value: 0, color: '#ffd9cf', text: '#b84c3a' },
      ],
    },
    {
      id: 4,
      title: 'PHASE 4 : Embauche',
      icon: FileText,
      stats: [
        { label: 'Contrat en cours', value: 0, color: '#ffe9cf', text: '#b87400' },
        { label: 'Contrat signe', value: 0, color: '#dff1ff', text: '#2778b8' },
        { label: 'Salarie integre', value: 0, color: '#dfeee2', text: '#2e7d5c' },
      ],
    },
    {
      id: 5,
      title: 'PHASE 5 : Fin mission',
      icon: Award,
      stats: [
        { label: 'Retenu', value: 0, color: '#dfeee2', text: '#2e7d5c' },
        { label: 'Non retenu', value: 0, color: '#ffd9cf', text: '#b84c3a' },
      ],
    },
  ];

  return (
    <View style={styles.container}>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>
        {recruitmentPhases.map((phase) => {
          const Icon = phase.icon;

          return (
            <View key={phase.id} style={styles.card}>

              {/* phase title */}
              <View style={styles.phaseHeader}>
                <View style={styles.iconBox}>
                  <Icon size={20} color="#2b5bbb" />
                </View>
                <Text style={styles.phaseTitle}>{phase.title}</Text>
              </View>

              {/* stats */}
              <View style={styles.grid}>
                {phase.stats.map((stat, i) => (
                  <View
                    key={i}
                    style={[styles.statBox, { backgroundColor: stat.color }]}
                  >
                    <Text style={[styles.statLabel, { color: stat.text }]}>
                      {stat.label}
                    </Text>
                    <Text style={[styles.statValue, { color: stat.text }]}>
                      {stat.value}
                    </Text>
                  </View>
                ))}
              </View>

            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },

  content: {
    padding: 15,
    gap: 15,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 15,
  },

  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef3ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  phaseTitle: {
    fontSize: 13,
    color: '#1b2d5a',
    flex: 1,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  statBox: {
    width: '48%',
    borderRadius: 14,
    padding: 10,
  },

  statLabel: {
    fontSize: 11,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
  },
});