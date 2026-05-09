import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import {
  Camera,
  User,
  ChevronDown,
  ChevronUp,
  Check,
  Upload,
  Trash2,
  Briefcase,
  GraduationCap,
  Save,
  MapPin,
  Globe,
  Car,
  Plus,
} from 'lucide-react-native';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Experience {
  id: number;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
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
  { key: 'identity', label: 'Identité' },
  { key: 'mobility', label: 'Mobilité' },
  { key: 'permits', label: 'Permis' },
  { key: 'languages', label: 'Langues' },
  { key: 'sectors', label: 'Secteurs' },
  { key: 'experience', label: 'Expériences' },
  { key: 'education', label: 'Formation' },
];

const PERMITS = ['AM','A1','A2','A','B1','B','C1','C','D1','D','BE','C1E','CE','D1E','DE'];
const NAUTIC_PERMITS = ['Permis côtier','Permis fluvial','Permis eaux intérieures','Permis hauturier'];
const LANGUAGES = ['Français','Anglais','Allemand','Espagnol','Italien','Arabe','Portugais','Néerlandais','Polonais','Russe','Danois','Norvégien','Finnois','Chinois'];
const SECTORS = ['Agriculture','BTP','Transport','Logistique','Industrie','Services','Santé','Commerce','Hôtellerie-Restauration'];
const CONTRACT_OPTIONS = ['','CDI','CDD','Intérim','Saisonnier','Alternance'];
const EDUCATION_LEVELS = ['','Sans diplôme','CAP / BEP','Bac','Bac +2','Bac +3','Bac +5 et plus'];
const AVAILABILITY_OPTIONS = ['','Immédiate','1 semaine','2 semaines','1 mois','2 mois','3 mois'];

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

// ✅ icon prop is always React.ReactNode — never a raw emoji string
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
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const set = (key: string) => (v: string) =>
    setFormData((p: any) => ({ ...p, [key]: v }));

  return (
    <View style={{ gap: 16 }}>
      <Card>
        <SectionTitle icon={<Camera size={18} color={C.blue} />}>
          {'Photo de profil'}
        </SectionTitle>
        <View style={styles.photoContainer}>
          <View style={styles.photoBox}>
            {formData.photo
              ? <Image source={{ uri: formData.photo }} style={styles.photoImage} />
              : <Camera size={28} color={C.blue} />
            }
          </View>
          <Text style={styles.photoHint}>{'Télécharger votre photo'}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={styles.btnImport}
              onPress={() => Alert.alert('Import', 'Sélectionner une photo depuis la galerie')}
            >
              <Upload size={16} color={C.white} />
              <Text style={styles.btnImportText}>{'Importer'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnDelete}
              onPress={() => setFormData((p: any) => ({ ...p, photo: '' }))}
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

        <Label>{'Ville'}</Label>
        <InputField value={formData.city} onChangeText={set('city')} />

        <Label>{'Numéro de sécurité sociale'}</Label>
        <InputField value={formData.socialSecurity} onChangeText={set('socialSecurity')} />
      </Card>
    </View>
  );
};

const MobilityTab = ({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const set = (key: string) => (v: string) =>
    setFormData((p: any) => ({ ...p, [key]: v }));

  return (
    <Card>
      <SectionTitle icon={<MapPin size={18} color={C.blue} />}>
        {'Mobilité & Profil'}
      </SectionTitle>

      <Label>{'Zone de mobilité'}</Label>
      <InputField
        value={formData.mobilityZone}
        onChangeText={set('mobilityZone')}
        placeholder="Ex: Île-de-France, National, International"
      />

      <Label>{"Niveau d'étude"}</Label>
      <SelectPicker value={formData.educationLevel} options={EDUCATION_LEVELS} onChange={set('educationLevel')} />

      <View style={{ height: 12 }} />
      <Label>{'Contrat préféré 1'}</Label>
      <SelectPicker value={formData.contract1} options={CONTRACT_OPTIONS} onChange={set('contract1')} />

      <View style={{ height: 12 }} />
      <Label>{'Contrat préféré 2'}</Label>
      <SelectPicker value={formData.contract2} options={CONTRACT_OPTIONS} onChange={set('contract2')} />

      <View style={{ height: 12 }} />
      <Label>{'Disponibilité'}</Label>
      <SelectPicker value={formData.availability} options={AVAILABILITY_OPTIONS} onChange={set('availability')} />
    </Card>
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
    </View>
  );
};

const LanguagesTab = ({ formData, setFormData }: { formData: any; setFormData: any }) => {
  const toggle = (lang: string) => {
    setFormData((p: any) => ({
      ...p,
      languages: p.languages.includes(lang)
        ? p.languages.filter((x: string) => x !== lang)
        : [...p.languages, lang],
    }));
  };

  return (
    <Card>
      <SectionTitle icon={<Globe size={18} color={C.blue} />}>
        {'Langues'}
      </SectionTitle>
      <View style={styles.checkGrid2}>
        {LANGUAGES.map((l) => (
          <CheckItem
            key={l}
            label={l}
            checked={formData.languages.includes(l)}
            onToggle={() => toggle(l)}
            wide
          />
        ))}
      </View>
    </Card>
  );
};

const SectorsTab = ({ formData, setFormData }: { formData: any; setFormData: any }) => {
  const set = (key: string) => (v: string) =>
    setFormData((p: any) => ({ ...p, [key]: v }));

  return (
    <Card>
      <SectionTitle icon={<Briefcase size={18} color={C.blue} />}>
        {"Secteurs d'activité"}
      </SectionTitle>

      <Label>{"Secteur d'activité 1"}</Label>
      <SelectPicker value={formData.sector1} options={['', ...SECTORS]} onChange={set('sector1')} />

      <View style={{ height: 12 }} />
      <Label>{"Secteur d'activité 2"}</Label>
      <SelectPicker value={formData.sector2} options={['', ...SECTORS]} onChange={set('sector2')} />

      <View style={{ height: 12 }} />
      <Label>{"Secteur d'activité 3"}</Label>
      <SelectPicker value={formData.sector3} options={['', ...SECTORS]} onChange={set('sector3')} />
    </Card>
  );
};

const ExperienceTab = ({
  experiences,
  setExperiences,
}: {
  experiences: Experience[];
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
}) => {
  const add = () =>
    setExperiences((p) => [
      ...p,
      { id: Date.now(), position: '', company: '', location: '', startDate: '', endDate: '', description: '' },
    ]);

  const update = (id: number, key: keyof Experience, value: string) =>
    setExperiences((p) => p.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const remove = (id: number) => setExperiences((p) => p.filter((e) => e.id !== id));

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

          <Label>{'Ville / Pays'}</Label>
          <InputField value={exp.location} onChangeText={(v) => update(exp.id, 'location', v)} placeholder="Ex: Paris, France" />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Label>{'Date de début'}</Label>
              <InputField value={exp.startDate} onChangeText={(v) => update(exp.id, 'startDate', v)} placeholder="AAAA-MM" />
            </View>
            <View style={{ flex: 1 }}>
              <Label>{'Date de fin'}</Label>
              <InputField value={exp.endDate} onChangeText={(v) => update(exp.id, 'endDate', v)} placeholder="AAAA-MM" />
            </View>
          </View>

          <Label>{'Description'}</Label>
          <InputField value={exp.description} onChangeText={(v) => update(exp.id, 'description', v)} placeholder="Décrivez vos missions..." multiline numberOfLines={3} />

          <TouchableOpacity style={styles.deleteBtn} onPress={() => remove(exp.id)}>
            <Trash2 size={16} color={C.red} />
            <Text style={styles.deleteBtnText}>{'Supprimer'}</Text>
          </TouchableOpacity>
        </Card>
      ))}
    </View>
  );
};

const EducationTab = ({
  education,
  setEducation,
}: {
  education: Education[];
  setEducation: React.Dispatch<React.SetStateAction<Education[]>>;
}) => {
  const add = () =>
    setEducation((p) => [
      ...p,
      { id: Date.now(), school: '', degree: '', startDate: '', endDate: '', description: '' },
    ]);

  const update = (id: number, key: keyof Education, value: string) =>
    setEducation((p) => p.map((e) => (e.id === id ? { ...e, [key]: value } : e)));

  const remove = (id: number) => setEducation((p) => p.filter((e) => e.id !== id));

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
              <Label>{'Date de début'}</Label>
              <InputField value={edu.startDate} onChangeText={(v) => update(edu.id, 'startDate', v)} placeholder="AAAA-MM" />
            </View>
            <View style={{ flex: 1 }}>
              <Label>{"Date d'obtention"}</Label>
              <InputField value={edu.endDate} onChangeText={(v) => update(edu.id, 'endDate', v)} placeholder="AAAA-MM" />
            </View>
          </View>

          <Label>{'Description'}</Label>
          <InputField value={edu.description} onChangeText={(v) => update(edu.id, 'description', v)} placeholder="Détails supplémentaires..." multiline numberOfLines={2} />

          <TouchableOpacity style={styles.deleteBtn} onPress={() => remove(edu.id)}>
            <Trash2 size={16} color={C.red} />
            <Text style={styles.deleteBtnText}>{'Supprimer'}</Text>
          </TouchableOpacity>
        </Card>
      ))}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CVScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('identity');

  const [formData, setFormData] = useState({
    civility: 'Monsieur',
    firstName: 'Abdellah',
    lastName: 'El Hakym',
    email: 'abdellah5420@gmail.com',
    phone: '0650195273',
    phone2: '',
    address: '',
    city: '',
    socialSecurity: '',
    photo: '',
    mobilityZone: '',
    educationLevel: '',
    contract1: '',
    contract2: '',
    availability: '',
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
      location: 'Paris, France',
      startDate: '2020-01',
      endDate: '2023-12',
      description: 'Maintenance et réparation de véhicules légers',
    },
  ]);

  const [education, setEducation] = useState<Education[]>([
    {
      id: 1,
      school: 'Lycée professionnel',
      degree: 'CAP Mécanique',
      startDate: '2018-09',
      endDate: '2019-06',
      description: '',
    },
  ]);

  const renderTab = () => {
    switch (activeTab) {
      case 'identity':
        return <IdentityTab formData={formData} setFormData={setFormData} />;
      case 'mobility':
        return <MobilityTab formData={formData} setFormData={setFormData} />;
      case 'permits':
        return <PermitsTab formData={formData} setFormData={setFormData} />;
      case 'languages':
        return <LanguagesTab formData={formData} setFormData={setFormData} />;
      case 'sectors':
        return <SectorsTab formData={formData} setFormData={setFormData} />;
      case 'experience':
        return <ExperienceTab experiences={experiences} setExperiences={setExperiences} />;
      case 'education':
        return <EducationTab education={education} setEducation={setEducation} />;
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderTab()}

        <View style={styles.saveContainer}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => Alert.alert('Enregistré', 'Votre CV a été enregistré avec succès.')}
          >
            <Save size={18} color={C.white} />
            <Text style={styles.saveBtnText}>{'Enregistrer mon CV'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  photoImage: {
    width: '100%',
    height: '100%',
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
});