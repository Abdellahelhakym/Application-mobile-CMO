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
import { getEmployerInfo } from '@/app/employeur/services/EmployerInfoScreen';

interface EmployerInfoScreenProps {
  onBack?: () => void;
}

export default function EmployerInfoScreen({ onBack }: EmployerInfoScreenProps) {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    logo: '',
    companyName: '',
    firstName: '',
    lastName: '',
    siren: '',
    siret: '',
    address: '',
    postalCode: '',
    city: '',
    country: ''
  });

  // Appel de l'API au chargement du composant
  useEffect(() => {
    let mounted = true;

    const fetchEmployerData = async () => {
      try {
        const response = await getEmployerInfo();
        
        if (mounted && response) {
          setFormData({
            logo: response.photo || '',
            companyName: response.raison_social || '',
            firstName: response.prenom_responsable || '',
            lastName: response.responsable || '', // 'responsable' correspond au nom dans ton objet API
            siren: response.siren || '',
            siret: response.siret || '',
            address: response.adresse || '',
            postalCode: response.code_postal ? String(response.code_postal) : '',
            city: response.ville || '',
            country: response.pays_origine || 'France'
          });
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('Données soumises :', formData);
    // Tu peux appeler ici ta fonction de mise à jour (ex: updateEmployerInfo)
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
            value={formData.companyName}
            onChangeText={(v) => handleChange('companyName', v)}
            style={styles.input}
          />

          <Text style={styles.label}>
            Prenom du responsable : <Text style={{ color: 'red' }}>(*)</Text>
          </Text>
          <TextInput
            value={formData.firstName}
            onChangeText={(v) => handleChange('firstName', v)}
            style={styles.input}
          />

          <Text style={styles.label}>
            Nom du responsable : <Text style={{ color: 'red' }}>(*)</Text>
          </Text>
          <TextInput
            value={formData.lastName}
            onChangeText={(v) => handleChange('lastName', v)}
            style={styles.input}
          />

          <Text style={styles.label}>Siren :</Text>
          <TextInput
            value={formData.siren}
            onChangeText={(v) => handleChange('siren', v)}
            style={styles.input}
            placeholder="Siren"
            placeholderTextColor="#7a8ab8"
          />

          <Text style={styles.label}>Siret :</Text>
          <TextInput
            value={formData.siret}
            onChangeText={(v) => handleChange('siret', v)}
            style={styles.input}
            placeholder="Siret"
            placeholderTextColor="#7a8ab8"
          />

          <Text style={styles.label}>Adresse :</Text>
          <TextInput
            value={formData.address}
            onChangeText={(v) => handleChange('address', v)}
            style={[styles.input, styles.inputHighlight]}
            placeholder="Adresse"
            placeholderTextColor="#7a8ab8"
          />

          <Text style={styles.label}>Code postal :</Text>
          <TextInput
            value={formData.postalCode}
            onChangeText={(v) => handleChange('postalCode', v)}
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#7a8ab8"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Ville :</Text>
          <TextInput
            value={formData.city}
            onChangeText={(v) => handleChange('city', v)}
            style={[styles.input, styles.inputHighlight]}
            placeholder="Ville"
            placeholderTextColor="#7a8ab8"
          />
        </View>
      </ScrollView>

      {/* Bouton Ajouter les informations en bas */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Ajouter les informations</Text>
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