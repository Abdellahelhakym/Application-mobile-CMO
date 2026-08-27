import { Car } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { getPermis, updatePermis } from "@/app/candidat/services/CVScreen";
import { C } from './colors';
import { Card, CheckItem, SectionSaveButton, SectionTitle } from './utils';

const PERMITS = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'D', 'BE', 'C1E', 'CE', 'D1E', 'DE'];
const NAUTIC_PERMITS = ['Permis côtier', 'Permis fluvial', 'Permis eaux intérieures', 'Permis hauturier'];

interface PermitsTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const PermitsTab = ({ formData, setFormData }: PermitsTabProps) => {
  // 📱 Charger les permis au montage
  useEffect(() => {
    loadPermis();
  }, []);

  const loadPermis = async () => {
    try {
      const data = await getPermis();
      const permisInfo = Array.isArray(data) ? data[0] : data?.data?.[0] ?? data;

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

      setFormData((prev: any) => ({
        ...prev,
        permits: nextPermits,
      }));
    } catch (error) {
      console.log('Erreur chargement permis:', error);
    }
  };

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
        has('AM'), has('A1'), has('A2'), has('A'), has('B1'), has('B'),
        has('C1'), has('C'), has('D1'), has('D'), has('BE'), has('C1E'),
        has('CE'), has('D1E'), has('DE'), has('Permis côtier'),
        has('Permis fluvial'), has('Permis eaux intérieures'), has('Permis hauturier')
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

const styles = StyleSheet.create({
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});