import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Modal, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCandidat } from '@/app/employeur/services/EmployeurCandidatures';

const { width } = Dimensions.get('window');

const TAB_DEFINITIONS = [
  { key: 'propose', label: 'Candidat proposé' },
  { key: 'valide', label: 'Candidat validé' },
  { key: 'archive', label: 'Candidat archivé' },
] as const;

type TabKey = (typeof TAB_DEFINITIONS)[number]['key'];

// ── Interfaces TypeScript pour les Secteurs et Métiers ──────────────────────
interface SectorItem {
  id: number;
  secteur_numero: number;
  metier: {
    id: number;
    titre: string;
  };
  sous_categorie: {
    id: number;
    titre: string;
  };
  categorie: {
    id: number;
    titre: string;
  };
}

interface ApiCandidate {
  id: number;
  id_agent: number;
  id_agent_digital: number;
  photo: string;
  civilite: string;
  prenom: string;
  nom: string;
  num_passeport: string;
  date_expiration_pass: string;
  tel: string;
  tel2: string;
  email: string;
  email2: string;
  adresse: string;
  ville: string;
  code_postal: number;
  pays: string;
  date_naissance: string;
  num_secur_social: string;
  sit_matri: string;
  nbr_enfant: number;
  notes: number;
  statut_rh: string;
  statut_rh2: string;
  statut_rh_et2: string;
  score_e_t: number;
  commentaire_et: string;
  teletravail: string;
  score_e_p: number;
  commentaire_ep: string;
  statut_rh3: string;
  source_data: string;
  ville_recrutement: string;
  poste: string;
  statut_appel: number;
  commentaire_statut: string;
  niveau_etude: string;
  experience: string;
  contrat_prefere1: string;
  contrat_prefere2: string;
  statut_candidat: number;
  statut_candidat2: number;
  statut_commande: number;
  date_inscription: string;
  date_validation: string;
  ip_adresse: string;
  token_id: string;
  etat_affect: number;
  date_depot: string;
  statut_depot: string;
  date_ofii: string;
  statut_ofii: string;
  note_refus: string;
  type_visa_accord: string;
  date_debut_accord: string;
  date_fin_accord: string;
  tokenid_apport: string;
  commentaire_cand: string;
  commentaire_cmo: string;
  situation_familiale: string;
  verifier: number;
  disponibilite: string;
  date_disponibilite: string;
  secteur_activite: string;
  deleted: number;
  id_statut: number;
  date_appel: string;
  heure_appel: string;
  commentaire_agent: string;
  id_fiche_poste: string;
  intitule_poste: string;
  date_aff: string;
  statut_aff: number;
  secteur_candidat_id?: number;
  secteur_numero?: number;
  metier_id?: number;
  metier_titre?: string;
  sous_categorie_id?: number;
  sous_categorie_titre?: string;
  categorie_id?: number;
  categorie_titre?: string;
  secteurs?: SectorItem[]; // Ajout du tableau dynamique de l'API
}

export default function EmployeurCandidatures() {
  const [activeTab, setActiveTab] = useState<TabKey>('propose');
  const [apiCandidates, setApiCandidates] = useState<ApiCandidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedCandidate, setSelectedCandidate] = useState<ApiCandidate | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await getCandidat();
        if (Array.isArray(response)) {
          setApiCandidates(response);
        } else {
          setApiCandidates([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des candidats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const filteredCandidates = apiCandidates.filter((candidate) => {
    if (activeTab === 'propose') return candidate.statut_aff !== 3;
    if (activeTab === 'valide') return candidate.statut_aff === 3;
    if (activeTab === 'archive') return false;
    return false;
  });

  const openCvModal = (candidate: ApiCandidate) => {
    setSelectedCandidate(candidate);
    setIsModalVisible(true);
  };

  const closeCvModal = () => {
    setIsModalVisible(false);
    setSelectedCandidate(null);
  };

  return (
    <View style={styles.container}>

      {/* ── Onglets ── */}
      <View style={styles.tabs}>
        {TAB_DEFINITIONS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Loader / Liste ── */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2b5bbb" />
          <Text style={styles.loadingText}>Chargement des candidats...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredCandidates.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun candidat dans cette catégorie.</Text>
            </View>
          ) : (
            filteredCandidates.map((candidate) => (
              <View key={candidate.id.toString()} style={styles.card}>

                {/* En-tête */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={28} color="#2b5bbb" />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.name}>
                      {`${candidate.prenom.charAt(0).toUpperCase() + candidate.prenom.slice(1)} ${candidate.nom.toUpperCase()}`}
                    </Text>
                    <Text style={styles.headerId}>
                      {candidate.id_fiche_poste || `000-Cmd-${candidate.id}`}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusPill,
                    candidate.statut_aff === 3 ? styles.statusPillValide : styles.statusPillPropose,
                  ]}>
                    <Text style={styles.statusText}>
                      {candidate.statut_aff === 3 ? 'Validé' : 'Proposé'}
                    </Text>
                  </View>
                </View>

                {/* Poste */}
                <View style={styles.jobList}>
                  <Text style={styles.jobItem}>
                    - {candidate.intitule_poste || 'Poste non spécifié'}
                  </Text>
                </View>

                {/* Expérience */}
                <Text style={styles.experienceText}>
                  {candidate.experience
                    ? `${candidate.experience} d'expérience`
                    : 'Aucune expérience mentionnée'}
                </Text>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  {candidate.statut_aff === 3 ? (
                    <TouchableOpacity style={[styles.actionButton, styles.archiveButton]}>
                      <Text style={[styles.actionText, styles.actionTextArchive]}>Archiver</Text>
                      <Ionicons name="archive-outline" size={16} color="#e15b5b" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutline]}>
                        <Text style={[styles.actionText, styles.actionTextOutline]}>Oui</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutline]}>
                        <Text style={[styles.actionText, styles.actionTextOutline]}>Non</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cvButton]}
                    onPress={() => openCvModal(candidate)}
                  >
                    <Text style={[styles.actionText, styles.actionTextWhite]}>CV</Text>
                    <Ionicons name="eye-outline" size={16} color="#ffffff" style={styles.cvIcon} />
                  </TouchableOpacity>
                </View>

                {/* Commentaire */}
                <TouchableOpacity style={styles.commentButton}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#ffffff" style={styles.commentIcon} />
                  <Text style={styles.commentText}>
                    {candidate.commentaire_cand ? 'Voir le commentaire' : 'CMO commentaire'}
                  </Text>
                </TouchableOpacity>

              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ──────────────── CV MODAL ──────────────── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeCvModal}
      >
        <View style={styles.cvModalBackdrop}>
          <View style={styles.modalCard}>
            {selectedCandidate && (
              <ScrollView showsVerticalScrollIndicator={false}>

                {/* 1. Identité & Coordonnées */}
                <Text style={styles.modalName}>
                  {`${selectedCandidate.prenom.charAt(0).toUpperCase() + selectedCandidate.prenom.slice(1)} ${selectedCandidate.nom.toUpperCase()}`}
                </Text>
                <Text style={styles.modalContactText}>{selectedCandidate.email}</Text>
                <Text style={styles.modalContactText}>{selectedCandidate.tel}</Text>
                {!!selectedCandidate.tel2 && <Text style={styles.modalContactText}>{selectedCandidate.tel2}</Text>}
                <Text style={styles.modalLocation}>{selectedCandidate.ville} - {selectedCandidate.pays || 'France'}</Text>

                {/* 2. Secteur d'activité & Métiers (Affichage Dynamique) */}
                <Text style={styles.sectionTitle}>Secteur d’activité & Métiers</Text>
                
                {selectedCandidate.secteurs && selectedCandidate.secteurs.length > 0 ? (
                  selectedCandidate.secteurs.map((sec) => (
                    <View key={sec.id.toString()} style={styles.sectorBlock}>
                      <Text style={styles.sectorCategoryText}>
                        📂 {sec.categorie?.titre || 'Catégorie non spécifiée'}
                      </Text>
                      <Text style={styles.sectorSubCategoryText}>
                        └─ {sec.sous_categorie?.titre || 'Sous-catégorie non spécifiée'}
                      </Text>
                      <Text style={styles.sectorMetierText}>
                        💼 Métier : {sec.metier?.titre || 'Non renseigné'}
                      </Text>
                    </View>
                  ))
                ) : (
                  <>
                    <Text style={styles.sectionItem}>• {selectedCandidate.intitule_poste || 'Non renseigné'}</Text>
                    {!!selectedCandidate.secteur_activite && (
                      <Text style={styles.sectionItem}>• {selectedCandidate.secteur_activite}</Text>
                    )}
                  </>
                )}

                {/* 3. Mobilité */}
                <Text style={styles.sectionTitle}>Mobilité</Text>
                <Text style={styles.sectionItem}>• Toute la France</Text>

                {/* 4. Niveau d'études */}
                <Text style={styles.sectionTitle}>Niveau d’études</Text>
                <Text style={styles.sectionItem}>• {selectedCandidate.niveau_etude || 'Non spécifié'}</Text>

                {/* 5. Expérience */}
                <Text style={styles.sectionTitle}>Expérience</Text>
                <View style={styles.blockItem}>
                  <Text style={styles.blockTitle}>{selectedCandidate.intitule_poste || 'Poste'}</Text>
                  <Text style={styles.sectionItem}>L'entreprise : {selectedCandidate.commentaire_cmo || 'Non renseignée'}</Text>
                  <Text style={styles.sectionItem}>Ville / Pays : {selectedCandidate.ville} - {selectedCandidate.pays || 'France'}</Text>
                  <Text style={styles.sectionItem}>Période : {selectedCandidate.experience || 'Non spécifiée'}</Text>
                </View>

                {/* 6. Attestations / Documents vérifiés */}
                <Text style={styles.sectionTitle}>Attestation</Text>
                <View style={styles.attestationList}>
                  {selectedCandidate.verifier === 1 ? (
                    <>
                      <Text style={styles.sectionItem}>✅ certificat_travail</Text>
                      <Text style={styles.sectionItem}>✅ Attestationdetravail</Text>
                    </>
                  ) : null}
                </View>

              </ScrollView>
            )}

            <TouchableOpacity style={styles.modalClose} onPress={closeCvModal}>
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Conteneur principal ── */
  container: {
    flex: 1,
    backgroundColor: '#eef4ff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  /* ── Onglets ── */
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 18,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#f6f8ff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 48,
  },
  tabButtonActive: {
    backgroundColor: '#2b5bbb',
    borderColor: '#2b5bbb',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4865a6',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#ffffff',
  },

  /* ── Body / Scroll ── */
  body: { flex: 1 },
  bodyContent: { paddingBottom: 30 },

  /* ── États vides / chargement ── */
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#2b5bbb', fontSize: 14, fontWeight: '600' },
  emptyState: { paddingTop: 40, alignItems: 'center' },
  emptyText: { color: '#5f6f91', fontSize: 15 },

  /* ── Carte candidat ── */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#d9e4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: { flex: 1 },
  name: { color: '#1b2d5a', fontSize: 16, fontWeight: '800' },
  headerId: { color: '#2b5bbb', fontSize: 13, fontWeight: '600' },

  /* Badge statut */
  statusPill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  statusPillPropose: { backgroundColor: '#fef5e8' },
  statusPillValide: { backgroundColor: '#eaf7ee' },
  statusText: { color: '#1b2d5a', fontSize: 11, fontWeight: '700' },

  /* Poste + expérience */
  jobList: { marginBottom: 8, paddingLeft: 4 },
  jobItem: { fontSize: 14, fontWeight: '700', color: '#1b2d5a', marginBottom: 2 },
  experienceText: { fontSize: 13, color: '#5f6f91', fontWeight: '500', marginBottom: 14 },

  /* Boutons d'action */
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  actionButton: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionButtonOutline: { borderWidth: 1, borderColor: '#2b5bbb', backgroundColor: '#ffffff' },
  archiveButton: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#e15b5b',
    backgroundColor: '#fff5f5',
  },
  cvButton: { flex: 1, backgroundColor: '#2b5bbb' },
  actionText: { fontSize: 13, fontWeight: '700' },
  actionTextOutline: { color: '#2b5bbb' },
  actionTextArchive: { color: '#e15b5b' },
  actionTextWhite: { color: '#ffffff' },
  cvIcon: { marginLeft: 6 },

  /* Bouton commentaire */
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2b5bbb',
    borderRadius: 22,
    paddingVertical: 12,
  },
  commentIcon: { marginRight: 8 },
  commentText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },

  /* ──────────── Modal CV ──────────── */
  cvModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width * 0.9,
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },

  /* Identité */
  modalName: { fontSize: 20, fontWeight: '800', color: '#1b2d5a', marginBottom: 4 },
  modalContactText: { fontSize: 13, color: '#4865a6', fontWeight: '500', marginBottom: 2 },
  modalLocation: { marginTop: 4, marginBottom: 10, color: '#7a8ab8', fontSize: 13, fontWeight: '600' },

  /* Sections */
  sectionTitle: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: '800',
    color: '#2b5bbb',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    borderBottomWidth: 1.5,
    borderBottomColor: '#eef3ff',
    paddingBottom: 4,
    marginBottom: 6,
  },
  sectionItem: { marginTop: 6, fontSize: 13, color: '#1b2d5a', lineHeight: 20, fontWeight: '500' },

  /* Style des Secteurs Dynamiques */
  sectorBlock: {
    backgroundColor: '#f4f7ff',
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f0a11b',
  },
  sectorCategoryText: { fontSize: 13, fontWeight: '700', color: '#1b2d5a' },
  sectorSubCategoryText: { fontSize: 12, fontWeight: '600', color: '#4865a6', marginTop: 2, paddingLeft: 6 },
  sectorMetierText: { fontSize: 13, fontWeight: '700', color: '#2b5bbb', marginTop: 4, paddingLeft: 6 },

  /* Bloc parcours */
  blockItem: {
    marginTop: 8,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2b5bbb',
  },
  blockTitle: { fontSize: 14, fontWeight: '700', color: '#1b2d5a', marginBottom: 4 },
  attestationList: { marginTop: 4 },

  /* Bouton fermer */
  modalClose: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#2b5bbb',
    alignItems: 'center',
  },
  modalCloseText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});