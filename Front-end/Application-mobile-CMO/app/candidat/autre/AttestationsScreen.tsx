import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { updateDocument, getDocument, DeleteDocument, getCategorie, getListFils } from '@/app/candidat/services/AttestationsScreen';
import url from '@/app/services/url';
import * as DocumentPicker from 'expo-document-picker';
import { Eye, Trash2, Upload } from 'lucide-react-native';

// 🔧 Fonction pour décoder les entités HTML courantes
const decodeHTML = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&euml;/g, 'ë')
    .replace(/&agrave;/g, 'à')
    .replace(/&acirc;/g, 'â')
    .replace(/&icirc;/g, 'î')
    .replace(/&iuml;/g, 'ï')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&ucirc;/g, 'û')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

type Category = { id: number; titre: string; deleted?: number };

type AttestationItem = {
  id: number;
  token_id_cand?: string;
  etats?: number;
  id_attestation: number;
  titre: string;
  titre2?: string;
  id_categorie: number;
  categorie?: string;
};

export default function AttestationsScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<AttestationItem[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<Record<number, string>>({});

  const loadFiles = async () => {
    try {
      const [cats, list, attestations] = await Promise.all([
        getCategorie(),
        getListFils(),
        getDocument(),
      ]);

      const catList = Array.isArray(cats) ? cats.filter((c) => c?.deleted !== 1) : [];
      const itemList = Array.isArray(list) ? list : [];

      const docsMap: Record<number, string> = {};
      
      if (attestations?.success && Array.isArray(attestations.files)) {
        attestations.files.forEach((file: any) => {
          if (file?.id_attestation != null && file?.cvitae) {
            docsMap[Number(file.id_attestation)] = file.cvitae;
          }
        });
      }

      setCategories(catList);
      setItems(itemList);
      setUploadedDocs(docsMap);
    } catch (error) {
      console.log('Error loading files:', error);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUpload = async (item: AttestationItem) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        console.log('❌ Sélection annulée ou pas de fichier');
        return;
      }

      const asset = result.assets[0];
      const fileName = asset.name ?? '';
      const isPdf =
        asset.mimeType === 'application/pdf' ||
        fileName.toLowerCase().endsWith('.pdf');

      if (!isPdf) {
        Alert.alert('Format invalide', 'Veuillez sélectionner un fichier PDF.');
        return;
      }

      const file = {
        uri: asset.uri,
        name: fileName || `document_${Date.now()}.pdf`,
        type: asset.mimeType ?? 'application/octet-stream',
      };

      await updateDocument(file as any, item.id_attestation);
      
      Alert.alert('Enregistré', 'Document envoyé avec succès.');
      loadFiles(); 
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      Alert.alert('Erreur', `Impossible d'envoyer le document.`);
    }
  };

  const handleView = async (item: AttestationItem) => {
    const fileName = uploadedDocs[item.id_attestation];
    if (!fileName) {
      Alert.alert('Aucun fichier', 'Aucun document pour ce type.');
      return;
    }

    const currentPhotoUrl = url() + "documents/attestations/" + fileName + "?t=" + Date.now();
    
    Linking.openURL(currentPhotoUrl).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir le lien du document.");
    });
  };

  const handleDelete = (item: AttestationItem) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await DeleteDocument(item.id_attestation);
              Alert.alert('Supprimé', 'Document supprimé avec succès.');
              loadFiles(); 
            } catch (error) {
              console.log('Error deleting document:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le document.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {categories.map((category) => (
          <View key={category.id} style={styles.card}>

            {/* 🛠️ Application de decodeHTML sur le titre de la catégorie */}
            <Text style={styles.sectionTitle}>
              {decodeHTML(category.titre)}
            </Text>

            {items.filter((item) => item.id_categorie === category.id).length === 0 ? (
              <Text style={styles.empty}>
                Aucun document
              </Text>
            ) : (
              items
                .filter((item) => item.id_categorie === category.id)
                .map((item) => {
                  const isUploaded = !!uploadedDocs[item.id_attestation];
                  const fileName = uploadedDocs[item.id_attestation];

                  return (
                    <View key={item.id} style={styles.itemRow}>

                      {/* 🛠️ Application de decodeHTML sur le titre de l'item */}
                      <Text style={styles.itemText}>
                        {decodeHTML(item.titre)}
                        {isUploaded && <Text style={{ color: 'green' }}> ✓</Text>}
                      </Text>

                      {/* 🛠️ Application de decodeHTML sur le sous-titre si présent */}
                      {item.titre2 ? (
                        <Text style={styles.itemSubtitle}>{decodeHTML(item.titre2)}</Text>
                      ) : null}

                      {isUploaded ? (
                        <Text style={styles.fileName}>
                          {fileName}
                        </Text>
                      ) : (
                        <Text style={styles.fileNameEmpty}>Aucun fichier</Text>
                      )}

                      <View style={styles.actions}>
                        <TouchableOpacity
                          style={[styles.uploadBtn, isUploaded && styles.replaceBtn]}
                          onPress={() => handleUpload(item)}
                        >
                          <Text style={styles.uploadText}>
                            {isUploaded ? 'Importé' : 'Importer'}
                          </Text>
                          <Upload size={16} color="#fff" />
                        </TouchableOpacity>

                        {isUploaded && (
                          <TouchableOpacity
                            style={styles.iconCircle}
                            onPress={() => handleView(item)}
                          >
                            <Eye size={18} color="#2b5bbb" />
                          </TouchableOpacity>
                        )}

                        {isUploaded && (
                          <TouchableOpacity
                            style={styles.iconDanger}
                            onPress={() => handleDelete(item)}
                          >
                            <Trash2 size={18} color="#b64a2f" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
            )}

          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef3ff' },
  content: { padding: 15, gap: 15, paddingBottom: 60 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1b2d5a', marginBottom: 12 },
  empty: { fontSize: 13, color: '#7a8ab8', fontStyle: 'italic' }, 
  itemRow: { backgroundColor: '#f6f8ff', borderWidth: 1, borderColor: '#e1e9fb', borderRadius: 16, padding: 12, marginBottom: 10 },
  itemText: { color: '#1b2d5a', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  itemSubtitle: { fontSize: 12, color: '#5b6a8e', marginBottom: 8 },
  fileName: { fontSize: 12, color: '#2b5bbb', fontWeight: '500', marginBottom: 10 },
  fileNameEmpty: { fontSize: 12, color: '#7a8ab8', marginBottom: 10 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  uploadBtn: { flexDirection: 'row', gap: 6, backgroundColor: '#2b5bbb', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, alignItems: 'center' },
  replaceBtn: { backgroundColor: '#6c757d' },
  uploadText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#dfe8ff', justifyContent: 'center', alignItems: 'center' },
  iconDanger: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffd9c9', justifyContent: 'center', alignItems: 'center' },
});