import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getSecteur, getToutMobilite } from '@/app/candidat/services/CVScreen';
import { AccepterRefuserDevis, getCommandes, getDevis, getStatutFiche } from '@/app/employeur/services/MyOffers';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ChevronDown, Download, Eye } from 'lucide-react-native';

import url from "@/app/services/url.js";

// Interface pour typer les statuts de la fiche
interface StatutItem {
  id: number;
  titre: string;
  couleur: string;
  deleted: number;
}

// 🔧 Fonction de décodage UTF-8 & HTML COMPLET
const decodeText = (str: string): string => {
  if (!str) return '';
  let decoded = str;

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

  decoded = decoded.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec)));

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
    '&ndash;': '–', '&mdash;': '—',
  };

  Object.keys(htmlEntities).forEach(entity => {
    if (decoded.includes(entity)) {
      decoded = decoded.split(entity).join(htmlEntities[entity]);
    }
  });

  return decoded;
};

// 🔧 Fonction pour formater les dates MySQL
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '-';
  
  try {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    let dateOnly = dateString.includes('T') 
      ? dateString.split('T')[0] 
      : dateString.includes('Z')
      ? dateString.split('Z')[0]
      : dateString;
    
    if (/^\d{4}-\d{2}-\d{2}/.test(dateOnly)) {
      const parts = dateOnly.split('-');
      if (parts.length >= 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
    }
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  } catch (error) {
    return dateString;
  }
};

// 🎨 Mappage des couleurs HTML/Bootstrap vers des codes Hexadécimaux
const getBadgeStyles = (colorType: string) => {
  switch (colorType) {
    case 'primary':
      return { bg: '#e7f1ff', text: '#0d6efd', border: '#b6d4fe' };
    case 'success':
      return { bg: '#e8f5e9', text: '#198754', border: '#a3cfbb' };
    case 'danger':
      return { bg: '#f8d7da', text: '#dc3545', border: '#f5c2c7' };
    case 'warning':
      return { bg: '#fff3cd', text: '#ffc107', border: '#ffe69c' };
    case 'info':
      return { bg: '#cff4fc', text: '#0dcaf0', border: '#9eeaf9' };
    case 'dark':
      return { bg: '#e2e3e5', text: '#212529', border: '#c4c8cb' };
    default:
      return { bg: '#f8f9fa', text: '#6c757d', border: '#dee2e6' };
  }
};

export default function MyOffersScreen() {
  const router = useRouter(); 
  const [activeTab, setActiveTab] = useState<'commands' | 'quotes'>('commands');
  const [commandes, setCommandes] = useState<any[]>([]);
  const [devis, setDevis] = useState<any[]>([]);
  const [statutsList, setStatutsList] = useState<StatutItem[]>([]);
  const [mobilites, setMobilites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null); 
  const [downloadLoadingId, setDownloadLoadingId] = useState<number | null>(null); 
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<any | null>(null);
  const [entriesOpen, setEntriesOpen] = useState(false);
  const [entriesValue, setEntriesValue] = useState<'10' | '20' | '30' | '40' | 'all'>('10');
  
  // 🔍 NOUVEAUX ÉTATS POUR RECHERCHE ET FILTRES
  const [searchText, setSearchText] = useState('');
  const [filterSecteur, setFilterSecteur] = useState<string>('');
  const [filterSousCategorie, setFilterSousCategorie] = useState<string>('');
  const [filterMetier, setFilterMetier] = useState<string>('');
  const [secteurOpen, setSecteurOpen] = useState(false);
  const [sousCatOpen, setSousCatOpen] = useState(false);
  const [metierOpen, setMetierOpen] = useState(false);
  const [secteurData, setSecteurData] = useState({
    categories: [] as any[],
    subCategories: [] as any[],
    metiers: [] as any[],
  });

  // 🔄 Charger la liste globale des statuts
  const fetchStatuts = async () => {
    try {
      const res = await getStatutFiche();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setStatutsList(list);
    } catch (error) {
      console.error("Erreur lors de la récupération des statuts:", error);
    }
  };

  // 🔄 Charger la liste des mobilités
  const fetchMobilites = async () => {
    try {
      const data = await getToutMobilite();
      const decoded = Array.isArray(data) 
        ? data.map((m: any) => ({ ...m, titre: decodeText(m.titre ?? '') })) 
        : [];
      setMobilites(decoded);
    } catch (error) {
      console.error('loadMobilites error', error);
      setMobilites([]);
    }
  };

  useEffect(() => {
    fetchStatuts();
    fetchMobilites();
    getSecteur()
      .then((data) => setSecteurData({
        categories: data?.secteurs ?? [],
        subCategories: data?.sousCategories ?? [],
        metiers: data?.metiers ?? [],
      }))
      .catch((error) => console.error('Erreur lors de la récupération des secteurs:', error));
  }, []);

  // 🔄 Fonction de chargement des données avec sécurité anti-doublons
  const fetchData = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);

    try {
      if (activeTab === 'commands') {
        const res = await getCommandes();
        const rawData = Array.isArray(res) ? res : (res?.data || []);
        
        const uniqueCommandes: any[] = [];
        const seenIds = new Set();
        rawData.forEach((item: any) => {
          if (item && item.id_fiche_poste && !seenIds.has(item.id_fiche_poste)) {
            seenIds.add(item.id_fiche_poste);
            uniqueCommandes.push(item);
          } else if (item && !item.id_fiche_poste) {
            uniqueCommandes.push(item);
          }
        });

        setCommandes(uniqueCommandes);
      } else if (activeTab === 'quotes') {
        const res = await getDevis();
        const rawData = Array.isArray(res) ? res : (res?.data || []);
        
        const uniqueDevis: any[] = [];
        const seenDevisIds = new Set();
        rawData.forEach((item: any) => {
          const currentId = item?.id_devis || item?.id;
          if (currentId && !seenDevisIds.has(currentId)) {
            seenDevisIds.add(currentId);
            uniqueDevis.push(item);
          } else if (!currentId) {
            uniqueDevis.push(item);
          }
        });

        setDevis(uniqueDevis);
      }
    } catch (error) {
      const message =
        activeTab === 'quotes'
          ? 'Impossible de charger les devis'
          : 'Impossible de charger les commandes';
      Alert.alert('Erreur', message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchData(false), fetchStatuts(), fetchMobilites()]);
    setRefreshing(false);
  };

  // 🔍 Helper : Récupérer le libellé et la couleur d'un statut par son ID
  const getStatusInfo = (statusId: any) => {
    const parsedId = Number(statusId);
    const found = statutsList.find((s) => Number(s.id) === parsedId);

    if (found) {
      return {
        titre: decodeText(found.titre),
        couleur: found.couleur,
      };
    }

    return {
      titre: statusId ? `Statut #${statusId}` : '-',
      couleur: 'default',
    };
  };

  // 🔍 Helper : Récupérer le titre de mobilité par ID
  const getMobilityTitle = (mobilityId: any): string => {
    if (!mobilityId) return '-';
    const mobility = mobilites.find(m => String(m.id) === String(mobilityId));
    return mobility ? decodeText(mobility.titre) : '-';
  };

  // 🔍 FONCTION DE FILTRAGE AMÉLIORÉE
  const getFilteredData = () => {
    const data = activeTab === 'quotes' ? devis : commandes;
    
    return data.filter((item) => {
      // Filtre par numéro de commande (ex: rechercher "314" trouve "000-Cmd-314")
      if (searchText.trim()) {
        const cmdNumber = item.id_fiche_poste ? String(item.id_fiche_poste) : '';
        // Cherche le texte saisi dans le numéro de commande
        if (!cmdNumber.includes(searchText.trim())) {
          return false;
        }
      }

      // Filtre par secteur (uniquement pour onglet commandes)
      if (activeTab === 'commands' && filterSecteur) {
        const category = secteurData.categories.find((entry) => String(entry.id_categorie) === filterSecteur);
        const values = [item.secteur_id, item.id_categorie, item.secteur, item.categorie]
          .filter(Boolean)
          .map((value) => decodeText(String(value)).trim().toLowerCase());
        if (!values.includes(filterSecteur) && !values.includes(decodeText(category?.titre || '').trim().toLowerCase())) {
          return false;
        }
      }

      // Filtre par sous-catégorie (uniquement pour onglet commandes)
      if (activeTab === 'commands' && filterSousCategorie) {
        const subCategory = secteurData.subCategories.find((entry) => String(entry.id_sous) === filterSousCategorie);
        const values = [item.sous_categorie_id, item.id_sous, item.sous_categorie]
          .filter(Boolean)
          .map((value) => decodeText(String(value)).trim().toLowerCase());
        if (!values.includes(filterSousCategorie) && !values.includes(decodeText(subCategory?.titre || '').trim().toLowerCase())) {
          return false;
        }
      }

      // Filtre par métier (uniquement pour onglet commandes)
      if (activeTab === 'commands' && filterMetier) {
        const metier = secteurData.metiers.find((entry) => String(entry.id_metier) === filterMetier);
        const values = [item.metier_id, item.id_metier, item.metier]
          .filter(Boolean)
          .map((value) => decodeText(String(value)).trim().toLowerCase());
        if (!values.includes(filterMetier) && !values.includes(decodeText(metier?.titre || '').trim().toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  };

  // 📋 Récupérer les listes uniques de secteurs, sous-catégories et métiers
  const getUniqueSecteurs = () => {
    if (secteurData.categories.length > 0) {
      return secteurData.categories.map((category) => ({
        value: String(category.id_categorie),
        label: decodeText(category.titre || 'Catégorie'),
      }));
    }
    const set = new Set(commandes.map(c => c.secteur_id || c.secteur).filter(Boolean));
    return Array.from(set).map((value) => ({ value: String(value), label: decodeText(String(value)) }));
  };

  const getUniqueSousCategories = () => {
    if (secteurData.subCategories.length > 0) {
      return secteurData.subCategories
        .filter((category) => String(category.id_categorie) === filterSecteur)
        .map((category) => ({
          value: String(category.id_sous),
          label: decodeText(category.titre || 'Sous-catégorie'),
        }));
    }
    const filtered = filterSecteur 
      ? commandes.filter(c => String(c.secteur_id || c.secteur) === filterSecteur)
      : commandes;
    const set = new Set(filtered.map(c => c.sous_categorie_id || c.sous_categorie).filter(Boolean));
    return Array.from(set).map((value) => ({ value: String(value), label: decodeText(String(value)) }));
  };

  const getUniqueMetiers = () => {
    if (secteurData.metiers.length > 0) {
      return secteurData.metiers
        .filter((metier) => String(metier.id_sous) === filterSousCategorie)
        .map((metier) => ({
          value: String(metier.id_metier),
          label: decodeText(metier.titre || 'Métier'),
        }));
    }
    let filtered = commandes;
    if (filterSecteur) {
      filtered = filtered.filter(c => String(c.secteur_id || c.secteur) === filterSecteur);
    }
    if (filterSousCategorie) {
      filtered = filtered.filter(c => String(c.sous_categorie_id || c.sous_categorie) === filterSousCategorie);
    }
    const set = new Set(filtered.map(c => c.metier_id || c.metier).filter(Boolean));
    return Array.from(set).map((value) => ({ value: String(value), label: decodeText(String(value)) }));
  };

  // 📄 Ouvre le fichier PDF du devis
  const openDevisFile = async (fileName: string | undefined | null, idDevis: number) => {
    if (!fileName) {
      Alert.alert('Erreur', 'Aucun fichier disponible pour ce devis.');
      return;
    }

    setDownloadLoadingId(idDevis);
    try {
      const viewerUrl = url() + "documents/devis/" + fileName + "?t=" + Date.now();
      await WebBrowser.openBrowserAsync(viewerUrl);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "Impossible d'ouvrir le fichier du devis.");
    } finally {
      setDownloadLoadingId(null);
    }
  };

  // 🚀 Confirmation d'action avant l'appel API
  const triggerActionConfirmation = (finaliser: number, idFichePoste: any, idDevis: any, numeroDevis?: string) => {
    if (!idDevis) return;

    if (finaliser === 4) {
      Alert.alert(
        'Refuser le devis',
        'Voulez-vous vraiment refuser ce devis ?',
        [
          { text: 'Retour', style: 'cancel' },
          { 
            text: 'Oui, refuser', 
            style: 'destructive',
            onPress: () => handleActionDevis(finaliser, idFichePoste, idDevis) 
          }
        ]
      );
    } else if (finaliser === 3) {
      Alert.alert(
        'Accepter le devis',
        `Devis N°: ${numeroDevis || '-'}\nBon pour accord`,
        [
          { text: 'Retour', style: 'cancel' },
          { 
            text: 'Valider', 
            onPress: () => handleActionDevis(finaliser, idFichePoste, idDevis) 
          }
        ]
      );
    }
  };

  // 📡 Appel API réel après confirmation
  const handleActionDevis = async (finaliser: number, idFichePoste: any, idDevis: any) => {
    setActionLoadingId(idDevis);
    try {
      await AccepterRefuserDevis(finaliser, idFichePoste, idDevis);
      Alert.alert('Succès', finaliser === 3 ? 'Le devis a été accepté avec succès.' : 'Le devis a été refusé.');
      await fetchData(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "Une erreur est survenue lors de la mise à jour du devis.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns =
    activeTab === 'quotes'
      ? [
          { key: 'numero_devis', label: 'Numero de devis', width: 140 },
          { key: 'id', label: 'Id Commande', width: 110 }, 
          { key: 'statut', label: 'Statut', width: 90 },
          { key: 'download', label: 'Telecharger', width: 130 },
          { key: 'action', label: 'Accepter / Refuser', width: 160 },
        ]
      : [
          { key: 'id_fiche_poste', label: 'N° Commande', width: 120 },
          { key: 'nbr_poste', label: 'Nbr de poste', width: 120 },
          { key: 'details', label: 'Tous les details', width: 150 },
          { key: 'contrat_duree', label: 'Contrat & Duree', width: 160 },
          { key: 'statut_fiche', label: 'Statut', width: 90 },
        ];

  const filteredData = getFilteredData();

  const entriesOptions: Array<{ label: string; value: '10' | '20' | '30' | '40' | 'all' }> = [
    { label: '10', value: '10' },
    { label: '20', value: '20' },
    { label: '30', value: '30' },
    { label: '40', value: '40' },
    { label: 'tout', value: 'all' },
  ];

  const displayCount = entriesValue === 'all' ? filteredData.length : Number(entriesValue);
  const displayedData = filteredData.slice(0, displayCount);

  const openDetails = (commande: any) => {
    setSelectedCommande(commande);
    setDetailsVisible(true);
  };

  const closeDetails = () => {
    setDetailsVisible(false);
    setSelectedCommande(null);
  };

  // 🔧 Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchText('');
    setFilterSecteur('');
    setFilterSousCategorie('');
    setFilterMetier('');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
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
        {/* 📦 SECTION 1 : CRÉATION DE COMMANDE */}
        <View style={styles.createSectionCard}>
          <Text style={styles.sectionTitle}>Nouvelle commande</Text>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={() => router.push("/employeur/autre/CreateOfferScreen")}
          >
            <Feather name="plus" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Créer une commande</Text>
          </TouchableOpacity>
        </View>

        {/* 📦 SECTION 2 : AFFICHAGE & LISTING (COMMANDES / DEVIS) */}
        <View style={styles.displaySectionCard}>
          <Text style={styles.sectionTitle}>Mes Offres & Devis</Text>
          
          {/* TABS */}
          <View style={styles.tabs}>
            {['commands', 'quotes'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => {
                  setActiveTab(tab as any);
                  resetFilters();
                }}
                style={[
                  styles.tab,
                  activeTab === tab && styles.tabActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab === 'commands' ? 'COMMANDES' : 'DEVIS'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 🔍 SECTION FILTRES (SEULEMENT POUR COMMANDES) */}
          {activeTab === 'commands' && (
            <View style={styles.filtersContainer}>
              <Text style={styles.filterTitle}>Filtres</Text>
              
              <View style={styles.filtersGrid}>
                {/* Filtre Secteur - TOUJOURS VISIBLE */}
                <View style={[styles.filterItem, secteurOpen && styles.filterItemOpen]}>
                  <Text style={styles.filterLabel}>Secteur</Text>
                  <View>
                    <TouchableOpacity
                      style={styles.filterSelect}
                      onPress={() => {
                        setSecteurOpen((open) => !open);
                        setSousCatOpen(false);
                        setMetierOpen(false);
                      }}
                    >
                      <Text style={styles.filterSelectText}>
                        {filterSecteur
                          ? decodeText(secteurData.categories.find((category) => String(category.id_categorie) === filterSecteur)?.titre || filterSecteur)
                          : 'Tous'}
                      </Text>
                      <ChevronDown size={14} color="#2b5bbb" />
                    </TouchableOpacity>
                    {secteurOpen && (
                      <View style={styles.filterMenu}>
                        <TouchableOpacity
                          onPress={() => {
                            setFilterSecteur('');
                            setFilterSousCategorie('');
                            setFilterMetier('');
                            setSecteurOpen(false);
                          }}
                          style={styles.filterMenuOption}
                        >
                          <Text style={styles.filterMenuText}>Tous</Text>
                        </TouchableOpacity>
                        {getUniqueSecteurs().map((secteur: any) => (
                          <TouchableOpacity
                            key={secteur.value}
                            onPress={() => {
                              setFilterSecteur(secteur.value);
                              setSecteurOpen(false);
                              setFilterSousCategorie('');
                              setFilterMetier('');
                            }}
                            style={styles.filterMenuOption}
                          >
                            <Text style={styles.filterMenuText}>{secteur.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Filtre Sous-Catégorie - SEULEMENT SI SECTEUR CHOISI */}
                {filterSecteur && (
                  <View style={[styles.filterItem, sousCatOpen && styles.filterItemOpen]}>
                    <Text style={styles.filterLabel}>Sous-Catégorie</Text>
                    <View>
                      <TouchableOpacity
                        style={styles.filterSelect}
                        onPress={() => {
                          setSousCatOpen((open) => !open);
                          setSecteurOpen(false);
                          setMetierOpen(false);
                        }}
                      >
                        <Text style={styles.filterSelectText}>
                          {filterSousCategorie
                            ? decodeText(secteurData.subCategories.find((category) => String(category.id_sous) === filterSousCategorie)?.titre || filterSousCategorie)
                            : 'Tous'}
                        </Text>
                        <ChevronDown size={14} color="#2b5bbb" />
                      </TouchableOpacity>
                      {sousCatOpen && (
                        <View style={styles.filterMenu}>
                          <TouchableOpacity
                            onPress={() => {
                              setFilterSousCategorie('');
                              setFilterMetier('');
                              setSousCatOpen(false);
                            }}
                            style={styles.filterMenuOption}
                          >
                            <Text style={styles.filterMenuText}>Tous</Text>
                          </TouchableOpacity>
                          {getUniqueSousCategories().map((sous: any) => (
                            <TouchableOpacity
                              key={sous.value}
                              onPress={() => {
                                setFilterSousCategorie(sous.value);
                                setSousCatOpen(false);
                                setFilterMetier('');
                              }}
                              style={styles.filterMenuOption}
                            >
                              <Text style={styles.filterMenuText}>{sous.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Filtre Métier - SEULEMENT SI SOUS-CATÉGORIE CHOISI */}
                {filterSecteur && filterSousCategorie && (
                  <View style={[styles.filterItem, metierOpen && styles.filterItemOpen]}>
                    <Text style={styles.filterLabel}>Métier</Text>
                    <View>
                      <TouchableOpacity
                        style={styles.filterSelect}
                        onPress={() => {
                          setMetierOpen((open) => !open);
                          setSecteurOpen(false);
                          setSousCatOpen(false);
                        }}
                      >
                        <Text style={styles.filterSelectText}>
                          {filterMetier
                            ? decodeText(secteurData.metiers.find((metier) => String(metier.id_metier) === filterMetier)?.titre || filterMetier)
                            : 'Tous'}
                        </Text>
                        <ChevronDown size={14} color="#2b5bbb" />
                      </TouchableOpacity>
                      {metierOpen && (
                        <View style={styles.filterMenu}>
                          <TouchableOpacity
                            onPress={() => {
                              setFilterMetier('');
                              setMetierOpen(false);
                            }}
                            style={styles.filterMenuOption}
                          >
                            <Text style={styles.filterMenuText}>Tous</Text>
                          </TouchableOpacity>
                          {getUniqueMetiers().map((metier: any) => (
                            <TouchableOpacity
                              key={metier.value}
                              onPress={() => {
                                setFilterMetier(metier.value);
                                setMetierOpen(false);
                              }}
                              style={styles.filterMenuOption}
                            >
                              <Text style={styles.filterMenuText}>{metier.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>

              {/* Bouton Réinitialiser */}
              {(filterSecteur || filterSousCategorie || filterMetier) && (
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={resetFilters}
                >
                  <Text style={styles.resetButtonText}>Réinitialiser les filtres</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* TABLE */}
          <View style={styles.tableCard}>
            <View style={styles.tableControls}>
              <Text style={styles.smallText}>Afficher</Text>
              <View>
                <TouchableOpacity
                  style={styles.select}
                  onPress={() => setEntriesOpen((prev) => !prev)}
                >
                  <Text style={styles.smallText}>
                    {entriesOptions.find((opt) => opt.value === entriesValue)?.label}
                  </Text>
                  <ChevronDown size={16} />
                </TouchableOpacity>
                {entriesOpen ? (
                  <View style={styles.selectMenu}>
                    {entriesOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={styles.selectItem}
                        onPress={() => {
                          setEntriesValue(opt.value);
                          setEntriesOpen(false);
                        }}
                      >
                        <Text style={styles.selectItemText}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </View>
              <Text style={styles.smallText}>entrées</Text>
            </View>

            <View style={styles.searchRow}>
              <Text style={styles.smallText}>Rechercher :</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: 314"
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {loading ? (
              <ActivityIndicator size="small" color="#2b5bbb" />
            ) : filteredData.length === 0 ? (
              <Text style={styles.empty}>
                Affichage de 0 à 0 sur 0 entrées
              </Text>
            ) : (
              <View>
                <View style={styles.verticalTableContainer}>
                  {displayedData.map((row, rowIndex) => {
                    const rowUniqueKey = activeTab === 'quotes' 
                      ? `quote-${row?.id_devis || row?.id || rowIndex}`
                      : `command-${row?.id_fiche_poste || rowIndex}`;

                    return (
                      <View key={rowUniqueKey} style={styles.verticalCard}>
                        {columns.map((col, colIndex) => {
                          let value = row?.[col.key];
                          if (col.key === 'id' && activeTab === 'quotes') {
                            value = row?.id_fiche_poste;
                          }

                          const cellKey = `${rowUniqueKey}-col-${col.key || colIndex}`;

                          // 🏷️ Rendu personnalisé du statut avec la couleur dynamique
                          if (col.key === 'statut_fiche' || (col.key === 'statut' && activeTab === 'quotes')) {
                            const statusId = row?.statut ?? row?.statut_fiche ?? value;
                            const statusInfo = getStatusInfo(statusId);
                            const badgeTheme = getBadgeStyles(statusInfo.couleur);

                            return (
                              <View key={cellKey} style={styles.verticalRow}>
                                <Text style={styles.verticalLabel}>{col.label}</Text>
                                <View
                                  style={[
                                    styles.statusBadge,
                                    { backgroundColor: badgeTheme.bg, borderColor: badgeTheme.border },
                                  ]}
                                >
                                  <Text style={[styles.statusBadgeText, { color: badgeTheme.text }]}>
                                    {statusInfo.titre}
                                  </Text>
                                </View>
                              </View>
                            );
                          }

                          let displayValue = '-';
                          if (col.key === 'nbr_poste') {
                            displayValue = row?.nbr_poste ?? row?.nombre_poste ?? row?.nbr_postes ?? '-';
                          } else if (col.key === 'contrat_duree') {
                            const contratStr = row?.contrat || '';
                            const dureeStr = row?.duree || '';
                            displayValue = [contratStr, dureeStr].filter(Boolean).join(' / ') || '-';
                          } else if (col.key === 'details') {
                            displayValue = 'Voir';
                          } else if (col.key === 'download') {
                            displayValue = 'Télécharger';
                          } else if (col.key === 'action') {
                            displayValue = 'Accepter / Refuser';
                          } else {
                            displayValue = value ?? '-';
                          }

                          const cleanedText = typeof displayValue === 'string' ? decodeText(displayValue) : displayValue;

                          if (col.key === 'download' && activeTab === 'quotes') {
                            const idDevis = row?.id_devis || row?.id;
                            const fileName = row?.devis;

                            return (
                              <View key={cellKey} style={styles.verticalRow}>
                                <Text style={styles.verticalLabel}>{col.label}</Text>
                                {downloadLoadingId === idDevis ? (
                                  <ActivityIndicator size="small" color="#2b5bbb" />
                                ) : (
                                  <TouchableOpacity
                                    onPress={() => openDevisFile(fileName, idDevis)}
                                    style={styles.detailsBadge}
                                  >
                                    <Download size={14} color="#2b5bbb" style={{ marginRight: 4 }} />
                                    <Text style={styles.detailsBadgeText}>Télécharger</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            );
                          }

                          if (col.key === 'action' && activeTab === 'quotes') {
                            const idDevis = row?.id_devis || row?.id; 
                            const idFichePoste = row?.id_fiche_poste;
                            const currentStatut = Number(row?.statut);

                            if (currentStatut === 2) {
                              return (
                                <View key={cellKey} style={styles.verticalRow}>
                                  <Text style={styles.verticalLabel}>{col.label}</Text>
                                  {actionLoadingId === idDevis ? (
                                    <ActivityIndicator size="small" color="#2b5bbb" />
                                  ) : (
                                    <View style={styles.radioGroup}>
                                      <TouchableOpacity 
                                        style={styles.radioButtonContainer}
                                        onPress={() => triggerActionConfirmation(3, idFichePoste, idDevis, row?.numero_devis)}
                                      >
                                        <View style={styles.radioCircle}></View>
                                        <Text style={styles.radioLabel}>Accepter</Text>
                                      </TouchableOpacity>

                                      <TouchableOpacity 
                                        style={styles.radioButtonContainer}
                                        onPress={() => triggerActionConfirmation(4, idFichePoste, idDevis)}
                                      >
                                        <View style={styles.radioCircle}></View>
                                        <Text style={styles.radioLabel}>Refuser</Text>
                                      </TouchableOpacity>
                                    </View>
                                  )}
                                </View>
                              );
                            } else {
                              return (
                                <View key={cellKey} style={styles.verticalRow}>
                                  <Text style={styles.verticalLabel}>{col.label}</Text>
                                  <Text style={styles.verticalValue}> </Text>
                                </View>
                              );
                            }
                          }

                          if (col.key === 'details' && activeTab === 'commands') {
                            return (
                              <View key={cellKey} style={styles.verticalRow}>
                                <Text style={styles.verticalLabel}>{col.label}</Text>
                                <TouchableOpacity 
                                  onPress={() => openDetails(row)}
                                  style={styles.detailsBadge}
                                >
                                  <Eye size={14} color="#2b5bbb" style={{ marginRight: 4 }} />
                                  <Text style={styles.detailsBadgeText}>Détails</Text>
                                </TouchableOpacity>
                              </View>
                            );
                          }

                          return (
                            <View key={cellKey} style={styles.verticalRow}>
                              <Text style={styles.verticalLabel}>{col.label}</Text>
                              <Text style={styles.verticalValue}>{cleanedText}</Text>
                            </View>
                          );
                        })}
                      </View>
                    );
                  })}
                </View>
                <Text style={styles.empty}>
                  Affichage de 1 à {displayedData.length} sur {filteredData.length} entrées
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* MODAL DETAILS - AVEC AFFICHAGE HTML CORRIGÉ */}
      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDetails}
      >
        <View style={styles.modalBackdrop}>
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Détails</Text>

              <Text style={styles.modalRow}>
                Catégorie : {decodeText(selectedCommande?.categorie || '-')}
              </Text>
              <Text style={styles.modalRow}>
                Sous Categorie : {decodeText(selectedCommande?.sous_categorie || '-')}
              </Text>
              <Text style={styles.modalRow}>
                Metier : {decodeText(selectedCommande?.metier || '-')}
              </Text>
              <Text style={styles.modalRow}>
                Contrat : {decodeText(selectedCommande?.contrat || '-')}
              </Text>
              
              <Text style={styles.modalRow}>
                Date de debut : {formatDate(selectedCommande?.date_besoin)}
              </Text>
              <Text style={styles.modalRow}>
                Date de fin : {formatDate(selectedCommande?.date_fin)}
              </Text>
              <Text style={styles.modalRow}>
                Durée : {decodeText(String(selectedCommande?.duree || '-'))}
              </Text>

              <Text style={styles.modalRow}>
                Adresse : {decodeText(selectedCommande?.adresse || '-')}
              </Text>
              <Text style={styles.modalRow}>
                Mobilite : {decodeText(getMobilityTitle(selectedCommande?.lieu_travail2))}
              </Text>
              <Text style={styles.modalRow}>
                Nombre de poste : {selectedCommande?.nbr_poste || '-'}
              </Text>
              <Text style={styles.modalRow}>
                Salaire propose : {decodeText(selectedCommande?.salaire_proposer || '-')}
              </Text>
              <Text style={styles.modalRow}>
                Logement : {selectedCommande?.logement === 1 || selectedCommande?.logement === 'Oui' ? 'Oui' : selectedCommande?.logement === 0 || selectedCommande?.logement === 'Non' ? 'Non' : '-'}
              </Text>
              <Text style={styles.modalRow}>
                Permis : {decodeText(selectedCommande?.permis || '-')}
              </Text>

              <TouchableOpacity style={styles.modalClose} onPress={closeDetails}>
                <Text style={styles.modalCloseText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef3ff' },
  content: { padding: 15, paddingBottom: 120, gap: 18 },

  /* 📦 Styles des deux blocs principaux */
  createSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dce6fa',
    shadowColor: '#2b5bbb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  displaySectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dce6fa',
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b2d5a',
    marginBottom: 10,
  },

  createButton: { flexDirection: 'row', backgroundColor: '#2b5bbb', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 1 },
  createButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tabs: { flexDirection: 'row', gap: 10 },
  tab: { flex: 1, padding: 12, backgroundColor: '#f4f7fe', borderRadius: 16, borderWidth: 1, borderColor: '#e1e9fb', alignItems: 'center' },
  tabActive: { backgroundColor: '#ffe9cf', borderColor: '#f2d9bf' },
  tabText: { fontSize: 12, color: '#1b2d5a' },
  tabTextActive: { fontWeight: '700' },

  /* 🔍 Styles des filtres */
  filtersContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e1e9fb',
    gap: 10,
    zIndex: 20,
    elevation: 20,
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2b5bbb',
    marginBottom: 5,
  },
  filtersGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    zIndex: 20,
  },
  filterItem: {
    flex: 1,
    minWidth: 140,
  },
  filterItemOpen: {
    zIndex: 20,
    elevation: 20,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2b5bbb',
    marginBottom: 4,
  },
  filterSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#cfd9ee',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  filterSelectText: {
    fontSize: 11,
    color: '#1b2d5a',
    fontWeight: '500',
    flex: 1,
  },
  filterMenu: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cfd9ee',
    borderRadius: 10,
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    maxHeight: 200,
  },
  filterMenuOption: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterMenuText: {
    fontSize: 11,
    color: '#1b2d5a',
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffe9cf',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 11,
    color: '#2b5bbb',
    fontWeight: '600',
  },

  tableCard: { backgroundColor: '#fff', borderRadius: 16 },
  tableControls: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  smallText: { fontSize: 12, color: '#1b2d5a' },
  select: { flexDirection: 'row', gap: 5, borderWidth: 1, borderColor: '#cfd9ee', padding: 5, borderRadius: 10 },
  selectMenu: { position: 'absolute', top: 34, left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cfd9ee', borderRadius: 10, zIndex: 10 },
  selectItem: { paddingVertical: 6, paddingHorizontal: 8 },
  selectItemText: { fontSize: 12, color: '#1b2d5a' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#cfd9ee', borderRadius: 16, padding: 8, backgroundColor: '#fff' },
  empty: { textAlign: 'center', marginTop: 20, color: '#7a8ab8' },
  detailsBadge: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#d4e3f7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#b0d0ff',
  },
  detailsBadgeText: {
    fontSize: 11,
    color: '#2b5bbb',
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-end',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  verticalTableContainer: { gap: 12 },
  verticalCard: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e1e9fb', borderRadius: 12, padding: 12, gap: 8 },
  verticalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  verticalLabel: { fontSize: 11, color: '#2b5bbb', fontWeight: '600', flex: 0.35 },
  verticalValue: { fontSize: 12, color: '#1b2d5a', flex: 0.65, textAlign: 'right' },
  radioGroup: { flexDirection: 'row', gap: 12, flex: 0.65, justifyContent: 'flex-end' },
  radioButtonContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  radioCircle: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#94a3b8', alignItems: 'center', justifyContent: 'center' },
  radioLabel: { fontSize: 11, color: '#475569', fontWeight: '500' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalScrollView: { flex: 1, width: '100%' },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginVertical: 'auto' },
  modalTitle: { fontSize: 16, color: '#1b2d5a', marginBottom: 10, fontWeight: '600' },
  modalRow: { fontSize: 12, color: '#1b2d5a', marginBottom: 8, lineHeight: 18 },
  modalClose: { marginTop: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#2b5bbb', alignItems: 'center' },
  modalCloseText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});