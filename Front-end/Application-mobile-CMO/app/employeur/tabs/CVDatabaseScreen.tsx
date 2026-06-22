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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCandidats } from '@/app/employeur/services/CVDatabaseScreen';
import { getSecteur } from '@/app/candidat/services/CVScreen';
import url from "@/app/services/url.js";

const { width, height } = Dimensions.get('window');

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

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedMetier, setSelectedMetier] = useState<string>('');
  const [selectedContrats, setSelectedContrats] = useState<string[]>([]);
  const [selectedPays, setSelectedPays] = useState<string>('');

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

  const filteredCandidats = candidats
    .filter((cand) => {
      const secteurs = Array.isArray(cand?.secteur_activite) ? cand.secteur_activite : [];

      if (selectedCategory || selectedSubCategory || selectedMetier) {
        const matchSecteur = secteurs.some((s: any) => {
          const matchCategory = selectedCategory ? String(s.id_categorie) === String(selectedCategory) : true;
          const matchSub = selectedSubCategory ? String(s.id_sous) === String(selectedSubCategory) : true;
          const matchMetier = selectedMetier ? String(s.id_metier) === String(selectedMetier) : true;
          return matchCategory && matchSub && matchMetier;
        });
        if (!matchSecteur) return false;
      }

      if (selectedPays) {
        const regions = cand?.mobilite?.map((m: any) => m.region || '') ?? [];
        const matchPays = regions.some((r: string) => r.toLowerCase().includes(selectedPays.toLowerCase()));
        if (!matchPays) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const idA = a.id || a.id_candidat || 0;
      const idB = b.id || b.id_candidat || 0;
      return Number(idB) - Number(idA); 
    });

  const activeFilterCount = [
    selectedCategory,
    selectedSubCategory,
    selectedMetier,
    selectedPays,
    ...selectedContrats,
  ].filter(Boolean).length;

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
          filteredCandidats.map((profile, index) => {
            const hasPhoto = profile.photo && profile.photo.trim() !== '';
            const photoUrl = hasPhoto 
              ? `${url()}documents/photos_candidats/${profile.photo}?t=${Date.now()}`
              : null;

            return (
              <View key={profile.token_id || profile.id || index} style={styles.card}>
                <View style={styles.row}>
                  
                  <View style={styles.avatarLarge}>
                    {hasPhoto ? (
                      <Image 
                        source={{ uri: photoUrl! }} 
                        style={styles.avatarImage} 
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="person-outline" size={30} color="#2b5bbb" />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{profile.prenom} </Text>
                    <Text style={styles.status}>{profile.experience || 'Vide !'} d'experience</Text>
                    
                    {/* METIERS */}
                    <View style={styles.metiersContainer}>
                      {Array.isArray(profile?.secteur_activite) && profile.secteur_activite.length > 0 ? (
                        profile.secteur_activite.slice(0, 2).map((secteur: any, idx: number) => (
                          <View key={idx} style={styles.metierBadge}>
                            <Text style={styles.metierBadgeText}>{secteur.metier}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noMetierText}>Aucun métier renseigné</Text>
                      )}
                      {Array.isArray(profile?.secteur_activite) && profile.secteur_activite.length > 2 && (
                        <Text style={styles.moreBadge}>+{profile.secteur_activite.length - 2}</Text>
                      )}
                    </View>

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
            );
          })
        )}

      </ScrollView>

      {/* ──────────────── MODAL DU CV AMÉLIORÉE ──────────────── */}
      <Modal
        visible={cvVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCv}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.cvCard}>
            <View style={styles.cvHeader}>
              <Text style={styles.cvTitle}>CV du Candidat</Text>
              <TouchableOpacity onPress={closeCv}>
                <Ionicons name="close-circle" size={26} color="#ff4d4d" />
              </TouchableOpacity>
            </View>

            {selectedCandidate && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                
                {/* HEADER AVEC AVATAR ET NOM */}
                <View style={styles.cvCenterAvatar}>
                  <View style={styles.cvAvatarLarge}>
                    {selectedCandidate.photo ? (
                      <Image 
                        source={{ uri: `${url()}documents/photos_candidats/${selectedCandidate.photo}` }} 
                        style={styles.avatarImage} 
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="person-outline" size={40} color="#2b5bbb" />
                    )}
                  </View>
                  <Text style={styles.cvName}>{selectedCandidate.prenom} </Text>
                </View>

                <View style={styles.divider} />

                {/* SECTEUR D'ACTIVITÉ */}
                {Array.isArray(selectedCandidate?.secteur_activite) && selectedCandidate.secteur_activite.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Secteur d'activité</Text>
                    {selectedCandidate.secteur_activite.map((s: any, i: number) => (
                      <View key={i} style={styles.sectorItem}>
                        <Text style={styles.sectorMetier}>• {s.metier}</Text>
                        <Text style={styles.sectorCategory}>
                          {s.sous_categorie} - {s.categorie}
                        </Text>
                      </View>
                    ))}
                    <View style={styles.divider} />
                  </>
                )}

                {/* MOBILITÉ */}
                {Array.isArray(selectedCandidate?.mobilite) && selectedCandidate.mobilite.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Mobilité</Text>
                    {selectedCandidate.mobilite.map((m: any, i: number) => (
                      <Text key={i} style={styles.mobiliteText}>• {m.region}</Text>
                    ))}
                    <View style={styles.divider} />
                  </>
                )}

                {/* NIVEAU D'ÉTUDES */}
                {selectedCandidate.niveau_etudes && (
                  <>
                    <Text style={styles.sectionTitle}>Niveau d'études</Text>
                    <Text style={styles.contentText}>{selectedCandidate.niveau_etudes}</Text>
                    <View style={styles.divider} />
                  </>
                )}

                {/* EXPÉRIENCE PROFESSIONNELLE */}
                {selectedCandidate.experience && (
                  <>
                    <Text style={styles.sectionTitle}>Expérience</Text>
                    <Text style={styles.contentText}>{selectedCandidate.experience}</Text>
                    <View style={styles.divider} />
                  </>
                )}

                {/* PARCOURS SCOLAIRE */}
                {Array.isArray(selectedCandidate?.parcours_scolaire) && selectedCandidate.parcours_scolaire.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Parcours scolaire</Text>
                    {selectedCandidate.parcours_scolaire.map((p: any, i: number) => (
                      <View key={i} style={styles.educationItem}>
                        <Text style={styles.educationDiplome}>
                          {p.diplome.toUpperCase() || 'Diplôme non renseigné'}
                        </Text>
                        <Text style={styles.educationSchool}>École : {p.ecole}</Text>
                        <Text style={styles.educationDate}>
                          Durée : {String(p.mois_debut).padStart(2, '0')}/{p.annee_debut} à {String(p.mois_obtention).padStart(2, '0')}/{p.annee_obtention}
                        </Text>
                        {p.description && (
                          <Text style={styles.educationDescription}>{p.description}</Text>
                        )}
                      </View>
                    ))}
                    <View style={styles.divider} />
                  </>
                )}

               {/* ATTESTATIONS */}
                        {Array.isArray(selectedCandidate?.attestation) &&
                          selectedCandidate.attestation.length > 0 && (
                            <>
                              <Text style={styles.sectionTitle}>Attestations</Text>

                              {selectedCandidate.attestation.map((a: any, i: number) => (
                                <View key={i} style={styles.attestationItem}>
                                  <View style={{ flex: 1 }}>
                                    <Text style={styles.attestationTitle}>{a.titre}</Text>
                                    <Text style={styles.attestationCategory}>{a.categorie}</Text>
                                  </View>
                                </View>
                              ))}
                            </>
                        )}
                                      </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ──────────────── FILTER MODAL ──────────────── */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.filterBackdrop}>
          <View style={styles.filterCard}>
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
              {/* CATEGORIE */}
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

              {/* SOUS CATEGORIE */}
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

              {/* METIER */}
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

              {/* CONTRAT */}
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

              {/* PAYS */}
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
                    {PAYS.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.dropdownItem,
                          item.value === selectedPays ? styles.dropdownItemActive : null,
                        ]}
                        onPress={() => {
                          setSelectedPays(item.value);
                          setPaysOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            item.value === selectedPays ? styles.dropdownItemTextActive : null,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  content: { padding: 15 },
  center: { alignItems: 'center', marginBottom: 15 },
  filterBtn: { flexDirection: 'row', backgroundColor: '#2b5bbb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, alignItems: 'center' },
  filterText: { color: '#fff', fontWeight: 'bold' },
  badge: { backgroundColor: '#ff4d4d', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#7a8ab8' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  
  // Avatar liste
  avatarLarge: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#eef2ff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15,
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  name: { fontSize: 16, fontWeight: 'bold', color: '#1b2d5a', marginBottom: 2 },
  status: { fontSize: 13, color: '#7a8ab8', marginBottom: 8 },
  metiersContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  metierBadge: { backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 6, marginBottom: 4 },
  metierBadgeText: { color: '#2b5bbb', fontSize: 11, fontWeight: '600' },
  moreBadge: { color: '#2b5bbb', fontSize: 11, fontWeight: '600', paddingHorizontal: 6 },
  noMetierText: { color: '#a0aec0', fontSize: 12, fontStyle: 'italic', marginBottom: 8 },
  info: { fontSize: 13, color: '#4a5568', marginBottom: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#edf2f7' },
  footerText: { fontSize: 12, color: '#a0aec0', fontStyle: 'italic' },
  cvBtn: { flexDirection: 'row', backgroundColor: '#2b5bbb', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 15, alignItems: 'center' },
  cvText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  
  // Modals Backdrops
  filterBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  
  // Modal CV
  cvCard: { backgroundColor: '#fff', width: width * 0.95, maxHeight: height * 0.9, borderRadius: 15, padding: 20, elevation: 5 },
  cvHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cvTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b2d5a' },
  cvCenterAvatar: { alignItems: 'center', marginTop: 10, marginBottom: 15 },
  cvAvatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  cvName: { fontSize: 20, fontWeight: 'bold', color: '#1b2d5a' },
  divider: { height: 1, backgroundColor: '#edf2f7', marginVertical: 15 },
  
  // Sections CV
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#2b5bbb', marginBottom: 10, marginTop: 5 },
  contentText: { fontSize: 14, color: '#4a5568', marginBottom: 8 },
  
  // Secteur d'activité
  sectorItem: { marginBottom: 12, paddingLeft: 5 },
  sectorMetier: { fontSize: 14, fontWeight: '600', color: '#1b2d5a', marginBottom: 3 },
  sectorCategory: { fontSize: 12, color: '#7a8ab8', marginLeft: 15 },
  
  // Mobilité
  mobiliteText: { fontSize: 14, color: '#4a5568', marginBottom: 6, paddingLeft: 5 },
  
  // Parcours scolaire
  educationItem: { marginBottom: 15, paddingLeft: 5, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  educationDiplome: { fontSize: 14, fontWeight: 'bold', color: '#2b5bbb', marginBottom: 5 },
  educationSchool: { fontSize: 13, color: '#4a5568', marginBottom: 3 },
  educationDate: { fontSize: 13, color: '#7a8ab8', marginBottom: 5, fontStyle: 'italic' },
  educationDescription: { fontSize: 12, color: '#4a5568', marginTop: 5, lineHeight: 18 },
  
  // Attestations
  attestationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 10 },
  attestationStatus: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  attestationValid: { backgroundColor: '#4caf50' },
  attestationInvalid: { backgroundColor: '#ff4d4d' },
  attestationStatus2: { fontSize: 18, fontWeight: 'bold', color: '#2b5bbb' },
  attestationTitle: { fontSize: 14, fontWeight: '600', color: '#1b2d5a' },
  attestationCategory: { fontSize: 12, color: '#7a8ab8' },

  // Modal Filtre
  filterCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filterHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  filterTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b2d5a' },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#4a5568', marginTop: 15, marginBottom: 5 },
  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 8, backgroundColor: '#fff' },
  dropdownDisabled: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  dropdownText: { color: '#94a3b8', fontSize: 14 },
  dropdownTextActive: { color: '#1b2d5a', fontWeight: '500' },
  dropdownList: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, marginTop: 4, backgroundColor: '#fff', maxHeight: 150, padding: 4 },
  dropdownItem: { padding: 12, borderRadius: 6 },
  dropdownItemActive: { backgroundColor: '#eef2ff' },
  dropdownItemText: { color: '#4a5568', fontSize: 14 },
  dropdownItemTextActive: { color: '#2b5bbb', fontWeight: '600' },
  checkboxGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 12 },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#2b5bbb', borderColor: '#2b5bbb' },
  checkboxLabel: { fontSize: 14, color: '#4a5568' },
});