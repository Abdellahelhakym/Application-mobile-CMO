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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

// Import de vos services (retrait de getTypeDocument qui n'est plus nécessaire)
import { getDocument, updateDocument, DeleteDocument } from '@/app/employeur/services/documents';
import url from "@/app/services/url.js";

type ViewerType = 'image' | 'pdf' | 'office' | 'other';

// Interface ajustée selon le nouveau retour de l'API
interface TypeDocument {
  type_document_id: number;
  type_document_titre: string;
  type_document_visible: number;
  type_document_deleted: number;
  tri_ordre: number;
  id: number | null; // ID du document utilisateur (null si non fourni)
  titre: string | null;
  document: string | null; // Nom du fichier sur le serveur
  id_societe: string | null;
  etat: number | null;
  type_document: string | null;
  deleted: number | null;
  created_at: string | null;
  updated_at: string | null;
}

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

// Fonction de décodage des entités HTML
const decodeHTML = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EmployerDocumentsScreen() {
  const [documentTypes, setDocumentTypes] = useState<TypeDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 👁️ États pour la visionneuse intégrée
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerLoading, setViewerLoading] = useState(true);
  const [viewerError, setViewerError] = useState(false);
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerType, setViewerType] = useState<ViewerType>('other');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // On charge l'unique API qui contient désormais l'ensemble des types et des documents associés
      const docRes = await getDocument();
      if (docRes && docRes.success && Array.isArray(docRes.documents)) {
        const sortedTypes = docRes.documents
          .filter((doc: TypeDocument) => !doc.type_document_deleted)
          .sort((a: TypeDocument, b: TypeDocument) => a.tri_ordre - b.tri_ordre);
          
        setDocumentTypes(sortedTypes);
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation des données :", error);
      Alert.alert("Erreur", "Impossible de charger les documents.");
    } finally {
      setLoading(false);
    }
  };

  const handlePickAndUpload = async (docType: TypeDocument) => {
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
      
      // On envoie l'ID du type de document cible
      const response = await updateDocument(fileToUpload, String(docType.type_document_id));

      if (response && response.success) {
        Alert.alert("Succès", `Le document "${decodeHTML(docType.type_document_titre)}" a bien été enregistré.`);
        await loadData(); 
      } else {
        Alert.alert("Erreur", response.message || "Une erreur est survenue lors de l'envoi.");
      }
    } catch (error) {
      console.error("Erreur d'upload :", error);
      Alert.alert("Erreur", "L'envoi a échoué.");
    } finally {
      setLoading(false);
    }
  };

  // Sécurisation de l'ID du document à supprimer
  const handleDelete = async (docType: TypeDocument, userDocId: number | null) => {
    if (!userDocId) {
      Alert.alert("Erreur", "Impossible de trouver l'identifiant du document à supprimer.");
      return;
    }

    Alert.alert(
      "Confirmation",
      `Voulez-vous vraiment supprimer le document : ${decodeHTML(docType.type_document_titre)} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await DeleteDocument(userDocId); 
              Alert.alert("Supprimé", "Document retiré avec succès.");
              await loadData();
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

  const handleViewDocument = async (fileName: string, docTitle: string) => {
    const currentPhotoUrl = url() + "documents/autre_type_entreprise/" + fileName + "?t=" + Date.now();
    const type = getViewerType(fileName);

    if (type === 'pdf' || type === 'office') {
      try {
        await WebBrowser.openBrowserAsync(currentPhotoUrl, {
          toolbarColor: '#1b2d5a',
          controlsColor: '#ffffff',
          showTitle: true,
          enableBarCollapsing: true,
        });
      } catch (error) {
        console.error("Erreur WebBrowser :", error);
        Alert.alert("Erreur", "Impossible d'ouvrir le document.");
      }
    } else {
      setViewerTitle(decodeHTML(docTitle)); 
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

  const remoteViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(viewerUrl)}`;

  if (loading && documentTypes.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2b5bbb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {documentTypes.map((docType: TypeDocument) => {
          // Un document est considéré comme téléversé si l'ID et le nom du fichier existent dans l'objet de l'API
          const isUploaded = docType.id !== null && docType.document !== null;
          const fileName = docType.document;

          return (
            <View key={docType.type_document_id} style={styles.docItem}>
              <View style={styles.docHeader}>
                <Text style={styles.docText}>
                  {decodeHTML(docType.type_document_titre)} {isUploaded && <Text style={{ color: "green" }}>✓</Text>}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.importBtn, isUploaded && styles.replaceBtn]} 
                  onPress={() => handlePickAndUpload(docType)}
                >
                  <Text style={styles.importText}>{isUploaded ? "Modifier " : "Importer "}</Text>
                  <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                </TouchableOpacity>

                {isUploaded && fileName && (
                  <TouchableOpacity 
                    style={styles.iconCircleBlue}
                    onPress={() => handleViewDocument(fileName, docType.type_document_titre)}
                  >
                    <Ionicons name="eye-outline" size={16} color="#2b5bbb" />
                  </TouchableOpacity>
                )}

                {isUploaded && docType.id !== null && (
                  <TouchableOpacity 
                    style={styles.iconCircleRed}
                    onPress={() => handleDelete(docType, docType.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#b64a2f" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* MODAL IMAGE */}
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
                  onHttpError={() => { setLoading(false); setViewerError(true); }}
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