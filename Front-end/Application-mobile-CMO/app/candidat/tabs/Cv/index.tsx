import { ChevronDown } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { EducationTab } from './EducationTab';
import { ExperienceTab } from './ExperienceTab';
import { IdentityTab } from './IdentityTab';
import { LanguagesTab } from './LanguagesTab';
import { MobilityTab } from './MobilityTab';
import { PermitsTab } from './PermitsTab';
import { SectorsTab } from './SectorsTab';
import { C } from './colors';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Experience {
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

export interface Education {
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

export interface Sector {
  id: number;
  category: string;
  subCategory: string;
  job: string;
}

export type TabKey =
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

export { C } from './colors';

// ─── Tab Dropdown Selector ────────────────────────────────────────────────────

const TabDropdownSelector = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabKey;
  setActiveTab: (key: TabKey) => void;
}) => {
  const buttonRef = useRef<View>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const animValue = useRef(new Animated.Value(0)).current;

  const activeLabel = TABS.find((t) => t.key === activeTab)?.label ?? '';

  const openDropdown = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setModalVisible(true);
      setIsOpen(true);
      requestAnimationFrame(() => {
        Animated.timing(animValue, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    });
  };

  const closeDropdown = () => {
    setIsOpen(false);
    Animated.timing(animValue, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setModalVisible(false);
    });
  };

  const toggleDropdown = () => {
    if (isOpen) closeDropdown();
    else openDropdown();
  };

  const handleSelect = (key: TabKey) => {
    setActiveTab(key);
    closeDropdown();
  };

  const chevronRotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const dropdownOpacity = animValue;
  const dropdownTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 0],
  });
  const dropdownScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });

  return (
    <View style={styles.tabSelectorWrap}>
      <TouchableOpacity
        ref={buttonRef}
        activeOpacity={0.85}
        style={styles.tabSelectorBtn}
        onPress={toggleDropdown}
      >
        <Text style={styles.tabSelectorBtnText}>{activeLabel}</Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <ChevronDown size={18} color={C.white} />
        </Animated.View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeDropdown}
        statusBarTranslucent
      >
        <Pressable style={styles.tabSelectorOverlay} onPress={closeDropdown}>
          <Animated.View
            style={[
              styles.tabSelectorDropdown,
              {
                position: 'absolute',
                top: anchor.y + anchor.height + 8,
                left: anchor.x,
                width: anchor.width,
                opacity: dropdownOpacity,
                transform: [
                  { translateY: dropdownTranslateY },
                  { scale: dropdownScale },
                ],
              },
            ]}
          >
            {TABS.map((tab, index) => {
              const isActive = tab.key === activeTab;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tabSelectorItem,
                    index === TABS.length - 1 ? styles.tabSelectorItemLast : undefined,
                    isActive ? styles.tabSelectorItemActive : undefined,
                  ]}
                  activeOpacity={0.6}
                  onPress={() => handleSelect(tab.key)}
                >
                  <Text style={[
                    styles.tabSelectorItemText,
                    isActive ? styles.tabSelectorItemTextActive : undefined,
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CVScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('identity');
  const scrollRef = useRef<ScrollView>(null);
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
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [langues, setLangues] = useState<string[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [activeTab]);

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
          />
        );
      case 'permits':
        return (
          <PermitsTab
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 'languages':
        return (
          <LanguagesTab
            langues={langues}
            setLangues={setLangues}
          />
        );
      case 'sectors':
        return (
          <SectorsTab
            sectors={sectors}
            setSectors={setSectors}
          />
        );
      case 'experience':
        return (
          <ExperienceTab
            experiences={experiences}
            setExperiences={setExperiences}
          />
        );
      case 'education':
        return (
          <EducationTab
            education={education}
            setEducation={setEducation}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TabDropdownSelector
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          ref={scrollRef}
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
  safeArea: { flex: 1, backgroundColor: C.bg },
  keyboardAvoid: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 120 },
  tabSelectorWrap: {
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.blueDark,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  tabSelectorBtnText: { color: C.white, fontSize: 15, fontWeight: '600' },
  tabSelectorOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.18)' },
  tabSelectorDropdown: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 4,
    overflow: 'hidden',
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  tabSelectorItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  tabSelectorItemActive: {
    backgroundColor: C.blueBg,
    borderLeftWidth: 4,
    borderLeftColor: C.blue,
    paddingLeft: 14,
  },
  tabSelectorItemLast: { borderBottomWidth: 0 },
  tabSelectorItemText: { fontSize: 14, color: C.gray700, fontWeight: '500' },
  tabSelectorItemTextActive: { color: C.blue, fontWeight: '600' },
});