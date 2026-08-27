import { Globe } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { getLangues, updateLangues } from "@/app/candidat/services/CVScreen";
import { C } from './colors';
import { Card, CheckItem, SectionSaveButton, SectionTitle } from './utils';

const LANGUAGES = ['Allemand', 'Anglais', 'Arabe', 'Chinois', 'Danois', 'Espagnol', 'Finnois', 'Français', 'Italien', 'Néerlandais', 'Norvégien', 'Polonais', 'Portugais', 'Russe'];
const LANGUAGE_KEYS: Record<string, string> = {
  Allemand: 'lang_de', Anglais: 'lang_en', Arabe: 'lang_ar', Chinois: 'lang_ch',
  Danois: 'lang_da', Espagnol: 'lang_es', Finnois: 'lang_fi', Français: 'lang_fr',
  Italien: 'lang_it', Néerlandais: 'lang_ne', Norvégien: 'lang_no', Polonais: 'lang_po',
  Portugais: 'lang_por', Russe: 'lang_ru',
};

interface LanguagesTabProps {
  langues: string[];
  setLangues: React.Dispatch<React.SetStateAction<string[]>>;
}

export const LanguagesTab = ({ langues, setLangues }: LanguagesTabProps) => {
  // 📱 Charger les langues au montage
  useEffect(() => {
    loadLangues();
  }, []);

  const loadLangues = async () => {
    try {
      const data = await getLangues();
      const langInfo = Array.isArray(data) ? data[0] : data?.data?.[0] ?? data;

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
      console.log('Erreur chargement langues:', error);
      setLangues([]);
    }
  };

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
        has('Français'), has('Anglais'), has('Espagnol'), has('Allemand'),
        has('Italien'), has('Chinois'), has('Polonais'), has('Danois'),
        has('Russe'), has('Arabe'), has('Néerlandais'), has('Portugais'),
        has('Norvégien'), has('Finnois')
      );

      Alert.alert('Enregistré', 'Langues enregistrées avec succès.');
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
          {LANGUAGES.map((lang) => (
            <CheckItem
              key={lang}
              label={lang}
              checked={langues.includes(lang)}
              onToggle={() => toggleLangue(lang)}
              wide
            />
          ))}
        </View>
      </Card>

      <SectionSaveButton
        label={'Sauvegarder les langues'}
        onPress={handleSaveLangues}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  checkGrid: { gap: 8 },
});