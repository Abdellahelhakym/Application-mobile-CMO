import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl,
  ActivityIndicator, Modal, Dimensions, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCandidat, getCandidatValides, setCandidatValides, setCandidatNonValide } from '@/app/employeur/services/EmployeurCandidatures';
import url from "@/app/services/url.js"; 

// 🔧 Décodage des entités HTML (Prise en charge Insensible à la casse + Entités Majuscules)
const decodeHTML = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&(eacute|Eacute);/g, 'é')
    .replace(/&(egrave|Egrave);/g, 'è')
    .replace(/&(ecirc|Ecirc);/g, 'ê')
    .replace(/&(euml|Euml);/g, 'ë')
    .replace(/&(agrave|Agrave);/g, 'à')
    .replace(/&(acirc|Acirc);/g, 'â')
    .replace(/&(icirc|Icirc);/g, 'î')
    .replace(/&(iuml|Iuml);/g, 'ï')
    .replace(/&(ocirc|Ocirc);/g, 'ô')
    .replace(/&(ugrave|Ugrave);/g, 'ù')
    .replace(/&(ucirc|Ucirc);/g, 'û')
    .replace(/&(ccedil|Ccedil);/g, 'ç')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
};

const { width } = Dimensions.get('window');

const TAB_DEFINITIONS = [
  { key: 'propose', label: 'Candidat proposé' },
  { key: 'valide', label: 'Candidat validé' },
] as const;

type TabKey = (typeof TAB_DEFINITIONS)[number]['key'];

interface MetierItem {
  id: number;
  titre: string;
}

interface ApiCandidate {
  id: number;
  candidat_id?: number;
  id_agent: number;
  id_aff: number;
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
  metier_id?: number;
  metier_titre?: string;
  metiers?: MetierItem[];
  mobilites?: { id_region?: number; region?: string }[];
  parcours_scolaire?: {
    id?: number;
    ecole?: string;
    diplome?: string;
    mois_debut?: string;
    annee_debut?: number;
    mois_obtention?: string;
    annee_obtention?: number;
    description?: string;
   }[];
  documents_manquants?: string[];
}

export default function EmployeurCandidatures() {
  const [refreshing, setRefreshing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<TabKey>('propose');
  const [apiCandidates, setApiCandidates] = useState<ApiCandidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false); 

  const [selectedCandidate, setSelectedCandidate] = useState<ApiCandidate | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [isCommentModalVisible, setIsCommentModalVisible] = useState<boolean>(false);
  const [selectedComment, setSelectedComment] = useState<string>('');

  const fetchCandidates = async () => {
    try {
      let response;

      if (activeTab === 'propose') {
        response = await getCandidat();
      } else {
        response = await getCandidatValides();
      }

      if (Array.isArray(response)) {
        setApiCandidates(response);
      } else {
        setApiCandidates([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des candidats:', error);
      setApiCandidates([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCandidates();
    setRefreshing(false);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchCandidates();
      setLoading(false);
    };

    loadInitialData();
  }, [activeTab, refreshTrigger]); 

  const handleValidate = async (candidate: ApiCandidate) => {
    const id_candidat = candidate.candidat_id ?? candidate.id;
    const id_aff = candidate.id_aff;
    const id_fiche_post = candidate.id_fiche_poste;
    const tokenid_cand = candidate.token_id;

    if (!id_candidat || !id_fiche_post) {
      Alert.alert('Erreur', 'Données du candidat incomplètes pour la validation.');
      return;
    }

    try {
      setLoading(true);
      await setCandidatValides(id_candidat, id_aff, id_fiche_post, tokenid_cand);
      Alert.alert('Succès', 'Le candidat a été validé avec succès.');
      setRefreshTrigger(prev => !prev);
    } catch (error) {
      console.error('Erreur lors de la validation du candidat:', error);
      Alert.alert('Erreur', 'Impossible de valider le candidat pour le moment.');
      setLoading(false);
    }
  };

  const handleReject = async (candidate: ApiCandidate) => {
    const id_candidat = candidate.candidat_id ?? candidate.id;
    const id_aff = candidate.id_aff;
    const id_fiche_post = candidate.id_fiche_poste;
    const tokenid_cand = candidate.token_id;

    if (!id_candidat || !id_fiche_post) {
      Alert.alert('Erreur', 'Données du candidat incomplètes pour le refus.');
      return;
    }

    const prenomDecoded = decodeHTML(candidate.prenom);
    const nomDecoded = decodeHTML(candidate.nom);

    Alert.alert(
      'Confirmation',
      `Êtes-vous sûr de vouloir refuser la candidature de ${prenomDecoded} ${nomDecoded} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui, refuser',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await setCandidatNonValide(id_candidat, id_aff, id_fiche_post, tokenid_cand);
              Alert.alert('Succès', 'Le candidat a été refusé et archivé.');
              setRefreshTrigger(prev => !prev);
            } catch (error) {
              console.error('Erreur lors du refus du candidat:', error);
              Alert.alert('Erreur', 'Impossible de refuser le candidat pour le moment.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const openCvModal = (candidate: ApiCandidate) => {
    setSelectedCandidate(candidate);
    setIsModalVisible(true);
  };

  const closeCvModal = () => {
    setIsModalVisible(false);
    setSelectedCandidate(null);
  };

  const openCommentModal = (candidate: ApiCandidate) => {
    setSelectedComment(candidate.commentaire_cmo || '');
    setIsCommentModalVisible(true);
  };

  const closeCommentModal = () => {
    setIsCommentModalVisible(false);
    setSelectedComment('');
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

      {/* ── Loader / Liste principale ── */}
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
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={["#2b5bbb"]}
              tintColor="#2b5bbb"
            />
          }
        >
          {apiCandidates.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun candidat dans cette catégorie.</Text>
            </View>
          ) : (
            apiCandidates.map((candidate) => {
              const candidatePhotoUrl = candidate.photo 
                ? `${url()}documents/photos_candidats/${candidate.photo}?t=${Date.now()}`
                : null;

              const cleanPrenom = decodeHTML(candidate.prenom || '');
              const cleanNom = decodeHTML(candidate.nom || '');
              const formattedName = `${cleanPrenom.charAt(0).toUpperCase() + cleanPrenom.slice(1).toLowerCase()} ${cleanNom.toUpperCase()}`;

              return (
                <View key={candidate.id.toString()} style={styles.card}>

                  {/* En-tête de la Carte */}
                  <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                      {candidatePhotoUrl ? (
                        <Image 
                          source={{ uri: candidatePhotoUrl }} 
                          style={styles.avatarImage} 
                        />
                      ) : (
                        <Ionicons name="person" size={28} color="#2b5bbb" />
                      )}
                    </View>
                    <View style={styles.headerText}>
                      <Text style={styles.name}>
                        {formattedName}
                      </Text>
                      <Text style={styles.headerId}>
                        {candidate.id_fiche_poste || `000-Cmd-${candidate.id}`}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusPill,
                      activeTab === 'valide' ? styles.statusPillValide : styles.statusPillPropose,
                    ]}>
                      <Text style={styles.statusText}>
                        {activeTab === 'valide' ? 'Validé' : 'Proposé'}
                      </Text>
                    </View>
                  </View>

                  {/* Affichage des métiers avec decodeHTML */}
                  <View style={styles.jobList}>
                    <Text style={styles.jobItem}>
                      {candidate.metiers && candidate.metiers.length > 0 ? (
                        candidate.metiers.map((met, index) => {
                          const titreMetier = decodeHTML(met.titre || 'Métier non spécifié');
                          return index === 0 ? `• ${titreMetier}` : ` • ${titreMetier}`;
                        })
                      ) : (
                        `• ${decodeHTML(candidate.metier_titre || candidate.intitule_poste || 'Poste non spécifié')}`
                      )}
                    </Text>
                  </View>

                  {/* Expérience */}
                  <Text style={styles.experienceText}>
                    {candidate.experience
                      ? `${decodeHTML(candidate.experience)} d'expérience`
                      : 'Aucune expérience mentionnée'}
                  </Text>

                  {/* Actions (Boutons) */}
                  <View style={styles.actionsRow}>
                    {activeTab === 'propose' && (
                      <>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.actionButtonOutline]}
                          onPress={() => handleValidate(candidate)} 
                        >
                          <Text style={[styles.actionText, styles.actionTextOutline]}>Oui</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.actionButtonOutline]}
                          onPress={() => handleReject(candidate)}
                        >
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

                  {/* Commentaire de l'agence */}
                  <TouchableOpacity
                    style={styles.commentButton}
                    onPress={() => openCommentModal(candidate)}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#ffffff" style={styles.commentIcon} />
                    <Text style={styles.commentText}>
                      {candidate.commentaire_cmo ? 'Voir le commentaire' : 'CMO commentaire'}
                    </Text>
                  </TouchableOpacity>

                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* ── MODAL VISUALISATION CV ── */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCvModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.cvCard}>
            <View style={styles.cvHeader}>
              <Text style={styles.cvTitle}>CV du Candidat</Text>
              <TouchableOpacity onPress={closeCvModal}>
                <Ionicons name="close-circle" size={26} color="#ff4d4d" />
              </TouchableOpacity>
            </View>

            {selectedCandidate && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.cvCenterAvatar}>
                  <View style={styles.cvAvatarLarge}>
                    {selectedCandidate.photo ? (
                      <Image 
                        source={{ uri: `${url()}documents/photos_candidats/${selectedCandidate.photo}?t=${Date.now()}` }} 
                        style={styles.avatarImage} 
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="person-outline" size={40} color="#2b5bbb" />
                    )}
                  </View>
                  <Text style={styles.cvName}>
                    {selectedCandidate.prenom
                      ? decodeHTML(selectedCandidate.prenom).charAt(0).toUpperCase() + decodeHTML(selectedCandidate.prenom).slice(1).toLowerCase()
                      : 'Candidat'}
                  </Text>
                </View>

                {/* Secteur / Métiers avec decodeHTML */}
                <Text style={styles.sectionTitle}>Secteur d'activité</Text>
                {Array.isArray(selectedCandidate?.metiers) && selectedCandidate.metiers.length > 0 ? (
                  <>
                    {selectedCandidate.metiers.map((m: any, i: number) => (
                      <Text key={i} style={styles.sectorMetier}>• {decodeHTML(m.titre)}</Text>
                    ))}
                    <View style={styles.divider} />
                  </>
                ) : (
                  <>
                    <Text style={styles.contentText}>{decodeHTML(selectedCandidate.metier_titre || selectedCandidate.intitule_poste || 'Non renseigné')}</Text>
                    <View style={styles.divider} />
                  </>
                )}

                {/* Mobilité avec decodeHTML */}
                {Array.isArray(selectedCandidate?.mobilites) && selectedCandidate.mobilites.length > 0 ? (
                  <>
                    <Text style={styles.sectionTitle}>Mobilité</Text>
                    {selectedCandidate.mobilites.map((m: any, i: number) => (
                      <Text key={i} style={styles.mobiliteText}>• {decodeHTML(m.region)}</Text>
                    ))}
                    <View style={styles.divider} />
                  </>
                ) : null}

                <Text style={styles.sectionTitle}>Niveau d'études</Text>
                <Text style={styles.contentText}>{decodeHTML(selectedCandidate.niveau_etude || 'Non spécifié')}</Text>
                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Expérience</Text>
                <Text style={styles.contentText}>{decodeHTML(selectedCandidate.experience || 'Non spécifiée')}</Text>
                <View style={styles.divider} />

                {/* Parcours scolaire avec decodeHTML */}
                {Array.isArray(selectedCandidate?.parcours_scolaire) && selectedCandidate.parcours_scolaire.length > 0 ? (
                  <>
                    <Text style={styles.sectionTitle}>Parcours scolaire</Text>
                    {selectedCandidate.parcours_scolaire.map((parcours: any, index: number) => (
                      <View key={index} style={styles.educationItem}>
                        <Text style={styles.educationDiplome}>{parcours.diplome ? decodeHTML(parcours.diplome).toUpperCase() : 'Diplôme non renseigné'}</Text>
                        <Text style={styles.educationSchool}>École : {decodeHTML(parcours.ecole || 'Non renseignée')}</Text>
                        <Text style={styles.educationDate}>
                          Durée : {String(parcours.mois_debut || '').padStart(2, '0')}/{parcours.annee_debut || ''} à {String(parcours.mois_obtention || '').padStart(2, '0')}/{parcours.annee_obtention || ''}
                        </Text>
                        {parcours.description ? <Text style={styles.educationDescription}>{decodeHTML(parcours.description)}</Text> : null}
                      </View>
                    ))}
                  </>
                ) : null}

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── MODAL COMMENTAIRE CMO ── */}
      <Modal
        visible={isCommentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCommentModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.commentCard}>
            <View style={styles.cvHeader}>
              <Text style={styles.cvTitle}>Commentaire CMO</Text>
              <TouchableOpacity onPress={closeCommentModal}>
                <Ionicons name="close-circle" size={26} color="#ff4d4d" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
              <Text style={styles.commentBody}>
                {selectedComment ? decodeHTML(selectedComment) : "Aucun commentaire disponible."}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef4ff', paddingHorizontal: 16, paddingTop: 20 },
  tabs: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 18, width: '100%' },
  tabButton: { flex: 1, backgroundColor: '#f6f8ff', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent', minHeight: 48 },
  tabButtonActive: { backgroundColor: '#2b5bbb', borderColor: '#2b5bbb' },
  tabLabel: { fontSize: 11, fontWeight: '700', color: '#4865a6', textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center' },
  tabLabelActive: { color: '#ffffff' },
  body: { flex: 1 },
  bodyContent: { paddingBottom: 30 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#2b5bbb', fontSize: 14, fontWeight: '600' },
  emptyState: { paddingTop: 40, alignItems: 'center' },
  emptyText: { color: '#5f6f91', fontSize: 15 },
  card: { backgroundColor: '#ffffff', borderRadius: 22, padding: 18, marginBottom: 16, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  
  avatar: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#d9e4ff', alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  headerText: { flex: 1 },
  name: { color: '#1b2d5a', fontSize: 16, fontWeight: '800' },
  headerId: { color: '#2b5bbb', fontSize: 13, fontWeight: '600' },
  statusPill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  statusPillPropose: { backgroundColor: '#fef5e8' },
  statusPillValide: { backgroundColor: '#eaf7ee' },
  statusText: { color: '#1b2d5a', fontSize: 11, fontWeight: '700' },
  jobList: { marginBottom: 8, paddingLeft: 4 },
  jobItem: { fontSize: 14, fontWeight: '700', color: '#1b2d5a', marginBottom: 2, lineHeight: 20 },
  experienceText: { fontSize: 13, color: '#5f6f91', fontWeight: '500', marginBottom: 14 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  actionButton: { flex: 1, borderRadius: 22, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  actionButtonOutline: { borderWidth: 1, borderColor: '#2b5bbb', backgroundColor: '#ffffff' },
  cvButton: { flex: 1, backgroundColor: '#2b5bbb' },
  actionText: { fontSize: 13, fontWeight: '700' },
  attestationList: { marginTop: 4 },
  documentMissingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 6 
  },
  actionTextOutline: { color: '#2b5bbb' },
  actionTextWhite: { color: '#ffffff' },
  cvIcon: { marginLeft: 6 },
  commentButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2b5bbb', borderRadius: 22, paddingVertical: 12 },
  commentIcon: { marginRight: 8 },
  commentText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  cvCard: { width: width * 0.9, maxHeight: '85%', backgroundColor: '#ffffff', borderRadius: 24, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
  cvHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cvTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b2d5a' },
  cvCenterAvatar: { alignItems: 'center', marginTop: 10, marginBottom: 15 },
  cvAvatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  cvName: { fontSize: 20, fontWeight: 'bold', color: '#1b2d5a' },
  divider: { height: 1, backgroundColor: '#edf2f7', marginVertical: 15, width: '100%' },
  
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#2b5bbb', marginBottom: 10, marginTop: 5 },
  contentText: { fontSize: 14, color: '#4a5568', marginBottom: 8 },
  sectionItem: { fontSize: 14, color: '#4a5568', marginBottom: 8 },
  
  sectorItem: { marginBottom: 12, paddingLeft: 5 },
  sectorMetier: { fontSize: 14, fontWeight: '600', color: '#1b2d5a', marginBottom: 3 },
  sectorCategory: { fontSize: 12, color: '#7a8ab8', marginLeft: 15 },
  mobiliteText: { fontSize: 14, color: '#4a5568', marginBottom: 6, paddingLeft: 5 },
  educationItem: { marginBottom: 15, paddingLeft: 5, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  educationDiplome: { fontSize: 14, fontWeight: 'bold', color: '#2b5bbb', marginBottom: 5 },
  educationSchool: { fontSize: 13, color: '#4a5568', marginBottom: 3 },
  educationDate: { fontSize: 13, color: '#7a8ab8', marginBottom: 5, fontStyle: 'italic' },
  educationDescription: { fontSize: 12, color: '#4a5568', marginTop: 5, lineHeight: 18 },
  attestationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 10 },
  attestationTitle: { fontSize: 14, fontWeight: '600', color: '#1b2d5a' },
  attestationCategory: { fontSize: 12, color: '#7a8ab8' },
  blockItem: { marginTop: 8, paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: '#2b5bbb' },
  blockTitle: { fontSize: 14, fontWeight: '700', color: '#1b2d5a', marginBottom: 4 },

  commentCard: {
    width: width * 0.85,
    maxHeight: '60%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 5,
    elevation: 6,
  },
  commentBody: {
    fontSize: 14,
    color: '#1b2d5a',
    lineHeight: 22,
    fontWeight: '500',
  },
});