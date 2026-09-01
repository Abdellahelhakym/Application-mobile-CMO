import { Briefcase, Plus, Save } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { addExperience, deleteExperiences, getExperiences, updateExperiences } from "@/app/candidat/services/CVScreen";
import { C } from './colors';
import { Experience } from './index';
import { Card, InputField, Label, SectionSaveButton, buildVillePays, decodeHTML, toApiDate, toMdYy } from './utils';

interface ExperienceTabProps {
  experiences: Experience[];
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
}

export const ExperienceTab = ({
  experiences,
  setExperiences,
}: ExperienceTabProps) => {
  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const data = await getExperiences();
      const items = Array.isArray(data) ? data : data?.data ?? [];

      const mapped = items.map((item: any) => {
        const rawVillePays = String(item.ville_pays ?? '').trim();
        const [cityPart, countryPart] = rawVillePays.split(',').map((v) => v.trim());
        return {
          id: item.id ?? Date.now(),
          position: decodeHTML(item.titre ?? ''),
          company: decodeHTML(item.societe ?? ''),
          city: decodeHTML(cityPart ?? ''),
          country: decodeHTML(item.pays ?? countryPart ?? ''),
          startDate: toMdYy(item.date1),
          endDate: toMdYy(item.date2),
          description: decodeHTML(item.description ?? ''),
          isNew: false,
        } as Experience;
      });

      setExperiences(mapped);
    } catch (error) {
      console.log('Erreur chargement expériences:', error);
    }
  };

  const add = () =>
    setExperiences((p) => [
      { id: Date.now(), position: '', company: '', city: '', country: '', startDate: '', endDate: '', description: '', isNew: true },
      ...p,
    ]);

  const update = (id: number, key: keyof Experience, value: string) =>
    setExperiences((p) => p.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const handleSaveExperiences = async () => {
    try {
      for (const exp of experiences) {
        const hasAnyField = Boolean(
          exp.position || exp.company || exp.city || exp.country || exp.startDate || exp.endDate || exp.description
        );
        if (!hasAnyField) continue;

        const villePays = buildVillePays(exp.city, exp.country);
        const date1 = toApiDate(exp.startDate);
        const date2 = toApiDate(exp.endDate);

        if (exp.isNew) {
          await addExperience(date1, date2, exp.position, exp.company, villePays, exp.country, exp.description);
        } else {
          await updateExperiences(exp.id, date1, date2, exp.position, exp.company, villePays, exp.country, exp.description);
        }
      }

      Alert.alert('Enregistré', 'Expériences enregistrées avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les expériences.');
    }
  };

  const handleDeleteExperience = async (exp: Experience) => {
    try {
      await deleteExperiences(exp.id);
      setExperiences((p) => p.filter((e) => e.id !== exp.id));
      Alert.alert('Supprimée', 'Expérience supprimée avec succès.');
    } catch (error) {
      Alert.alert('Erreur', "Impossible de supprimer l'expérience.");
    }
  };

  const handleUpdateExperience = async (exp: Experience) => {
    try {
      const villePays = buildVillePays(exp.city, exp.country);
      const date1 = toApiDate(exp.startDate);
      const date2 = toApiDate(exp.endDate);

      if (exp.isNew) {
        await addExperience(date1, date2, exp.position, exp.company, villePays, exp.country, exp.description);
        setExperiences((p) => p.map((e) => e.id === exp.id ? { ...e, isNew: false } : e));
      } else {
        await updateExperiences(exp.id, date1, date2, exp.position, exp.company, villePays, exp.country, exp.description);
      }

      Alert.alert('Enregistré', 'Expérience mise à jour.');
    } catch (error) {
      Alert.alert('Erreur', "Impossible de mettre à jour l'expérience.");
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      {/* En-tête de section */}
      <View style={styles.sectionTitleRow}>
        <Briefcase size={20} color={C.blue} style={{ marginRight: 8 }} />
        <Text style={styles.sectionTitlePlain}>Expériences professionnelles</Text>
      </View>

      {/* BOUTON D'AJOUT PRINCIPAL (TRÈS VISIBLE) */}
      <TouchableOpacity style={styles.mainAddBtn} onPress={add} activeOpacity={0.7}>
        <Plus size={20} color={C.blue} />
        <Text style={styles.mainAddBtnText}>Ajouter une expérience</Text>
      </TouchableOpacity>

      {/* Liste des expériences */}
      {experiences.map((exp, index) => (
        <Card key={exp.id}>
          <Text style={styles.cardHeader}>Expérience {experiences.length - index}</Text>

          <Label>{'Poste'}</Label>
          <InputField value={exp.position} onChangeText={(v) => update(exp.id, 'position', v)} placeholder="Ex: Mécanicien automobile" />

          <Label>{'Entreprise'}</Label>
          <InputField value={exp.company} onChangeText={(v) => update(exp.id, 'company', v)} placeholder="Ex: Garage Martin" />

          <Label>{'Ville'}</Label>
          <InputField value={exp.city} onChangeText={(v) => update(exp.id, 'city', v)} placeholder="Ex: Paris" />

          <Label>{'Pays'}</Label>
          <InputField value={exp.country} onChangeText={(v) => update(exp.id, 'country', v)} placeholder="Ex: France" />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Label>{'Date de début'}</Label>
              <InputField value={exp.startDate} onChangeText={(v) => update(exp.id, 'startDate', v)} placeholder="MM/DD/YY" />
            </View>
            <View style={{ flex: 1 }}>
              <Label>{'Date de fin'}</Label>
              <InputField value={exp.endDate} onChangeText={(v) => update(exp.id, 'endDate', v)} placeholder="MM/DD/YY" />
            </View>
          </View>

          <Label>{'Description'}</Label>
          <InputField value={exp.description} onChangeText={(v) => update(exp.id, 'description', v)} placeholder="Décrivez vos missions..." multiline numberOfLines={3} />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity style={styles.btnUpdate} onPress={() => handleUpdateExperience(exp)}>
              <Save size={16} color={C.white} />
              <Text style={styles.btnUpdateText}>{'Mettre à jour'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnDelete} onPress={() => handleDeleteExperience(exp)}>
              <Text style={styles.btnDeleteText}>{'Supprimer'}</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      <SectionSaveButton
        label={'Sauvegarder les expériences'}
        onPress={handleSaveExperiences}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  contentContainer: { gap: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sectionTitlePlain: { fontSize: 16, fontWeight: '600', color: C.blueDark },
  cardHeader: { fontSize: 14, fontWeight: '600', color: C.blueDark, marginBottom: 8 },

  // Bouton Ajouter principal (grand et visible)
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
});