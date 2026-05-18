import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    getExperiences,
    getFormations,
    getImage,
    getInformations,
    getMobiliteUser
} from "@/app/candidat/services/CVScreen";
import url from "@/app/services/url";
import { useFocusEffect } from "@react-navigation/native";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [photo, setPhoto] = useState("");
  const [mobilite, setMobilite] = useState("");
  const [niveauEtude, setNiveauEtude] = useState("");
  const [experiences, setExperiences] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const info = await getInformations();
      const i = Array.isArray(info) ? info[0] : info?.data?.[0] ?? info;
      setNom([i?.civilite, i?.prenom, i?.nom].filter(Boolean).join(" "));
      setEmail(i?.email ?? "");
      setPhone(i?.tel ?? "");
      setVille(i?.ville ?? "");
      setPays(i?.pays ?? "");

      const img = await getImage();
      const imageUrl = img?.image
        ? url() + "files/img_user/" + img.image
        : "";
      setPhoto(imageUrl || i?.photo || "");

      const mob = await getMobiliteUser();
      setMobilite(mob?.mobilite?.[0]?.region ?? "");
      setNiveauEtude(mob?.niveau_etude ?? "");

      const exp = await getExperiences();
      setExperiences(Array.isArray(exp) ? exp : exp?.data ?? []);

      const form = await getFormations();
      setFormations(Array.isArray(form) ? form : form?.data ?? []);
    } catch (error) {
      console.log("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── HEADER CARD ── */}
        <View style={styles.headerCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                photo
                  ? { uri: photo }
                  : { uri: "https://cdn-icons-png.flaticon.com/512/847/847969.png" }
              }
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>{nom || "—"}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{email || "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{phone || "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>
              {[ville, pays].filter(Boolean).join(", ") || "—"}
            </Text>
          </View>
        </View>

        {/* ── MOBILITÉ ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>Mobilité</Text>
          </View>
          <Text style={styles.value}>{mobilite || "—"}</Text>
        </View>

        {/* ── NIVEAU D'ÉTUDES ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>Niveau d'études</Text>
          </View>
          <Text style={styles.value}>{niveauEtude || "-"}</Text>
        </View>

        {/* ── EXPÉRIENCES ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>Expériences professionnelles</Text>
          </View>

          {experiences.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyDot}>•</Text>
              <Text style={styles.emptyText}>Aucune expérience enregistrée</Text>
            </View>
          ) : (
            experiences.map((exp, index) => (
              <View key={index} style={styles.expCard}>
                <View style={styles.expDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.expTitle}>{exp.titre}</Text>
                  <Text style={styles.expSub}>
                    {exp.societe}{exp.ville_pays ? ` · ${exp.ville_pays}` : ""}
                  </Text>
                  <Text style={styles.expDate}>
                    {exp.date1}{exp.date2 ? ` – ${exp.date2}` : ""}
                  </Text>
                  {exp.description ? (
                    <Text style={styles.expDesc}>{exp.description}</Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>

        {/* ── FORMATIONS ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>Formation</Text>
          </View>

          {formations.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyDot}>•</Text>
              <Text style={styles.emptyText}>Aucune formation enregistrée</Text>
            </View>
          ) : (
            formations.map((edu, index) => (
              <View key={index} style={styles.expCard}>
                <View style={styles.expDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.expTitle}>{edu.diplome}</Text>
                  <Text style={styles.expSub}>{edu.ecole}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* ── ATTESTATIONS ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>Attestations</Text>
          </View>
          <Text style={styles.emptyText}>Aucune attestation</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },
  scroll: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },

  // Header card
  headerCard: {
    backgroundColor: "#1e3a8a",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#dce8ff",
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 13,
    color: "#c8d6f0",
  },

  // Section cards
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#1b2d5a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  sectionBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: "#2b5bbb",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e3a8a",
  },
  value: {
    fontSize: 14,
    color: "#374151",
  },

  // Empty state
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  emptyDot: {
    fontSize: 14,
    color: "#2b5bbb",
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
  },

  // Expérience items
  expCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  expDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2b5bbb",
    marginTop: 5,
  },
  expTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e3a8a",
  },
  expSub: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 2,
  },
  expDate: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  expDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 18,
  },
});