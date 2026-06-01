import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCandidats } from '@/app/employeur/services/CVDatabaseScreen';
import { getSecteur } from '@/app/candidat/services/CVScreen';

const { width } = Dimensions.get('window');

const CONTRATS = ['CDI', 'CDD', 'Saisonnier', 'Alternance', 'Stage', 'Mi-temps', 'Interim', 'Liberal'];

const PAYS = [
  { label: 'Tout ...', value: '' },
  { label: 'France', value: 'France' },
  { label: 'Maroc', value: 'Maroc' },
  { label: 'Belgique', value: 'Belgique' },
  { label: 'Suisse', value: 'Suisse' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Espagne', value: 'Espagne' },
  { label: 'Italie', value: 'Italie' },
  { label: 'Allemagne', value: 'Allemagne' },
];

export default function CVDatabaseScreen() {
  const [candidats, setCandidats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cvVisible, setCvVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);

  const [secteurData, setSecteurData] = useState<{
    categories: any[];
    subCategories: any[];
    metiers: any[];
  }>({ categories: [], subCategories: [], metiers: [] });

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedMetier, setSelectedMetier] = useState<string>('');
  const [selectedContrats, setSelectedContrats] = useState<string[]>([]);
  const [selectedPays, setSelectedPays] = useState<string>('');

  // Dropdown open state
  const [catOpen, setCatOpen] = useState(false);
  const [subCatOpen, setSubCatOpen] = useState(false);
  const [metierOpen, setMetierOpen] = useState(false);
  const [paysOpen, setPaysOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadCandidats = async () => {
      setLoading(true);
      try {
        const data = await getCandidats();
        if (!mounted) return;
        setCandidats(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur lors de la récupération des candidats :', error);
        Alert.alert('Erreur', 'Impossible de charger les candidats');
        if (mounted) setCandidats([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadCandidats();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadSecteur = async () => {
      try {
        const data = await getSecteur();
        if (!mounted) return;
        setSecteurData({
          categories: data?.secteurs ?? [],
          subCategories: data?.sousCategories ?? [],
          metiers: data?.metiers ?? [],
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des secteurs :', error);
        if (mounted) setSecteurData({ categories: [], subCategories: [], metiers: [] });
      }
    };
    loadSecteur();
    return () => { mounted = false; };
  }, []);

  const openCv = (candidate: any) => {
    setSelectedCandidate(candidate);
    setCvVisible(true);
  };

  const closeCv = () => {
    setCvVisible(false);
    setSelectedCandidate(null);
  };

  const toggleContrat = (contrat: string) => {
    setSelectedContrats((prev) =>
      prev.includes(contrat) ? prev.filter((c) => c !== contrat) : [...prev, contrat]
    );
  };

  const filteredSubCategories = secteurData.subCategories.filter(
    (item) => String(item.id_categorie) === String(selectedCategory)
  );
  const filteredMetiers = secteurData.metiers.filter(
    (item) => String(item.id_sous) === String(selectedSubCategory)
  );

  const filteredCandidats = candidats.filter((cand) => {
    const secteurs = Array.isArray(cand?.secteur_activite) ? cand.secteur_activite : [];

    // Secteur filter
    if (selectedCategory || selectedSubCategory || selectedMetier) {
      const matchSecteur = secteurs.some((s: any) => {
        const matchCategory = selectedCategory ? String(s.id_categorie) === String(selectedCategory) : true;
        const matchSub = selectedSubCategory ? String(s.id_sous) === String(selectedSubCategory) : true;
        const matchMetier = selectedMetier ? String(s.id_metier) === String(selectedMetier) : true;
        return matchCategory && matchSub && matchMetier;
      });
      if (!matchSecteur) return false;
    }

    // Pays filter (based on mobilite region — simple contains check)
    if (selectedPays) {
      const regions = cand?.mobilite?.map((m: any) => m.region || '') ?? [];
      const matchPays = regions.some((r: string) => r.toLowerCase().includes(selectedPays.toLowerCase()));
      if (!matchPays) return false;
    }

    return true;
  });

  const activeFilterCount = [
    selectedCategory,
    selectedSubCategory,
    selectedMetier,
    selectedPays,
    ...selectedContrats,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedMetier('');
    setSelectedContrats([]);
    setSelectedPays('');
    setCatOpen(false);
    setSubCatOpen(false);
    setMetierOpen(false);
    setPaysOpen(false);
  };

  const getCategoryLabel = () =>
    secteurData.categories.find((c) => String(c.id_categorie) === selectedCategory)?.titre || 'Catégorie';

  const getSubCategoryLabel = () =>
    filteredSubCategories.find((c) => String(c.id_sous) === selectedSubCategory)?.titre || 'Sous-catégorie';

  const getMetierLabel = () =>
    filteredMetiers.find((c) => String(c.id_metier) === selectedMetier)?.titre || 'Métier';

  const getPaysLabel = () =>
    PAYS.find((p) => p.value === selectedPays)?.label || 'Tout ...';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* FILTER BUTTON */}
        <View style={styles.center}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
            <Ionicons name="filter-outline" size={16} color="#fff" />
            <Text style={styles.filterText}> Filtrer</Text>
            {activeFilterCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {loading ? (
          <ActivityIndicator size="small" color="#2b5bbb" style={{ marginTop: 40 }} />
        ) : filteredCandidats.length === 0 ? (
          <Text style={styles.emptyText}>Aucun candidat trouvé</Text>
        ) : (
          filteredCandidats.map((profile, index) => (
            <View key={profile.token_id || index} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.avatarLarge}>
                  <Ionicons name="person-outline" size={30} color="#2b5bbb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{profile.prenom} {profile.nom}</Text>
                  <Text style={styles.status}>{profile.experience || 'Vide !'}</Text>
                  <Text style={styles.info}>
                    Mobilité : {profile.mobilite?.map((m: any) => m.region).filter(Boolean).join(', ') || '-'}
                  </Text>
                  <Text style={styles.info}>Disponibilité : Oui</Text>
                </View>
              </View>
              <View style={styles.footer}>
                <Text style={styles.footerText}>Jamais travaillé chez vous</Text>
                <TouchableOpacity style={styles.cvBtn} onPress={() => openCv(profile)}>
                  <Text style={styles.cvText}>Le CV </Text>
                  <Ionicons name="eye-outline" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

      </ScrollView>

      {/* ──────────────── FILTER MODAL ──────────────── */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.filterBackdrop}>
          <View style={styles.filterCard}>

            {/* Header */}
            <View style={styles.filterHeader}>
              <View style={styles.filterHeaderLeft}>
                <Ionicons name="filter-outline" size={18} color="#1b2d5a" />
                <Text style={styles.filterTitle}> Filtrer</Text>
              </View>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={22} color="#1b2d5a" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* ── CATÉGORIE ── */}
              <Text style={styles.filterLabel}>Catégorie :</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => {
                  setCatOpen(!catOpen);
                  setSubCatOpen(false);
                  setMetierOpen(false);
                  setPaysOpen(false);
                }}
              >
                <Text style={[styles.dropdownText, selectedCategory ? styles.dropdownTextActive : null]}>
                  {getCategoryLabel()}
                </Text>
                <Ionicons name={catOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#7a8ab8" />
              </TouchableOpacity>
              {catOpen && (
                <View style={styles.dropdownList}>
                  <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCategory('');
                        setSelectedSubCategory('');
                        setSelectedMetier('');
                        setCatOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>-- Toutes les catégories --</Text>
                    </TouchableOpacity>
                    {secteurData.categories.map((item) => (
                      <TouchableOpacity
                        key={item.id_categorie}
                        style={[
                          styles.dropdownItem,
                          String(item.id_categorie) === selectedCategory ? styles.dropdownItemActive : null,
                        ]}
                        onPress={() => {
                          setSelectedCategory(String(item.id_categorie));
                          setSelectedSubCategory('');
                          setSelectedMetier('');
                          setCatOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            String(item.id_categorie) === selectedCategory ? styles.dropdownItemTextActive : null,
                          ]}
                        >
                          {item.titre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* ── SOUS CATÉGORIE ── */}
              <Text style={styles.filterLabel}>Sous catégorie :</Text>
              <TouchableOpacity
                style={[styles.dropdownBtn, !selectedCategory ? styles.dropdownDisabled : null]}
                onPress={() => {
                  if (!selectedCategory) return;
                  setSubCatOpen(!subCatOpen);
                  setCatOpen(false);
                  setMetierOpen(false);
                  setPaysOpen(false);
                }}
              >
                <Text style={[styles.dropdownText, selectedSubCategory ? styles.dropdownTextActive : null]}>
                  {selectedCategory ? getSubCategoryLabel() : 'Sous-catégorie'}
                </Text>
                <Ionicons name={subCatOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#7a8ab8" />
              </TouchableOpacity>
              {subCatOpen && filteredSubCategories.length > 0 && (
                <View style={styles.dropdownList}>
                  <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedSubCategory('');
                        setSelectedMetier('');
                        setSubCatOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>-- Toutes les sous-catégories --</Text>
                    </TouchableOpacity>
                    {filteredSubCategories.map((item) => (
                      <TouchableOpacity
                        key={item.id_sous}
                        style={[
                          styles.dropdownItem,
                          String(item.id_sous) === selectedSubCategory ? styles.dropdownItemActive : null,
                        ]}
                        onPress={() => {
                          setSelectedSubCategory(String(item.id_sous));
                          setSelectedMetier('');
                          setSubCatOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            String(item.id_sous) === selectedSubCategory ? styles.dropdownItemTextActive : null,
                          ]}
                        >
                          {item.titre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* ── MÉTIER ── */}
              <Text style={styles.filterLabel}>Métier :</Text>
              <TouchableOpacity
                style={[styles.dropdownBtn, !selectedSubCategory ? styles.dropdownDisabled : null]}
                onPress={() => {
                  if (!selectedSubCategory) return;
                  setMetierOpen(!metierOpen);
                  setCatOpen(false);
                  setSubCatOpen(false);
                  setPaysOpen(false);
                }}
              >
                <Text style={[styles.dropdownText, selectedMetier ? styles.dropdownTextActive : null]}>
                  {selectedSubCategory ? getMetierLabel() : 'Métier'}
                </Text>
                <Ionicons name={metierOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#7a8ab8" />
              </TouchableOpacity>
              {metierOpen && filteredMetiers.length > 0 && (
                <View style={styles.dropdownList}>
                  <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedMetier('');
                        setMetierOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>-- Tous les métiers --</Text>
                    </TouchableOpacity>
                    {filteredMetiers.map((item) => (
                      <TouchableOpacity
                        key={item.id_metier}
                        style={[
                          styles.dropdownItem,
                          String(item.id_metier) === selectedMetier ? styles.dropdownItemActive : null,
                        ]}
                        onPress={() => {
                          setSelectedMetier(String(item.id_metier));
                          setMetierOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            String(item.id_metier) === selectedMetier ? styles.dropdownItemTextActive : null,
                          ]}
                        >
                          {item.titre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* ── CONTRAT ── */}
              <Text style={styles.filterLabel}>Contrat :</Text>
              <View style={styles.checkboxGrid}>
                {CONTRATS.map((contrat) => {
                  const checked = selectedContrats.includes(contrat);
                  return (
                    <TouchableOpacity
                      key={contrat}
                      style={styles.checkboxRow}
                      onPress={() => toggleContrat(contrat)}
                    >
                      <View style={[styles.checkbox, checked ? styles.checkboxChecked : null]}>
                        {checked && <Ionicons name="checkmark" size={12} color="#fff" />}
                      </View>
                      <Text style={styles.checkboxLabel}>{contrat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ── PAYS ── */}
              <Text style={styles.filterLabel}>Pays :</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => {
                  setPaysOpen(!paysOpen);
                  setCatOpen(false);
                  setSubCatOpen(false);
                  setMetierOpen(false);
                }}
              >
                <Text style={[styles.dropdownText, selectedPays ? styles.dropdownTextActive : null]}>
                  {getPaysLabel()}
                </Text>
                <Ionicons name={paysOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#7a8ab8" />
              </TouchableOpacity>
              {paysOpen && (
                <View style={styles.dropdownList}>
                  <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    {PAYS.map((p) => (
                      <TouchableOpacity
                        key={p.value}
                        style={[
                          styles.dropdownItem,
                          p.value === selectedPays ? styles.dropdownItemActive : null,
                        ]}
                        onPress={() => {
                          setSelectedPays(p.value);
                          setPaysOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            p.value === selectedPays ? styles.dropdownItemTextActive : null,
                          ]}
                        >
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

            </ScrollView>

            {/* Actions */}
            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.filterReset} onPress={resetFilters}>
                <Text style={styles.filterResetText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterApply} onPress={() => setFilterVisible(false)}>
                <Text style={styles.filterApplyText}>Appliquer</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* ──────────────── CV MODAL (CENTRÉ ET CORRESPONDANT À LA TAILLE DU MOBILE) ──────────────── */}
      <Modal
        visible={cvVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCv}
      >
        <View style={styles.cvModalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalName}>
                {selectedCandidate?.prenom} {selectedCandidate?.nom}
              </Text>
              <Text style={styles.modalLocation}>
                {selectedCandidate?.mobilite?.[0]?.region || ''}
              </Text>

              <Text style={styles.sectionTitle}>Secteur d'activité</Text>
              {selectedCandidate?.secteur_activite?.length ? (
                selectedCandidate.secteur_activite.map((item: any, idx: number) => (
                  <Text key={`secteur-${idx}`} style={styles.sectionItem}>• {item.metier}</Text>
                ))
              ) : (
                <Text style={styles.sectionItem}>-</Text>
              )}

              <Text style={styles.sectionTitle}>Mobilité</Text>
              <Text style={styles.sectionItem}>
                {selectedCandidate?.mobilite?.map((m: any) => m.region).filter(Boolean).join(', ') || '-'}
              </Text>

              <Text style={styles.sectionTitle}>Niveau d'études</Text>
              <Text style={styles.sectionItem}>{selectedCandidate?.niveau_etudes || '-'}</Text>

              <Text style={styles.sectionTitle}>Expérience</Text>
              <Text style={styles.sectionItem}>{selectedCandidate?.experience || '-'}</Text>

              <Text style={styles.sectionTitle}>Parcours scolaire</Text>
              {selectedCandidate?.parcours_scolaire?.length ? (
                selectedCandidate.parcours_scolaire.map((item: any, idx: number) => (
                  <View key={`scolaire-${idx}`} style={styles.blockItem}>
                    <Text style={styles.blockTitle}>{item.diplome || '-'}</Text>
                    <Text style={styles.sectionItem}>• {item.ecole}</Text>
                    <Text style={styles.sectionItem}>• Début : {item.mois_debut}/{item.annee_debut}</Text>
                    <Text style={styles.sectionItem}>• Fin : {item.mois_obtention}/{item.annee_obtention}</Text>
                    {!!item.description && (
                      <Text style={styles.sectionItem}>• {item.description}</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.sectionItem}>-</Text>
              )}

              <Text style={styles.sectionTitle}>Attestations</Text>
              {selectedCandidate?.attestation?.length ? (
                selectedCandidate.attestation.map((item: any, idx: number) => (
                  <View key={`att-${idx}`} style={styles.attestationRow}>
                    <Text style={styles.sectionItem}>• {item.titre}</Text>
                    <View style={[styles.etatBadge, item.etats === 1 ? styles.etatOk : styles.etatPending]}>
                      <Text style={styles.etatText}>{item.etats === 1 ? 'Validé' : 'En attente'}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.sectionItem}>-</Text>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.modalClose} onPress={closeCv}>
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef3ff' },
  content: { paddingBottom: 120 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#7a8ab8', fontSize: 14 },

  center: { alignItems: 'center', marginVertical: 10 },
  filterBtn: { flexDirection: 'row', backgroundColor: '#2b5bbb', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  filterText: { color: '#fff', marginLeft: 5, fontWeight: '600' },
  badge: { backgroundColor: '#e84040', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  card: { backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatarLarge: { width: 60, height: 60, borderRadius: 15, backgroundColor: '#e7eeff', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1b2d5a' },
  status: { fontSize: 13, color: '#7a8ab8', fontStyle: 'italic' },
  info: { marginTop: 4, fontSize: 13, color: '#1b2d5a' },
  footer: { marginTop: 15, backgroundColor: '#fff1dc', padding: 10, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { color: '#b87400', fontSize: 12 },
  cvBtn: { flexDirection: 'row', backgroundColor: '#2b5bbb', padding: 8, borderRadius: 20, alignItems: 'center' },
  cvText: { color: '#fff', fontSize: 13 },

  // ── Filter Modal Styling ──
  filterBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  filterCard: { backgroundColor: '#fdf8f2', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  filterHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  filterTitle: { fontSize: 17, fontWeight: '700', color: '#1b2d5a' },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#1b2d5a', marginTop: 14, marginBottom: 6 },

  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#c8d4f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fff' },
  dropdownDisabled: { backgroundColor: '#f0f3fb', borderColor: '#e1e9fb' },
  dropdownText: { fontSize: 13, color: '#7a8ab8' },
  dropdownTextActive: { color: '#1b2d5a', fontWeight: '600' },
  dropdownList: { borderWidth: 1.5, borderColor: '#c8d4f0', borderRadius: 12, marginTop: 4, backgroundColor: '#fff', maxHeight: 180, overflow: 'hidden' },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#eef3ff' },
  dropdownItemActive: { backgroundColor: '#e7eeff' },
  dropdownItemText: { fontSize: 13, color: '#1b2d5a' },
  dropdownItemTextActive: { fontWeight: '700', color: '#2b5bbb' },

  checkboxGrid: { flexDirection: 'column' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#2b5bbb', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkboxChecked: { backgroundColor: '#2b5bbb' },
  checkboxLabel: { fontSize: 14, color: '#1b2d5a' },

  filterActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 10 },
  filterReset: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#c8d4f0', alignItems: 'center' },
  filterResetText: { color: '#1b2d5a', fontSize: 13, fontWeight: '600' },
  filterApply: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#2b5bbb', alignItems: 'center' },
  filterApplyText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // ── CV Modal Styling (Corrigé pour centrer et prendre la taille écran) ──
  cvModalBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center',  // Centre verticalement
    alignItems: 'center',      // Centre horizontalement
  },
  modalCard: { 
    width: width * 0.9,         // Occupe 90% de la largeur totale de l'écran du mobile
    maxHeight: '80%',           // Hauteur maximale raisonnable pour scroller proprement dedans
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalName: { fontSize: 18, fontWeight: '700', color: '#1b2d5a' },
  modalLocation: { marginBottom: 10, color: '#7a8ab8', fontSize: 13 },
  sectionTitle: { marginTop: 14, fontSize: 14, fontWeight: '700', color: '#2b5bbb', borderBottomWidth: 1, borderBottomColor: '#eef3ff', paddingBottom: 4 },
  sectionItem: { marginTop: 4, fontSize: 12, color: '#1b2d5a', lineHeight: 18 },
  blockItem: { marginTop: 8, paddingLeft: 6, borderLeftWidth: 2, borderLeftColor: '#e7eeff' },
  blockTitle: { fontSize: 13, fontWeight: '700', color: '#1b2d5a', marginBottom: 2 },
  attestationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  etatBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  etatOk: { backgroundColor: '#d4f4e2' },
  etatPending: { backgroundColor: '#fff1dc' },
  etatText: { fontSize: 10, fontWeight: '700', color: '#1b2d5a' },
  modalClose: { marginTop: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#2b5bbb', alignItems: 'center' },
  modalCloseText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});