import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';

// Import de tes services
import { getDocument, updateDocument, DeleteDocument } from '@/app/employeur/services/documents';
import url from "@/app/services/url.js";

// Liste complète de tes documents
const DOCUMENT_TYPES: string[] = [
  "Clôture offre France Travail",
  "Attestation de vigilance URSSAF",
  "Offre France Travail",
  "Attestation sur l'honneur",
  "Devis signé",
  "Attestation de régularité fiscale",
  "Déclaration d'hébergement collectif",
  "Attestation d'affiliation",
  "Procuration",
  "Facture électricité/gaz",
  "Certificat d'adressage",
  "Déclaration sociale nominative",
  "Bordereau de neutralisation",
  "Contrat d'engagement",
  "Fiche de poste",
  "Relevé parcellaire",
  "Devis provisoire"
];

export default function EmployerDocumentsScreen() {
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({}); 
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUserDocuments();
  }, []);

  const fetchUserDocuments = async () => {
    try {
      setLoading(true);
      const res = await getDocument();
      
      // CORRECTION : On cible 'res.documents' qui est le vrai tableau
      if (res && res.success && Array.isArray(res.documents)) {
        const docsMap: Record<string, string> = {};
        
        res.documents.forEach((doc: any) => {
          // CORRECTION : On utilise 'doc.titre' pour correspondre aux clés de DOCUMENT_TYPES
          if (!doc.deleted && doc.titre) {
            docsMap[doc.titre] = doc.document; 
          }
        });
        setUploadedDocs(docsMap);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      Alert.alert("Erreur", "Impossible de charger vos documents.");
    } finally {
      setLoading(false);
    }
  };

  const handlePickAndUpload = async (docType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      const fileToUpload = {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || "application/octet-stream",
      };

      setLoading(true);
      const response = await updateDocument(fileToUpload, docType, docType);

      if (response && response.success) {
        Alert.alert("Succès", `${docType} a bien été enregistré.`);
        fetchUserDocuments(); 
      } else {
        Alert.alert("Erreur", response.message || "Une erreur est survenue lors de l'envoi.");
      }
    } catch (error) {
      console.error("Erreur d'upload:", error);
      Alert.alert("Erreur", "L'envoi a échoué.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docType: string) => {
    Alert.alert(
      "Confirmation",
      `Voulez-vous vraiment supprimer le document : ${docType} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await DeleteDocument(); 
              Alert.alert("Supprimé", "Document retiré avec succès.");
              fetchUserDocuments();
            } catch (error) {
              console.error(error);
              Alert.alert("Erreur", "Impossible de supprimer le document.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Fonction pour ouvrir l'URL sur le Web
  const handleViewDocument = (fileName: string) => {
    const currentPhotoUrl = url() + "documents/autre_type_entreprise/" + fileName + "?t=" + Date.now();
    
    Linking.openURL(currentPhotoUrl).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir le lien du document.");
    });
  };

  if (loading && Object.keys(uploadedDocs).length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2b5bbb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {DOCUMENT_TYPES.map((doc: string, index: number) => {
          const isUploaded = !!uploadedDocs[doc];
          const fileName = uploadedDocs[doc];

          return (
            <View key={index} style={styles.docItem}>
              <View style={styles.docHeader}>
                <Text style={styles.docText}>
                  {doc} {isUploaded && <Text style={{ color: "green" }}>✓</Text>}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.importBtn, isUploaded && styles.replaceBtn]} 
                  onPress={() => handlePickAndUpload(doc)}
                >
                  <Text style={styles.importText}>{isUploaded ? "Remplacer " : "Importer "}</Text>
                  <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                </TouchableOpacity>

                {/* BOUTON VOIR (ŒIL) : S'affiche uniquement si le document est importé */}
                {isUploaded && fileName && (
                  <TouchableOpacity 
                    style={styles.iconCircleBlue}
                    onPress={() => handleViewDocument(fileName)}
                  >
                    <Ionicons name="eye-outline" size={16} color="#2b5bbb" />
                  </TouchableOpacity>
                )}

                {isUploaded && (
                  <TouchableOpacity 
                    style={styles.iconCircleRed}
                    onPress={() => handleDelete(doc)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#b64a2f" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },
  center: {
    justifyContent: "center",
    alignItems: "center"
  },
  content: {
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 20,
  },
  docItem: {
    backgroundColor: "#f6f8ff",
    borderWidth: 1,
    borderColor: "#e1e9fb",
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
  },
  docHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  docText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1b2d5a",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  importBtn: {
    flexDirection: "row",
    backgroundColor: "#2b5bbb",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: "center",
    marginRight: 5,
  },
  replaceBtn: {
    backgroundColor: "#6c757d",
  },
  importText: {
    color: "#fff",
    fontSize: 13,
  },
  iconCircleBlue: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#dfe8ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  iconCircleRed: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#ffd9c9",
    alignItems: "center",
    justifyContent: "center",
  },
});