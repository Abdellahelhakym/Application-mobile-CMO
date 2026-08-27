import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { MapPin, ChevronDown, X } from 'lucide-react-native';

import {
  getMobiliteUser,
  getToutMobilite,
  updateMobilite,
} from "@/app/candidat/services/CVScreen";
import { C } from './colors';
import {
  Card,
  InputField,
  SectionSaveButton,
  SectionTitle,
  decodeHTML,
  encodeForSave,
} from './utils';

// Constantes
const EDUCATION_LEVELS = ['', 'Niveau Bac', 'Bac', 'Bac +2', 'Bac +3', 'Bac +5', 'Bac+7'];
const EXPERIENCE_LEVELS = ['', "Moins d'1 an", 'Entre 1 et 2 ans', 'Entre 3 et 5 ans', 'Entre 5 et 10 ans', 'plus de 10 ans'];
const CONTRACT_OPTIONS = ['', 'CDD', 'CDI', 'SAISONIER', 'ALTERNANCE', 'STAGE', 'MI-TEMPS', 'INTERIM', 'LIBERAL'];

interface MobiliteOption {
  id: number;
  titre: string;
  deleted?: number;
}

interface MobilityTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

// --- COMPOSANT SELECTPICKER ROBUSTE (SANS BUGS DE SCROLL) ---
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
export const MobilityTab = ({
  formData,
  setFormData,
}: MobilityTabProps) => {
  const [mobilityOptions, setMobilityOptions] = useState<MobiliteOption[]>([]);
  const [loading, setLoading] = useState(true);

  const set = (key: string) => (v: string) =>
    setFormData((p: any) => ({ ...p, [key]: v }));

  const setAvailabilityChoice = (v: string) => {
    setFormData((p: any) => ({
      ...p,
      availabilityChoice: v,
      availabilityDate: v === 'Oui' ? p.availabilityDate : '',
    }));
  };

  useEffect(() => {
    loadMobilityData();
  }, []);

  const loadMobilityData = async () => {
    try {
      setLoading(true);
      const [tout, user] = await Promise.all([
        getToutMobilite(),
        getMobiliteUser(),
      ]);

      const allOptions: MobiliteOption[] = Array.isArray(tout) ? tout : tout?.data || [];
      const decodedOptions = allOptions
        .filter((item) => item?.deleted !== 1)
        .map((item) => ({
          ...item,
          titre: decodeHTML(item?.titre ?? ''),
        }));

      setMobilityOptions(decodedOptions);

      const userMobilite = user?.mobilite?.[0];
      const disponibiliteValue = user?.disponibilite;
      const disponibiliteChoice = disponibiliteValue === 1 || disponibiliteValue === '1' ? 'Oui' : 'Non';

      setFormData((prev: any) => ({
        ...prev,
        mobilityZone: decodeHTML(userMobilite?.region ?? '') || prev.mobilityZone,
        educationLevel: decodeHTML(user?.niveau_etude ?? '') || prev.educationLevel,
        experienceLevel: decodeHTML(user?.experience ?? '') || prev.experienceLevel,
        contract1: decodeHTML(user?.contrat_prefere1 ?? '') || prev.contract1,
        contract2: decodeHTML(user?.contrat_prefere2 ?? '') || prev.contract2,
        availabilityChoice: disponibiliteChoice,
        availabilityDate: user?.date_disponibilite ?? prev.availabilityDate,
      }));
    } catch (error) {
      console.log('Erreur chargement mobilité:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de mobilité.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMobilite = async () => {
    try {
      const disponibiliteValue = formData.availabilityChoice === 'Oui' ? 1 : 0;
      const selectedMobilite = mobilityOptions.find(
        (item) => decodeHTML(item.titre) === formData.mobilityZone
      );
      const mobiliteId = selectedMobilite?.id ?? null;

      await updateMobilite(
        mobiliteId,
        encodeForSave(formData.educationLevel),
        encodeForSave(formData.experienceLevel),
        encodeForSave(formData.contract1),
        encodeForSave(formData.contract2),
        disponibiliteValue,
        formData.availabilityDate
      );

      Alert.alert('Enregistré', 'Mobilité enregistrée avec succès.');
    } catch (error) {
      console.log('Erreur sauvegarde mobilité:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la mobilité.');
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <Card>
        <SectionTitle icon={<MapPin size={18} color={C.blue} />}>
          {'Mobilité & Profil'}
        </SectionTitle>

        {loading ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={C.blue} />
          </View>
        ) : (
          <View style={styles.formColumn}>
            {/* Mobilité */}
            <UniversalSelectPicker
              label="Mobilité"
              value={formData.mobilityZone}
              options={['', ...mobilityOptions.map((item) => item.titre)]}
              onChange={set('mobilityZone')}
            />

            {/* Niveau d'étude */}
            <UniversalSelectPicker
              label="Niveau d'étude"
              value={formData.educationLevel}
              options={EDUCATION_LEVELS}
              onChange={set('educationLevel')}
            />

            {/* Expérience */}
            <UniversalSelectPicker
              label="Expériences"
              value={formData.experienceLevel}
              options={EXPERIENCE_LEVELS}
              onChange={set('experienceLevel')}
            />

            {/* Contrat préféré 1 */}
            <UniversalSelectPicker
              label="Contrat préféré 1"
              value={formData.contract1}
              options={CONTRACT_OPTIONS}
              onChange={set('contract1')}
            />

            {/* Contrat préféré 2 */}
            <UniversalSelectPicker
              label="Contrat préféré 2"
              value={formData.contract2}
              options={CONTRACT_OPTIONS}
              onChange={set('contract2')}
            />

            {/* Disponibilité */}
            <UniversalSelectPicker
              label="Disponibilité"
              value={formData.availabilityChoice}
              options={['Non', 'Oui']}
              onChange={setAvailabilityChoice}
            />

            {/* Date de disponibilité conditionnelle */}
            {formData.availabilityChoice === 'Oui' && (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Disponible le :</Text>
                <InputField
                  value={formData.availabilityDate}
                  onChangeText={set('availabilityDate')}
                  placeholder="mm/jj/aaaa"
                />
              </View>
            )}
          </View>
        )}
      </Card>

      <SectionSaveButton
        label={'Sauvegarder la mobilité'}
        onPress={handleSaveMobilite}
      />
    </ScrollView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  contentContainer: { gap: 16, paddingBottom: 24 },
  formColumn: { gap: 12, marginTop: 12 },
  inputWrapper: { marginTop: 4 },

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
    height: 350, // Hauteur fixe stricte pour forcer le scroll interne de la FlatList
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