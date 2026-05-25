import * as ImagePicker from 'expo-image-picker';
import {
    Briefcase,
    Camera,
    Car,
    Check,
    ChevronDown,
    ChevronUp,
    Globe,
    GraduationCap,
    MapPin,
    Plus,
    Save,
    Trash2,
    Upload,
    User,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import {
    addExperience,
    addFormation,
    deleteExperiences,
    deleteFormation,
    DeleteImage,
    getExperiences,
    getFormations,
    getImage,
    getInformations,
    getLangues,
    getMobiliteUser,
    getPermis,
    getSecteur, getSecteurUser,
    getToutMobilite,
    updateExperiences,
    updateFormation,
    updateImage,
    updateInformations,
    updateLangues,
    updateMobilite,
    updatePermis,
    updateSecteur
} from "@/app/candidat/services/CVScreen";
import url from "@/app/services/url.js";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Experience {
  id: number;
  position: string;
  company: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  description: string;
  isNew?: boolean;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  description: string;
  isNew?: boolean;
}

interface Sector {
  id: number;
  category: string;
  subCategory: string;
  job: string;
}

interface MobiliteOption {
  id: number;
  titre: string;
  deleted?: number;
}

interface SectorCategory {
  id_categorie: number;
  titre: string;
}

interface SectorSubCategory {
  id_sous: number;
  id_categorie: number;
  titre: string;
}

interface SectorJob {
  id_metier: number;
  id_sous: number;
  titre: string;
}

type TabKey =
  | 'identity'
  | 'mobility'
  | 'permits'
  | 'languages'
  | 'sectors'
  | 'experience'
  | 'education';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: 'identity', label: 'Informations' },
  { key: 'mobility', label: 'Mobilité' },
  { key: 'permits', label: 'Permis' },
  { key: 'languages', label: 'Langues' },
  { key: 'sectors', label: 'Secteurs' },
  { key: 'experience', label: 'Expériences' },
  { key: 'education', label: 'Formation' },
];

const PERMITS = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'D', 'BE', 'C1E', 'CE', 'D1E', 'DE'];
const NAUTIC_PERMITS = ['Permis côtier', 'Permis fluvial', 'Permis eaux intérieures', 'Permis hauturier'];
// Langues UI + mapping vers les cles API.
const LANGUAGES = ['Allemand', 'Anglais', 'Arabe', 'Chinois', 'Danois', 'Espagnol', 'Finnois', 'Français', 'Italien', 'Néerlandais', 'Norvégien', 'Polonais', 'Portugais', 'Russe'];
const LANGUAGE_KEYS: Record<string, string> = {
  Allemand: 'lang_de',
  Anglais: 'lang_en',
  Arabe: 'lang_ar',
  Chinois: 'lang_ch',
  Danois: 'lang_da',
  Espagnol: 'lang_es',
  Finnois: 'lang_fi',
  Français: 'lang_fr',
  Italien: 'lang_it',
  Néerlandais: 'lang_ne',
  Norvégien: 'lang_no',
  Polonais: 'lang_po',
  Portugais: 'lang_por',
  Russe: 'lang_ru',
};

const CONTRACT_OPTIONS = ['', 'CDD', 'CDI', 'SAISONIER', 'ALTERNANCE', 'STAGE','MI-TEMPS','INTERIM','LIBERAL'];
const EDUCATION_LEVELS = ['', 'Niveau Bac', 'Bac', 'Bac +2', 'Bac +3', 'Bac +5 ','Bac+7'];
const EXPERIENCE_LEVELS = ['', 'Moins d\'1 an', 'Entre 1 et 2 ans', 'Entre 3 et 5 ans', 'Entre 5 et 10 ans', 'plus de 10 ans'];

// ─── Colors ───────────────────────────────────────────────────────────────────

const C = {
  bg: '#eef3ff',
  white: '#ffffff',
  navy: '#1b2d5a',
  blue: '#2b5bbb',
  blueDark: '#1e3a8a',
  border: '#e1e9fb',
  borderLight: '#dbe3f3',
  inputBg: '#f6f8ff',
  textMuted: '#5b6a8e',
  accent: '#fff2e4',
  accentDelete: '#ffd9c9',
  deleteText: '#b64a2f',
  red: '#ef4444',
  blueBg: '#eff6ff',
  gray100: '#f3f4f6',
  gray700: '#374151',
  gray200: '#e5e7eb',
};

// ─── Reusable Components ──────────────────────────────────────────────────────

const Label = ({ children }: { children: string }) => (
  <Text style={styles.label}>{children}</Text>
);

const InputField = ({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  numberOfLines,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
}) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor="#9ca3af"
    keyboardType={keyboardType ?? 'default'}
    multiline={multiline}
    numberOfLines={numberOfLines}
    style={[styles.input, multiline ? styles.inputMultiline : undefined]}
  />
);


const Card = ({ children, style }: { children: React.ReactNode; style?: object }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const SectionSaveButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <View style={styles.saveContainer}>
    <TouchableOpacity style={styles.saveBtn} onPress={onPress}>
      <Save size={18} color={C.white} />
      <Text style={styles.saveBtnText}>{label}</Text>
    </TouchableOpacity>
  </View>
);

const SectionTitle = ({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: string;
}) => (
  <View style={styles.sectionTitleRow}>
    {icon != null ? <View style={styles.sectionTitleIcon}>{icon}</View> : null}
    <Text style={styles.sectionTitle}>{children}</Text>
  </View>
);

const SelectPicker = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity style={styles.selectBox} onPress={() => setOpen(!open)}>
        <Text style={value ? styles.selectText : styles.selectPlaceholder}>
          {value || 'Sélectionner'}
        </Text>
        {open
          ? <ChevronUp size={16} color={C.textMuted} />
          : <ChevronDown size={16} color={C.textMuted} />
        }
      </TouchableOpacity>
      {open ? (
        <View style={styles.dropdownList}>
          <ScrollView
            style={styles.dropdownScroll}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {options.map((opt) => (
              <TouchableOpacity
                key={opt || '__empty__'}
                style={styles.dropdownItem}
                onPress={() => { onChange(opt); setOpen(false); }}
              >
                <Text style={[styles.dropdownItemText, opt === value ? styles.dropdownItemActive : undefined]}>
                  {opt || 'Sélectionner'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

const CheckItem = ({
  label,
  checked,
  onToggle,
  wide,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  wide?: boolean;
}) => (
  <TouchableOpacity
    onPress={onToggle}
    style={[
      styles.checkItem,
      wide ? styles.checkItemWide : undefined,
      checked ? styles.checkItemChecked : undefined,
    ]}
  >
    <View style={[styles.checkbox, checked ? styles.checkboxChecked : undefined]}>
      {checked ? <Check size={11} color={C.white} strokeWidth={3} /> : null}
    </View>
    <Text style={[styles.checkLabel, checked ? styles.checkLabelActive : undefined]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Tab Screens ──────────────────────────────────────────────────────────────

const IdentityTab = ({
  formData,
  setFormData,
  photoUpload,
  setPhotoUpload,
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  photoUpload: { uri: string; name: string; type: string } | null;
  setPhotoUpload: React.Dispatch<React.SetStateAction<{ uri: string; name: string; type: string } | null>>;
}) => {
  const [photoLoading, setPhotoLoading] = useState(false);
  const set = (key: string) => (v: string) =>
    setFormData((p: any) => ({ ...p, [key]: v }));

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission requise', 'Autorisez l\'accès à la galerie pour importer une photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setFormData((p: any) => ({ ...p, photo: asset.uri }));

      const image = {
        uri: asset.uri,
        name: asset.fileName ?? `profile_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      };
      setPhotoUpload(image);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo.');
    }
  };

  const handleSaveInformations = async () => {
    try {
      const codePostalValue = formData.postalCode ? Number(formData.postalCode) : 0;

      await updateInformations(
        formData.civility,
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.phone,
        codePostalValue,
        formData.city,
        formData.country,
        formData.socialSecurity
      );

      if (photoUpload) {
        await updateImage(photoUpload as any);
        setPhotoUpload(null);
      }

      Alert.alert('Enregistré', 'Informations enregistrées avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les informations.');
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <Card>
        <SectionTitle icon={<Camera size={18} color={C.blue} />}>
          {'Photo de profil'}
        </SectionTitle>
        <View style={styles.photoContainer}>
          <View style={styles.photoBox}>
            {formData.photo
              ? (
                <>
                  <Image
                    source={{ uri: formData.photo }}
                    style={styles.photoImage}
                    onLoadStart={() => setPhotoLoading(true)}
                    onLoadEnd={() => setPhotoLoading(false)}
                    onError={() => setPhotoLoading(false)}
                  />
                  {photoLoading ? (
                    <View style={styles.photoLoading}>
                      <ActivityIndicator size="small" color={C.blue} />
                    </View>
                  ) : null}
                </>
              )
              : <Camera size={28} color={C.blue} />
            }
          </View>
          <Text style={styles.photoHint}>{'Télécharger votre photo'}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={styles.btnImport}
              onPress={handlePickPhoto}
            >
              <Upload size={16} color={C.white} />
              <Text style={styles.btnImportText}>{'Importer'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnDelete}
              onPress={() => {
                setFormData((p: any) => ({ ...p, photo: '' }));
                setPhotoUpload(null);
                setPhotoLoading(false);
                DeleteImage();
              }}
            >
              <Trash2 size={16} color={C.deleteText} />
              <Text style={styles.btnDeleteText}>{'Supprimer'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      <Card>
        <SectionTitle icon={<User size={18} color={C.blue} />}>
          {'Informations'}
        </SectionTitle>

        <Label>{'Civilité'}</Label>
        <View style={{ gap: 8, marginBottom: 4 }}>
          {['Monsieur', 'Madame'].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.civilityBtn,
                formData.civility === opt ? styles.civilityBtnActive : undefined,
              ]}
              onPress={() => setFormData((p: any) => ({ ...p, civility: opt }))}
            >
              <Text
                style={[
                  styles.civilityText,
                  formData.civility === opt ? styles.civilityTextActive : undefined,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Label>{'Prénom *'}</Label>
            <InputField value={formData.firstName} onChangeText={set('firstName')} />
          </View>
          <View style={{ flex: 1 }}>
            <Label>{'Nom *'}</Label>
            <InputField value={formData.lastName} onChangeText={set('lastName')} />
          </View>
        </View>

        <Label>{'Email *'}</Label>
        <InputField value={formData.email} onChangeText={set('email')} keyboardType="email-address" />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Label>{'Téléphone *'}</Label>
            <InputField value={formData.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Label>{'Téléphone 2'}</Label>
            <InputField value={formData.phone2} onChangeText={set('phone2')} keyboardType="phone-pad" />
          </View>
        </View>

        <Label>{'Adresse postale'}</Label>
        <InputField value={formData.address} onChangeText={set('address')} />

        <Label>{'Code postal'}</Label>
        <InputField value={formData.postalCode} onChangeText={set('postalCode')} />

        <Label>{'Ville'}</Label>
        <InputField value={formData.city} onChangeText={set('city')} />

        <Label>{'Pays'}</Label>
        <InputField value={formData.country} onChangeText={set('country')} />

        <Label>{'Numéro de sécurité sociale'}</Label>
        <InputField value={formData.socialSecurity} onChangeText={set('socialSecurity')} />
      </Card>

      <SectionSaveButton
        label={'Sauvegarder les informations'}
        onPress={handleSaveInformations}
      />
    </View>
  );
};

const MobilityTab = ({
  formData,
  setFormData,
  mobilityOptions,
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  mobilityOptions: MobiliteOption[];
}) => {
  const set = (key: string) => (v: string) =>
    setFormData((p: any) => ({ ...p, [key]: v }));

  const setAvailabilityChoice = (v: string) => {
    setFormData((p: any) => ({
      ...p,
      availabilityChoice: v,
      availabilityDate: v === 'Oui' ? p.availabilityDate : '',
    }));
  };

  const handleSaveMobilite = async () => {
    try {
      const disponibiliteValue = formData.availabilityChoice === 'Oui' ? 1 : 0;
      const selectedMobilite = mobilityOptions.find(
        (item) => item.titre === formData.mobilityZone
      );
      const mobiliteId = selectedMobilite?.id ?? null;

      await updateMobilite(
        mobiliteId,
        formData.educationLevel,
        formData.experienceLevel,
        formData.contract1,
        formData.contract2,
        disponibiliteValue,
        formData.availabilityDate
      );

      Alert.alert('Enregistré', 'Mobilité enregistrée avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la mobilité.');
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <Card>
        <SectionTitle icon={<MapPin size={18} color={C.blue} />}>
          {'Mobilité & Profil'}
        </SectionTitle>

        <Label>{'Mobilité'}</Label>
        <SelectPicker
          value={formData.mobilityZone}
          options={['', ...mobilityOptions.map((item) => item.titre)]}
          onChange={set('mobilityZone')}
        />

        <Label>{"Niveau d'étude"}</Label>
        <SelectPicker value={formData.educationLevel} options={EDUCATION_LEVELS} onChange={set('educationLevel')} />

        <Label>{"Expériences"}</Label>
        <SelectPicker value={formData.experienceLevel} options={EXPERIENCE_LEVELS} onChange={set('experienceLevel')} />

        <View style={{ height: 12 }} />
        <Label>{'Contrat préféré 1'}</Label>
        <SelectPicker value={formData.contract1} options={CONTRACT_OPTIONS} onChange={set('contract1')} />

        <View style={{ height: 12 }} />
        <Label>{'Contrat préféré 2'}</Label>
        <SelectPicker value={formData.contract2} options={CONTRACT_OPTIONS} onChange={set('contract2')} />

        <View style={{ height: 12 }} />
        <Label>{'Disponibilité'}</Label>
        <SelectPicker value={formData.availabilityChoice} options={['Non', 'Oui']} onChange={setAvailabilityChoice} />

        {formData.availabilityChoice === 'Oui' ? (
          <View>
            <Label>{'Disponible le :'}</Label>
            <InputField
              value={formData.availabilityDate}
              onChangeText={set('availabilityDate')}
              placeholder="mm/jj/aaaa"
            />
          </View>
        ) : null}
      </Card>

      <SectionSaveButton
        label={'Sauvegarder la mobilité'}
        onPress={handleSaveMobilite}
      />
    </View>
  );
};

const PermitsTab = ({ formData, setFormData }: { formData: any; setFormData: any }) => {
  const toggle = (permit: string) => {
    setFormData((p: any) => ({
      ...p,
      permits: p.permits.includes(permit)
        ? p.permits.filter((x: string) => x !== permit)
        : [...p.permits, permit],
    }));
  };

  const handleSavePermits = async () => {
    try {
      const has = (label: string) => (formData.permits.includes(label) ? 1 : 0);

      await updatePermis(
        has('AM'),
        has('A1'),
        has('A2'),
        has('A'),
        has('B1'),
        has('B'),
        has('C1'),
        has('C'),
        has('D1'),
        has('D'),
        has('BE'),
        has('C1E'),
        has('CE'),
        has('D1E'),
        has('DE'),
        has('Permis côtier'),
        has('Permis fluvial'),
        has('Permis eaux intérieures'),
        has('Permis hauturier')
      );

      Alert.alert('Enregistré', 'Permis enregistrés avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les permis.');
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <Card>
        <SectionTitle icon={<Car size={18} color={C.blue} />}>
          {'Permis de conduire'}
        </SectionTitle>
        <View style={styles.checkGrid}>
          {PERMITS.map((p) => (
            <CheckItem
              key={p}
              label={p}
              checked={formData.permits.includes(p)}
              onToggle={() => toggle(p)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>{'Permis nautiques'}</SectionTitle>
        <View style={{ gap: 8 }}>
          {NAUTIC_PERMITS.map((p) => (
            <CheckItem
              key={p}
              label={p}
              checked={formData.permits.includes(p)}
              onToggle={() => toggle(p)}
              wide
            />
          ))}
        </View>
      </Card>

      <SectionSaveButton
        label={'Sauvegarder les permis'}
        onPress={handleSavePermits}
      />
    </View>
  );
};

// Affichage des langues avec cases cochees et sauvegarde.
const LanguagesTab = ({
  langues,
  onToggle,
  onSave,
}: {
  langues: string[];
  onToggle: (label: string) => void;
  onSave: () => void;
}) => {
  return (
    <View style={{ gap: 16 }}>
      <Card>
        <SectionTitle icon={<Globe size={18} color={C.blue} />}>
          {'Langues'}
        </SectionTitle>

        <View style={styles.checkGrid2}>
          {LANGUAGES.map((lang) => (
            <CheckItem
              key={lang}
              label={lang}
              checked={langues.includes(lang)}
              onToggle={() => onToggle(lang)}
              wide
            />
          ))}
        </View>
      </Card>

      <SectionSaveButton
        label={'Sauvegarder les langues'}
        onPress={onSave}
      />
    </View>
  );
};

const SectorsTab = ({
  sectors,
  setSectors,
  sectorData,
  onSave,
}: {
  sectors: Sector[];
  setSectors: React.Dispatch<React.SetStateAction<Sector[]>>;
  sectorData: {
    categories: SectorCategory[];
    subCategories: SectorSubCategory[];
    jobs: SectorJob[];
  };
  onSave: () => void;
}) => {
  const add = () =>
    setSectors((p) => [
      ...p,
      { id: Date.now(), category: '', subCategory: '', job: '' },
    ]);

  const update = (id: number, key: keyof Sector, value: string) => {
    setSectors((p) =>
      p.map((s) => {
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

  const remove = (id: number) => {
    if (sectors.length <= 3) return;
    setSectors((p) => p.filter((s) => s.id !== id));
  };

  const getSubCategoriesForCategory = (category: string): string[] => {
    if (!category) return [];
    const selected = sectorData.categories.find((c) => c.titre === category);
    if (!selected) return [];
    return sectorData.subCategories
      .filter((s) => s.id_categorie === selected.id_categorie)
      .map((s) => s.titre);
  };

  const getJobsForSubCategory = (category: string, subCategory: string): string[] => {
    if (!category || !subCategory) return [];
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

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleIcon}>
          <Briefcase size={18} color={C.blue} />
        </View>
        <Text style={styles.sectionTitlePlain}>{"Secteurs d'activité"}</Text>
      </View>

      {sectors.map((sector, index) => (
        <Card key={sector.id}>
          <Label>{`Secteur d'activité ${index + 1}`}</Label>

          <View style={styles.sectorColumn}>
            <Label>Catégorie</Label>
            <SelectPicker
              value={sector.category}
              options={['', ...sectorData.categories.map((c) => c.titre)]}
              onChange={(v) => update(sector.id, 'category', v)}
            />

            <Label>Sous-catégorie</Label>
            <SelectPicker
              value={sector.subCategory}
              options={['', ...getSubCategoriesForCategory(sector.category)]}
              onChange={(v) => update(sector.id, 'subCategory', v)}
            />

            <Label>Métier</Label>
            <SelectPicker
              value={sector.job}
              options={['', ...getJobsForSubCategory(sector.category, sector.subCategory)]}
              onChange={(v) => update(sector.id, 'job', v)}
            />
          </View>
        </Card>
      ))}

      <SectionSaveButton
        label={'Sauvegarder les secteurs'}
        onPress={onSave}
      />
    </View>
  );
};

const ExperienceTab = ({
  experiences,
  setExperiences,
  onSave,
  onDelete,
  onUpdate,
}: {
  experiences: Experience[];
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
  onSave: () => void;
  onDelete: (exp: Experience) => void;
  onUpdate: (exp: Experience) => void;
}) => {
  const add = () =>
    setExperiences((p) => [
      { id: Date.now(), position: '', company: '', city: '', country: '', startDate: '', endDate: '', description: '', isNew: true },
      ...p,
    ]);

  const update = (id: number, key: keyof Experience, value: string) =>
    setExperiences((p) => p.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const remove = (exp: Experience) => onDelete(exp);

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.rowBetween}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionTitleIcon}>
            <Briefcase size={18} color={C.blue} />
          </View>
          <Text style={styles.sectionTitlePlain}>{'Expériences professionnelles'}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={add}>
          <Plus size={14} color={C.blueDark} />
          <Text style={styles.addBtnText}>{'Ajouter'}</Text>
        </TouchableOpacity>
      </View>

      {experiences.map((exp) => (
        <Card key={exp.id}>
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

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <TouchableOpacity style={styles.btnImport} onPress={() => onUpdate(exp)}>
              <Save size={16} color={C.white} />
              <Text style={styles.btnImportText}>{'Mettre à jour'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => remove(exp)}>
              <Trash2 size={16} color={C.red} />
              <Text style={styles.deleteBtnText}>{'Supprimer'}</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      <SectionSaveButton
        label={'Sauvegarder les expériences'}
        onPress={onSave}
      />
    </View>
  );
};

const EducationTab = ({
  education,
  setEducation,
  onSave,
  onDelete,
  onUpdate,
}: {
  education: Education[];
  setEducation: React.Dispatch<React.SetStateAction<Education[]>>;
  onSave: () => void;
  onDelete: (edu: Education) => void;
  onUpdate: (edu: Education) => void;
}) => {
  const add = () =>
    setEducation((p) => [
      { id: Date.now(), school: '', degree: '', startMonth: '', startYear: '', endMonth: '', endYear: '', description: '', isNew: true },
      ...p,
    ]);

  const update = (id: number, key: keyof Education, value: string) =>
    setEducation((p) => p.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const remove = (edu: Education) => onDelete(edu);

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.rowBetween}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionTitleIcon}>
            <GraduationCap size={18} color={C.blue} />
          </View>
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
          <InputField value={edu.degree} onChangeText={(v) => update(edu.id, 'degree', v)} placeholder="Ex: CAP Mécanique" />

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
              <Label>{'Mois d\'obtention'}</Label>
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
            <TouchableOpacity style={styles.btnImport} onPress={() => onUpdate(edu)}>
              <Save size={16} color={C.white} />
              <Text style={styles.btnImportText}>{'Mettre à jour'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => remove(edu)}>
              <Trash2 size={16} color={C.red} />
              <Text style={styles.deleteBtnText}>{'Supprimer'}</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      <SectionSaveButton
        label={'Sauvegarder la formation'}
        onPress={onSave}
      />
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CVScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('identity');
  const [mobilityOptions, setMobilityOptions] = useState<MobiliteOption[]>([]);
  const [sectorData, setSectorData] = useState<{
    categories: SectorCategory[];
    subCategories: SectorSubCategory[];
    jobs: SectorJob[];
  }>({
    categories: [],
    subCategories: [],
    jobs: [],
  });

  // ✅ FIX: Single declaration of langues state — only here in CVScreen
const [langues, setLangues] = useState<string[]>([]);
  const [photoUpload, setPhotoUpload] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [formData, setFormData] = useState({
    civility: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phone2: '',
    address: '',
    postalCode: '',
    city: '',
    country: '',
    socialSecurity: '',
    photo: '',
    mobilityZone: '',
    educationLevel: '',
    contract1: '',
    contract2: '',
    experienceLevel: '',
    availabilityChoice: 'Non',
    availabilityDate: '',
    permits: [] as string[],
    languages: ['Français', 'Arabe'] as string[],
    sector1: 'Agriculture',
    sector2: '',
    sector3: '',
  });

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: 1,
      position: 'Mécanicien automobile',
      company: 'Garage Martin',
      city: 'Paris',
      country: 'France',
      startDate: '2020-01',
      endDate: '2023-12',
      description: 'Maintenance et réparation de véhicules légers',
      isNew: false,
    },
  ]);

  const [education, setEducation] = useState<Education[]>([]);

  const [sectors, setSectors] = useState<Sector[]>([
    { id: 1, category: '', subCategory: '', job: '' },
    { id: 2, category: '', subCategory: '', job: '' },
    { id: 3, category: '', subCategory: '', job: '' },
  ]);


  // Chargement langues depuis l'API.
  // Regle: 0 => decoche, 1 => coche, liste vide => tout decoche.
  useEffect(() => {
    const loadLangues = async () => {
      try {
        const data = await getLangues();

        const langInfo = Array.isArray(data)
          ? data[0]
          : data?.data?.[0] ?? data;

        if (!langInfo || Object.keys(langInfo).length === 0) {
          setLangues([]);
          return;
        }

        const selected = LANGUAGES.filter((label) => {
          const key = LANGUAGE_KEYS[label];
          return langInfo?.[key] === 1 || langInfo?.[key] === '1';
        });

        setLangues(selected);
      } catch (error) {
        setLangues([]);
      }
    };

    loadLangues();
  }, []);

  useEffect(() => {
    const loadInformations = async () => {
      try {
        const data = await getInformations();
        const info = Array.isArray(data)
          ? data[0]
          : data?.data?.[0] ?? data;

        if (!info) return;

        const rawPhoto = info.photo ?? '';

        setFormData((prev) => ({
          ...prev,
          photo: rawPhoto
            ? (rawPhoto.startsWith('http') || rawPhoto.startsWith('file:')
              ? rawPhoto
              : url() + "files/img_user/" + rawPhoto)
            : prev.photo,
          civility: info.civilite ?? prev.civility,
          firstName: info.prenom ?? prev.firstName,
          lastName: info.nom ?? prev.lastName,
          email: info.email ?? prev.email,
          phone: info.tel ?? prev.phone,
          postalCode: info.code_postal != null ? String(info.code_postal) : prev.postalCode,
          city: info.ville ?? prev.city,
          country: info.pays ?? prev.country,
          socialSecurity: info.num_secur_social ?? prev.socialSecurity,
        }));
      } catch (error) {
        return;
      }
    };

    loadInformations();
  }, []);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const data = await getImage();
        const imageUrl = data?.image
          ? url() + "files/img_user/" + data.image
          : '';

        if (imageUrl) {
          setFormData((prev) => ({
            ...prev,
            photo: imageUrl,
          }));
        }
      } catch (error) {
        return;
      }
    };

    loadImage();
  }, []);

  useEffect(() => {
    const loadMobilite = async () => {
      try {
        const [tout, user] = await Promise.all([
          getToutMobilite(),
          getMobiliteUser(),
        ]);

        const allOptions: MobiliteOption[] = Array.isArray(tout)
          ? tout
          : tout?.data || [];

        setMobilityOptions(
          allOptions.filter((item) => item?.deleted !== 1)
        );

        const userMobilite = user?.mobilite?.[0];
        const disponibiliteValue = user?.disponibilite;
        const disponibiliteChoice =
          disponibiliteValue === 1 || disponibiliteValue === '1' ? 'Oui' : 'Non';

        setFormData((prev) => ({
          ...prev,
          mobilityZone: userMobilite?.region ?? prev.mobilityZone,
          educationLevel: user?.niveau_etude ?? prev.educationLevel,
          experienceLevel: user?.experience ?? prev.experienceLevel,
          contract1: user?.contrat_prefere1 ?? prev.contract1,
          contract2: user?.contrat_prefere2 ?? prev.contract2,
          availabilityChoice: disponibiliteChoice,
          availabilityDate: user?.date_disponibilite ?? prev.availabilityDate,
        }));
      } catch (error) {
        return;
      }
    };

    loadMobilite();
  }, []);

  useEffect(() => {
    const loadPermis = async () => {
      try {
        const data = await getPermis();
        const permisInfo = Array.isArray(data)
          ? data[0]
          : data?.data?.[0] ?? data;

        if (!permisInfo) return;

        const nextPermits: string[] = [];
        const addIf = (key: string, label: string) => {
          if (permisInfo?.[key] === 1 || permisInfo?.[key] === '1') {
            nextPermits.push(label);
          }
        };

        addIf('perm_am', 'AM');
        addIf('perm_a1', 'A1');
        addIf('perm_a2', 'A2');
        addIf('perm_a', 'A');
        addIf('perm_b1', 'B1');
        addIf('perm_b', 'B');
        addIf('perm_c1', 'C1');
        addIf('perm_c', 'C');
        addIf('perm_d1', 'D1');
        addIf('perm_d', 'D');
        addIf('perm_be', 'BE');
        addIf('perm_c1e', 'C1E');
        addIf('perm_ce', 'CE');
        addIf('perm_d1e', 'D1E');
        addIf('perm_de', 'DE');
        addIf('perm_cotier', 'Permis côtier');
        addIf('perm_fluvial', 'Permis fluvial');
        addIf('perm_grandes_eaux', 'Permis eaux intérieures');
        addIf('perm_hauturier', 'Permis hauturier');

        setFormData((prev) => ({
          ...prev,
          permits: nextPermits,
        }));
      } catch (error) {
        return;
      }
    };

    loadPermis();
  }, []);

  // Chargement des experiences utilisateur.
  useEffect(() => {
    const loadExperiences = async () => {
      try {
        const data = await getExperiences();
        const items = Array.isArray(data) ? data : data?.data ?? [];

        const toMdYy = (value: string | null | undefined) => {
          if (!value) return '';
          const date = new Date(String(value));
          if (Number.isNaN(date.getTime())) return '';
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const yy = String(date.getFullYear()).slice(-2);
          return `${mm}/${dd}/${yy}`;
        };

        const mapped = items.map((item: any) => {
          const rawVillePays = String(item.ville_pays ?? '').trim();
          const [cityPart, countryPart] = rawVillePays.split(',').map((v) => v.trim());
          return {
            id: item.id ?? Date.now(),
            position: item.titre ?? '',
            company: item.societe ?? '',
            city: cityPart ?? '',
            country: item.pays ?? countryPart ?? '',
            startDate: toMdYy(item.date1),
            endDate: toMdYy(item.date2),
            description: item.description ?? '',
            isNew: false,
          } as Experience;
        });

        setExperiences(mapped);
      } catch (error) {
        return;
      }
    };

    loadExperiences();
  }, []);

  // Chargement des formations utilisateur.
  useEffect(() => {
    const loadFormations = async () => {
      try {
        const data = await getFormations();
        const items = Array.isArray(data) ? data : data?.data ?? [];

        const mapped = items.map((item: any) => ({
          id: item.id ?? Date.now(),
          school: item.ecole ?? '',
          degree: item.diplome ?? '',
          startMonth: item.mois_debut != null ? String(item.mois_debut).padStart(2, '0') : '',
          startYear: item.annee_debut != null ? String(item.annee_debut) : '',
          endMonth: item.mois_obtention != null ? String(item.mois_obtention).padStart(2, '0') : '',
          endYear: item.annee_obtention != null ? String(item.annee_obtention) : '',
          description: item.description ?? '',
          isNew: false,
        } as Education));

        setEducation(mapped);
      } catch (error) {
        return;
      }
    };

    loadFormations();
  }, []);

  // Chargement des secteurs depuis l'API (categories, sous-categories, metiers).
  useEffect(() => {
    const loadSecteurs = async () => {
      try {
        const data = await getSecteur();
        setSectorData({
          categories: data?.secteurs ?? [],
          subCategories: data?.sousCategories ?? [],
          jobs: data?.metiers ?? [],
        });
      } catch (error) {
        setSectorData({ categories: [], subCategories: [], jobs: [] });
      }
    };

    loadSecteurs();
  }, []);

  // Chargement des choix utilisateur (id_metier) et mapping vers categorie/sous-categorie/metier.
  useEffect(() => {
    const loadSecteurUser = async () => {
      try {
        if (!sectorData.jobs.length || !sectorData.subCategories.length || !sectorData.categories.length) {
          return;
        }

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

        const filled = mapped.length ? mapped : [{ id: Date.now(), category: '', subCategory: '', job: '' }];
        while (filled.length < 3) {
          filled.push({ id: Date.now() + filled.length, category: '', subCategory: '', job: '' });
        }

        setSectors(filled);
      } catch (error) {
        return;
      }
    };

    loadSecteurUser();
  }, [sectorData]);

  const toggleLangue = (label: string) => {
    setLangues((prev) => (
      prev.includes(label)
        ? prev.filter((x) => x !== label)
        : [...prev, label]
    ));
  };

  const handleSaveLangues = async () => {
    try {
      const selected = new Set(langues);
      const has = (label: string) => (selected.has(label) ? 1 : 0);

      await updateLangues(
        has('Français'),
        has('Anglais'),
        has('Espagnol'),
        has('Allemand'),
        has('Italien'),
        has('Chinois'),
        has('Polonais'),
        has('Danois'),
        has('Russe'),
        has('Arabe'),
        has('Néerlandais'),
        has('Portugais'),
        has('Norvégien'),
        has('Finnois')
      );

      Alert.alert('Enregistré', 'Langues enregistrées avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les langues.');
    }
  };

  const buildVillePays = (city: string, country: string) => {
    if (city && country) return `${city}, ${country}`;
    return city || country || '';
  };

  const toApiDate = (val: string) => {
    if (!val) return '';
    const [mm, dd, yy] = val.split('/');
    if (!mm || !dd || !yy) return val;
    const yearNum = Number(yy);
    const fullYear = yy.length === 4 ? yearNum : yearNum + 2000;
    return `${String(fullYear).padStart(4, '0')}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  };

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
          await addExperience(
            date1,
            date2,
            exp.position,
            exp.company,
            villePays,
            exp.country,
            exp.description
          );
        } else {
          await updateExperiences(
            exp.id,
            date1,
            date2,
            exp.position,
            exp.company,
            villePays,
            exp.country,
            exp.description
          );
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
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer l\'expérience.');
    }
  };

  const handleUpdateExperience = async (exp: Experience) => {
    try {
      const villePays = buildVillePays(exp.city, exp.country);

      const date1 = toApiDate(exp.startDate);
      const date2 = toApiDate(exp.endDate);

      if (exp.isNew) {
        await addExperience(
          date1,
          date2,
          exp.position,
          exp.company,
          villePays,
          exp.country,
          exp.description
        );
        setExperiences((p) => p.map((e) => (e.id === exp.id ? { ...e, isNew: false } : e)));
      } else {
        await updateExperiences(
          exp.id,
          date1,
          date2,
          exp.position,
          exp.company,
          villePays,
          exp.country,
          exp.description
        );
      }

      Alert.alert('Enregistré', 'Expérience mise à jour.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'expérience.');
    }
  };

  const toYearNumber = (val: string) => {
    if (!val) return null;
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  };

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
          await addFormation(
            edu.school,
            edu.degree,
            edu.startMonth,
            anneeDebut,
            edu.endMonth,
            anneeObtention,
            edu.description
          );
        } else {
          await updateFormation(
            edu.id,
            edu.school,
            edu.degree,
            edu.startMonth,
            anneeDebut,
            edu.endMonth,
            anneeObtention,
            edu.description
          );
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
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer la formation.');
    }
  };

  const handleUpdateFormation = async (edu: Education) => {
    try {
      const anneeDebut = toYearNumber(edu.startYear);
      const anneeObtention = toYearNumber(edu.endYear);

      if (edu.isNew) {
        await addFormation(
          edu.school,
          edu.degree,
          edu.startMonth,
          anneeDebut,
          edu.endMonth,
          anneeObtention,
          edu.description
        );
        setEducation((p) => p.map((e) => (e.id === edu.id ? { ...e, isNew: false } : e)));
      } else {
        await updateFormation(
          edu.id,
          edu.school,
          edu.degree,
          edu.startMonth,
          anneeDebut,
          edu.endMonth,
          anneeObtention,
          edu.description
        );
      }

      Alert.alert('Enregistré', 'Formation mise à jour.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la formation.');
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'identity':
        return (
          <IdentityTab
            formData={formData}
            setFormData={setFormData}
            photoUpload={photoUpload}
            setPhotoUpload={setPhotoUpload}
          />
        );
      case 'mobility':
        return (
          <MobilityTab
            formData={formData}
            setFormData={setFormData}
            mobilityOptions={mobilityOptions}
          />
        );
      case 'permits':
        return <PermitsTab formData={formData} setFormData={setFormData} />;
      case 'languages':
        return (
          <LanguagesTab
            langues={langues}
            onToggle={toggleLangue}
            onSave={handleSaveLangues}
          />
        );
      case 'sectors':
        return (
          <SectorsTab
            sectors={sectors}
            setSectors={setSectors}
            sectorData={sectorData}
            onSave={async () => {
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
            }}
          />
        );
      case 'experience':
        return (
          <ExperienceTab
            experiences={experiences}
            setExperiences={setExperiences}
            onSave={handleSaveExperiences}
            onDelete={handleDeleteExperience}
            onUpdate={handleUpdateExperience}
          />
        );
      case 'education':
        return (
          <EducationTab
            education={education}
            setEducation={setEducation}
            onSave={handleSaveFormations}
            onDelete={handleDeleteFormation}
            onUpdate={handleUpdateFormation}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key ? styles.tabBtnActive : undefined]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key ? styles.tabTextActive : undefined]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderTab()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  tabBar: {
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tabScroll: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: C.gray100,
  },
  tabBtnActive: {
    backgroundColor: C.blueDark,
  },
  tabText: {
    fontSize: 12,
    color: C.gray700,
    fontWeight: '500',
  },
  tabTextActive: {
    color: C.white,
  },
  scrollView: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.navy,
    lineHeight: 20,
    flexShrink: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitleIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitlePlain: {
    fontSize: 15,
    fontWeight: '600',
    color: C.blueDark,
    flex: 1,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    color: C.gray700,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: C.borderLight,
    backgroundColor: C.inputBg,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 14,
    color: C.navy,
  },
  inputMultiline: {
    borderRadius: 12,
    paddingTop: 12,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  photoContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.borderLight,
    backgroundColor: C.bg,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  photoBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(238, 243, 255, 0.7)',
  },
  photoHint: {
    fontSize: 13,
    color: C.textMuted,
  },
  btnImport: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: C.blue,
  },
  btnImportText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '500',
  },
  btnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: C.accentDelete,
  },
  btnDeleteText: {
    color: C.deleteText,
    fontSize: 13,
    fontWeight: '500',
  },
  civilityBtn: {
    borderWidth: 1,
    borderColor: C.borderLight,
    backgroundColor: '#fff8f0',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  civilityBtnActive: {
    borderColor: C.blue,
    backgroundColor: C.accent,
  },
  civilityText: {
    fontSize: 14,
    color: C.textMuted,
  },
  civilityTextActive: {
    color: C.navy,
    fontWeight: '500',
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.white,
  },
  selectText: {
    fontSize: 14,
    color: C.navy,
    flex: 1,
  },
  selectPlaceholder: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: C.white,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  dropdownItemText: {
    fontSize: 14,
    color: C.gray700,
  },
  dropdownItemActive: {
    color: C.blue,
    fontWeight: '600',
  },
  checkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkGrid2: {
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 8,
    minWidth: 72,
  },
  checkItemWide: {
    width: '100%',
  },
  checkItemChecked: {
    borderColor: C.blueDark,
    backgroundColor: '#eff6ff',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: C.blueDark,
    borderColor: C.blueDark,
  },
  checkLabel: {
    fontSize: 13,
    color: C.gray700,
    flex: 1,
  },
  checkLabelActive: {
    color: C.navy,
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.blueBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  addBtnText: {
    fontSize: 13,
    color: C.blueDark,
    fontWeight: '500',
  },
  deleteBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteBtnText: {
    fontSize: 13,
    color: C.red,
  },
  saveContainer: {
    marginTop: 8,
    paddingBottom: 8,
  },
  saveBtn: {
    backgroundColor: C.blueDark,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '600',
  },
  sectorColumn: {
    gap: 14,
  },
});