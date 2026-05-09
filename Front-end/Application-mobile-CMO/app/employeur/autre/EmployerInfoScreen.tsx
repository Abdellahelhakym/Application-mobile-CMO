import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { Phone, MessageSquare } from 'lucide-react-native';

interface EmployerInfoScreenProps {
  onBack?: () => void;
}

export default function EmployerInfoScreen({ onBack }: EmployerInfoScreenProps) {
  const [formData, setFormData] = useState({
    logo: '',
    companyName: 'test',
    firstName: 'abdellah',
    lastName: 'el hakym',
    siren: '123 456 789',
    siret: '123 456 789 00012',
    address: '',
    postalCode: '0',
    city: '',
    country: 'France'
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>Votre Logo</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.company}>test</Text>
              <Text style={styles.separator}>|</Text>
            </View>

            <View style={styles.badgePlan}>
              <Text style={styles.badgePlanText}>
                Pack DEVIS PERSONNALISE
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.outlineBtn}>
              <Phone size={16} color="#2b5bbb" />
              <Text style={styles.outlineText}>Contacter mon conseiller</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineBtn}>
              <MessageSquare size={16} color="#2b5bbb" />
              <Text style={styles.outlineText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.label}>
            importer votre logo : <Text style={{ color: 'red' }}>(*)</Text>
          </Text>

          {/* Pas de input file en React Native */}
          <View style={styles.fakeInput}>
            <Text>Sélectionner un fichier</Text>
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

          <TextInput
            value={formData.siren}
            onChangeText={(v) => handleChange('siren', v)}
            style={styles.input}
            placeholder="Siren"
          />

          <TextInput
            value={formData.siret}
            onChangeText={(v) => handleChange('siret', v)}
            style={styles.input}
            placeholder="Siret"
          />

          <TextInput
            value={formData.address}
            onChangeText={(v) => handleChange('address', v)}
            style={styles.input}
            placeholder="Adresse"
          />

          <TextInput
            value={formData.postalCode}
            onChangeText={(v) => handleChange('postalCode', v)}
            style={styles.input}
            placeholder="0"
          />

          <TextInput
            value={formData.city}
            onChangeText={(v) => handleChange('city', v)}
            style={styles.input}
            placeholder="Ville"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff'
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 120
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e9fb'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#f6f8ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoText: {
    fontSize: 10,
    color: '#2b5bbb'
  },
  company: {
    fontSize: 16,
    color: '#1b2d5a',
    fontWeight: '600'
  },
  separator: {
    fontSize: 12,
    color: '#7a8ab8'
  },
  badgePlan: {
    backgroundColor: '#2b5bbb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  badgePlanText: {
    color: '#fff',
    fontSize: 10
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cfd9ee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  outlineText: {
    color: '#2b5bbb',
    fontSize: 12
  },
  label: {
    fontSize: 14,
    color: '#1b2d5a',
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#cfd9ee',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 6
  },
  fakeInput: {
    borderWidth: 1,
    borderColor: '#cfd9ee',
    borderRadius: 20,
    padding: 12,
    marginTop: 6
  }
});