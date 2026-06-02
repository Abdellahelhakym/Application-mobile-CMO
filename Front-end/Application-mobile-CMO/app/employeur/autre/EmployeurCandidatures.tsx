import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_CANDIDATES = [
  {
    id: '1',
    name: 'Joe Die',
    title: 'Ouvrier céréales',
    commandId: '0000-Cmd-001',
    skills: ['Ouvrier céréales', 'Ouvrier maraîcher', 'Ouvrier arboricole'],
    experienceRange: 'Entre 5 et 10 ans d’expérience',
    status: 'propose',
  },
  {
    id: '2',
    name: 'Nadia L.',
    title: 'Ouvrier maraîcher',
    commandId: '0000-Cmd-004',
    skills: ['Plantation', 'Récolte', 'Arrosage'],
    experienceRange: 'Entre 4 et 7 ans d’expérience',
    status: 'propose',
  },
  {
    id: '3',
    name: 'Mikael S.',
    title: 'Ouvrier arboricole',
    commandId: '0000-Cmd-005',
    skills: ['Taille', 'Entretien vergers', 'Récolte fruitière'],
    experienceRange: 'Entre 6 et 9 ans d’expérience',
    status: 'propose',
  },
  {
    id: '4',
    name: 'Sara Diaz',
    title: 'Conductrice de camion',
    commandId: '0000-Cmd-002',
    skills: ['Conduite poids lourd', 'Chargement', 'Livraison'],
    experienceRange: 'Entre 3 et 6 ans d’expérience',
    status: 'valide',
  },
  {
    id: '5',
    name: 'Alexandre T.',
    title: 'Logisticien',
    commandId: '0000-Cmd-006',
    skills: ['Organisation', 'Réception', 'Expédition'],
    experienceRange: 'Entre 2 et 5 ans d’expérience',
    status: 'valide',
  },
  {
    id: '6',
    name: 'Omar K.',
    title: 'Agent de nettoyage',
    commandId: '0000-Cmd-003',
    skills: ['Nettoyage industriel', 'Entretien', 'Respect des consignes'],
    experienceRange: 'Entre 2 et 4 ans d’expérience',
    status: 'archive',
  },
  {
    id: '7',
    name: 'Lina F.',
    title: 'Préparatrice de commande',
    commandId: '0000-Cmd-007',
    skills: ['Tri', 'Emballage', 'Gestion du stock'],
    experienceRange: 'Entre 1 et 3 ans d’expérience',
    status: 'archive',
  },
];

const TAB_DEFINITIONS = [
  { key: 'propose', label: 'Candidat proposé' },
  { key: 'valide', label: 'Candidat validé' },
  { key: 'archive', label: 'Candidat archivé' },
] as const;

type TabKey = (typeof TAB_DEFINITIONS)[number]['key'];

type Candidate = typeof INITIAL_CANDIDATES[number];

export default function EmployeurCandidatures() {
  const [activeTab, setActiveTab] = useState<TabKey>('propose');

  const filteredCandidates = INITIAL_CANDIDATES.filter(
    (candidate) => candidate.status === activeTab
  );

  return (
    <View style={styles.container}>
    
      <View style={styles.tabs}> 
        {TAB_DEFINITIONS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredCandidates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Aucun candidat dans cette catégorie.
            </Text>
          </View>
        ) : (
          filteredCandidates.map((candidate) => (
            <View key={candidate.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}> 
                  <Ionicons name="person" size={28} color="#2b5bbb" />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.name}>{candidate.name}</Text>
                  <Text style={styles.role}>{candidate.title}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    candidate.status === 'propose' && styles.statusPillPropose,
                    candidate.status === 'valide' && styles.statusPillValide,
                    candidate.status === 'archive' && styles.statusPillArchive,
                  ]}
                >
                  <Text style={styles.statusText}>{candidate.status === 'propose' ? 'Proposé' : candidate.status === 'valide' ? 'Validé' : 'Archivé'}</Text>
                </View>
              </View>

              <Text style={styles.commandId}>{candidate.commandId}</Text>

              <View style={styles.jobList}>
                {candidate.skills.map((skill, idx) => (
                  <Text key={idx} style={styles.jobItem}>• {skill}</Text>
                ))}
              </View>

              <Text style={styles.experienceText}>{candidate.experienceRange}</Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutline]}>
                  <Text style={[styles.actionText, styles.actionTextOutline]}>Oui</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutline, styles.actionButtonMargin]}>
                  <Text style={[styles.actionText, styles.actionTextOutline]}>Non</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.cvButton]}>
                  <Text style={[styles.actionText, styles.actionTextWhite]}>CV</Text>
                  <Ionicons name="eye-outline" size={16} color="#ffffff" style={styles.cvIcon} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.commentButton}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#ffffff" style={styles.commentIcon} />
                <Text style={styles.commentText}>CMO commentaire</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4ff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 18,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1b2d5a',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: '#5f6f91',
    lineHeight: 22,
    maxWidth: '90%',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#f6f8ff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#2b5bbb',
    borderColor: '#2b5bbb',
    shadowColor: '#2b5bbb',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4865a6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  tabBadge: {
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tabBadgeText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 30,
  },
  emptyState: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#5f6f91',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0e1d47',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#d9e4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    flex: 1,
  },
  name: {
    color: '#1b2d5a',
    fontSize: 17,
    fontWeight: '800',
  },
  role: {
    color: '#6d7a9a',
    fontSize: 13,
    marginTop: 4,
  },
  commandId: {
    fontSize: 12,
    color: '#2b5bbb',
    fontWeight: '700',
    alignSelf: 'flex-start',
    backgroundColor: '#eef3ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  jobList: {
    marginBottom: 10,
  },
  jobItem: {
    fontSize: 13,
    color: '#3b4a76',
    marginBottom: 4,
    lineHeight: 20,
  },
  experienceText: {
    fontSize: 13,
    color: '#5f6f91',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  statusPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    minWidth: 86,
    alignItems: 'center',
  },
  statusPillPropose: {
    backgroundColor: '#fef5e8',
  },
  statusPillValide: {
    backgroundColor: '#eaf7ee',
  },
  statusPillArchive: {
    backgroundColor: '#fbecee',
  },
  statusText: {
    color: '#1b2d5a',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonOutline: {
    borderWidth: 1,
    borderColor: '#2b5bbb',
    backgroundColor: '#ffffff',
  },
  actionButtonMargin: {
    marginLeft: 10,
  },
  cvButton: {
    backgroundColor: '#2b5bbb',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionTextOutline: {
    color: '#2b5bbb',
  },
  actionTextWhite: {
    color: '#ffffff',
  },
  cvIcon: {
    marginLeft: 8,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2b5bbb',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  commentIcon: {
    marginRight: 8,
  },
  commentText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});