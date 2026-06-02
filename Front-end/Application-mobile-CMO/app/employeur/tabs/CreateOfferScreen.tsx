import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { getSecteur, getToutMobilite } from "@/app/candidat/services/CVScreen";
import { createCommande } from '@/app/employeur/services/CreatOffesScreen';


const SelectPicker = ({
  value,
  options,
  onChange,
  placeholder = 'Sélectionner',
  error,
}: {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) => {
  const [open, setOpen] = useState(false);
  const displayLabel = options.find(opt => opt.value === value)?.label || placeholder;
  
  return (
    <View style={[styles.selectContainer, open && styles.selectContainerOpen]}>
      <TouchableOpacity style={styles.selectBox} onPress={() => setOpen(!open)}>
        <Text style={value ? styles.selectText : styles.selectPlaceholder}>
          {displayLabel}
        </Text>
        {open
          ? <Ionicons name="chevron-up" size={16} color="#6b7280" />
          : <Ionicons name="chevron-down" size={16} color="#6b7280" />
        }
      </TouchableOpacity>
      {open ? (
        <View style={styles.dropdownList}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value || '__empty__'}
                style={[
                  styles.dropdownItem,
                  opt.value === value ? styles.dropdownItemActiveBg : undefined,
                ]}
                onPress={() => { onChange(opt.value); setOpen(false); }}
              >
                <Text style={[styles.dropdownItemText, opt.value === value ? styles.dropdownItemActive : undefined]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

// --- NOUVEAU COMPOSANT : SelectPicker pour choix multiples (Permis) ---
const MultiSelectPicker = ({
  value,
  options,
  onChange,
  placeholder = 'Sélectionner',
  error,
}: {
  value: string; // Stocké sous forme de string séparée par des virgules ex: "A1,B1,BE"
  options: Array<{ label: string; value: string }>;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) => {
  const [open, setOpen] = useState(false);

  // Convertit la chaîne "A1,B1,BE" en tableau ["A1", "B1", "BE"] pour la gestion interne
  const selectedValues = value ? value.split(',') : [];

  const handleSelect = (itemValue: string) => {
    let nextValues: string[];
    if (selectedValues.includes(itemValue)) {
      // Si déjà sélectionné, on l'enlève
      nextValues = selectedValues.filter(v => v !== itemValue);
    } else {
      // Sinon, on l'ajoute
      nextValues = [...selectedValues, itemValue];
    }
    // Renvoie la chaîne finale formatée "A1,B1,BE"
    onChange(nextValues.join(','));
  };

  return (
    <View style={[styles.selectContainer, open && styles.selectContainerOpen]}>
      <TouchableOpacity style={styles.selectBox} onPress={() => setOpen(!open)}>
        <Text style={value ? styles.selectText : styles.selectPlaceholder} numberOfLines={1}>
          {value ? `Permis : ${value}` : placeholder}
        </Text>
        {open
          ? <Ionicons name="chevron-up" size={16} color="#6b7280" />
          : <Ionicons name="chevron-down" size={16} color="#6b7280" />
        }
      </TouchableOpacity>
      
      {open ? (
        <View style={styles.dropdownList}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((opt) => {
              const isSelected = selectedValues.includes(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.dropdownItem,
                    isSelected ? styles.dropdownItemActiveBg : undefined,
                    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
                  ]}
                  onPress={() => handleSelect(opt.value)}
                >
                  <Text style={[styles.dropdownItemText, isSelected ? styles.dropdownItemActive : undefined]}>
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color="#2b5bbb" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default function CreateOfferScreen() {
  const initialFormData = {
    categoryId: '',
    category: '',
    subcategoryId: '',
    subcategory: '',
    jobId: '',
    jobTitle: '',
    jobType: '',
    startDate: '',
    endDate: '',
    address: '',
    mobility: '',
    positions: '',
    salary: '',
    housing: '',
    drivingLicense: '', // contiendra la string "A1,B1,BE"
    description: '',
    comments: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [sectorData, setSectorData] = useState<{ categories: any[]; subCategories: any[]; jobs: any[] }>({ categories: [], subCategories: [], jobs: [] });
  const [mobilites, setMobilites] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Liste des permis disponibles
  const drivingLicenseOptions = [
    { label: 'AM', value: 'AM' },
    { label: 'A1', value: 'A1' },
    { label: 'A2', value: 'A2' },
    { label: 'A', value: 'A' },
    { label: 'B1', value: 'B1' },
    { label: 'B', value: 'B' },
    { label: 'C1', value: 'C1' },
    { label: 'C', value: 'C' },
    { label: 'D1', value: 'D1' },
    { label: 'BE', value: 'BE' },
    { label: 'C1E', value: 'C1E' },
    { label: 'CE', value: 'CE' },
    { label: 'D1E', value: 'D1E' },
    { label: 'DE', value: 'DE' },
  ];

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    const category = sectorData.categories.find(c => String(c.id_categorie ?? c.id) === String(categoryId));
    setFormData(prev => ({
      ...prev,
      categoryId: categoryId,
      category: category?.titre ?? '',
      subcategoryId: '',
      subcategory: '',
      jobId: '',
      jobTitle: ''
    }));
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    const subcategory = sectorData.subCategories.find(sc => String(sc.id_sous ?? sc.id) === String(subcategoryId));
    setFormData(prev => ({
      ...prev,
      subcategoryId: subcategoryId,
      subcategory: subcategory?.titre ?? '',
      jobId: '',
      jobTitle: ''
    }));
  };

  const handleJobSelect = (jobId: string) => {
    const job = sectorData.jobs.find(j => String(j.id_metier ?? j.id) === String(jobId));
    setFormData(prev => ({
      ...prev,
      jobId: jobId,
      jobTitle: job?.titre ?? ''
    }));
  };

  const handleSubmit = async () => {
    const requiredFields: Array<{ key: keyof typeof formData; label: string }> = [
      { key: 'categoryId', label: 'Categorie' },
      { key: 'subcategoryId', label: 'Sous-categorie' },
      { key: 'jobId', label: 'Metier' },
      { key: 'jobType', label: 'Type de contrat' },
      { key: 'startDate', label: 'Date debut (MM/DD/YYYY)' },
      { key: 'address', label: 'Adresse' },
      { key: 'mobility', label: 'Mobilite' },
      { key: 'positions', label: 'Nombre de poste' },
      { key: 'salary', label: 'Salaire' },
      { key: 'housing', label: 'Logement' },
      { key: 'drivingLicense', label: 'Permis de conduire' },
      { key: 'description', label: 'Description' },
    ];

    const nextErrors: Record<string, string> = {};
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    requiredFields.forEach((field) => {
      if (!String(formData[field.key]).trim()) {
        nextErrors[field.key] = `Le champ ${field.label} est obligatoire`;
      }
    });

    if (formData.startDate && !dateRegex.test(formData.startDate)) {
      nextErrors.startDate = 'Format date invalide: MM/DD/YYYY';
    }

    if (formData.endDate && !dateRegex.test(formData.endDate)) {
      nextErrors.endDate = 'Format date invalide: MM/DD/YYYY';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    try {
      const result = await createCommande({ ...formData });
      const message = result?.message || 'Offre soumise pour validation CMO';
      Alert.alert('Resultat', message);
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de creer la commande';
      Alert.alert('Erreur', message);
      console.error(error);
    }
  };

  const filteredSubCategories = sectorData.subCategories.filter(sc => String(sc.id_categorie) === String(formData.categoryId));
  const filteredJobs = sectorData.jobs.filter(j => String(j.id_sous) === String(formData.subcategoryId));

  React.useEffect(() => {
    let mounted = true;
    const loadSecteurs = async () => {
      try {
        const data = await getSecteur();
        if (!mounted) return;
        setSectorData({
          categories: data?.secteurs ?? [],
          subCategories: data?.sousCategories ?? [],
          jobs: data?.metiers ?? [],
        });
      } catch (error) {
        console.error('loadSecteurs error', error);
        if (mounted) setSectorData({ categories: [], subCategories: [], jobs: [] });
      }
    };
    loadSecteurs();
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    const loadMobilites = async () => {
      try {
        const data = await getToutMobilite();
        if (!mounted) return;
        setMobilites(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('loadMobilites error', error);
        if (mounted) setMobilites([]);
      }
    };
    loadMobilites();
    return () => { mounted = false; };
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* FORM */}
      <View style={styles.card}>
        {Platform.OS === 'ios' ? (
          <View>
            <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowCategoryPicker(true)}>
              <Text style={[styles.pickerTriggerText, !formData.category && styles.pickerPlaceholder]}>
                {formData.category || 'Categorie'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#7a8ab8" />
            </TouchableOpacity>

            <Modal
              visible={showCategoryPicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowCategoryPicker(false)}
            >
              <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryPicker(false)} />
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                    <Text style={styles.modalDone}>Terminer</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={formData.categoryId}
                  onValueChange={(value) => handleCategorySelect(String(value))}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Categorie" value="" />
                  {sectorData.categories.map((c) => (
                    <Picker.Item key={c.id_categorie ?? c.id} label={c.titre} value={String(c.id_categorie ?? c.id)} />
                  ))}
                </Picker>
              </View>
            </Modal>
            {errors.categoryId ? <Text style={styles.errorText}>{errors.categoryId}</Text> : null}
          </View>
        ) : (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.categoryId}
              onValueChange={(value) => handleCategorySelect(String(value))}
              style={styles.picker}
              mode="dropdown"
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Categorie" value="" />
              {sectorData.categories.map((c) => (
                <Picker.Item key={c.id_categorie ?? c.id} label={c.titre} value={String(c.id_categorie ?? c.id)} />
              ))}
            </Picker>
            {errors.categoryId ? <Text style={styles.errorText}>{errors.categoryId}</Text> : null}
          </View>
        )}

        <SelectPicker
          value={formData.subcategoryId}
          options={[{ label: 'Sous-categorie', value: '' }, ...filteredSubCategories.map(sc => ({ label: sc.titre, value: String(sc.id_sous ?? sc.id) }))]}
          onChange={(v) => handleSubcategorySelect(v)}
          placeholder="Sous-categorie"
          error={errors.subcategoryId}
        />

        <SelectPicker
          value={formData.jobId}
          options={[{ label: 'Metier / Intitule du poste', value: '' }, ...filteredJobs.map(j => ({ label: j.titre, value: String(j.id_metier ?? j.id) }))]}
          onChange={(v) => handleJobSelect(v)}
          placeholder="Metier / Intitule du poste"
          error={errors.jobId}
        />

        <SelectPicker
          value={formData.jobType}
          options={[
            { label: 'Type de contrat', value: '' },
            { label: 'CDI', value: 'CDI' },
            { label: 'CDD', value: 'CDD' },
            { label: 'Intérim', value: 'Interim' },
          ]}
          onChange={(v) => handleChange('jobType', v)}
          placeholder="Type de contrat"
          error={errors.jobType}
        />

        <TextInput
          style={styles.input}
          placeholder="Date debut (MM/DD/YYYY)"
          placeholderTextColor="#7a8ab8"
          value={formData.startDate}
          onChangeText={(v) => handleChange('startDate', v)}
        />
        {errors.startDate ? <Text style={styles.errorText}>{errors.startDate}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Date fin (MM/DD/YYYY)"
          placeholderTextColor="#7a8ab8"
          value={formData.endDate}
          onChangeText={(v) => handleChange('endDate', v)}
        />
        {errors.endDate ? <Text style={styles.errorText}>{errors.endDate}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Adresse"
          placeholderTextColor="#7a8ab8"
          value={formData.address}
          onChangeText={(v) => handleChange('address', v)}
        />
        {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

     {/* Mobility picker - dropdown */}
      <SelectPicker
        value={formData.mobility}
        options={[
          { label: 'Mobilité', value: '' },
          ...mobilites.map((item) => ({ label: item.titre, value: String(item.id) })),
        ]}
        onChange={(v) => handleChange('mobility', v)}
        placeholder="Mobilité"
        error={errors.mobility}
      />

        <TextInput
          style={styles.input}
          placeholder="Nombre de poste"
          placeholderTextColor="#7a8ab8"
          value={formData.positions}
          onChangeText={(v) => handleChange('positions', v)}
          keyboardType="numeric"
        />
        {errors.positions ? <Text style={styles.errorText}>{errors.positions}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Salaire"
          placeholderTextColor="#7a8ab8"
          value={formData.salary}
          onChangeText={(v) => handleChange('salary', v)}
          keyboardType="numeric"
        />
        {errors.salary ? <Text style={styles.errorText}>{errors.salary}</Text> : null}

        <SelectPicker
          value={formData.housing}
          options={[
            { label: 'Logement', value: '' },
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ]}
          onChange={(v) => handleChange('housing', v)}
          placeholder="Logement"
          error={errors.housing}
        />

        {/* MODIFICATION ICI : Remplacement du SelectPicker par MultiSelectPicker pour le permis de conduire */}
        <MultiSelectPicker
          value={formData.drivingLicense}
          options={drivingLicenseOptions}
          onChange={(v) => handleChange('drivingLicense', v)}
          placeholder="permis"
          error={errors.drivingLicense}
        />

        <TextInput
          style={styles.textarea}
          placeholder="Description"
          placeholderTextColor="#7a8ab8"
          multiline
          value={formData.description}
          onChangeText={(v) => handleChange('description', v)}
        />
        {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Commentaires (optionnel)"
          placeholderTextColor="#7a8ab8"
          value={formData.comments}
          onChangeText={(v) => handleChange('comments', v)}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Créer la commande</Text>
        </TouchableOpacity>
      </View>

      {/* RECAP */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Recapitulatif</Text>
        <Text>Categorie : {formData.category}</Text>
        <Text>Sous-Categorie : {formData.subcategory}</Text>
        <Text>Metier : {formData.jobTitle}</Text>
        <Text>Contrat : {formData.jobType}</Text>
        <Text>Date debut : {formData.startDate}</Text>
        <Text>Date fin : {formData.endDate}</Text>
        <Text>Adresse : {formData.address}</Text>
        <Text>Mobilite : {formData.mobility}</Text>
        <Text>Postes : {formData.positions}</Text>
        <Text>Salaire : {formData.salary}</Text>
        <Text>Logement : {formData.housing}</Text>
        <Text>Permis : {formData.drivingLicense}</Text>
        <Text>Description : {formData.description}</Text>
        <Text>Commentaires : {formData.comments}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef3ff' },
  content: { paddingBottom: 120 },
  card: { backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 20 },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#1b2d5a' },
  row: { flexDirection: 'row', marginTop: 10 },
  outlineBtn: { flexDirection: 'row', borderWidth: 1, borderColor: '#cfd9ee', padding: 8, borderRadius: 20, marginRight: 10 },
  btnText: { marginLeft: 5 },
  notice: { marginTop: 10, backgroundColor: '#fff1dc', padding: 10, borderRadius: 10 },
  pickerTrigger: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 16, marginTop: 10, backgroundColor: '#f6f8ff', minHeight: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerTriggerText: { color: '#1b2d5a' },
  pickerPlaceholder: { color: '#9ca3af' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 20 },
  modalHeader: { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#e7edf7' },
  modalDone: { color: '#2b5bbb', fontWeight: '600' },
  pickerWrapper: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 16, marginTop: 10, overflow: 'hidden', backgroundColor: '#f6f8ff', height: Platform.OS === 'android' ? 56 : 48, justifyContent: 'center' },
  selectContainer: { position: 'relative', zIndex: 1 },
  selectContainerOpen: { zIndex: 10 },
  selectBox: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 16, marginTop: 10, paddingHorizontal: 16, height: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f6f8ff' },
  selectText: { fontSize: 14, color: '#1b2d5a', flex: 1 },
  selectPlaceholder: { fontSize: 14, color: '#9ca3af', flex: 1 },
  dropdownList: { position: 'absolute', top: 56, left: 0, right: 0, zIndex: 20, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, backgroundColor: '#fff', maxHeight: 200, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  dropdownItemText: { fontSize: 14, color: '#374151' },
  dropdownItemActiveBg: { backgroundColor: '#eef3ff' },
  dropdownItemActive: { color: '#2b5bbb', fontWeight: '600' },
  picker: { height: Platform.OS === 'ios' ? 216 : 56, width: '100%', paddingHorizontal: 16, color: '#1b2d5a' },
  pickerItem: { color: '#1b2d5a', fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#cfd9ee', padding: 12, borderRadius: 20, marginTop: 10, color: '#1b2d5a' },
  textarea: { borderWidth: 1, borderColor: '#cfd9ee', padding: 12, borderRadius: 20, marginTop: 10, height: 100, textAlignVertical: 'top', color: '#1b2d5a' },
  submitBtn: { backgroundColor: '#3a4f8f', padding: 12, borderRadius: 20, alignItems: 'center', marginTop: 15 },
  submitText: { color: '#fff' },
  errorText: { marginTop: 6, marginLeft: 6, fontSize: 12, color: '#dc2626' },
});