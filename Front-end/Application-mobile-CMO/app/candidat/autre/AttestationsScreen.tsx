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

import { deletDocument, getCategorie, getFils, getListFils, updateFils } from '@/app/candidat/services/AttestationsScreen';
import url from '@/app/services/url';
import * as DocumentPicker from 'expo-document-picker';
import { Eye, Trash2, Upload } from 'lucide-react-native';

type Category = { id: number; titre: string; deleted?: number };
type AttestationItem = {
  id: number;
  id_attestation: number;
  id_categorie: number;
  titre: string;
  titre2?: string;
  etats?: number;
};

export default function AttestationsScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<AttestationItem[]>([]);
  const [filesByAttestation, setFilesByAttestation] = useState<Record<number, string>>({});
  const [filesByTitle, setFilesByTitle] = useState<Record<string, string>>({});

  const normalizeTitle = (title: string) => title.trim().toLowerCase();

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const [cats, list, files] = await Promise.all([
          getCategorie(),
          getListFils(),
          getFils(),
        ]);

        const catList = Array.isArray(cats) ? cats.filter((c) => c?.deleted !== 1) : [];
        const itemList = Array.isArray(list) ? list : [];

        const nextFilesByTitle: Record<string, string> = {};
        const nextFilesByAttestation: Record<number, string> = {};
        const serverFiles = Array.isArray(files?.files) ? files.files : [];
        serverFiles.forEach((file: any) => {
          if (file?.titre && file?.cvitae) {
            nextFilesByTitle[normalizeTitle(String(file.titre))] = String(file.cvitae);
          }
          if (file?.id != null && file?.cvitae) {
            nextFilesByAttestation[Number(file.id)] = String(file.cvitae);
          }
        });

        setCategories(catList);
        setItems(itemList);
        setFilesByTitle(nextFilesByTitle);
        setFilesByAttestation(nextFilesByAttestation);
      } catch (error) {
        console.log('Error loading files:', error);
      }
    };

    loadFiles();
  }, []);

  const buildFileUrl = (fileName: string) =>
    url() + 'files/Document/' + fileName;

  const handleUpload = async (item: AttestationItem) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const fileName = asset.name ?? '';
      const isPdf =
        asset.mimeType === 'application/pdf' ||
        fileName.toLowerCase().endsWith('.pdf');

      if (!isPdf) {
        Alert.alert('Format invalide', 'Veuillez selectionner un fichier PDF.');
        return;
      }

      const file = {
        uri: asset.uri,
        name: fileName || `document_${Date.now()}.pdf`,
        type: asset.mimeType ?? 'application/octet-stream',
      };

      const response = await updateFils(file as any, item.id_attestation, item.id);
      const serverFile = response?.fichier ?? file.name;

      setFilesByAttestation((prev) => ({
        ...prev,
        [item.id_attestation]: serverFile,
      }));
      Alert.alert('Enregistré', 'Document envoyé avec succès.');
    } catch (error) {
      console.log('Error uploading file:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le document.');
    }
  };

  const handleView = (item: AttestationItem) => {
    const fileName =
      filesByAttestation[item.id_attestation] ||
      filesByTitle[normalizeTitle(item.titre)];

    if (!fileName) {
      Alert.alert('Aucun fichier', 'Aucun document pour ce type.');
      return;
    }

    Linking.openURL(buildFileUrl(fileName));
  };

  const handleDelete = (item: AttestationItem) => {
    Alert.alert(
      'Confirmer la suppression',
      'Etes-vous sur de vouloir supprimer ce document ? Cette action est irreversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletDocument(item.id_attestation);

              setFilesByAttestation((prev) => {
                const next = { ...prev };
                delete next[item.id_attestation];
                return next;
              });
              setFilesByTitle((prev) => {
                const next = { ...prev };
                delete next[normalizeTitle(item.titre)];
                return next;
              });

              Alert.alert('Supprime', 'Document supprime avec succes.');
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

    

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>

        {categories.map((category) => (
          <View key={category.id} style={styles.card}>

            <Text style={styles.sectionTitle}>
              {category.titre}
            </Text>

            {items.filter((item) => item.id_categorie === category.id).length === 0 ? (
              <Text style={styles.empty}>
                Aucun document
              </Text>
            ) : (
              items
                .filter((item) => item.id_categorie === category.id)
                .map((item) => (
                <View key={item.id} style={styles.itemRow}>

                  <Text style={styles.itemText}>
                    {item.titre}
                  </Text>

                  {item.titre2 ? (
                    <Text style={styles.itemSubtitle}>{item.titre2}</Text>
                  ) : null}

                  {filesByAttestation[item.id_attestation] || filesByTitle[normalizeTitle(item.titre)] ? (
                    <Text style={styles.fileName}>
                      {filesByAttestation[item.id_attestation] || filesByTitle[normalizeTitle(item.titre)]}
                    </Text>
                  ) : (
                    <Text style={styles.fileNameEmpty}>Aucun fichier</Text>
                  )}

                  <View style={styles.actions}>

                    <TouchableOpacity
                      style={styles.uploadBtn}
                      onPress={() => handleUpload(item)}
                    >
                      <Text style={styles.uploadText}>Importer</Text>
                      <Upload size={16} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconCircle}
                      onPress={() => handleView(item)}
                    >
                      <Eye size={18} color="#2b5bbb" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconDanger}
                      onPress={() => handleDelete(item)}
                    >
                      <Trash2 size={18} color="#b64a2f" />
                    </TouchableOpacity>

                  </View>
                </View>
              ))
            )}

          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },

  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e9fb',
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },

  iconBtn: {
    position: 'relative',
    padding: 8,
    borderRadius: 12,
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f7b500',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e7eeff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    color: '#1b2d5a',
    marginTop: 10,
  },

  content: {
    padding: 15,
    gap: 15,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
  },

  sectionTitle: {
    fontSize: 16,
    color: '#1b2d5a',
    marginBottom: 10,
  },

  empty: {
    fontSize: 13,
    color: '#7a8ab8',
  },

  itemRow: {
    backgroundColor: '#f6f8ff',
    borderWidth: 1,
    borderColor: '#e1e9fb',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },

  itemText: {
    color: '#1b2d5a',
    marginBottom: 10,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#5b6a8e',
    marginBottom: 8,
  },
  fileName: {
    fontSize: 12,
    color: '#2b5bbb',
    marginBottom: 10,
  },
  fileNameEmpty: {
    fontSize: 12,
    color: '#7a8ab8',
    marginBottom: 10,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  uploadBtn: {
    flexDirection: 'row',
    gap: 5,
    backgroundColor: '#2b5bbb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },

  uploadText: {
    color: '#fff',
    fontSize: 12,
  },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dfe8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconDanger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffd9c9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});