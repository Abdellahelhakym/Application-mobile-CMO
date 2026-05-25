import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { PieChart } from "react-native-chart-kit";

import {
    getDashboardData,
    getSecteursActivite,
} from "@/app/candidat/services/DashboardScreen";

import { getListFils } from "@/app/candidat/services/AttestationsScreen";

type DashboardDataType = {
  user: {
    nom: string;
    verification: number;
  };
  inscriptionStatus: {
    verification?: number;
    informations: number;
    attestations: number;
    competences: number;
  };
  candidatureStats: {
    sent: number;
    replied: number;
    favorites: number;
  };
  sectors: { name: string }[];
  documents: { name: string }[];
};

type SecteurActivite = {
  id_categorie: number;
  categorie: string;
  total_candidatures: number;
};

type MissingDocument = {
  id: number;
  titre: string;
  titre2?: string;
  etats?: number;
};

const emptyDashboardData: DashboardDataType = {
  user: {
    nom: "",
    verification: 0,
  },
  inscriptionStatus: {
    informations: 0,
    attestations: 0,
    competences: 0,
  },
  candidatureStats: {
    sent: 0,
    replied: 0,
    favorites: 0,
  },
  sectors: [],
  documents: [],
};

function normalizeDashboardData(
  data: Partial<DashboardDataType> | null | undefined,
): DashboardDataType {
  const verificationLevel =
    data?.inscriptionStatus?.verification ?? data?.user?.verification ?? 0;

  const computedInscriptionStatus =
    verificationLevel === 1
      ? { informations: 1, attestations: 1, competences: 1 }
      : {
          informations: verificationLevel >= 2 ? 1 : 0,
          attestations: verificationLevel >= 3 ? 1 : 0,
          competences: verificationLevel >= 4 ? 1 : 0,
        };

  const rawDocuments = (data as { documentsManquants?: string[] })
    ?.documentsManquants;
  const normalizedDocuments = Array.isArray(rawDocuments)
    ? rawDocuments.map((name) => ({ name }))
    : (data?.documents ?? emptyDashboardData.documents);

  return {
    user: {
      nom: data?.user?.nom ?? emptyDashboardData.user.nom,
      verification: verificationLevel,
    },
    inscriptionStatus: {
      informations: computedInscriptionStatus.informations,
      attestations: computedInscriptionStatus.attestations,
      competences: computedInscriptionStatus.competences,
    },
    candidatureStats: {
      sent:
        data?.candidatureStats?.sent ??
        emptyDashboardData.candidatureStats.sent,
      replied:
        data?.candidatureStats?.replied ??
        emptyDashboardData.candidatureStats.replied,
      favorites:
        data?.candidatureStats?.favorites ??
        emptyDashboardData.candidatureStats.favorites,
    },
    sectors: data?.sectors ?? emptyDashboardData.sectors,
    documents: normalizedDocuments,
  };
}

export default function DashboardScreen() {
  const [dashboardData, setDashboardData] = useState<DashboardDataType | null>(
    null,
  );
  const [secteursActivite, setSecteursActivite] = useState<SecteurActivite[]>(
    [],
  );
  const [missingDocs, setMissingDocs] = useState<MissingDocument[]>([]);
  const [badgeLoading, setBadgeLoading] = useState(false);

  const loadDashboard = React.useCallback(async () => {
    try {
      const [data, secteurs, docs] = await Promise.all([
        getDashboardData(),
        getSecteursActivite(),
        getListFils(),
      ]);

      setDashboardData(normalizeDashboardData(data));
      setSecteursActivite(Array.isArray(secteurs) ? secteurs : []);
      const list = Array.isArray(docs)
        ? docs
        : Array.isArray(docs?.data)
          ? docs.data
          : [];
      setMissingDocs(list as MissingDocument[]);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      setDashboardData(emptyDashboardData);
      setSecteursActivite([]);
      setMissingDocs([]);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (!dashboardData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const candidatureTotal =
    dashboardData.candidatureStats.sent +
    dashboardData.candidatureStats.replied +
    dashboardData.candidatureStats.favorites;

  const secteurTotal = secteursActivite.reduce(
    (sum, item) => sum + item.total_candidatures,
    0,
  );

  const getPercent = (value: number, totalValue: number) =>
    totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* WELCOME */}
        <View style={styles.card}>
          <View style={styles.row}>
            {dashboardData.user.verification === 1 && (
              <View style={styles.iconBox}>
                <Image
                  source={require("@/img/badge_verifie.png")}
                  style={styles.badgeIcon}
                  resizeMode="contain"
                  onLoadStart={() => setBadgeLoading(true)}
                  onLoadEnd={() => setBadgeLoading(false)}
                  onError={() => setBadgeLoading(false)}
                />
                {badgeLoading ? (
                  <View style={styles.badgeLoading}>
                    <ActivityIndicator size="small" color="#2b5bbb" />
                  </View>
                ) : null}
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                Bonjour, {dashboardData.user.nom}
              </Text>

              <Text style={styles.subtitle}>
                {dashboardData.user.verification === 1
                  ? "Félicitations votre compte est confirmé(e)"
                  : "Vous avez presque finalisé votre inscription en tant que candidat"}
              </Text>
            </View>
          </View>
        </View>

        {/* INSCRIPTION STATUS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>État de l inscription</Text>

          <View style={styles.grid}>
            {[
              {
                label: "Informations",
                value: dashboardData.inscriptionStatus.informations,
              },
              {
                label: "Attestations",
                value: dashboardData.inscriptionStatus.attestations,
              },
              {
                label: "Compétences",
                value: dashboardData.inscriptionStatus.competences,
              },
            ].map((item) => (
              <View key={item.label} style={styles.statusBox}>
                <Feather
                  name={item.value === 1 ? "check-circle" : "x-circle"}
                  size={26}
                  color={item.value === 1 ? "#22c55e" : "#ef4444"}
                />
                <Text style={styles.statusText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CANDIDATURES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mes candidatures</Text>

          <View style={styles.chartRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.item, { color: "#4f6edb" }]}>
                ● {dashboardData.candidatureStats.sent} Envoyées ({getPercent(dashboardData.candidatureStats.sent, candidatureTotal)}%)
              </Text>

              <Text style={[styles.item, { color: "#7cc7a5" }]}>
                ● {dashboardData.candidatureStats.replied} Répondues ({getPercent(dashboardData.candidatureStats.replied, candidatureTotal)}%)
              </Text>

              <Text style={[styles.item, { color: "#f5b82e" }]}>
                ● {dashboardData.candidatureStats.favorites} Favoris ({getPercent(dashboardData.candidatureStats.favorites, candidatureTotal)}%)
              </Text>
            </View>

            <PieChart
              data={[
                {
                  name: "Envoyées",
                  population: dashboardData.candidatureStats.sent,
                  color: "#4f6edb",
                  legendFontColor: "#1b2d5a",
                  legendFontSize: 10,
                },
                {
                  name: "Répondues",
                  population: dashboardData.candidatureStats.replied,
                  color: "#7cc7a5",
                  legendFontColor: "#1b2d5a",
                  legendFontSize: 10,
                },
                {
                  name: "Favoris",
                  population: dashboardData.candidatureStats.favorites,
                  color: "#f5b82e",
                  legendFontColor: "#1b2d5a",
                  legendFontSize: 10,
                },
              ]}
              width={100}
              height={100}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              hasLegend={false}
              chartConfig={{
                color: () => `#000`,
                labelColor: () => "#1b2d5a",
              }}
            />
          </View>
        </View>

        {/* SECTORS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mes secteurs d'activités</Text>

          <View style={styles.chartRow}>
            <View style={{ flex: 1 }}>
              {secteursActivite.map((s, index) => (
                <Text
                  key={s.id_categorie}
                  style={[
                    styles.item,
                    {
                      color: sectorColors[index % sectorColors.length],
                    },
                  ]}
                >
                  ● {s.total_candidatures} {s.categorie} ({getPercent(s.total_candidatures, secteurTotal)}%)
                </Text>
              ))}
            </View>

            <PieChart
              data={secteursActivite.map((s, index) => ({
                name: s.categorie,
                population: s.total_candidatures,
                color: sectorColors[index % sectorColors.length],
                legendFontColor: "#1b2d5a",
                legendFontSize: 10,
              }))}
              width={100}
              height={100}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              hasLegend={false}
              chartConfig={{
                color: () => `#000`,
                labelColor: () => "#1b2d5a",
              }}
            />
          </View>
        </View>

        {/* DOCUMENTS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Documents manquants</Text>

          {missingDocs.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.docRow}
              onPress={() => router.push("/candidat/autre/AttestationsScreen")}
            >
              <Text style={styles.docText}>{doc.titre}</Text>

              <View style={styles.uploadBtn}>
                <Feather name="upload" size={16} color="#2b5bbb" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>© 2026 CMO</Text>
      </View>
    </ScrollView>
  );
}

const sectorColors = [
  "#4f6edb",
  "#7cc7a5",
  "#f5b82e",
  "#e74c3c",
  "#9b59b6",
  "#1abc9c",
  "#e67e22",
];

/* STYLE */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3ff",
    marginBottom: 80,
  },
  content: {
    padding: 15,
    gap: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#eef3ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    position: "relative",
  },
  badgeIcon: {
    width: 28,
    height: 28,
  },
  badgeLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(238, 243, 255, 0.7)",
  },
  title: {
    fontSize: 16,
    color: "#1b2d5a",
  },
  subtitle: {
    fontSize: 12,
    color: "#5b6a8e",
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    color: "#1b2d5a",
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusBox: {
    alignItems: "center",
    flex: 1,
  },
  statusText: {
    fontSize: 11,
    marginTop: 5,
    color: "#1b2d5a",
  },
  item: {
    fontSize: 12,
    color: "#1b2d5a",
    marginVertical: 2,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 10,
    borderColor: "#2b5bbb",
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: {
    fontSize: 12,
    color: "#5b6a8e",
  },
  docRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f6f8ff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  docText: {
    fontSize: 12,
    color: "#1b2d5a",
  },
  uploadBtn: {
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footer: {
    textAlign: "center",
    marginTop: 20,
    color: "#7a8ab8",
    fontSize: 12,
  },
});