import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const documents = [
  "Piece d'identite",
  "Mandat",
  "KBIS",
  "Attestation de vigilance MSA",
  "Cloture offre France travail",
  "Attestation de vigilance URSSAF",
];

export default function EmployerDocumentsScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
    
      {/* DOCUMENTS LIST */}
      <View style={styles.card}>
        {documents.map((doc, index) => (
          <View key={index} style={styles.docItem}>
            <Text style={styles.docText}>{doc}</Text>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.importBtn}>
                <Text style={styles.importText}>Importer </Text>
                <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconCircleBlue}>
                <Ionicons name="eye-outline" size={16} color="#2b5bbb" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconCircleRed}>
                <Ionicons name="trash-outline" size={16} color="#b64a2f" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3ff",
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

  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1b2d5a",
  },

  row: {
    flexDirection: "row",
    marginTop: 10,
  },

  outlineBtn: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#cfd9ee",
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  btnText: {
    marginLeft: 5,
  },

  notice: {
    marginTop: 10,
    backgroundColor: "#fff1dc",
    padding: 10,
    borderRadius: 10,
    color: "#1b2d5a",
  },

  docItem: {
    backgroundColor: "#f6f8ff",
    borderWidth: 1,
    borderColor: "#e1e9fb",
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
  },

  docText: {
    fontSize: 14,
    color: "#1b2d5a",
    marginBottom: 10,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  importBtn: {
    flexDirection: "row",
    backgroundColor: "#2b5bbb",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    marginRight: 5,
  },

  importText: {
    color: "#fff",
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