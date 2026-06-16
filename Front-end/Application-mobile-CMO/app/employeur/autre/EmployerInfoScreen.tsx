import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Phone, MessageSquare, Edit2, Trash2, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import url from "@/app/services/url.js"; // Importation de votre service d'URL
import { getEmployerInfo, updateEmployerInfo } from '@/app/employeur/services/EmployerInfoScreen';
import { getImage, updateImage, DeleteImage } from '@/app/employeur/services/documents';

interface EmployerInfoScreenProps {
  onBack?: () => void;
}

export default function EmployerInfoScreen({ onBack }: EmployerInfoScreenProps) {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [photoUpload, setPhotoUpload] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const fetchInitialData = async () => {
      try {
        const response = await getEmployerInfo();
        let currentPhotoUrl = '';

        try {
          const imageData = await getImage();
          if (imageData?.image) {
            // Utilisation de url() importé pour construire le chemin complet de l'image
            currentPhotoUrl = url() + "documents/photos_employeur/" + imageData.image;
          }
        } catch (imgError) {
          console.log("Pas d'image ou erreur de récupération :", imgError);
        }

        if (mounted && response) {
          setFormData({
            ...response,
            photo: currentPhotoUrl,
          });
        }
      } catch (error) {
        console.error("Erreur chargement données :", error);
        Alert.alert('Erreur', 'Impossible de récupérer vos informations.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchInitialData();
    return () => { mounted = false; };
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission requise", "Vous devez autoriser l'accès à vos photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setFormData((prev: any) => ({ ...prev, photo: selectedImage.uri }));
      
      const localUri = selectedImage.uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      setPhotoUpload({
        uri: localUri,
        name: filename,
        type: type,
      });
    }
  };

  const handleDeleteImage = async () => {
    Alert.alert(
      "Supprimer le logo",
      "Êtes-vous sûr de vouloir supprimer votre logo actuel ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await DeleteImage();
              setFormData((prev: any) => ({ ...prev, photo: '' }));
              setPhotoUpload(null);
              Alert.alert('Succès', 'Le logo a bien été supprimé.');
            } catch (error) {
              console.error("Erreur suppression image :", error);
              Alert.alert('Erreur', 'Impossible de supprimer le logo.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

const handleSubmit = async () => {
  if (!formData) return;

  setLoading(true);
  try {
    // 1. On tente d'uploader l'image si elle existe
    if (photoUpload) {
      try {
        console.log("Envoi de l'image en cours...", photoUpload);
        const imgResponse = await updateImage(photoUpload as any);
        console.log("Réponse serveur upload image :", imgResponse);
        setPhotoUpload(null);
      } catch (imgError: any) {
        console.error("❌ Erreur spécifique à updateImage :", imgError);
        // Si l'erreur vient du serveur (Axios/Fetch), on affiche son contenu s'il existe
        const serverMsg = imgError?.response?.data?.message || imgError?.message || JSON.stringify(imgError);
        Alert.alert('Erreur Upload Image', `Le serveur a rejeté l'image :\n${serverMsg}`);
        setLoading(false);
        return; // On arrête l'exécution ici pour ne pas envoyer le reste
      }
    }

    // 2. On tente de mettre à jour le reste des informations textuelles
    console.log("Envoi des informations de l'employeur...", formData);
    const result = await updateEmployerInfo(formData);
    console.log("Réponse serveur updateEmployerInfo :", result);
    
    if (
      result && 
      (result.success === true || 
       result.status === 'success' || 
       result.status === 200 || 
       result.message === 'success')
    ) {
      Alert.alert('Succès', 'Vos informations ont bien été modifiées.');
    } else if (result && (result.success === false || result.status === 'error')) {
      Alert.alert('Erreur', result?.message || "Le serveur a renvoyé un statut d'erreur.");
    } else {
      Alert.alert('Succès', 'Vos informations ont bien été modifiées.');
    }
  } catch (error: any) {
    // 3. Capture des erreurs globales du serveur
    console.error('❌ Erreur globale de mise à jour :', error);
    
    // On extrait le message le plus précis possible venant du serveur Node.js (souvent dans error.response.data)
    const exactServerError = error?.response?.data?.message 
      || error?.response?.data 
      || error?.message 
      || "Erreur inconnue";

    Alert.alert(
      'Erreur Serveur', 
      `Détails du problème :\n${typeof exactServerError === 'object' ? JSON.stringify(exactServerError) : exactServerError}`
    );
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
        
        <View style={styles.card}>
          <Text style={styles.label}>
            votre logo : <Text style={{ color: 'red' }}>(*)</Text>
          </Text>

          {/* Section Logo carrée */}
          <View style={styles.imageContainer}>
            {formData?.photo ? (
              <View style={styles.logoBlock}>
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: formData.photo }} style={styles.logoPreview} />
                </View>
                
                {/* Boutons Modifier et Supprimer côte à côte */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity style={[styles.inlineBtn, styles.editInlineBtn]} onPress={pickImage}>
                    <Edit2 size={14} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.inlineBtnText}>Modifier</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.inlineBtn, styles.deleteInlineBtn]} onPress={handleDeleteImage}>
                    <Trash2 size={14} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.inlineBtnText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickImage}>
                <Upload size={24} color="#7a8ab8" />
                <Text style={styles.uploadText}>Sélectionner un logo</Text>
              </TouchableOpacity>
            )}
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
  imageContainer: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBlock: {
    alignItems: 'center',
    gap: 12,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cfd9ee',
    overflow: 'hidden',
    backgroundColor: '#f6f8ff',
  },
  logoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 15,
  },
  editInlineBtn: {
    backgroundColor: '#2b5bbb',
  },
  deleteInlineBtn: {
    backgroundColor: '#d9534f',
  },
  inlineBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadPlaceholder: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#7a8ab8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    gap: 6
  },
  uploadText: {
    color: '#7a8ab8',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 4
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