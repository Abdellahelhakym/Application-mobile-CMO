import { getSecteur } from '@/app/candidat/services/CVScreen';
import { getCandidats } from '@/app/employeur/services/CVDatabaseScreen';
import { getEmployerInfo } from "@/app/employeur/services/EmployerInfoScreen";

import url from "@/app/services/url.js";
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// ✅ CACHE GLOBAL POUR DÉCODAGE HTML
const decodeCache = new Map<string, string>();

// ✅ DÉCODAGE HTML OPTIMISÉ
const decodeHTML = (str: string): string => {
  if (!str) return '';
  if (decodeCache.has(str)) return decodeCache.get(str)!;

  let decoded = String(str);

  const utf8Fixes: { [key: string]: string } = {
    'â€"': '-', 'â€': '-', 'â€"/': '–',
    'Â©': '©', 'Â¢': '¢', 'â„¢': '™',
    'â€œ': '"', 'â€\u009d': '"', 'â€\u009c': '"',
    'â€˜': "'", 'â€™': "'", 'â€\u0098': "'",
    'â€•': '—', 'â€¢': '•', 'â€¦': '…', 'â€‹': '', 'â€›': '›',
    'â€\u0082': '‚', 'â€ƒ': 'ƒ', 'â€„': '„',
    'â€…': '…', 'â€†': '†', 'â€‡': '‡',
    'Ã©': 'é', 'Ã¡': 'á', 'Ã ': 'à', 'Ã¤': 'ä', 'Ã¥': 'å',
    'Ã¨': 'è', 'Ã¢': 'â', 'Ã¾': 'þ',
    'Ã¬': 'ì', 'Ã®': 'î', 'Ã¯': 'ï', 'Ã­': 'í',
    'Ã²': 'ò', 'Ã´': 'ô', 'Ã¶': 'ö', 'Ã³': 'ó', 'Ãµ': 'õ',
    'Ã¹': 'ù', 'Ã»': 'û', 'Ã¼': 'ü', 'Ãº': 'ú',
    'Ã§': 'ç', 'Ã±': 'ñ',
    'Ã¿': 'ÿ', 'Ã˜': 'Ø', 'Ã†': 'Æ',
    'Ã‰': 'É', 'Ã€': 'À', 'ÃŠ': 'Ê', 'Ã‹': 'Ë',
    'ÃŒ': 'Ì', 'ÃŽ': 'Î',
    'Ã"': 'Ó', 'Ã•': 'Õ', 'Ã–': 'Ö',
    'Ã™': 'Ù', 'Ãš': 'Ú', 'Ã›': 'Û', 'Ãœ': 'Ü',
    'Ã‡': 'Ç', 'Ãˆ': 'È',
    'Â': '', 'Ã': ''
  };

  Object.keys(utf8Fixes).forEach(key => {
    if (decoded.includes(key)) {
      decoded = decoded.split(key).join(utf8Fixes[key]);
    }
  });

  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));

  const htmlEntities: { [key: string]: string } = {
    '&eacute;': 'é', '&egrave;': 'è', '&ecirc;': 'ê', '&euml;': 'ë',
    '&agrave;': 'à', '&acirc;': 'â', '&aring;': 'å',
    '&icirc;': 'î', '&iuml;': 'ï',
    '&ocirc;': 'ô', '&ouml;': 'ö',
    '&ugrave;': 'ù', '&ucirc;': 'û', '&uuml;': 'ü',
    '&ccedil;': 'ç',
    '&Eacute;': 'É', '&Egrave;': 'È', '&Ecirc;': 'Ê', '&Euml;': 'Ë',
    '&Agrave;': 'À', '&Acirc;': 'Â', '&Aring;': 'Å',
    '&Icirc;': 'Î', '&Iuml;': 'Ï',
    '&Ocirc;': 'Ô', '&Ouml;': 'Ö',
    '&Ugrave;': 'Ù', '&Ucirc;': 'Û', '&Uuml;': 'Ü',
    '&Ccedil;': 'Ç', '&Ntilde;': 'Ñ',
    '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>',
    '&nbsp;': ' ', '&rsquo;': "'", '&lsquo;': "'",
  };

  Object.keys(htmlEntities).forEach(entity => {
    if (decoded.includes(entity)) {
      decoded = decoded.split(entity).join(htmlEntities[entity]);
    }
  });

  decodeCache.set(str, decoded);
  return decoded;
};

// ✅ NORMALISATION POUR COMPARAISON
const normalizeForCompare = (str: string): string => {
  if (!str) return '';
  const decoded = decodeHTML(str);
  return decoded
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
};

const extractCandidates = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.candidats)) return response.candidats;
  if (Array.isArray(response?.candidates)) return response.candidates;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  return [];
};

const CONTRATS = ['CDI', 'CDD', 'Saisonnier', 'Alternance', 'Stage', 'Mi-temps', 'Interim', 'Liberal'];

const PAYS = [
  { label: 'Tout ...', value: '' },
  { label: 'Autriche', value: 'Autriche' },
  { label: 'Belgique', value: 'Belgique' },
  { label: 'Bulgarie', value: 'Bulgarie' },
  { label: 'Croatie', value: 'Croatie' },
  { label: 'Chypre', value: 'Chypre' },
  { label: 'République tchèque', value: 'République tchèque' },
  { label: 'Danemark', value: 'Danemark' },
  { label: 'Estonie', value: 'Estonie' },
  { label: 'Finlande', value: 'Finlande' },
  { label: 'France', value: 'France' },
  { label: 'Allemagne', value: 'Allemagne' },
  { label: 'Grèce', value: 'Grèce' },
  { label: 'Hongrie', value: 'Hongrie' },
  { label: 'Irlande', value: 'Irlande' },
  { label: 'Italie', value: 'Italie' },
  { label: 'Lettonie', value: 'Lettonie' },
  { label: 'Lituanie', value: 'Lituanie' },
  { label: 'Luxembourg', value: 'Luxembourg' },
  { label: 'Malte', value: 'Malte' },
  { label: 'Pays-Bas', value: 'Pays-Bas' },
  { label: 'Pologne', value: 'Pologne' },
  { label: 'Portugal', value: 'Portugal' },
  { label: 'Roumanie', value: 'Roumanie' },
  { label: 'Slovaquie', value: 'Slovaquie' },
  { label: 'Slovénie', value: 'Slovénie' },
  { label: 'Espagne', value: 'Espagne' },
  { label: 'Suède', value: 'Suède' },
  { label: 'Maroc', value: 'Maroc' },
  { label: 'Tunisie', value: 'Tunisie' },
  { label: 'Algérie', value: 'Algérie' },
];

const PAGE_SIZE = 15;
const MAX_PAGE_BUTTONS = 5;

type PickerOption = { label: string; value: string };

// ✅ CARD CANDIDATE MÉMORISÉE
const CandidateCard = memo(({ profile, onOpenCv }: { profile: any; onOpenCv: (c: any) => void }) => {
  const hasPhoto = profile.photo?.trim();
  const photoUrl = hasPhoto ? `${url()}documents/photos_candidats/${profile.photo}?t=${Date.now()}` : undefined;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatarLarge}>
          {hasPhoto ? (
            <Image
              source={{ uri: photoUrl }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person-outline" size={30} color="#2b5bbb" />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{decodeHTML(profile.prenom)}</Text>
          <Text style={styles.status}>{decodeHTML(profile.experience) || 'Vide !'} d&apos;experience</Text>

          <View style={styles.metiersContainer}>
            {Array.isArray(profile?.secteur_activite) && profile.secteur_activite.length > 0 ? (
              <>
                {profile.secteur_activite.slice(0, 2).map((secteur: any, idx: number) => (
                  <View key={idx} style={styles.metierBadge}>
                    <Text style={styles.metierBadgeText}>{decodeHTML(secteur.metier)}</Text>
                  </View>
                ))}
                {profile.secteur_activite.length > 2 && (
                  <Text style={styles.moreBadge}>+{profile.secteur_activite.length - 2}</Text>
                )}
              </>
            ) : (
              <Text style={styles.noMetierText}>Aucun métier renseigné</Text>
            )}
          </View>

          <Text style={styles.info}>
            Mobilité : {profile.mobilite?.map((m: any) => decodeHTML(m.region)).filter(Boolean).join(', ') || '-'}
          </Text>
          <Text style={styles.info}>Disponibilité : Oui</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Jamais travaillé chez vous</Text>
        <TouchableOpacity style={styles.cvBtn} onPress={() => onOpenCv(profile)}>
          <Text style={styles.cvText}>Le CV </Text>
          <Ionicons name="eye-outline" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

CandidateCard.displayName = 'CandidateCard';

// ✅ SELECT PICKER MÉMORISÉ
const UniversalSelectPicker = memo(({
  label,
  value,
  options,
  onChange,
  placeholder = 'Sélectionner...',
  disabled = false,
}: {
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = useMemo(() => options.find((o) => o.value === value)?.label, [value, options]);

  return (
    <View style={styles.pickerWrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.pickerButton, disabled && styles.dropdownDisabled]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text style={[styles.pickerText, !selectedLabel && styles.placeholderText]}>
          {selectedLabel || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#7a8ab8" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Sélectionner'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#1b2d5a" />
              </TouchableOpacity>
            </View>

            <View style={styles.listWrapper}>
              <FlatList
                data={options}
                keyExtractor={(item, index) => `${item.value}-${index}`}
                nestedScrollEnabled={true}
                removeClippedSubviews={true}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.optionItem, item.value === value && styles.selectedOption]}
                    onPress={() => {
                      onChange(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.optionText, item.value === value && styles.selectedOptionText]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

UniversalSelectPicker.displayName = 'UniversalSelectPicker';

// ✅ COMPOSANT PRINCIPAL
export default function CVDatabaseScreen() {
  const [candidats, setCandidats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cvVisible, setCvVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [employerCountry, setEmployerCountry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [secteurData, setSecteurData] = useState({
    categories: [] as any[],
    subCategories: [] as any[],
    metiers: [] as any[],
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedMetier, setSelectedMetier] = useState('');
  const [selectedContrats, setSelectedContrats] = useState<string[]>([]);
  const [selectedPays, setSelectedPays] = useState('');

  const [tempCategory, setTempCategory] = useState('');
  const [tempSubCategory, setTempSubCategory] = useState('');
  const [tempMetier, setTempMetier] = useState('');
  const [tempContrats, setTempContrats] = useState<string[]>([]);
  const [tempPays, setTempPays] = useState('');

  // ✅ CHARGEMENT PARALLÈLE
  useEffect(() => {
    let mounted = true;
    const loadAllData = async () => {
      try {
        const [candData, empData, sectData] = await Promise.all([
          getCandidats(),
          getEmployerInfo(),
          getSecteur(),
        ]);

        if (!mounted) return;

        setCandidats(extractCandidates(candData));
        setEmployerCountry(normalizeForCompare(empData?.pays_origine || empData?.data?.pays_origine || ''));
        setSecteurData({
          categories: sectData?.secteurs ?? [],
          subCategories: sectData?.sousCategories ?? [],
          metiers: sectData?.metiers ?? [],
        });
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        if (mounted) {
          Alert.alert('Erreur', 'Impossible de charger les données');
          setLoading(false);
        }
      }
    };

    loadAllData();
    return () => { mounted = false; };
  }, []);

  // ✅ FILTRAGE OPTIMISÉ
  const filteredCandidats = useMemo(() => {
    return candidats
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
          const candPays = normalizeForCompare(cand?.pays || '');
          const filterPays = normalizeForCompare(selectedPays);
          if (candPays !== filterPays) return false;
        }

        if (selectedContrats.length > 0) {
          const candContrat1 = normalizeForCompare(cand?.contrat_prefere1 || '');
          const candContrat2 = normalizeForCompare(cand?.contrat_prefere2 || '');
          const matchContrat = selectedContrats.some((c) => {
            const normalizedFilter = normalizeForCompare(c);
            return candContrat1 === normalizedFilter || candContrat2 === normalizedFilter;
          });
          if (!matchContrat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const sameCountryA = normalizeForCompare(a?.pays || '') === employerCountry ? 1 : 0;
        const sameCountryB = normalizeForCompare(b?.pays || '') === employerCountry ? 1 : 0;
        if (sameCountryA !== sameCountryB) return sameCountryB - sameCountryA;
        return (b.id || b.id_candidat || 0) - (a.id || a.id_candidat || 0);
      });
  }, [candidats, selectedCategory, selectedSubCategory, selectedMetier, selectedPays, selectedContrats, employerCountry]);

  // ✅ PAGINATION
  const totalItems = filteredCandidats.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedCandidats = useMemo(
    () => filteredCandidats.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredCandidats, currentPage]
  );

  // ✅ CALLBACKS OPTIMISÉS
  const openCv = useCallback((candidate: any) => {
    setSelectedCandidate(candidate);
    setCvVisible(true);
  }, []);

  const closeCv = useCallback(() => {
    setCvVisible(false);
    setSelectedCandidate(null);
  }, []);

  const openFilterModal = useCallback(() => {
    setTempCategory(selectedCategory);
    setTempSubCategory(selectedSubCategory);
    setTempMetier(selectedMetier);
    setTempPays(selectedPays);
    setTempContrats(selectedContrats);
    setFilterVisible(true);
  }, [selectedCategory, selectedSubCategory, selectedMetier, selectedPays, selectedContrats]);

  const toggleTempContrat = useCallback((contrat: string) => {
    setTempContrats((prev) =>
      prev.includes(contrat) ? prev.filter((c) => c !== contrat) : [...prev, contrat]
    );
  }, []);

  const handleApplyFilters = useCallback(() => {
    setSelectedCategory(tempCategory);
    setSelectedSubCategory(tempSubCategory);
    setSelectedMetier(tempMetier);
    setSelectedPays(tempPays);
    setSelectedContrats(tempContrats);
    setCurrentPage(1);
    setFilterVisible(false);
  }, [tempCategory, tempSubCategory, tempMetier, tempPays, tempContrats]);

  // ✅ OPTIONS PICKERS MÉMORISÉES
  const categoryOptions: PickerOption[] = useMemo(
    () => [
      { label: '-- Toutes les catégories --', value: '' },
      ...secteurData.categories.map((c) => ({
        label: decodeHTML(c.titre) || 'Catégorie',
        value: String(c.id_categorie),
      })),
    ],
    [secteurData.categories]
  );

  const tempFilteredSubCategories = useMemo(
    () => secteurData.subCategories.filter((item) => String(item.id_categorie) === String(tempCategory)),
    [secteurData.subCategories, tempCategory]
  );

  const subCategoryOptions: PickerOption[] = useMemo(
    () => [
      { label: '-- Toutes les sous-catégories --', value: '' },
      ...tempFilteredSubCategories.map((c) => ({
        label: decodeHTML(c.titre) || 'Sous-catégorie',
        value: String(c.id_sous),
      })),
    ],
    [tempFilteredSubCategories]
  );

  const tempFilteredMetiers = useMemo(
    () => secteurData.metiers.filter((item) => String(item.id_sous) === String(tempSubCategory)),
    [secteurData.metiers, tempSubCategory]
  );

  const metierOptions: PickerOption[] = useMemo(
    () => [
      { label: '-- Tous les métiers --', value: '' },
      ...tempFilteredMetiers.map((c) => ({
        label: decodeHTML(c.titre) || 'Métier',
        value: String(c.id_metier),
      })),
    ],
    [tempFilteredMetiers]
  );

  const getPageNumbers = useCallback(() => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
    let end = Math.min(totalPages, start + MAX_PAGE_BUTTONS - 1);
    start = Math.max(1, end - MAX_PAGE_BUTTONS + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }, [totalPages]);

  const renderCandidateCard = useCallback(({ item }: { item: any }) => (
    <CandidateCard profile={item} onOpenCv={openCv} />
  ), [openCv]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2b5bbb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* FILTER BUTTON */}
        <View style={styles.center}>
          <TouchableOpacity style={styles.filterBtn} onPress={openFilterModal}>
            <Ionicons name="filter-outline" size={16} color="#fff" />
            <Text style={styles.filterText}> Filtrer</Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {filteredCandidats.length === 0 ? (
          <Text style={styles.emptyText}>Aucun candidat trouvé</Text>
        ) : (
          <FlatList
            data={paginatedCandidats}
            keyExtractor={(item, index) => String(item.token_id || item.id || item.id_candidat || `candidate-${index}`)}
            renderItem={renderCandidateCard}
            scrollEnabled={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
          />
        )}

        {/* PAGINATION */}
        {totalItems > 0 && totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.pageNavBtn, currentPage === 1 && styles.pageNavBtnDisabled]}
              onPress={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Ionicons name="chevron-back" size={18} color={currentPage === 1 ? '#a0aec0' : '#2b5bbb'} />
            </TouchableOpacity>

            {getPageNumbers()[0] > 1 && (
              <>
                <TouchableOpacity style={styles.pageBtn} onPress={() => goToPage(1)}>
                  <Text style={styles.pageBtnText}>1</Text>
                </TouchableOpacity>
                {getPageNumbers()[0] > 2 && <Text style={styles.pageEllipsis}>...</Text>}
              </>
            )}

            {getPageNumbers().map((page) => (
              <TouchableOpacity
                key={page}
                style={[styles.pageBtn, page === currentPage && styles.pageBtnActive]}
                onPress={() => goToPage(page)}
              >
                <Text style={[styles.pageBtnText, page === currentPage && styles.pageBtnTextActive]}>
                  {page}
                </Text>
              </TouchableOpacity>
            ))}

            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
              <Text style={styles.pageEllipsis}>...</Text>
            )}

            <TouchableOpacity
              style={[styles.pageNavBtn, currentPage === totalPages && styles.pageNavBtnDisabled]}
              onPress={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <Ionicons name="chevron-forward" size={18} color={currentPage === totalPages ? '#a0aec0' : '#2b5bbb'} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* CV MODAL */}
      <Modal visible={cvVisible} transparent animationType="slide" onRequestClose={closeCv}>
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
                {/* HEADER */}
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
                  <Text style={styles.cvName}>{decodeHTML(selectedCandidate.prenom)}</Text>
                </View>

                <View style={styles.divider} />

                {/* SECTEUR */}
                {Array.isArray(selectedCandidate?.secteur_activite) && selectedCandidate.secteur_activite.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Secteur d&apos;activité</Text>
                    {selectedCandidate.secteur_activite.map((s: any, i: number) => (
                      <View key={i} style={styles.sectorItem}>
                        <Text style={styles.sectorMetier}>• {decodeHTML(s.metier)}</Text>
                        <Text style={styles.sectorCategory}>
                          {decodeHTML(s.sous_categorie)} - {decodeHTML(s.categorie)}
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
                      <Text key={i} style={styles.mobiliteText}>• {decodeHTML(m.region)}</Text>
                    ))}
                    <View style={styles.divider} />
                  </>
                )}

                {/* ÉTUDES */}
                {selectedCandidate.niveau_etudes && (
                  <>
                    <Text style={styles.sectionTitle}>Niveau d&apos;études</Text>
                    <Text style={styles.contentText}>{decodeHTML(selectedCandidate.niveau_etudes)}</Text>
                    <View style={styles.divider} />
                  </>
                )}

                {/* EXPÉRIENCE */}
                {selectedCandidate.experience && (
                  <>
                    <Text style={styles.sectionTitle}>Expérience</Text>
                    <Text style={styles.contentText}>{decodeHTML(selectedCandidate.experience)}</Text>
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
                          {decodeHTML(p.diplome)?.toUpperCase() || 'Diplôme non renseigné'}
                        </Text>
                        <Text style={styles.educationSchool}>École : {decodeHTML(p.ecole)}</Text>
                        <Text style={styles.educationDate}>
                          Durée : {String(p.mois_debut).padStart(2, '0')}/{p.annee_debut} à {String(p.mois_obtention).padStart(2, '0')}/{p.annee_obtention}
                        </Text>
                        {p.description && (
                          <Text style={styles.educationDescription}>{decodeHTML(p.description)}</Text>
                        )}
                      </View>
                    ))}
                    <View style={styles.divider} />
                  </>
                )}

                {/* ATTESTATIONS */}
                {Array.isArray(selectedCandidate?.attestation) && selectedCandidate.attestation.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Attestations</Text>
                    {selectedCandidate.attestation.map((a: any, i: number) => (
                      <View key={i} style={styles.attestationItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.attestationTitle}>{decodeHTML(a.titre)}</Text>
                          <Text style={styles.attestationCategory}>{decodeHTML(a.categorie)}</Text>
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

      {/* FILTER MODAL */}
      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
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
              <UniversalSelectPicker
                label="Catégorie"
                value={tempCategory}
                options={categoryOptions}
                placeholder="Catégorie"
                onChange={(v) => {
                  setTempCategory(v);
                  setTempSubCategory('');
                  setTempMetier('');
                }}
              />

              <UniversalSelectPicker
                label="Sous-catégorie"
                value={tempSubCategory}
                options={subCategoryOptions}
                placeholder="Sous-catégorie"
                disabled={!tempCategory}
                onChange={(v) => {
                  setTempSubCategory(v);
                  setTempMetier('');
                }}
              />

              <UniversalSelectPicker
                label="Métier"
                value={tempMetier}
                options={metierOptions}
                placeholder="Métier"
                disabled={!tempSubCategory}
                onChange={(v) => setTempMetier(v)}
              />

              <Text style={styles.filterLabel}>Contrat :</Text>
              <View style={styles.checkboxGrid}>
                {CONTRATS.map((contrat) => {
                  const checked = tempContrats.includes(contrat);
                  return (
                    <TouchableOpacity
                      key={contrat}
                      style={styles.checkboxRow}
                      onPress={() => toggleTempContrat(contrat)}
                    >
                      <View style={[styles.checkbox, checked ? styles.checkboxChecked : null]}>
                        {checked && <Ionicons name="checkmark" size={12} color="#fff" />}
                      </View>
                      <Text style={styles.checkboxLabel}>{contrat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <UniversalSelectPicker
                label="Pays"
                value={tempPays}
                options={PAYS}
                placeholder="Tout ..."
                onChange={(v) => setTempPays(v)}
              />
            </ScrollView>

            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
              <Text style={styles.applyButtonText}>Filtrer</Text>
            </TouchableOpacity>
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
  emptyText: { textAlign: 'center', marginTop: 40, color: '#7a8ab8', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  avatarLarge: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
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
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 10, marginBottom: 20 },
  pageNavBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eef2ff', marginHorizontal: 3 },
  pageNavBtnDisabled: { backgroundColor: '#f1f5f9' },
  pageBtn: { minWidth: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eef2ff', marginHorizontal: 3, paddingHorizontal: 8 },
  pageBtnActive: { backgroundColor: '#2b5bbb' },
  pageBtnText: { color: '#2b5bbb', fontSize: 13, fontWeight: '600' },
  pageBtnTextActive: { color: '#fff' },
  pageEllipsis: { color: '#7a8ab8', marginHorizontal: 4, fontSize: 13 },
  filterBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  cvCard: { backgroundColor: '#fff', width: width * 0.95, maxHeight: height * 0.9, borderRadius: 15, padding: 20, elevation: 5 },
  cvHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cvTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b2d5a' },
  cvCenterAvatar: { alignItems: 'center', marginTop: 10, marginBottom: 15 },
  cvAvatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  cvName: { fontSize: 20, fontWeight: 'bold', color: '#1b2d5a' },
  divider: { height: 1, backgroundColor: '#edf2f7', marginVertical: 15 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#2b5bbb', marginBottom: 10, marginTop: 5 },
  contentText: { fontSize: 14, color: '#4a5568', marginBottom: 8 },
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
  filterCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filterHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  filterTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b2d5a', marginLeft: 10 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#4a5568', marginTop: 15, marginBottom: 5 },
  checkboxGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 12 },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#2b5bbb', borderColor: '#2b5bbb' },
  checkboxLabel: { fontSize: 14, color: '#4a5568' },
  applyButton: { marginTop: 15, backgroundColor: '#2b5bbb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  pickerWrapper: { marginBottom: 4, marginTop: 15 },
  label: { fontSize: 13, color: '#4a5568', marginBottom: 4, fontWeight: '600' },
  pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  pickerText: { fontSize: 14, color: '#1b2d5a', flex: 1 },
  placeholderText: { color: '#94A3B8' },
  dropdownDisabled: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 12, height: 350, padding: 16, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#1b2d5a' },
  listWrapper: { flex: 1 },
  optionItem: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  selectedOption: { backgroundColor: '#F1F5F9', borderRadius: 6 },
  optionText: { fontSize: 14, color: '#334155' },
  selectedOptionText: { fontWeight: '600', color: '#2b5bbb' },
});