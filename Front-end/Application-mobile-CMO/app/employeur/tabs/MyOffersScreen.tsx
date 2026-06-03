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
} from 'react-native';

import { Phone, MessageSquare, ChevronDown } from 'lucide-react-native';
import { getCommandes, getDevis } from '@/app/employeur/services/MyOffers';

export default function MyOffersScreen() {
  const [activeTab, setActiveTab] =
    useState<'commands' | 'quotes' | 'archive'>('commands');
  const [commandes, setCommandes] = useState<any[]>([]);
  const [devis, setDevis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<any | null>(null);
  const [entriesOpen, setEntriesOpen] = useState(false);
  const [entriesValue, setEntriesValue] = useState<'10' | '20' | '30' | '40' | 'all'>('10');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'commands') {
          const data = await getCommandes();
     
          setCommandes(data || []);
        } else if (activeTab === 'quotes') {
          const data = await getDevis();
   
          setDevis(data || []);
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

    if (activeTab === 'archive') {
      setLoading(false);
      return;
    }

    loadData();
  }, [activeTab]);

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

  const data =
    activeTab === 'quotes'
      ? devis
      : activeTab === 'commands'
      ? commandes
      : [];

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

  const tableTitle =
    activeTab === 'commands'
      ? 'N° Commande'
      : activeTab === 'quotes'
      ? 'N° Devis'
      : 'Archive';

  return (
    <View style={styles.container}>
      {/* ✅ SCROLL FIXÉ */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

   

        {/* TABS */}
        <View style={styles.tabs}>
          {['commands', 'quotes', 'archive'].map((tab) => (
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
                {tab === 'commands'
                  ? 'COMMANDES'
                  : tab === 'quotes'
                  ? 'DEVIS'
                  : 'ARCHIVE'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TABLE */}
        <View style={styles.tableCard}>

          <View style={styles.tableControls}>
            <Text style={styles.smallText}>Show</Text>

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

            <Text style={styles.smallText}>entries</Text>
          </View>

          <View style={styles.searchRow}>
            <Text style={styles.smallText}>Search:</Text>
            <TextInput style={styles.input} />
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#2b5bbb" />
          ) : data.length === 0 ? (
            <Text style={styles.empty}>
              Showing 0 to 0 of 0 entries
            </Text>
          ) : (
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.tableHeader}>
                    {columns.map((col) => (
                      <Text
                        key={col.key}
                        style={[styles.th, { width: col.width }]}
                      >
                        {col.label}
                      </Text>
                    ))}
                  </View>

                  {displayedData.map((row, index) => (
                    <View key={index} style={styles.tableRow}>
                      {columns.map((col) => {
                        const value = row?.[col.key];
                        const displayValue =
                          col.key === 'statut_fiche'
                            ? row?.statut_titre || (value === '2' ? 'Actif' : 'Inactif')
                            : col.key === 'statut' && activeTab === 'quotes'
                            ? row?.statut_titre || (Number(value) === 1
                              ? 'Accepter'
                              : Number(value) === 0
                              ? 'Refuser'
                              : value ?? '-')
                            : col.key === 'nbr_poste'
                            ?
                                row?.nbr_poste ??
                                row?.nombre_poste ??
                                row?.nbr_postes ??
                                '-'
                            : col.key === 'contrat_duree'
                            ? [row?.contrat, row?.duree, row?.duree_contrat]
                                .filter(Boolean)
                                .join(' / ') || '-'
                            : col.key === 'details'
                            ? 'Voir'
                            : col.key === 'download'
                            ? 'Telecharger'
                            : col.key === 'action'
                            ? 'Accepter / Refuser'
                            : value ?? '-';
                        if (col.key === 'details' && activeTab === 'commands') {
                          return (
                            <TouchableOpacity
                              key={`${col.key}-${index}`}
                              onPress={() => openDetails(row)}
                              style={[styles.td, { width: col.width }]}
                            >
                              <Text style={styles.linkText}>{displayValue}</Text>
                            </TouchableOpacity>
                          );
                        }

                        return (
                          <Text
                            key={`${col.key}-${index}`}
                            style={[styles.td, { width: col.width }]}
                          >
                            {displayValue}
                          </Text>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
              <Text style={styles.empty}>
                Showing 1 to {displayedData.length} of {data.length} entries
              </Text>
            </View>
          )}
        </View>

      </ScrollView>

      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDetails}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Details</Text>

            <Text style={styles.modalRow}>
              Categorie : {selectedCommande?.categorie || '-'}
            </Text>
            <Text style={styles.modalRow}>
              Sous Categorie : {selectedCommande?.sous_categorie || '-'}
            </Text>
            <Text style={styles.modalRow}>
              Metier : {selectedCommande?.metier || '-'}
            </Text>
            <Text style={styles.modalRow}>
              Contrat : {selectedCommande?.contrat || '-'}
            </Text>
            <Text style={styles.modalRow}>
              Date de debut : {selectedCommande?.date_besoin || '-'}
            </Text>
            <Text style={styles.modalRow}>
              Date de fin : {selectedCommande?.date_fin || '-'}
            </Text>
            <Text style={styles.modalRow}>
              Adresse : {selectedCommande?.adresse || '-'}
            </Text>
            <Text style={styles.modalRow}>
              Mobilite :
              {selectedCommande?.lieu_travail2 ||
                selectedCommande?.lieu_travail ||
                '-'}
            </Text>
            <Text style={styles.modalRow}>
              Nombre de poste : {selectedCommande?.nbr_poste || '-'}
            </Text>
            <Text style={styles.modalRow}>
              Salaire propose : {selectedCommande?.salaire_proposer || '-'}
            </Text>
            <Text style={styles.modalRow}>
              Logement :
              {selectedCommande?.logement === 1
                ? 'Oui'
                : selectedCommande?.logement === 0
                ? 'Non'
                : '-'}
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
  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },

  content: {
    padding: 15,
    paddingBottom: 120, // ✅ IMPORTANT pour scroll
    gap: 15,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f6f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  company: {
    fontSize: 16,
    color: '#1b2d5a',
  },

  sub: {
    fontSize: 12,
    color: '#7a8ab8',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  btnOutline: {
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: '#cfd9ee',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
  },

  btnText: {
    color: '#2b5bbb',
    fontSize: 12,
  },

  infoBox: {
    marginTop: 10,
    backgroundColor: '#fff1dc',
    padding: 10,
    borderRadius: 12,
  },

  infoText: {
    fontSize: 12,
    color: '#1b2d5a',
  },

  tabs: {
    flexDirection: 'row',
    gap: 10,
  },

  tab: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e9fb',
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: '#ffe9cf',
    borderColor: '#f2d9bf',
  },

  tabText: {
    fontSize: 12,
    color: '#1b2d5a',
  },

  tabTextActive: {
    fontWeight: '600',
  },

  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
  },

  tableControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },

  smallText: {
    fontSize: 12,
    color: '#1b2d5a',
  },

  select: {
    flexDirection: 'row',
    gap: 5,
    borderWidth: 1,
    borderColor: '#cfd9ee',
    padding: 5,
    borderRadius: 10,
  },

  selectMenu: {
    position: 'absolute',
    top: 34,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cfd9ee',
    borderRadius: 10,
    zIndex: 10,
  },

  selectItem: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  selectItemText: {
    fontSize: 12,
    color: '#1b2d5a',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cfd9ee',
    borderRadius: 20,
    padding: 8,
    backgroundColor: '#fff',
  },

  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  th: {
    fontSize: 10,
    color: '#2b5bbb',
    flex: 1,
  },

  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7a8ab8',
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e9fb',
  },

  td: {
    fontSize: 12,
    color: '#1b2d5a',
    flex: 1,
  },

  linkText: {
    fontSize: 12,
    color: '#2b5bbb',
    textDecorationLine: 'underline',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },

  modalTitle: {
    fontSize: 16,
    color: '#1b2d5a',
    marginBottom: 10,
    fontWeight: '600',
  },

  modalRow: {
    fontSize: 12,
    color: '#1b2d5a',
    marginBottom: 6,
  },

  modalClose: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2b5bbb',
    alignItems: 'center',
  },

  modalCloseText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});