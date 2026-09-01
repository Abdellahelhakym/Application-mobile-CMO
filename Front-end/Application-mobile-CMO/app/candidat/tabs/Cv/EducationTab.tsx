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
import { ChevronDown, GraduationCap, Plus, Save, X } from 'lucide-react-native';

import {
  addFormation,
  deleteFormation,
  getFormations,
  updateFormation,
} from "@/app/candidat/services/CVScreen";
import { C } from './colors';
import { Education } from './index';
import {
  Card,
  InputField,
  Label,
  SectionSaveButton,
  decodeHTML,
  toYearNumber,
} from './utils';

const DEGREE_LEVELS = ['', 'BAC', 'BAC+2/equivalent', 'BAC+3/equivalent', 'BAC+5/equivalent', 'BAC+7/equivalent'];

interface EducationTabProps {
  education: Education[];
  setEducation: React.Dispatch<React.SetStateAction<Education[]>>;
}

// --- COMPOSANT SELECTPICKER ROBUSTE ---
const UniversalSelectPicker = ({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
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
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Sélectionner'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={C.gray700} />
              </TouchableOpacity>
            </View>

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
export const EducationTab = ({
  education,
  setEducation,
}: EducationTabProps) => {
  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      const data = await getFormations();
      const items = Array.isArray(data) ? data : data?.data ?? [];

      const mapped = items.map((item: any) => ({
        id: item.id ?? Date.now(),
        school: decodeHTML(item.ecole ?? ''),
        degree: decodeHTML(item.diplome ?? ''),
        startMonth: item.mois_debut != null ? String(item.mois_debut).padStart(2, '0') : '',
        startYear: item.annee_debut != null ? String(item.annee_debut) : '',
        endMonth: item.mois_obtention != null ? String(item.mois_obtention).padStart(2, '0') : '',
        endYear: item.annee_obtention != null ? String(item.annee_obtention) : '',
        description: decodeHTML(item.description ?? ''),
        isNew: false,
      } as Education));

      setEducation(mapped);
    } catch (error) {
      console.log('Erreur chargement formations:', error);
    }
  };

  // --- VALIDE QUE TOUS LES CHAMPS OBLIGATOIRES SONT REMPLIS ---
  const validateEducation = (edu: Education): boolean => {
    if (
      !edu.school.trim() ||
      !edu.degree.trim() ||
      !edu.startMonth.trim() ||
      !edu.startYear.trim() ||
      !edu.endMonth.trim() ||
      !edu.endYear.trim()
    ) {
      Alert.alert(
        'Champs obligatoires',
        'Veuillez remplir tous les champs obligatoires .\nSeule la description est optionnelle.'
      );
      return false;
    }
    return true;
  };

  const add = () =>
    setEducation((p) => [
      { id: Date.now(), school: '', degree: '', startMonth: '', startYear: '', endMonth: '', endYear: '', description: '', isNew: true },
      ...p,
    ]);

  const update = (id: number, key: keyof Education, value: string) =>
    setEducation((p) => p.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const handleSaveFormations = async () => {
    try {
      for (const edu of education) {
        const hasAnyField = Boolean(
          edu.school || edu.degree || edu.startMonth || edu.startYear || edu.endMonth || edu.endYear || edu.description
        );
        if (!hasAnyField) continue;

        if (!validateEducation(edu)) return;

        const anneeDebut = toYearNumber(edu.startYear);
        const anneeObtention = toYearNumber(edu.endYear);

        if (edu.isNew) {
          await addFormation(edu.school, edu.degree, edu.startMonth, anneeDebut, edu.endMonth, anneeObtention, edu.description);
        } else {
          await updateFormation(edu.id, edu.school, edu.degree, edu.startMonth, anneeDebut, edu.endMonth, anneeObtention, edu.description);
        }
      }

      Alert.alert('Enregistré', 'Formations enregistrées avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les formations.');
    }
  };

  const handleDeleteFormation = async (edu: Education) => {
    try {
      await deleteFormation(edu.id);
      setEducation((p) => p.filter((e) => e.id !== edu.id));
      Alert.alert('Supprimée', 'Formation supprimée avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer la formation.');
    }
  };

  const handleUpdateFormation = async (edu: Education) => {
    if (!validateEducation(edu)) return;

    try {
      const anneeDebut = toYearNumber(edu.startYear);
      const anneeObtention = toYearNumber(edu.endYear);

      if (edu.isNew) {
        await addFormation(edu.school, edu.degree, edu.startMonth, anneeDebut, edu.endMonth, anneeObtention, edu.description);
        setEducation((p) => p.map((e) => e.id === edu.id ? { ...e, isNew: false } : e));
      } else {
        await updateFormation(edu.id, edu.school, edu.degree, edu.startMonth, anneeDebut, edu.endMonth, anneeObtention, edu.description);
      }

      Alert.alert('Enregistré', 'Formation mise à jour.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la formation.');
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      {/* En-tête de section */}
      <View style={styles.sectionTitleRow}>
        <GraduationCap size={20} color={C.blue} style={{ marginRight: 8 }} />
        <Text style={styles.sectionTitlePlain}>Parcours scolaire</Text>
      </View>

      {/* BOUTON D'AJOUT PRINCIPAL */}
      <TouchableOpacity style={styles.mainAddBtn} onPress={add} activeOpacity={0.7}>
        <Plus size={20} color={C.blue} />
        <Text style={styles.mainAddBtnText}>Ajouter une formation</Text>
      </TouchableOpacity>

      {/* Liste des formations */}
      {education.map((edu, index) => (
        <Card key={edu.id}>
          <Text style={styles.cardHeader}>Formation {education.length - index}</Text>

          <Label>{'École '}</Label>
          <InputField value={edu.school} onChangeText={(v) => update(edu.id, 'school', v)} placeholder="Ex: Lycée professionnel" />

          <Label>{'Diplôme '}</Label>
          <UniversalSelectPicker
            value={edu.degree}
            options={DEGREE_LEVELS}
            onChange={(v) => update(edu.id, 'degree', v)}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Label>{'Mois de début '}</Label>
              <InputField value={edu.startMonth} onChangeText={(v) => update(edu.id, 'startMonth', v)} placeholder="MM" />
            </View>
            <View style={{ flex: 1 }}>
              <Label>{'Année de début '}</Label>
              <InputField value={edu.startYear} onChangeText={(v) => update(edu.id, 'startYear', v)} placeholder="YYYY" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Label>{"Mois d'obtention "}</Label>
              <InputField value={edu.endMonth} onChangeText={(v) => update(edu.id, 'endMonth', v)} placeholder="MM" />
            </View>
            <View style={{ flex: 1 }}>
              <Label>{"Année d'obtention "}</Label>
              <InputField value={edu.endYear} onChangeText={(v) => update(edu.id, 'endYear', v)} placeholder="YYYY" />
            </View>
          </View>

          <Label>{'Description (optionnel)'}</Label>
          <InputField value={edu.description} onChangeText={(v) => update(edu.id, 'description', v)} placeholder="Détails supplémentaires..." multiline numberOfLines={2} />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity style={styles.btnUpdate} onPress={() => handleUpdateFormation(edu)}>
              <Save size={16} color={C.white} />
              <Text style={styles.btnUpdateText}>{'Mettre à jour'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnDelete} onPress={() => handleDeleteFormation(edu)}>
              <Text style={styles.btnDeleteText}>{'Supprimer'}</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      <SectionSaveButton
        label={'Sauvegarder la formation'}
        onPress={handleSaveFormations}
      />
    </ScrollView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  contentContainer: { gap: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sectionTitlePlain: { fontSize: 16, fontWeight: '600', color: C.blueDark },
  cardHeader: { fontSize: 14, fontWeight: '600', color: C.blueDark, marginBottom: 8 },

  mainAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.blueBg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.blue,
    borderStyle: 'dashed',
  },
  mainAddBtnText: {
    fontSize: 15,
    color: C.blue,
    fontWeight: '600',
  },

  btnUpdate: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: C.blue },
  btnUpdateText: { color: C.white, fontSize: 13, fontWeight: '500' },
  btnDelete: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: C.accentDelete },
  btnDeleteText: { color: C.deleteText, fontSize: 13, fontWeight: '500' },

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