import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Phone, MessageSquare } from 'lucide-react-native';
import { getEmployerInfo, updateEmployerInfo } from '@/app/employeur/services/EmployerInfoScreen';

interface EmployerInfoScreenProps {
  onBack?: () => void;
}

export default function EmployerInfoScreen({ onBack }: EmployerInfoScreenProps) {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const fetchEmployerData = async () => {
      try {
        const response = await getEmployerInfo();

        if (mounted && response) {
          setFormData(response);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des infos de l'employeur :", error);
        Alert.alert('Erreur', 'Impossible de récupérer vos informations.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchEmployerData();
    return () => { mounted = false; };
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData) return;

    setLoading(true);
    try {
      const result = await updateEmployerInfo(formData);
      if (result?.success || result?.status === 'success') {
        Alert.alert('Succès', 'Vos informations ont bien été modifiées.');
      } else {
        Alert.alert('Erreur', result?.message || 'Impossible de modifier vos informations.');
      }
    } catch (error) {
      console.error('Erreur de mise à jour :', error);
      Alert.alert('Erreur', 'Impossible de modifier vos informations.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerLoader]}>
        <ActivityIndicator size="large" color="#2b5bbb" />
      </View>
    );
  }
  

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.label}>
            importer votre logo : <Text style={{ color: 'red' }}>(*)</Text>
          </Text>

          {/* Pas de input file en React Native */}
          <View style={styles.fakeInput}>
            <Text>{formData.logo ? 'Fichier sélectionné' : 'Sélectionner un fichier'}</Text>
          </View>

          <Text style={styles.label}>
            Raison social : <Text style={{ color: 'red' }}>(*)</Text>
          </Text>
          <TextInput
            value={formData?.raison_social || ''}
            onChangeText={(v) => handleChange('raison_social', v)}
            style={styles.input}
          />

          <Text style={styles.label}>
            Prenom du responsable : <Text style={{ color: 'red' }}>(*)</Text>
          </Text>
          <TextInput
            value={formData?.prenom_responsable || ''}
            onChangeText={(v) => handleChange('prenom_responsable', v)}
            style={styles.input}
          />

          <Text style={styles.label}>
            Nom du responsable : <Text style={{ color: 'red' }}>(*)</Text>
          </Text>
          <TextInput
            value={formData?.responsable || ''}
            onChangeText={(v) => handleChange('responsable', v)}
            style={styles.input}
          />

          <Text style={styles.label}>Siren :</Text>
          <TextInput
            value={formData?.siren || ''}
            onChangeText={(v) => handleChange('siren', v)}
            style={styles.input}
            placeholder="Siren"
            placeholderTextColor="#7a8ab8"
          />

          <Text style={styles.label}>Siret :</Text>
          <TextInput
            value={formData?.siret || ''}
            onChangeText={(v) => handleChange('siret', v)}
            style={styles.input}
            placeholder="Siret"
            placeholderTextColor="#7a8ab8"
          />

          <Text style={styles.label}>N° de téléphone 1 : <Text style={{ color: 'red' }}>(*)</Text></Text>
          <TextInput
            value={formData?.num_tel || ''}
            onChangeText={(v) => handleChange('num_tel', v)}
            style={styles.input}
            placeholder="Téléphone 1"
            placeholderTextColor="#7a8ab8"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>N° de téléphone 2 :</Text>
          <TextInput
            value={formData?.num_tel2 || ''}
            onChangeText={(v) => handleChange('num_tel2', v)}
            style={styles.input}
            placeholder="Téléphone 2"
            placeholderTextColor="#7a8ab8"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Adresse email 1 : <Text style={{ color: 'red' }}>(*)</Text></Text>
          <TextInput
            value={formData?.email || ''}
            onChangeText={(v) => handleChange('email', v)}
            style={styles.input}
            placeholder="Email 1"
            placeholderTextColor="#7a8ab8"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Adresse email 2 :</Text>
          <TextInput
            value={formData?.email2 || ''}
            onChangeText={(v) => handleChange('email2', v)}
            style={styles.input}
            placeholder="Email 2"
            placeholderTextColor="#7a8ab8"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Adresse Postale:</Text>
          <TextInput
            value={formData?.adresse || ''}
            onChangeText={(v) => handleChange('adresse', v)}
            style={[styles.input, styles.inputHighlight]}
            placeholder="Adresse"
            placeholderTextColor="#7a8ab8"
          />

          <Text style={styles.label}>Code postal :</Text>
          <TextInput
            value={formData?.code_postal ? String(formData.code_postal) : ''}
            onChangeText={(v) => handleChange('code_postal', v)}
            style={styles.input}
            placeholder="10000"
            placeholderTextColor="#7a8ab8"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Ville :</Text>
          <TextInput
            value={formData?.ville || ''}
            onChangeText={(v) => handleChange('ville', v)}
            style={[styles.input, styles.inputHighlight]}
            placeholder="Ville"
            placeholderTextColor="#7a8ab8"
          />

          <Text style={styles.label}>Pays :</Text>
          <TextInput
            value={formData?.pays_origine || ''}
            onChangeText={(v) => handleChange('pays_origine', v)}
            style={styles.input}
            placeholder="France"
            placeholderTextColor="#7a8ab8"
          />
        </View>
      </ScrollView>

      {/* Bouton Ajouter les informations en bas */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Modifier les informations</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff'
  },
  centerLoader: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 20
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e9fb'
  },
  label: {
    fontSize: 14,
    color: '#1b2d5a',
    marginTop: 12,
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: '#cfd9ee',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 6,
    color: '#1b2d5a',
    backgroundColor: '#fff'
  },
  inputHighlight: {
    borderColor: '#2b5bbb',
    backgroundColor: '#f6f8ff',
    color: '#2b5bbb',
    fontWeight: '500'
  },
  fakeInput: {
    borderWidth: 1,
    borderColor: '#cfd9ee',
    borderRadius: 20,
    padding: 12,
    marginTop: 6,
    backgroundColor: '#fff'
  },
  bottomContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e1e9fb'
  },
  submitBtn: {
    backgroundColor: '#2b5bbb',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});