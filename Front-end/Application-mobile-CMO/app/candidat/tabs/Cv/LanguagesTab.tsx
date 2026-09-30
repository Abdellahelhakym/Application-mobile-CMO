import { Globe } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { getLangues, updateLangues } from "@/app/candidat/services/CVScreen";
import { C } from './colors';
import { Card, CheckItem, SectionSaveButton, SectionTitle, SectionWarning } from './utils';

const LANGUAGES = [
  'Allemand', 'Anglais', 'Arabe', 'Chinois', 'Danois', 
  'Espagnol', 'Finnois', 'Français', 'Italien', 'Néerlandais', 
  'Norvégien', 'Polonais', 'Portugais', 'Russe'
] as const;

type LanguageType = typeof LANGUAGES[number];

const LANGUAGE_CONFIG: Record<string, { langKey: string; levelKey: string }> = {
  Allemand: { langKey: 'lang_de', levelKey: 'niveau_de' },
  Anglais: { langKey: 'lang_en', levelKey: 'niveau_en' },
  Arabe: { langKey: 'lang_ar', levelKey: 'niveau_ar' },
  Chinois: { langKey: 'lang_ch', levelKey: 'niveau_ch' },
  Danois: { langKey: 'lang_da', levelKey: 'niveau_da' },
  Espagnol: { langKey: 'lang_es', levelKey: 'niveau_es' },
  Finnois: { langKey: 'lang_fi', levelKey: 'niveau_fi' },
  Français: { langKey: 'lang_fr', levelKey: 'niveau_fr' },
  Italien: { langKey: 'lang_it', levelKey: 'niveau_it' },
  Néerlandais: { langKey: 'lang_ne', levelKey: 'niveau_ne' },
  Norvégien: { langKey: 'lang_no', levelKey: 'niveau_no' },
  Polonais: { langKey: 'lang_po', levelKey: 'niveau_po' },
  Portugais: { langKey: 'lang_por', levelKey: 'niveau_por' },
  Russe: { langKey: 'lang_ru', levelKey: 'niveau_ru' },
};

interface CustomSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

// 🎚️ Composant Slider officiel, simple et très fluide
const NativeSlider: React.FC<CustomSliderProps> = ({ label, value, onChange }) => {
  return (
    <View style={styles.sliderCard}>
      <Text style={styles.sliderTitle}>Score {label}</Text>

      <Slider
        style={{ width: '100%', height: 35 }}
        minimumValue={0}
        maximumValue={10}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={C.blue || '#2563EB'}
        maximumTrackTintColor="#E5E7EB"
        thumbTintColor={C.blue || '#2563EB'}
      />

      <Text style={styles.scoreText}>{value}/10</Text>
    </View>
  );
};

interface LanguagesTabProps {
  langues: string[];
  setLangues: React.Dispatch<React.SetStateAction<string[]>>;
}

export const LanguagesTab: React.FC<LanguagesTabProps> = ({ langues, setLangues }) => {
  const [niveaux, setNiveaux] = useState<Record<string, number>>({});

  useEffect(() => {
    loadLangues();
  }, []);

  const loadLangues = async () => {
    try {
      const data = await getLangues();
      const langInfo = Array.isArray(data) ? data[0] : data?.data?.[0] ?? data;

      if (!langInfo || Object.keys(langInfo).length === 0) {
        setLangues([]);
        setNiveaux({});
        return;
      }

      const selected: string[] = [];
      const loadedNiveaux: Record<string, number> = {};

      LANGUAGES.forEach((label) => {
        const config = LANGUAGE_CONFIG[label];
        if (!config) return;

        const isChecked = langInfo?.[config.langKey] === 1 || langInfo?.[config.langKey] === '1';

        if (isChecked) {
          selected.push(label);
        }
        loadedNiveaux[label] = Number(langInfo?.[config.levelKey] ?? 0);
      });

      setLangues(selected);
      setNiveaux(loadedNiveaux);
    } catch (error) {
      console.log('Erreur chargement langues:', error);
      setLangues([]);
      setNiveaux({});
    }
  };

  const toggleLangue = (label: string) => {
    setLangues((prev) =>
      prev.includes(label)
        ? prev.filter((x) => x !== label)
        : [...prev, label]
    );
  };

  const handleNiveauChange = (label: string, value: number) => {
    setNiveaux((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const handleSaveLangues = async () => {
    try {
      const selected = new Set(langues);
      const payload: Record<string, number> = {};

      LANGUAGES.forEach((label) => {
        const config = LANGUAGE_CONFIG[label];
        if (!config) return;

        const isSelected = selected.has(label);

        payload[config.langKey] = isSelected ? 1 : 0;
        payload[config.levelKey] = isSelected ? (niveaux[label] ?? 0) : 0;
      });

      await updateLangues(payload);

      Alert.alert('Enregistré', 'Langues et niveaux enregistrés avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les langues.');
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <Card>
        <SectionTitle icon={<Globe size={18} color={C.blue} />}>
          {'Langues'}
        </SectionTitle>

        <View style={styles.checkGrid}>
          {LANGUAGES.map((lang) => {
            const isChecked = langues.includes(lang);
            const currentLevel = niveaux[lang] ?? 0;

            return (
              <View key={lang} style={styles.langItemContainer}>
                <CheckItem
                  label={lang}
                  checked={isChecked}
                  onToggle={() => toggleLangue(lang)}
                  wide
                />

                {isChecked && (
                  <NativeSlider
                    label={lang}
                    value={currentLevel}
                    onChange={(val) => handleNiveauChange(lang, val)}
                  />
                )}
              </View>
            );
          })}
        </View>
      </Card>

      <SectionWarning />
      <SectionSaveButton
        label={'Sauvegarder les langues'}
        onPress={handleSaveLangues}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  checkGrid: { gap: 14 },
  langItemContainer: { gap: 8 },
  sliderCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  sliderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.blue || '#1D4ED8',
  },
  scoreText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
});