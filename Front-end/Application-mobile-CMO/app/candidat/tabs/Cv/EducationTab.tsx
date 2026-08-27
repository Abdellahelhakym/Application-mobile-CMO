import { GraduationCap, Plus, Save } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { addFormation, deleteFormation, getFormations, updateFormation } from "@/app/candidat/services/CVScreen";
import { C } from './colors';
import { Education } from './index';
import { Card, InputField, Label, SectionSaveButton, SelectPicker, decodeHTML, toYearNumber } from './utils';

const DEGREE_LEVELS = ['', 'BAC', 'BAC+2/equivalent', 'BAC+3/equivalent', 'BAC+5/equivalent', 'BAC+7/equivalent'];

interface EducationTabProps {
  education: Education[];
  setEducation: React.Dispatch<React.SetStateAction<Education[]>>;
}

export const EducationTab = ({
  education,
  setEducation,
}: EducationTabProps) => {
  // 📱 Charger les formations au montage
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
    <View style={{ gap: 16 }}>
      <View style={styles.rowBetween}>
        <View style={styles.sectionTitleRow}>
          <GraduationCap size={18} color={C.blue} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitlePlain}>{'Parcours scolaire'}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={add}>
          <Plus size={14} color={C.blueDark} />
          <Text style={styles.addBtnText}>{'Ajouter'}</Text>
        </TouchableOpacity>
      </View>

      {education.map((edu) => (
        <Card key={edu.id}>
          <Label>{'École'}</Label>
          <InputField value={edu.school} onChangeText={(v) => update(edu.id, 'school', v)} placeholder="Ex: Lycée professionnel" />

          <Label>{'Diplôme'}</Label>
          <SelectPicker value={edu.degree} options={DEGREE_LEVELS} onChange={(v) => update(edu.id, 'degree', v)} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Label>{'Mois de début'}</Label>
              <InputField value={edu.startMonth} onChangeText={(v) => update(edu.id, 'startMonth', v)} placeholder="MM" />
            </View>
            <View style={{ flex: 1 }}>
              <Label>{'Année de début'}</Label>
              <InputField value={edu.startYear} onChangeText={(v) => update(edu.id, 'startYear', v)} placeholder="YYYY" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Label>{"Mois d'obtention"}</Label>
              <InputField value={edu.endMonth} onChangeText={(v) => update(edu.id, 'endMonth', v)} placeholder="MM" />
            </View>
            <View style={{ flex: 1 }}>
              <Label>{"Année d'obtention"}</Label>
              <InputField value={edu.endYear} onChangeText={(v) => update(edu.id, 'endYear', v)} placeholder="YYYY" />
            </View>
          </View>

          <Label>{'Description'}</Label>
          <InputField value={edu.description} onChangeText={(v) => update(edu.id, 'description', v)} placeholder="Détails supplémentaires..." multiline numberOfLines={2} />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitlePlain: { fontSize: 15, fontWeight: '600', color: C.blueDark, flex: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.blueBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { fontSize: 13, color: C.blueDark, fontWeight: '500' },
  btnUpdate: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: C.blue },
  btnUpdateText: { color: C.white, fontSize: 13, fontWeight: '500' },
  btnDelete: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: C.accentDelete },
  btnDeleteText: { color: C.deleteText, fontSize: 13, fontWeight: '500' },
});