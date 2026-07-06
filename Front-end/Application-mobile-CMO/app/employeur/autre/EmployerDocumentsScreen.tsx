import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Image,
  Dimensions,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { WebView } from 'react-native-webview';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser'; // <-- Ajouté pour le rendu de PDF interne

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

type ViewerType = 'image' | 'pdf' | 'office' | 'other';

const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

const getViewerType = (fileName: string): ViewerType => {
  const ext = getFileExtension(fileName);
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'office';
  return 'other';
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EmployerDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({}); 
  const [loading, setLoading] = useState<boolean>(true);

  // 👁️ États pour la visionneuse intégrée (utilisée pour les images / fallback)
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerLoading, setViewerLoading] = useState(true);
  const [viewerError, setViewerError] = useState(false);
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerType, setViewerType] = useState<ViewerType>('other');

  useEffect(() => {
    fetchUserDocuments();
  }, []);

  const fetchUserDocuments = async () => {
    try {
      setLoading(true);
      const res = await getDocument();
      
      if (res && res.success && Array.isArray(res.documents)) {
        const docsMap: Record<string, string> = {};
        
        res.documents.forEach((doc: any) => {
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

  // 👁️ GESTION DU CLIC SUR L'ŒIL
  const handleViewDocument = async (fileName: string, docType: string) => {
    const currentPhotoUrl = url() + "documents/autre_type_entreprise/" + fileName + "?t=" + Date.now();
    const type = getViewerType(fileName);

    if (type === 'pdf' || type === 'office') {
      // Ouvre le PDF de manière native dans l'application (sans écran noir)
      try {
        await WebBrowser.openBrowserAsync(currentPhotoUrl, {
          toolbarColor: '#1b2d5a',
          controlsColor: '#ffffff',
          showTitle: true,
          enableBarCollapsing: true,
        });
      } catch (error) {
        console.error("Erreur WebBrowser:", error);
        Alert.alert("Erreur", "Impossible d'ouvrir le document.");
      }
    } else {
      // Reste sur le modal classique pour les images (.png, .jpg)
      setViewerTitle(docType);
      setViewerUrl(currentPhotoUrl);
      setViewerType(type);
      setViewerError(false);
      setViewerLoading(true);
      setViewerVisible(true);
    }
  };

  const handleOpenExternally = () => {
    Linking.openURL(viewerUrl).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir le lien du document.");
    });
  };

  const closeViewer = () => {
    setViewerVisible(false);
    setViewerUrl('');
    setViewerError(false);
  };

  // Logique de secours de la WebView pour la production
  const remoteViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(viewerUrl)}`;

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
                  <Text style={styles.importText}>{isUploaded ? "Importé " : "Importer "}</Text>
                  <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                </TouchableOpacity>

                {isUploaded && fileName && (
                  <TouchableOpacity 
                    style={styles.iconCircleBlue}
                    onPress={() => handleViewDocument(fileName, doc)}
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

      {/* MODAL UTILISÉ UNIQUEMENT POUR LES IMAGES MAINTENANT */}
      <Modal
        visible={viewerVisible}
        animationType="slide"
        onRequestClose={closeViewer}
        transparent={false}
      >
        <SafeAreaView style={styles.viewerContainer} edges={['top', 'bottom']}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity onPress={closeViewer} style={styles.viewerHeaderBtn}>
              <Ionicons name="chevron-back" size={26} color="#1b2d5a" />
            </TouchableOpacity>
            <Text style={styles.viewerTitle} numberOfLines={1}>{viewerTitle}</Text>
            <TouchableOpacity onPress={handleOpenExternally} style={styles.viewerHeaderBtn}>
              <Ionicons name="open-outline" size={22} color="#1b2d5a" />
            </TouchableOpacity>
          </View>

          <View style={styles.viewerBody}>
            {viewerError ? (
              <View style={styles.viewerErrorBox}>
                <Ionicons name="alert-circle-outline" size={40} color="#b64a2f" />
                <Text style={styles.viewerErrorText}>
                  Impossible d'afficher ce document ici.
                </Text>
                <TouchableOpacity style={styles.viewerFallbackBtn} onPress={handleOpenExternally}>
                  <Text style={styles.viewerFallbackText}>Ouvrir dans le navigateur</Text>
                </TouchableOpacity>
              </View>
            ) : viewerType === 'image' ? (
              <>
                <Image
                  source={{ uri: viewerUrl }}
                  style={styles.viewerImage}
                  resizeMode="contain"
                  onLoadEnd={() => setViewerLoading(false)}
                  onError={() => { setViewerLoading(false); setViewerError(true); }}
                />
                {viewerLoading && (
                  <View style={styles.viewerLoadingOverlay}>
                    <ActivityIndicator size="large" color="#2b5bbb" />
                  </View>
                )}
              </>
            ) : (
              <>
                <WebView
                  key={viewerUrl}
                  source={{ uri: (viewerType === 'office' || viewerType === 'pdf') ? remoteViewerUrl : viewerUrl }}
                  style={{ flex: 1, backgroundColor: '#fff' }}
                  originWhitelist={['*']}
                  javaScriptEnabled
                  domStorageEnabled
                  startInLoadingState={false}
                  mixedContentMode="always"
                  allowsInlineMediaPlayback
                  onLoadEnd={() => setViewerLoading(false)}
                  onError={() => { setViewerLoading(false); setViewerError(true); }}
                  onHttpError={() => { setViewerLoading(false); setViewerError(true); }}
                  renderLoading={() => <View />}
                />
                {viewerLoading && (
                  <View style={styles.viewerLoadingOverlay}>
                    <ActivityIndicator size="large" color="#2b5bbb" />
                    <Text style={styles.viewerLoadingText}>Chargement du document...</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>
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
  viewerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  viewerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e7edf7",
    minHeight: 52,
  },
  viewerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1b2d5a",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  viewerHeaderBtn: {
    padding: 8,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  viewerBody: {
    flex: 1,
    backgroundColor: "#1c1c1e",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 120,
  },
  viewerLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  viewerLoadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 13,
  },
  viewerErrorBox: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  viewerErrorText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
  viewerFallbackBtn: {
    marginTop: 18,
    backgroundColor: "#2b5bbb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  viewerFallbackText: {
    color: "#fff",
    fontWeight: "600",
  },
});