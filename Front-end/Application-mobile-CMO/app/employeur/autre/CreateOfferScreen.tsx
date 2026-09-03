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
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getSecteur, getToutMobilite } from "@/app/candidat/services/CVScreen";
import { createCommande } from '@/app/employeur/services/CreatOffesScreen';


const decodeHTML = (str: string): string => {
  if (!str) return '';

  const entities: Record<string, string> = {
    // Ponctuation et symboles
    'ndash': '–',
    'mdash': '—',
    'rsquo': "'",
    'lsquo': "'",
    'nbsp': ' ',
    'amp': '&',
    'quot': '"',
    'apos': "'",
    'lt': '<',
    'gt': '>',

    // Accents minuscules
    'agrave': 'à',
    'aacute': 'á',
    'acirc': 'â',
    'auml': 'ä',
    'egrave': 'è',
    'eacute': 'é',
    'ecirc': 'ê',
    'euml': 'ë',
    'icirc': 'î',
    'iuml': 'ï',
    'ocirc': 'ô',
    'ugrave': 'ù',
    'ucirc': 'û',
    'ccedil': 'ç',

    // Accents majuscules
    'Agrave': 'À',
    'Aacute': 'Á',
    'Acirc': 'Â',
    'Egrave': 'È',
    'Eacute': 'É',
    'Ecirc': 'Ê',
    'Euml': 'Ë',
    'Icirc': 'Î',
    'Iuml': 'Ï',
    'Ocirc': 'Ô',
    'Ugrave': 'Ù',
    'Ucirc': 'Û',
    'Ccedil': 'Ç',
  };

  return str
    // Entités numériques
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Entités nommées (recherche dynamique)
    .replace(/&([a-zA-Z]+);/g, (match, entity) => entities[entity] || match);
};
const formatDate = (date: Date): string => {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

const parseDate = (str: string): Date => {
  if (!str) return new Date();
  const [mm, dd, yyyy] = str.split('/').map(Number);
  if (!mm || !dd || !yyyy) return new Date();
  return new Date(yyyy, mm - 1, dd);
};

const UniversalSelectPicker = ({
  label,
  value,
  options,
  onChange,
  error,
  isMulti = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  error?: string;
  isMulti?: boolean;
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
        <Ionicons name="chevron-down" size={18} color="#6b7280" />
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
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.listWrapper}>
              <FlatList
                data={options}
                keyExtractor={(_, index) => index.toString()}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) => {
                  const isSelected = isMulti 
                    ? value.split(',').includes(item) 
                    : item === value;
                  return (
                    <TouchableOpacity
                      style={[styles.optionItem, isSelected && styles.selectedOption]}
                      onPress={() => {
                        if (isMulti) {
                          const vals = value ? value.split(',') : [];
                          if (vals.includes(item)) {
                            onChange(vals.filter(v => v !== item).join(','));
                          } else {
                            onChange([...vals, item].join(','));
                          }
                        } else {
                          onChange(item);
                          setModalVisible(false);
                        }
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                          {item === '' ? 'Aucun(e)' : item}
                        </Text>
                        {isSelected && <Ionicons name="checkmark" size={18} color="#2b5bbb" />}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

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
    drivingLicense: '', 
    description: '',
    comments: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [sectorData, setSectorData] = useState<{ categories: any[]; subCategories: any[]; jobs: any[] }>({ categories: [], subCategories: [], jobs: [] });
  const [mobilites, setMobilites] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const drivingLicenseOptions = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'BE', 'C1E', 'CE', 'D1E', 'DE'];

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category: string) => {
    const cat = sectorData.categories.find(c => c.titre === category);
    setFormData(prev => ({
      ...prev,
      categoryId: String(cat?.id_categorie ?? cat?.id ?? ''),
      category: category,
      subcategoryId: '', subcategory: '', jobId: '', jobTitle: ''
    }));
  };

  const handleSubcategorySelect = (subcategory: string) => {
    const sub = sectorData.subCategories.find(sc => sc.titre === subcategory);
    setFormData(prev => ({
      ...prev,
      subcategoryId: String(sub?.id_sous ?? sub?.id ?? ''),
      subcategory: subcategory,
      jobId: '', jobTitle: ''
    }));
  };

  const handleJobSelect = (job: string) => {
    const j = sectorData.jobs.find(jb => jb.titre === job);
    setFormData(prev => ({ ...prev, jobId: String(j?.id_metier ?? j?.id ?? ''), jobTitle: job }));
  };

  const handleSubmit = async () => {
    const requiredFields: Array<{ key: keyof typeof formData; label: string }> = [
      { key: 'categoryId', label: 'Catégorie' },
      { key: 'subcategoryId', label: 'Sous-catégorie' },
      { key: 'jobId', label: 'Métier' },
      { key: 'jobType', label: 'Type de contrat' },
      { key: 'startDate', label: 'Date début (MM/DD/YYYY)' },
      { key: 'address', label: 'Adresse' },
      { key: 'mobility', label: 'Mobilité' },
      { key: 'positions', label: 'Nombre de postes' },
      { key: 'salary', label: 'Salaire' },
      { key: 'housing', label: 'Logement' },
    ];

    const nextErrors: Record<string, string> = {};
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    
    requiredFields.forEach((field) => {
      if (!String(formData[field.key]).trim()) {
        nextErrors[field.key] = `Le champ ${field.label} est obligatoire`;
      }
    });

    if (formData.startDate && !dateRegex.test(formData.startDate)) {
      nextErrors.startDate = 'Format date invalide : MM/DD/YYYY';
    }

    if (formData.endDate && !dateRegex.test(formData.endDate)) {
      nextErrors.endDate = 'Format date invalide : MM/DD/YYYY';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? parseDate(formData.startDate) : null,
        endDate: formData.endDate ? parseDate(formData.endDate) : null,
      };

      const result = await createCommande(payload);
      const message = result?.message || 'Offre soumise pour validation CMO';
      Alert.alert('Résultat', message);
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de créer la commande';
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
          categories: (data?.secteurs ?? []).map((cat: any) => ({
            ...cat,
            titre: decodeHTML(cat.titre ?? ''),
          })),
          subCategories: (data?.sousCategories ?? []).map((sub: any) => ({
            ...sub,
            titre: decodeHTML(sub.titre ?? ''),
          })),
          jobs: (data?.metiers ?? []).map((job: any) => ({
            ...job,
            titre: decodeHTML(job.titre ?? ''),
          })),
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
        const decoded = Array.isArray(data) 
          ? data.map((m: any) => ({ ...m, titre: decodeHTML(m.titre ?? '') })) 
          : [];
        setMobilites(decoded);
      } catch (error) {
        console.error('loadMobilites error', error);
        if (mounted) setMobilites([]);
      }
    };
    loadMobilites();
    return () => { mounted = false; };
  }, []);

  const selectedMobilityText = mobilites.find(m => String(m.id) === String(formData.mobility))?.titre ?? '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <UniversalSelectPicker
          label="Catégorie"
          value={formData.category}
          options={['', ...sectorData.categories.map(c => c.titre)]}
          onChange={handleCategorySelect}
          error={errors.categoryId}
        />

        <UniversalSelectPicker
          label="Sous-catégorie"
          value={formData.subcategory}
          options={['', ...filteredSubCategories.map(sc => sc.titre)]}
          onChange={handleSubcategorySelect}
          error={errors.subcategoryId}
        />

        <UniversalSelectPicker
          label="Métier / Intitulé du poste"
          value={formData.jobTitle}
          options={['', ...filteredJobs.map(j => j.titre)]}
          onChange={handleJobSelect}
          error={errors.jobId}
        />

        <UniversalSelectPicker
          label="Type de contrat"
          value={formData.jobType}
          options={['', 'CDI', 'CDD', 'Interim']}
          onChange={(v) => handleChange('jobType', v)}
          error={errors.jobType}
        />

        <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowStartPicker(true)}>
          <Text style={[styles.pickerTriggerText, !formData.startDate && styles.pickerPlaceholder]}>
            {formData.startDate || 'Date début (MM/DD/YYYY)'}
          </Text>
          <Ionicons name="calendar-outline" size={18} color="#7a8ab8" />
        </TouchableOpacity>
        {errors.startDate ? <Text style={styles.errorText}>{errors.startDate}</Text> : null}

        {showStartPicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={parseDate(formData.startDate)}
            mode="date"
            display="default"
            textColor="#1b2d5a"
            accentColor="#2b5bbb"
            onChange={(event, selectedDate) => {
              setShowStartPicker(false);
              if (event.type === 'dismissed') return;
              if (selectedDate) handleChange('startDate', formatDate(selectedDate));
            }}
          />
        )}

        {Platform.OS === 'ios' && (
          <Modal visible={showStartPicker} transparent animationType="slide" onRequestClose={() => setShowStartPicker(false)}>
            <Pressable style={styles.modalOverlay} onPress={() => setShowStartPicker(false)} />
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                  <Text style={styles.modalDone}>Terminer</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker 
                value={parseDate(formData.startDate)} 
                mode="date" 
                display="inline" 
                themeVariant="light"
                textColor="#1b2d5a"
                accentColor="#2b5bbb"
                onChange={(event, selectedDate) => {
                  if (selectedDate) handleChange('startDate', formatDate(selectedDate));
                }} 
              />
            </View>
          </Modal>
        )}

        {formData.jobType !== 'CDI' && (
          <>
            <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowEndPicker(true)}>
              <Text style={[styles.pickerTriggerText, !formData.endDate && styles.pickerPlaceholder]}>
                {formData.endDate || 'Date fin (MM/DD/YYYY)'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color="#7a8ab8" />
            </TouchableOpacity>
            {errors.endDate ? <Text style={styles.errorText}>{errors.endDate}</Text> : null}

            {showEndPicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={parseDate(formData.endDate)}
                mode="date"
                display="default"
                textColor="#1b2d5a"
                accentColor="#2b5bbb"
                onChange={(event, selectedDate) => {
                  setShowEndPicker(false);
                  if (event.type === 'dismissed') return;
                  if (selectedDate) handleChange('endDate', formatDate(selectedDate));
                }}
              />
            )}

            {Platform.OS === 'ios' && (
              <Modal visible={showEndPicker} transparent animationType="slide" onRequestClose={() => setShowEndPicker(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowEndPicker(false)} />
                <View style={styles.modalSheet}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                      <Text style={styles.modalDone}>Terminer</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker 
                    value={parseDate(formData.endDate)} 
                    mode="date" 
                    display="inline" 
                    themeVariant="light"
                    textColor="#1b2d5a"
                    accentColor="#2b5bbb"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) handleChange('endDate', formatDate(selectedDate));
                    }} 
                  />
                </View>
              </Modal>
            )}
          </>
        )}

        <TextInput style={styles.input} placeholder="Adresse" placeholderTextColor="#7a8ab8" value={formData.address} onChangeText={(v) => handleChange('address', v)} />
        {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

        <UniversalSelectPicker
          label="Mobilité"
          value={selectedMobilityText}
          options={['', ...mobilites.map(m => m.titre)]}
          onChange={(v) => {
            const mob = mobilites.find(m => m.titre === v);
            handleChange('mobility', String(mob?.id ?? ''));
          }}
          error={errors.mobility}
        />

        <TextInput style={styles.input} placeholder="Nombre de postes" placeholderTextColor="#7a8ab8" value={formData.positions} onChangeText={(v) => handleChange('positions', v)} keyboardType="numeric" />
        {errors.positions ? <Text style={styles.errorText}>{errors.positions}</Text> : null}

        <TextInput style={styles.input} placeholder="Salaire" placeholderTextColor="#7a8ab8" value={formData.salary} onChangeText={(v) => handleChange('salary', v)} keyboardType="numeric" />
        {errors.salary ? <Text style={styles.errorText}>{errors.salary}</Text> : null}

        <UniversalSelectPicker
          label="Logement"
          value={formData.housing}
          options={['', 'Oui', 'Non']}
          onChange={(v) => handleChange('housing', v)}
          error={errors.housing}
        />

        <UniversalSelectPicker
          label="Permis"
          value={formData.drivingLicense}
          options={['', ...drivingLicenseOptions]}
          onChange={(v) => handleChange('drivingLicense', v)}
          isMulti={true}
          error={errors.drivingLicense}
        />

        <TextInput style={styles.textarea} placeholder="Description" placeholderTextColor="#7a8ab8" multiline value={formData.description} onChangeText={(v) => handleChange('description', v)} />
        {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

        <TextInput style={styles.input} placeholder="Commentaires (optionnel)" placeholderTextColor="#7a8ab8" value={formData.comments} onChangeText={(v) => handleChange('comments', v)} />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Créer la commande</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Récapitulatif</Text>
        
        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Catégorie :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{decodeHTML(formData.category) || '-'}</Text>
            {formData.category && (
              <TouchableOpacity onPress={() => handleCategorySelect('')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Sous-catégorie :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{decodeHTML(formData.subcategory) || '-'}</Text>
            {formData.subcategory && (
              <TouchableOpacity onPress={() => handleSubcategorySelect('')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Métier :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{decodeHTML(formData.jobTitle) || '-'}</Text>
            {formData.jobTitle && (
              <TouchableOpacity onPress={() => handleJobSelect('')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Contrat :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{decodeHTML(formData.jobType) || '-'}</Text>
            {formData.jobType && (
              <TouchableOpacity onPress={() => handleChange('jobType', '')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Date début :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{formData.startDate || '-'}</Text>
            {formData.startDate && (
              <TouchableOpacity onPress={() => handleChange('startDate', '')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Date fin :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{formData.endDate || '-'}</Text>
            {formData.endDate && (
              <TouchableOpacity onPress={() => handleChange('endDate', '')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Adresse :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{decodeHTML(formData.address) || '-'}</Text>
            {formData.address && (
              <TouchableOpacity onPress={() => handleChange('address', '')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Mobilité :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{decodeHTML(selectedMobilityText) || '-'}</Text>
            {selectedMobilityText && (
              <TouchableOpacity onPress={() => handleChange('mobility', '')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Postes :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{decodeHTML(formData.positions) || '-'}</Text>
            {formData.positions && (
              <TouchableOpacity onPress={() => handleChange('positions', '')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Salaire :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{decodeHTML(formData.salary) || '-'}</Text>
            {formData.salary && (
              <TouchableOpacity onPress={() => handleChange('salary', '')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Logement :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{decodeHTML(formData.housing) || '-'}</Text>
            {formData.housing && (
              <TouchableOpacity onPress={() => handleChange('housing', '')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Permis :</Text>
          <View style={styles.recapValueContainer}>
            {formData.drivingLicense ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>
                {formData.drivingLicense.split(',').map((license, idx) => (
                  <View key={idx} style={styles.permisTag}>
                    <Text style={styles.permisTagText}>{decodeHTML(license)}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const vals = formData.drivingLicense.split(',').filter(v => v !== license);
                        handleChange('drivingLicense', vals.join(','));
                      }}
                      style={styles.permisTagClose}
                    >
                      <Ionicons name="close-circle" size={14} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.recapValue}>-</Text>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Description :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{decodeHTML(formData.description) || '-'}</Text>
            {formData.description && (
              <TouchableOpacity onPress={() => handleChange('description', '')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recapRow}>
          <Text style={styles.recapLabel}>Commentaires :</Text>
          <View style={styles.recapValueContainer}>
            <Text style={styles.recapValue}>{decodeHTML(formData.comments) || '-'}</Text>
            {formData.comments && (
              <TouchableOpacity onPress={() => handleChange('comments', '')} style={styles.recapDeleteBtn}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef3ff' },
  content: { paddingBottom: 120 },
  card: { backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 20 },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#1b2d5a', marginBottom: 16 },
  
  pickerTrigger: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 16, marginTop: 10, backgroundColor: '#f6f8ff', minHeight: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerTriggerText: { color: '#1b2d5a' },
  pickerPlaceholder: { color: '#9ca3af' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', padding: 20 },
  modalSheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30, paddingHorizontal: 10 },
  modalHeader: { paddingHorizontal: 16, paddingVertical: 14, alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#e7edf7', flexDirection: 'row', justifyContent: 'space-between' },
  modalDone: { color: '#2b5bbb', fontWeight: '600', fontSize: 16 },
  
  pickerWrapper: { marginBottom: 4, marginTop: 10 },
  label: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  pickerText: { fontSize: 14, color: '#1E293B' },
  placeholderText: { color: '#94A3B8' },
  
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 12, height: 350, padding: 16, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#1b2d5a' },
  listWrapper: { flex: 1 },
  optionItem: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  selectedOption: { backgroundColor: '#F1F5F9', borderRadius: 6 },
  optionText: { fontSize: 14, color: '#334155' },
  selectedOptionText: { fontWeight: '600', color: '#2b5bbb' },
  
  input: { borderWidth: 1, borderColor: '#cfd9ee', padding: 12, borderRadius: 20, marginTop: 10, color: '#1b2d5a' },
  textarea: { borderWidth: 1, borderColor: '#cfd9ee', padding: 12, borderRadius: 20, marginTop: 10, height: 100, textAlignVertical: 'top', color: '#1b2d5a' },
  submitBtn: { backgroundColor: '#3a4f8f', padding: 12, borderRadius: 20, alignItems: 'center', marginTop: 15 },
  submitText: { color: '#fff' },
  errorText: { marginTop: 6, marginLeft: 6, fontSize: 12, color: '#dc2626' },
  
  recapRow: { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 8 },
  recapLabel: { fontSize: 13, fontWeight: '600', color: '#1b2d5a', marginBottom: 4 },
  recapValueContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recapValue: { fontSize: 13, color: '#475569', flex: 1 },
  recapDeleteBtn: { marginLeft: 8, padding: 4 },
  permisTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  permisTagText: { fontSize: 12, color: '#2b5bbb', fontWeight: '600', marginRight: 4 },
  permisTagClose: { padding: 2 },
});