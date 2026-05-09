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
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function CreateOfferScreen() {
  const [formData, setFormData] = useState({
    category: '',
    address: '',
    mobility: '',
    positions: '',
    salary: '',
    description: ''
  });

    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    Alert.alert('Succès', 'Offre soumise pour validation CMO');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      {/* CARD INFO */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>test</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.outlineBtn}>
            <Ionicons name="call-outline" size={16} />
            <Text style={styles.btnText}> Contacter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn}>
            <Ionicons name="chatbubble-outline" size={16} />
            <Text style={styles.btnText}> Chat</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.notice}>
          Passez vos commandes en toute simplicite !
        </Text>
      </View>

      {/* FORM */}
      <View style={styles.card}>
        {Platform.OS === 'ios' ? (
          <View>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text
                style={[
                  styles.pickerTriggerText,
                  !formData.category && styles.pickerPlaceholder
                ]}
              >
                {formData.category || 'Categorie'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color="#7a8ab8"
              />
            </TouchableOpacity>

            <Modal
              visible={showCategoryPicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowCategoryPicker(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowCategoryPicker(false)}
              />
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => setShowCategoryPicker(false)}
                  >
                    <Text style={styles.modalDone}>Terminer</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Categorie" value="" />
                  <Picker.Item label="Agriculture" value="Agriculture" />
                  <Picker.Item label="BTP" value="BTP" />
                </Picker>
              </View>
            </Modal>
          </View>
        ) : (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value) => handleChange('category', value)}
              style={styles.picker}
              mode="dropdown"
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Categorie" value="" />
              <Picker.Item label="Agriculture" value="Agriculture" />
              <Picker.Item label="BTP" value="BTP" />
            </Picker>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Adresse"
          placeholderTextColor="#7a8ab8"
          value={formData.address}
          onChangeText={(v) => handleChange('address', v)}
        />

        <TextInput
          style={styles.input}
          placeholder="Mobilite"
          placeholderTextColor="#7a8ab8"
          value={formData.mobility}
          onChangeText={(v) => handleChange('mobility', v)}
        />

        <TextInput
          style={styles.input}
          placeholder="Nombre de poste"
          placeholderTextColor="#7a8ab8"
          value={formData.positions}
          onChangeText={(v) => handleChange('positions', v)}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Salaire"
          placeholderTextColor="#7a8ab8"
          value={formData.salary}
          onChangeText={(v) => handleChange('salary', v)}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.textarea}
          placeholder="Description"
          placeholderTextColor="#7a8ab8"
          multiline
          value={formData.description}
          onChangeText={(v) => handleChange('description', v)}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Créer la commande</Text>
        </TouchableOpacity>
      </View>

      {/* RECAP */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Recapitulatif</Text>

        <Text>Categorie : {formData.category}</Text>
        <Text>Adresse : {formData.address}</Text>
        <Text>Mobilite : {formData.mobility}</Text>
        <Text>Postes : {formData.positions}</Text>
        <Text>Salaire : {formData.salary}</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff'
  },

  content: {
    paddingBottom: 120
  },

  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 20
  },

  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b2d5a'
  },

  row: {
    flexDirection: 'row',
    marginTop: 10
  },

  outlineBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cfd9ee',
    padding: 8,
    borderRadius: 20,
    marginRight: 10
  },

  btnText: {
    marginLeft: 5
  },

  notice: {
    marginTop: 10,
    backgroundColor: '#fff1dc',
    padding: 10,
    borderRadius: 10
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#cfd9ee',
    borderRadius: 20,
    marginTop: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    height: Platform.OS === 'android' ? 56 : 48,
    justifyContent: 'center'
  },

  picker: {
    height: Platform.OS === 'ios' ? 216 : 56,
    width: '100%',
    paddingHorizontal: 12,
    color: '#1b2d5a'
  },

  pickerItem: {
    color: '#1b2d5a',
    fontSize: 16
  },

  input: {
    borderWidth: 1,
    borderColor: '#cfd9ee',
    padding: 12,
    borderRadius: 20,
    marginTop: 10,
    color: '#1b2d5a'
  },

  textarea: {
    borderWidth: 1,
    borderColor: '#cfd9ee',
    padding: 12,
    borderRadius: 20,
    marginTop: 10,
    height: 100,
    textAlignVertical: 'top',
    color: '#1b2d5a'
  },

  submitBtn: {
    backgroundColor: '#3a4f8f',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 15
  },

  submitText: {
    color: '#fff'
  },

  pickerTrigger: {
    borderWidth: 1,
    borderColor: '#cfd9ee',
    borderRadius: 20,
    marginTop: 10,
    backgroundColor: '#fff',
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  pickerTriggerText: {
    color: '#1b2d5a'
  },

  pickerPlaceholder: {
    color: '#7a8ab8'
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },

  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20
  },

  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#e7edf7'
  },

  modalDone: {
    color: '#2b5bbb',
    fontWeight: '600'
  },
});