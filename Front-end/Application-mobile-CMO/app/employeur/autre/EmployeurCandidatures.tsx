
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCandidat } from '@/app/employeur/services/EmployeurCandidatures';

const TAB_DEFINITIONS = [
  { key: 'propose', label: 'Candidat proposé' },
  { key: 'valide', label: 'Candidat validé' },
  { key: 'archive', label: 'Candidat archivé' },
] as const;

type TabKey = (typeof TAB_DEFINITIONS)[number]['key'];

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
        console.error("Erreur lors de la récupération des candidats:", error);
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
      {/* Onglets de navigation */}
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

      {/* Loader */}
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
                
                {/* En-tête de la carte */}
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
                  
                  {/* Badge de Statut */}
                  <View style={[
                    styles.statusPill,
                    candidate.statut_aff !== 3 && styles.statusPillPropose,
                    candidate.statut_aff === 3 && styles.statusPillValide,
                  ]}>
                    <Text style={styles.statusText}>
                      {candidate.statut_aff === 3 ? 'Validé' : 'Proposé'}
                    </Text>
                  </View>
                </View>

                {/* Liste des postes / Secteurs d'activité */}
                <View style={styles.jobList}>
                  <Text style={styles.jobItem}>- {candidate.intitule_poste || "Poste non spécifié"}</Text>
                </View>

                {/* Expérience textuelle globale */}
                <Text style={styles.experienceText}>
                  {candidate.experience ? `${candidate.experience} d’expérience` : "Aucune expérience mentionnée"}
                </Text>

                {/* Zone des Actions d'arbitrage */}
                <View style={styles.actionsRow}>
                  {candidate.statut_aff === 3 ? (
                    // Si validé (statut_aff === 3) : Bouton Archiver
                    <TouchableOpacity style={[styles.actionButton, styles.archiveButton]}>
                      <Text style={[styles.actionText, styles.actionTextArchive]}>Archiver</Text>
                      <Ionicons name="archive-outline" size={16} color="#e15b5b" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  ) : (
                    // Sinon : Boutons Oui et Non
                    <>
                      <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutline]}>
                        <Text style={[styles.actionText, styles.actionTextOutline]}>Oui</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutline]}>
                        <Text style={[styles.actionText, styles.actionTextOutline]}>Non</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Bouton CV (Toujours visible) */}
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cvButton]}
                    onPress={() => openCvModal(candidate)}
                  >
                    <Text style={[styles.actionText, styles.actionTextWhite]}>CV</Text>
                    <Ionicons name="eye-outline" size={16} color="#ffffff" style={styles.cvIcon} />
                  </TouchableOpacity>
                </View>

                {/* Section Commentaire */}
                <TouchableOpacity style={styles.commentButton}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#ffffff" style={styles.commentIcon} />
                  <Text style={styles.commentText}>
                    {candidate.commentaire_cand ? "Voir le commentaire" : "CMO commentaire"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Fenêtre Modale pour le CV détaillé */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeCvModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <TouchableOpacity style={styles.closeButton} onPress={closeCvModal}>
              <Ionicons name="close-circle" size={32} color="#ff4d4d" />
            </TouchableOpacity>

            {selectedCandidate && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                <Text style={styles.modalTitle}>
                  {`${selectedCandidate.prenom.charAt(0).toUpperCase() + selectedCandidate.prenom.slice(1)} ${selectedCandidate.nom.toUpperCase()}`}
                </Text>
                <Text style={styles.modalInfo}>{selectedCandidate.email}</Text>
                <Text style={styles.modalInfo}>{selectedCandidate.tel}</Text>
                <Text style={styles.modalInfo}>{selectedCandidate.ville}</Text>

                <Text style={styles.modalSectionTitle}>Secteur d’activité</Text>
                <Text style={styles.modalBodyText}>{selectedCandidate.intitule_poste || "Non spécifié"}</Text>

                <Text style={styles.modalSectionTitle}>Mobilité</Text>
                <Text style={styles.modalBodyText}>Toute la france</Text>

                <Text style={styles.modalSectionTitle}>Niveau d’études</Text>
                <Text style={styles.modalBodyText}>{selectedCandidate.niveau_etude || "Non spécifié"}</Text>

                <Text style={styles.modalSectionTitle}>Expérience</Text>
                
                <View style={styles.experienceBlock}>
                  <Text style={styles.expJobTitle}>{selectedCandidate.intitule_poste || "Poste"}</Text>
                  <Text style={styles.expDetails}>L'entreprise : Ferme TEST</Text>
                  <Text style={styles.expDetails}>Ville / Pays : {selectedCandidate.ville} - {selectedCandidate.pays}</Text>
                  <Text style={styles.expDetails}>Période : {selectedCandidate.experience || "Non spécifiée"}</Text>
                </View>

                <Text style={styles.modalSectionTitle}>Attestation</Text>
                <Text style={styles.modalBodyText}>Disponibilité : {selectedCandidate.disponibilite === "0" ? "Immédiate" : selectedCandidate.disponibilite}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 30,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#2b5bbb',
    fontSize: 14,
    fontWeight: '600',
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
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#d9e4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: '#1b2d5a',
    fontSize: 16,
    fontWeight: '800',
  },
  headerId: {
    color: '#2b5bbb',
    fontSize: 13,
    fontWeight: '600',
  },
  jobList: {
    marginBottom: 8,
    paddingLeft: 4,
  },
  jobItem: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b2d5a',
    marginBottom: 2,
  },
  experienceText: {
    fontSize: 13,
    color: '#5f6f91',
    fontWeight: '500',
    marginBottom: 14,
  },
  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusPillPropose: {
    backgroundColor: '#fef5e8',
  },
  statusPillValide: {
    backgroundColor: '#eaf7ee',
  },
  statusText: {
    color: '#1b2d5a',
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionButtonOutline: {
    borderWidth: 1,
    borderColor: '#2b5bbb',
    backgroundColor: '#ffffff',
  },
  archiveButton: {
    flex: 2, // Prend deux fois plus de place pour combler harmonieusement l'absence des deux boutons initiaux
    borderWidth: 1,
    borderColor: '#e15b5b',
    backgroundColor: '#fff5f5',
  },
  cvButton: {
    flex: 1,
    backgroundColor: '#2b5bbb',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionTextOutline: {
    color: '#2b5bbb',
  },
  actionTextArchive: {
    color: '#e15b5b',
  },
  actionTextWhite: {
    color: '#ffffff',
  },
  cvIcon: {
    marginLeft: 6,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2b5bbb',
    borderRadius: 22,
    paddingVertical: 12,
  },
  commentIcon: {
    marginRight: 8,
  },
  commentText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1b2d5a',
    marginBottom: 6,
  },
  modalInfo: {
    fontSize: 14,
    color: '#5f6f91',
    marginBottom: 4,
    fontWeight: '500',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2b5bbb',
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalBodyText: {
    fontSize: 15,
    color: '#1b2d5a',
    fontWeight: '600',
  },
  experienceBlock: {
    backgroundColor: '#f4f7fe',
    padding: 14,
    borderRadius: 16,
    marginTop: 6,
  },
  expJobTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b2d5a',
    marginBottom: 6,
  },
  expDetails: {
    fontSize: 13,
    color: '#5f6f91',
    marginBottom: 3,
  },
});
