import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';

import { ChevronDown, Eye, Download } from 'lucide-react-native';
import { Feather } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router'; 
import * as WebBrowser from 'expo-web-browser';
import { getCommandes, getDevis, AccepterRefuserDevis, getStatutFiche } from '@/app/employeur/services/MyOffers';
import { getSecteur } from '@/app/candidat/services/CVScreen';

import url from "@/app/services/url.js";

// Interface pour typer les statuts de la fiche
interface StatutItem {
  id: number;
  titre: string;
  couleur: string;
  deleted: number;
}

// 🔧 Fonction globale de décodage des entités HTML
const decodeHTML = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&eacute;/gi, 'é')  
    .replace(/&egrave;/gi, 'è')
    .replace(/&ecirc;/gi, 'ê')
    .replace(/&euml;/gi, 'ë')
    .replace(/&agrave;/gi, 'à')
    .replace(/&acirc;/gi, 'â')
    .replace(/&icirc;/gi, 'î')
    .replace(/&iuml;/gi, 'ï')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null); 
  const [downloadLoadingId, setDownloadLoadingId] = useState<number | null>(null); 
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<any | null>(null);
  const [entriesOpen, setEntriesOpen] = useState(false);
  const [entriesValue, setEntriesValue] = useState<'10' | '20' | '30' | '40' | 'all'>('10');

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

  useEffect(() => {
    fetchStatuts();
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
    await Promise.all([fetchData(false), fetchStatuts()]);
    setRefreshing(false);
  };

  // 🔍 Helper : Récupérer le libellé et la couleur d'un statut par son ID
  const getStatusInfo = (statusId: any) => {
    const parsedId = Number(statusId);
    const found = statutsList.find((s) => Number(s.id) === parsedId);

    if (found) {
      return {
        titre: decodeHTML(found.titre),
        couleur: found.couleur,
      };
    }

    return {
      titre: statusId ? `Statut #${statusId}` : '-',
      couleur: 'default',
    };
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

  const data = activeTab === 'quotes' ? devis : commandes;

  const entriesOptions: Array<{ label: string; value: '10' | '20' | '30' | '40' | 'all' }> = [
    { label: '10', value: '10' },
    { label: '20', value: '20' },
    { label: '30', value: '30' },
    { label: '40', value: '40' },
    { label: 'tout', value: 'all' },
  ];

  const displayCount = entriesValue === 'all' ? data.length : Number(entriesValue);
  const displayedData = data.slice(0, displayCount);

  const openDetails = (commande: any) => {
    setSelectedCommande(commande);
    setDetailsVisible(true);
  };

  const closeDetails = () => {
    setDetailsVisible(false);
    setSelectedCommande(null);
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
                onPress={() => setActiveTab(tab as any)}
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
              <TextInput style={styles.input} />
            </View>

            {loading ? (
              <ActivityIndicator size="small" color="#2b5bbb" />
            ) : data.length === 0 ? (
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

                          const cleanedText = typeof displayValue === 'string' ? decodeHTML(displayValue) : displayValue;

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
                  Affichage de 1 à {displayedData.length} sur {data.length} entrées
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* MODAL DETAILS */}
      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDetails}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Détails</Text>

            <Text style={styles.modalRow}>
              Catégorie : {decodeHTML(selectedCommande?.categorie || '-')}
            </Text>
            <Text style={styles.modalRow}>
              Sous Categorie : {decodeHTML(selectedCommande?.sous_categorie || '-')}
            </Text>
            <Text style={styles.modalRow}>
              Metier : {decodeHTML(selectedCommande?.metier || '-')}
            </Text>
            <Text style={styles.modalRow}>
              Contrat : {selectedCommande?.contrat || '-'}
            </Text>
            
            <Text style={styles.modalRow}>
              Date de debut : {formatDate(selectedCommande?.date_besoin)}
            </Text>
            <Text style={styles.modalRow}>
              Date de fin : {formatDate(selectedCommande?.date_fin)}
            </Text>
            <Text style={styles.modalRow}>
              Durée : {selectedCommande?.duree || '-'}
            </Text>

            <Text style={styles.modalRow}>
              Adresse : {decodeHTML(selectedCommande?.adresse || '-')}
            </Text>
            <Text style={styles.modalRow}>
              Mobilite : {decodeHTML(selectedCommande?.lieu_travail2 || selectedCommande?.lieu_travail || '-')}
            </Text>
            <Text style={styles.modalRow}>
              Nombre de poste : {selectedCommande?.nbr_poste || '-'}
            </Text>
            <Text style={styles.modalRow}>
              Salaire propose : {selectedCommande?.salaire_proposer || '-'}
            </Text>
            <Text style={styles.modalRow}>
              Logement : {selectedCommande?.logement === 1 ? 'Oui' : selectedCommande?.logement === 0 ? 'Non' : '-'}
            </Text>
            <Text style={styles.modalRow}>
              Permis : {selectedCommande?.permis || '-'}
            </Text>

            <TouchableOpacity style={styles.modalClose} onPress={closeDetails}>
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
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 16, color: '#1b2d5a', marginBottom: 10, fontWeight: '600' },
  modalRow: { fontSize: 12, color: '#1b2d5a', marginBottom: 6 },
  modalClose: { marginTop: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: '#2b5bbb', alignItems: 'center' },
  modalCloseText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});