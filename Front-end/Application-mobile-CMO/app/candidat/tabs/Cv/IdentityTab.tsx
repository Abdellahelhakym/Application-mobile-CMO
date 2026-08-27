import * as ImagePicker from 'expo-image-picker';
import { Camera, Trash2, Upload } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import {
    getInformations,
    updateInformations,
} from "@/app/candidat/services/CVScreen";
import url from "@/app/services/url.js";
import { DeleteImage, getImage, updateImage } from "../../services/document";
import { C } from './colors';
import {
    Card,
    InputField,
    Label,
    SectionSaveButton,
    SectionTitle,
    decodeHTML,
    encodeForSave,
} from './utils';

interface IdentityTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  photoUpload: { uri: string; name: string; type: string } | null;
  setPhotoUpload: React.Dispatch<React.SetStateAction<{ uri: string; name: string; type: string } | null>>;
}

export const IdentityTab = ({
  formData,
  setFormData,
  photoUpload,
  setPhotoUpload,
}: IdentityTabProps) => {
  const [photo, setPhoto] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);

  const set = (key: string) => (v: string) =>
    setFormData((p: any) => ({ ...p, [key]: v }));

  // 📱 Charger l'image de profil au montage
  useEffect(() => {
    fetchProfileImage();
  }, []);

  const fetchProfileImage = async () => {
    try {
      const imageData = await getImage();
      const imageUrl = imageData?.image
        ? url() + "documents/photos_candidats/" + imageData.image
        : '';
      setPhoto(imageUrl);
    } catch (error) {
      console.log('Erreur chargement image:', error);
    }
  };

  // 📱 Charger les informations personnelles
  useEffect(() => {
    loadInformations();
  }, []);

  const loadInformations = async () => {
    try {
      const data = await getInformations();
      const info = Array.isArray(data) ? data[0] : data?.data?.[0] ?? data;

      if (!info) return;

      setFormData((prev: any) => ({
        ...prev,
        civility: decodeHTML(info.civilite ?? prev.civility),
        firstName: decodeHTML(info.prenom ?? prev.firstName),
        lastName: decodeHTML(info.nom ?? prev.lastName),
        email: decodeHTML(info.email ?? prev.email),
        phone: decodeHTML(info.tel ?? prev.phone),
        phone2: decodeHTML(info.tel2 ?? prev.phone2),
        address: decodeHTML(info.adresse ?? info.adresse_postale ?? prev.address),
        postalCode: info.code_postal != null ? String(info.code_postal) : prev.postalCode,
        city: decodeHTML(info.ville ?? prev.city),
        country: decodeHTML(info.pays ?? prev.country),
        socialSecurity: decodeHTML(info.num_secur_social ?? prev.socialSecurity),
      }));
    } catch (error) {
      console.log('Erreur chargement informations:', error);
    }
  };

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission requise', "Autorisez l'accès à la galerie pour importer une photo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setPhoto(asset.uri);

      const image = {
        uri: asset.uri,
        name: asset.fileName ?? `profile_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      };
      setPhotoUpload(image);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo.');
    }
  };

  const handleSaveInformations = async () => {
    try {
      const codePostalValue = formData.postalCode ? Number(formData.postalCode) : 0;

      await updateInformations(
        encodeForSave(formData.civility),
        encodeForSave(formData.firstName),
        encodeForSave(formData.lastName),
        encodeForSave(formData.email),
        encodeForSave(formData.phone),
        encodeForSave(formData.phone2),
        encodeForSave(formData.address),
        codePostalValue,
        encodeForSave(formData.city),
        encodeForSave(formData.country),
        encodeForSave(formData.socialSecurity)
      );

      if (photoUpload) {
        setAvatarLoading(true);
        await updateImage(photoUpload as any);
        setPhotoUpload(null);
        await fetchProfileImage();
        setAvatarLoading(false);
      }

      Alert.alert('Enregistré', 'Informations enregistrées avec succès.');
    } catch (error) {
      setAvatarLoading(false);
      Alert.alert('Erreur', 'Impossible de sauvegarder les informations.');
    }
  };

  return (
    <View style={{ gap: 16 }}>
      {/* Photo de profil */}
      <Card>
        <SectionTitle icon={<Camera size={18} color={C.blue} />}>
          {'Photo de profil'}
        </SectionTitle>
        <View style={styles.photoContainer}>
          <View style={styles.photoBox}>
            {photo ? (
              <>
                <Image
                  source={{ uri: photo }}
                  style={styles.photoImage}
                  onLoadStart={() => setAvatarLoading(true)}
                  onLoadEnd={() => setAvatarLoading(false)}
                  onError={() => setAvatarLoading(false)}
                />
                {avatarLoading ? (
                  <View style={styles.photoLoading}>
                    <ActivityIndicator size="small" color="#2b5bbb" />
                  </View>
                ) : null}
              </>
            ) : (
              <Camera size={28} color={C.blue} />
            )}
          </View>

          <Text style={styles.photoHint}>{'Télécharger votre photo'}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.btnImport} onPress={handlePickPhoto}>
              <Upload size={16} color={C.white} />
              <Text style={styles.btnImportText}>{'Importer'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnDelete}
              onPress={async () => {
                setPhoto('');
                setPhotoUpload(null);
                setAvatarLoading(false);
                await DeleteImage();
              }}
            >
              <Trash2 size={16} color={C.deleteText} />
              <Text style={styles.btnDeleteText}>{'Supprimer'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Informations personnelles */}
      <Card>
        <SectionTitle>{'Informations'}</SectionTitle>

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

        <Label>{'Code postal'}</Label>
        <InputField value={formData.postalCode} onChangeText={set('postalCode')} />

        <Label>{'Ville'}</Label>
        <InputField value={formData.city} onChangeText={set('city')} />

        <Label>{'Pays'}</Label>
        <InputField value={formData.country} onChangeText={set('country')} />

        <Label>{'Numéro de sécurité sociale'}</Label>
        <InputField value={formData.socialSecurity} onChangeText={set('socialSecurity')} />
      </Card>

      <SectionSaveButton
        label={'Sauvegarder les informations'}
        onPress={handleSaveInformations}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
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
    position: 'relative',
  },
  photoImage: { width: '100%', height: '100%' },
  photoLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(238, 243, 255, 0.7)',
  },
  photoHint: { fontSize: 13, color: C.textMuted },
  btnImport: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: C.blue,
  },
  btnImportText: { color: C.white, fontSize: 13, fontWeight: '500' },
  btnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: C.accentDelete,
  },
  btnDeleteText: { color: C.deleteText, fontSize: 13, fontWeight: '500' },
  civilityBtn: {
    borderWidth: 1,
    borderColor: C.borderLight,
    backgroundColor: '#fff8f0',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  civilityBtnActive: { borderColor: C.blue, backgroundColor: C.accent },
  civilityText: { fontSize: 14, color: C.textMuted },
  civilityTextActive: { color: C.navy, fontWeight: '500' },
});