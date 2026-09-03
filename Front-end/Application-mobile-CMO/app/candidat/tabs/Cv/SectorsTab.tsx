import { decode } from 'html-entities';
import { Briefcase, ChevronDown, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getSecteur, getSecteurUser, updateSecteur } from "@/app/candidat/services/CVScreen";
import { C } from './colors';
import { Sector } from './index';
import { Card, SectionSaveButton, SectionWarning } from './utils';

// --- TYPES ---
interface SectorCategory { id_categorie: number; titre: string; }
interface SectorSubCategory { id_sous: number; id_categorie: number; titre: string; }
interface SectorJob { id_metier: number; id_sous: number; titre: string; }

interface SectorsTabProps {
  sectors: Sector[];
  setSectors: React.Dispatch<React.SetStateAction<Sector[]>>;
}

// --- EXACTEMENT LE MÊME COMPOSANT SELECTPICKER ROBUSTE ---
const UniversalSelectPicker = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.pickerWrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.pickerText, !value && styles.placeholderText]}>
          {value || 'Sélectionner...'}
        </Text>
        <ChevronDown size={18} color={C.gray700} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {/* Ferme le menu en cliquant à l'extérieur sans interférer avec le scroll */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />

          {/* Modal Content avec hauteur fixe pour garantir le scroll */}
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Sélectionner'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={C.gray700} />
              </TouchableOpacity>
            </View>

            {/* Zone de FlatList isolée */}
            <View style={styles.listWrapper}>
              <FlatList
                data={options}
                keyExtractor={(_, index) => index.toString()}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.optionItem, item === value && styles.selectedOption]}
                    onPress={() => {
                      onChange(item);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.optionText, item === value && styles.selectedOptionText]}>
                      {item === '' ? 'Aucun(e)' : item}
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
};

// --- COMPOSANT PRINCIPAL ---
export const SectorsTab = ({ sectors, setSectors }: SectorsTabProps) => {
  const [sectorData, setSectorData] = useState<{
    categories: SectorCategory[];
    subCategories: SectorSubCategory[];
    jobs: SectorJob[];
  }>({ categories: [], subCategories: [], jobs: [] });

  useEffect(() => {
    loadSectorData();
  }, []);

  const loadSectorData = async () => {
    try {
      const data = await getSecteur();
      setSectorData({
        categories: (data?.secteurs ?? []).map((cat: SectorCategory) => ({
          ...cat,
          titre: decode(cat.titre ?? ''),
        })),
        subCategories: (data?.sousCategories ?? []).map((sub: SectorSubCategory) => ({
          ...sub,
          titre: decode(sub.titre ?? ''),
        })),
        jobs: (data?.metiers ?? []).map((job: SectorJob) => ({
          ...job,
          titre: decode(job.titre ?? ''),
        })),
      });
    } catch (error) {
      console.log('Erreur chargement secteurs:', error);
    }
  };

  useEffect(() => {
    if (sectorData.jobs.length && sectorData.subCategories.length && sectorData.categories.length) {
      loadUserSectors();
    }
  }, [sectorData]);

  const loadUserSectors = async () => {
    try {
      const data = await getSecteurUser();
      const items = Array.isArray(data) ? data : data?.data ?? [];

      const mapped = items
        .filter((item: any) => item?.deleted !== 1)
        .map((item: any) => {
          const job = sectorData.jobs.find((m) => m.id_metier === item.id_metier);
          if (!job) return null;
          const sub = sectorData.subCategories.find((s) => s.id_sous === job.id_sous);
          if (!sub) return null;
          const cat = sectorData.categories.find((c) => c.id_categorie === sub.id_categorie);
          if (!cat) return null;
          return {
            id: item.id ?? Date.now(),
            category: cat.titre,
            subCategory: sub.titre,
            job: job.titre,
          } as Sector;
        })
        .filter(Boolean) as Sector[];

      const filled = mapped.slice(0, 3);
      while (filled.length < 3) {
        filled.push({ id: Date.now() + filled.length, category: '', subCategory: '', job: '' });
      }

      setSectors(filled);
    } catch (error) {
      console.log('Erreur chargement secteurs utilisateur:', error);
    }
  };

  const update = (id: number, key: keyof Sector, value: string) => {
    setSectors((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated: Sector = { ...s, [key]: value };
          if (key === 'category') {
            updated.subCategory = '';
            updated.job = '';
          }
          if (key === 'subCategory') {
            updated.job = '';
          }
          return updated;
        }
        return s;
      })
    );
  };

  const getSubCategoriesForCategory = (category: string): string[] => {
    const selected = sectorData.categories.find((c) => c.titre === category);
    if (!selected) return [];
    return sectorData.subCategories
      .filter((s) => s.id_categorie === selected.id_categorie)
      .map((s) => s.titre);
  };

  const getJobsForSubCategory = (category: string, subCategory: string): string[] => {
    const selectedCategory = sectorData.categories.find((c) => c.titre === category);
    if (!selectedCategory) return [];
    const selectedSub = sectorData.subCategories.find(
      (s) => s.id_categorie === selectedCategory.id_categorie && s.titre === subCategory
    );
    if (!selectedSub) return [];
    return sectorData.jobs
      .filter((m) => m.id_sous === selectedSub.id_sous)
      .map((m) => m.titre);
  };

  const handleSaveSectors = async () => {
    try {
      const secteur = sectors.slice(0, 3).map((sector, index) => {
        if (!sector.job) {
          return { secteur_numero: index + 1, id_metier: null };
        }
        const job = sectorData.jobs.find((m) => m.titre === sector.job);
        return {
          secteur_numero: index + 1,
          id_metier: job ? job.id_metier : null,
        };
      });

      await updateSecteur(secteur);
      Alert.alert('Enregistré', 'Secteurs enregistrés avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les secteurs.');
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.sectionTitleRow}>
        <Briefcase size={18} color={C.blue} style={{ marginRight: 8 }} />
        <Text style={styles.sectionTitlePlain}>Vos Secteurs d'Activité </Text>
      </View>
      <Text style={styles.sectionDescription}>Choisissez les secteurs d'activités que vous ciblez</Text>

      {sectors.map((sector, index) => {
        const subCategories = getSubCategoriesForCategory(sector.category);
        const jobs = getJobsForSubCategory(sector.category, sector.subCategory);

        return (
          <Card key={sector.id}>
            <Text style={styles.cardHeader}>{`Secteur d'activité ${index + 1}`}</Text>

            <View style={styles.sectorColumn}>
              {/* Catégorie */}
              <UniversalSelectPicker
                label="Catégorie"
                value={sector.category}
                options={['', ...sectorData.categories.map((c) => c.titre)]}
                onChange={(v) => update(sector.id, 'category', v)}
              />

              {/* Sous-catégorie */}
              {sector.category !== '' && (
                <UniversalSelectPicker
                  label="Sous-catégorie"
                  value={sector.subCategory}
                  options={['', ...subCategories]}
                  onChange={(v) => update(sector.id, 'subCategory', v)}
                />
              )}

              {/* Métier */}
              {sector.category !== '' && sector.subCategory !== '' && (
                <UniversalSelectPicker
                  label="Métier"
                  value={sector.job}
                  options={['', ...jobs]}
                  onChange={(v) => update(sector.id, 'job', v)}
                />
              )}
            </View>
          </Card>
        );
      })}

      <SectionWarning />
      <SectionSaveButton label="Sauvegarder les secteurs" onPress={handleSaveSectors} />
    </ScrollView>
  );
};

// --- STYLES (Identiques à MobilityTab) ---
const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  contentContainer: { gap: 16, paddingBottom: 24 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitlePlain: { fontSize: 16, fontWeight: '600', color: C.blueDark, flex: 1 },
  sectionDescription: { fontSize: 14, color: C.textMuted, marginBottom: 12 },
  cardHeader: { fontSize: 14, fontWeight: '600', color: C.blueDark, marginBottom: 12 },
  sectorColumn: { gap: 12 },

  // SelectPicker Styles
  pickerWrapper: { marginBottom: 4 },
  label: { fontSize: 13, color: C.gray700, marginBottom: 4 },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerText: { fontSize: 14, color: '#1E293B' },
  placeholderText: { color: '#94A3B8' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 350,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: '600', color: C.blueDark },
  listWrapper: { flex: 1 },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  selectedOption: { backgroundColor: '#F1F5F9', borderRadius: 6 },
  optionText: { fontSize: 14, color: '#334155' },
  selectedOptionText: { fontWeight: '600', color: C.blue },
});