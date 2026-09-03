import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Briefcase, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { addExperience, deleteExperiences, getExperiences, updateExperiences } from "@/app/candidat/services/CVScreen";
import { C } from './colors';
import { Experience } from './index';
import { Card, InputField, Label, SectionSaveButton, SectionWarning, decodeHTML, toApiDate, toMdYy } from './utils';

interface ExperienceTabProps {
  experiences: Experience[];
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
}

export const ExperienceTab = ({
  experiences,
  setExperiences,
}: ExperienceTabProps) => {
  // État pour gérer le DateTimePicker actif
  const [activePicker, setActivePicker] = useState<{
    expId: number;
    field: 'startDate' | 'endDate';
  } | null>(null);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const data = await getExperiences();
      const items = Array.isArray(data) ? data : data?.data ?? [];

      const mapped = items.map((item: any) => {
        const rawVillePays = String(item.ville_pays ?? '').trim();
        const [cityPart, countryFromVillePays] = rawVillePays.split(',').map((v) => v.trim());

        const countryValue = item.pays?.trim() || countryFromVillePays || '';
        const cityValue = (cityPart && cityPart.toLowerCase() !== countryValue.toLowerCase()) ? cityPart : (item.pays ? cityPart : rawVillePays);

        return {
          id: item.id ?? Date.now(),
          position: decodeHTML(item.titre ?? ''),
          company: decodeHTML(item.societe ?? ''),
          city: decodeHTML(cityValue),
          country: decodeHTML(countryValue),
          startDate: toMdYy(item.date1),
          endDate: toMdYy(item.date2),
          description: decodeHTML(item.description ?? ''),
          isNew: false,
        } as Experience;
      });

      if (mapped.length === 0) {
        setExperiences([
          { id: Date.now(), position: '', company: '', city: '', country: '', startDate: '', endDate: '', description: '', isNew: true },
        ]);
      } else {
        setExperiences(mapped);
      }
    } catch (error) {
      console.log('Erreur chargement expériences:', error);
    }
  };

  const add = () => {
    if (experiences.length > 0) {
      const lastExp = experiences[0];
      const hasFirst4Fields = Boolean(
        lastExp.position?.trim() && 
        lastExp.company?.trim() && 
        lastExp.city?.trim() && 
        lastExp.country?.trim()
      );
      
      if (!hasFirst4Fields) {
        Alert.alert(
          'Complétez d\'abord',
          'Veuillez remplir au minimum les 4 premiers champs (Poste, Entreprise, Ville, Pays) de la dernière expérience avant d\'en ajouter une nouvelle.'
        );
        return;
      }
    }

    setExperiences((p) => [
      { id: Date.now(), position: '', company: '', city: '', country: '', startDate: '', endDate: '', description: '', isNew: true },
      ...p,
    ]);
  };

  const update = (id: number, key: keyof Experience, value: string) =>
    setExperiences((p) => p.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  // Gestion de la sélection de date via le DateTimePicker
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setActivePicker(null); // Fermer le dialog sur Android immédiatement
    }

    if (event.type === 'set' && selectedDate && activePicker) {
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const year = String(selectedDate.getFullYear()).slice(-2);
      const formattedDate = `${month}/${day}/${year}`; // Format MM/DD/YY

      update(activePicker.expId, activePicker.field, formattedDate);
    }

    if (event.type === 'dismissed') {
      setActivePicker(null);
    }
  };

  // Convertit une chaîne "MM/DD/YY" en objet Date (ou renvoie la date actuelle si invalide)
  const parseStringToDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1;
      const day = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  const handleSaveExperiences = async () => {
    try {
      for (const exp of experiences) {
        const hasAnyField = Boolean(
          exp.position || exp.company || exp.city || exp.country || exp.startDate || exp.endDate || exp.description
        );
        if (!hasAnyField) continue;

        const hasFirst4Fields = Boolean(
          exp.position?.trim() && 
          exp.company?.trim() && 
          exp.city?.trim() && 
          exp.country?.trim()
        );

        if (!hasFirst4Fields) {
          Alert.alert(
            'Champs obligatoires',
            'Veuillez remplir les 4 champs obligatoires (Poste, Entreprise, Ville, Pays) pour chaque expérience avant de sauvegarder.'
          );
          return;
        }

        const date1 = toApiDate(exp.startDate);
        const date2 = toApiDate(exp.endDate);

        if (exp.isNew) {
          await addExperience(date1, date2, exp.position, exp.company, exp.city, exp.country, exp.description);
        } else {
          await updateExperiences(exp.id, date1, date2, exp.position, exp.company, exp.city, exp.country, exp.description);
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

  const isFirstExperienceValid = () => {
    if (experiences.length === 0) return true;
    const firstExp = experiences[0];
    return Boolean(
      firstExp.position?.trim() && 
      firstExp.company?.trim() && 
      firstExp.city?.trim() && 
      firstExp.country?.trim()
    );
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.sectionTitleRow}>
        <Briefcase size={20} color={C.blue} style={{ marginRight: 8 }} />
        <Text style={styles.sectionTitlePlain}>Vos expériences</Text>
      </View>

      <TouchableOpacity style={styles.mainAddBtn} onPress={add} activeOpacity={0.7}>
        <Plus size={20} color={C.blue} />
        <Text style={styles.mainAddBtnText}>Ajouter une expérience</Text>
      </TouchableOpacity>

      {experiences.length > 0 && !isFirstExperienceValid() && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Veuillez remplir au minimum 4 champs (Poste, Entreprise, Ville, Pays) de la dernière expérience avant d'en ajouter une nouvelle.
          </Text>
        </View>
      )}

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
            {/* Champ Date de début */}
            <View style={{ flex: 1 }}>
              <Label>{'Date de début'}</Label>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setActivePicker({ expId: exp.id, field: 'startDate' })}
              >
                <Text style={[styles.dateButtonText, !exp.startDate && styles.dateButtonPlaceholder]}>
                  {exp.startDate || 'MM/DD/YY'}
                </Text>
                <Ionicons name="calendar-outline" size={18} color={C.blue} />
              </TouchableOpacity>
            </View>

            {/* Champ Date de fin */}
            <View style={{ flex: 1 }}>
              <Label>{'Date de fin'}</Label>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setActivePicker({ expId: exp.id, field: 'endDate' })}
              >
                <Text style={[styles.dateButtonText, !exp.endDate && styles.dateButtonPlaceholder]}>
                  {exp.endDate || 'MM/DD/YY'}
                </Text>
                <Ionicons name="calendar-outline" size={18} color={C.blue} />
              </TouchableOpacity>
            </View>
          </View>

          <Label>{'Description'}</Label>
          <InputField value={exp.description} onChangeText={(v) => update(exp.id, 'description', v)} placeholder="Décrivez vos missions..." multiline numberOfLines={3} />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity style={styles.btnDelete} onPress={() => handleDeleteExperience(exp)}>
              <Text style={styles.btnDeleteText}>{'Supprimer'}</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      {/* DateTimePicker pour Android */}
      {activePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={parseStringToDate(
            experiences.find((e) => e.id === activePicker.expId)?.[activePicker.field] || ''
          )}
          mode="date"
          display="default"
          textColor={C.navy}
          accentColor={C.blue}
          onChange={handleDateChange}
        />
      )}

      {/* DateTimePicker pour iOS dans un Modal */}
      {activePicker && Platform.OS === 'ios' && (
        <Modal visible={true} transparent animationType="slide" onRequestClose={() => setActivePicker(null)}>
          <Pressable style={styles.modalOverlay} onPress={() => setActivePicker(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Text style={styles.modalDone}>Terminer</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={parseStringToDate(
                experiences.find((e) => e.id === activePicker.expId)?.[activePicker.field] || ''
              )}
              mode="date"
              display="inline"
              themeVariant="light"
              textColor={C.navy}
              onChange={handleDateChange}
            />
          </View>
        </Modal>
      )}

      <SectionWarning />
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
  warningContainer: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '500',
    lineHeight: 18,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.borderLight,
    backgroundColor: C.inputBg,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateButtonText: {
    fontSize: 14,
    color: C.navy,
  },
  dateButtonPlaceholder: {
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: C.blue,
  },
  btnDelete: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: C.accentDelete },
  btnDeleteText: { color: C.deleteText, fontSize: 13, fontWeight: '500' },
});