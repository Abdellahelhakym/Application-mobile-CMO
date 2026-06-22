import React, { useState, useCallback } from "react"; // 👈 Remplacement de useEffect par useCallback
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, Image } from "react-native";
import { useFocusEffect , router} from "expo-router"; // 👈 Importation du hook de navigation d'Expo

import { Award, FileText, MessageSquare, Phone, Search, UserCheck } from "lucide-react-native";

import { getPhase1, getPhase2, getPhase3, getPhase4, getPhase5, getPack } from "@/app/employeur/services/EmployerDashboard";
import { getPsaudo } from "@/app/employeur/services/token_id";
import { getImage } from '@/app/employeur/services/documents';
import url from "@/app/services/url.js";

const PACK_NAMES: { [key: number]: string } = {
  1: "START RECRUT",
  2: "PRO RECRUT",
  3: "FULL RECRUT",
  4: "DEVIS PERSONNALISÉ"
};

export default function EmployerDashboard() {
  const [packName, setPackName] = useState<string>("Chargement du pack...");
  const [photoUrl, setPhotoUrl] = useState<string>(""); 
  
  const [phase1Stats, setPhase1Stats] = useState({
    nouvelleCommande: 0,
    nombrePoste: 0,
    enCours: 0,
    commandeValidee: 0,
    commandesRefusees: 0,
    commandesAnnulees: 0,
  });
  const [phase2Stats, setPhase2Stats] = useState({
    candidatsProposes: 0,
    candidatsContactes: 0,
    candidatsInteresses: 0,
    candidatsAcceptes: 0,
    preselectionValidee: 0,
    preselectionNonValidee: 0,
  });
  const [phase3Stats, setPhase3Stats] = useState({
    entretienProgramme: 0,
    candidatRetenu: 0,
    candidatNonRetenu: 0,
  });
  const [phase4Stats, setPhase4Stats] = useState({
    contratEnCours: 0,
    contratSigne: 0,
    salarieIntegre: 0,
    periodeEssai: 0,
  });
  const [phase5Stats, setPhase5Stats] = useState({
    retenu: 0,
    nonRetenu: 0,
    missionTermine: 0,
  });

  // 👈 useFocusEffect s'exécute à CHAQUE FOIS que l'utilisateur entre sur la page
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchPackData = async () => {
        try {
          const response = await getPack();
          if (!isMounted) return;

          const idFormule = response?.id_formule;
          if (idFormule && PACK_NAMES[idFormule]) {
            setPackName(PACK_NAMES[idFormule]);
          } else {
            setPackName("AUCUN PACK ACTIF");
          }
        } catch (error) {
          console.log("Erreur récupération pack:", error);
          if (isMounted) setPackName("DEVIS PERSONNALISÉ");
        }
      };

      const fetchEmployerImage = async () => {
        try {
          const imageData = await getImage();
          if (!isMounted) return;

          if (imageData?.image) {
            // 👈 Ajout de `?t=` avec le timestamp actuel (Date.now()) pour casser le cache de l'image
            const currentPhotoUrl = url() + "documents/photos_employeur/" + imageData.image + "?t=" + Date.now();
            setPhotoUrl(currentPhotoUrl);
          }
        } catch (imgError) {
          console.log("Pas d'image ou erreur de récupération :", imgError);
        }
      };

      const fetchPhase1 = async () => {
        try {
          const response = await getPhase1();
          if (!isMounted) return;
          if (response?.success) {
            setPhase1Stats({
              nouvelleCommande: response.nouvelle_commande ?? 0,
              nombrePoste: response.nombre_poste ?? 0,
              enCours: response["En_cours"] ?? 0,
              commandeValidee: response["commande_validée"] ?? 0,
              commandesRefusees: response["commandes_refusées"] ?? 0,
              commandesAnnulees: response["commandes_annulées"] ?? 0,
            });
          }
        } catch (error) {
          console.log("Erreur phase 1:", error);
        }
      };

      const fetchPhase2 = async () => {
        try {
          const response = await getPhase2();
          if (!isMounted) return;
          if (response?.success) {
            setPhase2Stats({
              candidatsProposes: response.phase2_1 ?? 0,
              candidatsContactes: response.phase2_2 ?? 0,
              candidatsInteresses: response.phase2_3 ?? 0,
              candidatsAcceptes: response.phase2_4 ?? 0,
              preselectionValidee: response.phase2_5 ?? 0,
              preselectionNonValidee: response.phase2_6 ?? 0,
            });
          }
        } catch (error) {
          console.log("Erreur phase 2:", error);
        }
      };

      const fetchPhase3 = async () => {
        try {
          const response = await getPhase3();
          if (!isMounted) return;
          if (response?.success) {
            setPhase3Stats({
              entretienProgramme: response.phase3_1 ?? 0,
              candidatRetenu: response.phase3_2 ?? 0,
              candidatNonRetenu: response.phase3_3 ?? 0,
            });
          }
        } catch (error) {
          console.log("Erreur phase 3:", error);
        }
      };

      const fetchPhase4 = async () => {
        try {
          const response = await getPhase4();
          if (!isMounted) return;
          if (response?.success) {
            setPhase4Stats({
              contratEnCours: response.phase4_1 ?? 0,
              contratSigne: response.phase4_2 ?? 0,
              salarieIntegre: response.phase4_3 ?? 0,
              periodeEssai: response.phase4_4 ?? 0,
            });
          }
        } catch (error) {
          console.log("Erreur phase 4:", error);
        }
      };

      const fetchPhase5 = async () => {
        try {
          const response = await getPhase5();
          if (!isMounted) return;
          if (response?.success) {
            setPhase5Stats({
              retenu: response.phase5_1 ?? 0,
              nonRetenu: response.phase5_2 ?? 0,
              missionTermine: response.phase5_3 ?? 0,
            });
          }
        } catch (error) {
          console.log("Erreur phase 5:", error);
        }
      };

      // Exécution de toutes les requêtes à l'entrée sur l'écran
      fetchPackData();
      fetchEmployerImage();
      fetchPhase1();
      fetchPhase2();
      fetchPhase3();
      fetchPhase4();
      fetchPhase5();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const recruitmentPhases = [
    {
      id: 1,
      title: 'PHASE 1 : Traitement de la commande',
      icon: Search,
      stats: [
        { label: 'Nouvelle commande', value: phase1Stats.nouvelleCommande, color: '#e8f0ff', text: '#1e3c76' },
        { label: 'Nombre de poste', value: phase1Stats.nombrePoste, color: '#dff1ff', text: '#1e3c76' },
        { label: "En cours d'analyse", value: phase1Stats.enCours, color: '#ffe9cf', text: '#1e3c76' },
        { label: 'Commande validée', value: phase1Stats.commandeValidee, color: '#dfeee2', text: '#1e3c76' },
        { label: 'Commandes refusées', value: phase1Stats.commandesRefusees, color: '#dfeee2', text: '#1e3c76' },
        { label: 'Commandes annulées', value: phase1Stats.commandesAnnulees, color: '#dfeee2', text: '#1e3c76' },
      ],
    },
    {
      id: 2,
      title: 'PHASE 2 : Sourcing et Présélection',
      icon: Search,
      stats: [
        { label: 'Candidats proposés', value: phase2Stats.candidatsProposes, color: '#e8f0ff', text: '#2b5bbb' },
        { label: 'Candidats contactés', value: phase2Stats.candidatsContactes, color: '#dff1ff', text: '#2778b8' },
        { label: 'Candidats intéressés', value: phase2Stats.candidatsInteresses, color: '#ffe9cf', text: '#b87400' },
        { label: 'Candidats acceptés', value: phase2Stats.candidatsAcceptes, color: '#dfeee2', text: '#2e7d5c' },
        { label: 'Présélection validée', value: phase2Stats.preselectionValidee, color: '#dfeee2', text: '#2e7d5c' },
        { label: 'Présélection non-validée', value: phase2Stats.preselectionNonValidee, color: '#ffd9cf', text: '#b84c3a' },
      ],
    },
    {
      id: 3,
      title: 'PHASE 3 : Entretien et Validation employeur',
      icon: UserCheck,
      stats: [
        { label: 'Entretien programmé', value: phase3Stats.entretienProgramme, color: '#dff1ff', text: '#2778b8' },
        { label: 'Candidat retenu', value: phase3Stats.candidatRetenu, color: '#dfeee2', text: '#2e7d5c' },
        { label: 'Candidat non retenu', value: phase3Stats.candidatNonRetenu, color: '#ffd9cf', text: '#b84c3a' },
      ],
    },
    {
      id: 4,
      title: 'PHASE 4 : Embauche et intégration',
      icon: FileText,
      stats: [
        { label: 'Contrat en cours', value: phase4Stats.contratEnCours, color: '#ffe9cf', text: '#b87400' },
        { label: 'Contrat signé', value: phase4Stats.contratSigne, color: '#dff1ff', text: '#2778b8' },
        { label: 'Salarié intégré', value: phase4Stats.salarieIntegre, color: '#dfeee2', text: '#2e7d5c' },
        { label: "Période d'essai", value: phase4Stats.periodeEssai, color: '#e8f0ff', text: '#1e3c76' },
      ],
    },
    {
      id: 5,
      title: 'PHASE 5 : Fin de période d\'essai',
      icon: Award,
      stats: [
        { label: 'Retenu', value: phase5Stats.retenu, color: '#dfeee2', text: '#2e7d5c' },
        { label: 'Non retenu', value: phase5Stats.nonRetenu, color: '#ffd9cf', text: '#b84c3a' },
        { label: 'Mission terminé', value: phase5Stats.missionTermine, color: '#dff1ff', text: '#2778b8' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* CARD INFO */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.logoBox}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.logoText}>Logo</Text>
              )}
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.company}>{getPsaudo()}</Text>
              <Text style={styles.sub}>Pack {packName}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnOutline} onPress={() => Linking.openURL("tel:+212788361923")}>
              <Phone size={16} color="#2b5bbb" />
              <Text style={styles.btnText}>Conseiller</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnOutline}  onPress={() => router.push("/employeur/autre/Chat")}>
              <MessageSquare size={16} color="#2b5bbb" />
              <Text style={styles.btnText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {[...recruitmentPhases].sort((a, b) => a.id - b.id).map((phase) => {
          const Icon = phase.icon;

          return (
            <View key={phase.id} style={styles.card}>
              <View style={styles.phaseHeader}>
                <View style={styles.iconBox}>
                  <Icon size={20} color="#2b5bbb" />
                </View>
                <Text style={styles.phaseTitle}>{phase.title}</Text>
              </View>

              <View style={styles.grid}>
                {phase.stats.map((stat, i) => (
                  <View
                    key={i}
                    style={[styles.statBox, { backgroundColor: stat.color }]}
                  >
                    <Text style={[styles.statLabel, { color: stat.text }]}>
                      {stat.label}
                    </Text>
                    <Text style={[styles.statValue, { color: stat.text }]}>
                      {stat.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef3ff' },
  content: { padding: 15, gap: 15, paddingBottom: 120 },
  infoCard: { backgroundColor: "#fff", borderRadius: 18, padding: 15 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: { 
    width: 50, 
    height: 50, 
    borderRadius: 12, 
    backgroundColor: "#eef3ff", 
    justifyContent: "center", 
    alignItems: "center",
    overflow: "hidden" 
  },
  logoText: { fontSize: 10, color: "#2b5bbb" },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  infoContent: { flex: 1 },
  company: { fontSize: 15, fontWeight: "600", color: "#1b2d5a" },
  sub: { color: "#2b5bbb", marginTop: 2, fontSize: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  btnOutline: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "#cfd9ee", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18 },
  btnText: { color: "#2b5bbb", fontSize: 12, fontWeight: "600" },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 15 },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eef3ff', justifyContent: 'center', alignItems: 'center' },
  phaseTitle: { fontSize: 13, color: '#1b2d5a', flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: { width: '48%', borderRadius: 14, padding: 10 },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 18, fontWeight: '600', marginTop: 5 },
});