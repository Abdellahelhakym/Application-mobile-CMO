import React, { useState, useCallback } from "react"; 
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, Image } from "react-native";
import { useFocusEffect, router } from "expo-router"; 
import { Award, Bell, FileText, MessageSquare, Phone, Search, UserCheck } from "lucide-react-native";

import { getPhase1, getPhase2, getPhase3, getPhase4, getPhase5, getPack } from "@/app/employeur/services/EmployerDashboard";
import { getPsaudo } from "@/app/employeur/services/token_id";
import { getImage } from '@/app/employeur/services/documents';
import { getNotification } from '../../employeur/services/messagerie'; 
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
  const [notifCount, setNotifCount] = useState<number>(0);
  
  const [phase1Stats, setPhase1Stats] = useState({ nouvelleCommande: 0, nombrePoste: 0, enCours: 0, commandeValidee: 0, commandesRefusees: 0, commandesAnnulees: 0 });
  const [phase2Stats, setPhase2Stats] = useState({ candidatsProposes: 0, candidatsContactes: 0, candidatsInteresses: 0, candidatsAcceptes: 0, preselectionValidee: 0, preselectionNonValidee: 0 });
  const [phase3Stats, setPhase3Stats] = useState({ entretienProgramme: 0, candidatRetenu: 0, candidatNonRetenu: 0 });
  const [phase4Stats, setPhase4Stats] = useState({ contratEnCours: 0, contratSigne: 0, salarieIntegre: 0, periodeEssai: 0 });
  const [phase5Stats, setPhase5Stats] = useState({ retenu: 0, nonRetenu: 0, missionTermine: 0 });

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchData = async () => {
        try {
          const [packRes, imgRes, ph1, ph2, ph3, ph4, ph5, notifRes] = await Promise.all([
            getPack(), getImage(), getPhase1(), getPhase2(), getPhase3(), getPhase4(), getPhase5(), getNotification()
          ]);

          if (!isMounted) return;

          // Pack
          if (packRes?.id_formule && PACK_NAMES[packRes.id_formule]) setPackName(PACK_NAMES[packRes.id_formule]);
          else setPackName("AUCUN PACK ACTIF");

          // Image
          if (imgRes?.image) setPhotoUrl(`${url()}documents/photos_employeur/${imgRes.image}?t=${Date.now()}`);

          // Stats & Notifications
          if (ph1?.success) setPhase1Stats({ nouvelleCommande: ph1.nouvelle_commande ?? 0, nombrePoste: ph1.nombre_poste ?? 0, enCours: ph1["En_cours"] ?? 0, commandeValidee: ph1["commande_validée"] ?? 0, commandesRefusees: ph1["commandes_refusées"] ?? 0, commandesAnnulees: ph1["commandes_annulées"] ?? 0 });
          if (ph2?.success) setPhase2Stats({ candidatsProposes: ph2.phase2_1 ?? 0, candidatsContactes: ph2.phase2_2 ?? 0, candidatsInteresses: ph2.phase2_3 ?? 0, candidatsAcceptes: ph2.phase2_4 ?? 0, preselectionValidee: ph2.phase2_5 ?? 0, preselectionNonValidee: ph2.phase2_6 ?? 0 });
          if (ph3?.success) setPhase3Stats({ entretienProgramme: ph3.phase3_1 ?? 0, candidatRetenu: ph3.phase3_2 ?? 0, candidatNonRetenu: ph3.phase3_3 ?? 0 });
          if (ph4?.success) setPhase4Stats({ contratEnCours: ph4.phase4_1 ?? 0, contratSigne: ph4.phase4_2 ?? 0, salarieIntegre: ph4.phase4_3 ?? 0, periodeEssai: ph4.phase4_4 ?? 0 });
          if (ph5?.success) setPhase5Stats({ retenu: ph5.phase5_1 ?? 0, nonRetenu: ph5.phase5_2 ?? 0, missionTermine: ph5.phase5_3 ?? 0 });
          
          if (notifRes?.success) setNotifCount(notifRes.nombre_msg ?? 0);

        } catch (error) {
          console.log("Erreur chargement dashboard:", error);
        }
      };

      fetchData();
      return () => { isMounted = false; };
    }, [])
  );

  const recruitmentPhases = [
    { id: 1, title: 'PHASE 1 : Traitement de la commande', icon: Search, stats: [{ label: 'Nouvelle commande', value: phase1Stats.nouvelleCommande, color: '#e8f0ff', text: '#1e3c76' }, { label: 'Nombre de poste', value: phase1Stats.nombrePoste, color: '#dff1ff', text: '#1e3c76' }, { label: "En cours d'analyse", value: phase1Stats.enCours, color: '#ffe9cf', text: '#1e3c76' }, { label: 'Commande validée', value: phase1Stats.commandeValidee, color: '#dfeee2', text: '#1e3c76' }, { label: 'Commandes refusées', value: phase1Stats.commandesRefusees, color: '#dfeee2', text: '#1e3c76' }, { label: 'Commandes annulées', value: phase1Stats.commandesAnnulees, color: '#dfeee2', text: '#1e3c76' }] },
    { id: 2, title: 'PHASE 2 : Sourcing et Présélection', icon: Search, stats: [{ label: 'Candidats proposés', value: phase2Stats.candidatsProposes, color: '#e8f0ff', text: '#2b5bbb' }, { label: 'Candidats contactés', value: phase2Stats.candidatsContactes, color: '#dff1ff', text: '#2778b8' }, { label: 'Candidats intéressés', value: phase2Stats.candidatsInteresses, color: '#ffe9cf', text: '#b87400' }, { label: 'Candidats acceptés', value: phase2Stats.candidatsAcceptes, color: '#dfeee2', text: '#2e7d5c' }, { label: 'Présélection validée', value: phase2Stats.preselectionValidee, color: '#dfeee2', text: '#2e7d5c' }, { label: 'Présélection non-validée', value: phase2Stats.preselectionNonValidee, color: '#ffd9cf', text: '#b84c3a' }] },
    { id: 3, title: 'PHASE 3 : Entretien et Validation employeur', icon: UserCheck, stats: [{ label: 'Entretien programmé', value: phase3Stats.entretienProgramme, color: '#dff1ff', text: '#2778b8' }, { label: 'Candidat retenu', value: phase3Stats.candidatRetenu, color: '#dfeee2', text: '#2e7d5c' }, { label: 'Candidat non retenu', value: phase3Stats.candidatNonRetenu, color: '#ffd9cf', text: '#b84c3a' }] },
    { id: 4, title: 'PHASE 4 : Embauche et intégration', icon: FileText, stats: [{ label: 'Contrat en cours', value: phase4Stats.contratEnCours, color: '#ffe9cf', text: '#b87400' }, { label: 'Contrat signé', value: phase4Stats.contratSigne, color: '#dff1ff', text: '#2778b8' }, { label: 'Salarié intégré', value: phase4Stats.salarieIntegre, color: '#dfeee2', text: '#2e7d5c' }, { label: "Période d'essai", value: phase4Stats.periodeEssai, color: '#e8f0ff', text: '#1e3c76' }] },
    { id: 5, title: 'PHASE 5 : Fin de période d\'essai', icon: Award, stats: [{ label: 'Retenu', value: phase5Stats.retenu, color: '#dfeee2', text: '#2e7d5c' }, { label: 'Non retenu', value: phase5Stats.nonRetenu, color: '#ffd9cf', text: '#b84c3a' }, { label: 'Mission terminé', value: phase5Stats.missionTermine, color: '#dff1ff', text: '#2778b8' }] }
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.logoBox}>{photoUrl ? <Image source={{ uri: photoUrl }} style={styles.avatarImage} /> : <Text style={styles.logoText}>Logo</Text>}</View>
            <View style={styles.infoContent}>
              <Text style={styles.company}>{getPsaudo()}</Text>
              <Text style={styles.sub}>Pack {packName}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnOutline} onPress={() => Linking.openURL("tel:+33788361923")}>
              <Phone size={16} color="#2b5bbb" /><Text style={styles.btnText}>Conseiller</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOutline} onPress={() => router.push("/employeur/autre/Chat")}>
              <MessageSquare size={16} color="#2b5bbb" /><Text style={styles.btnText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOutline} onPress={() => router.push("/employeur/autre/Notification")}>
              <View>
                <Bell size={19} color="#2b5bbb" />
                {notifCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{notifCount > 9 ? '9+' : notifCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.btnText}>Notification</Text>
            </TouchableOpacity>
          </View>
        </View>

        {[...recruitmentPhases].sort((a, b) => a.id - b.id).map((phase) => {
          const Icon = phase.icon;
          return (
            <View key={phase.id} style={styles.card}>
              <View style={styles.phaseHeader}>
                <View style={styles.iconBox}><Icon size={20} color="#2b5bbb" /></View>
                <Text style={styles.phaseTitle}>{phase.title}</Text>
              </View>
              <View style={styles.grid}>
                {phase.stats.map((stat, i) => (
                  <View key={i} style={[styles.statBox, { backgroundColor: stat.color }]}>
                    <Text style={[styles.statLabel, { color: stat.text }]}>{stat.label}</Text>
                    <Text style={[styles.statValue, { color: stat.text }]}>{stat.value}</Text>
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
  logoBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#eef3ff", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  logoText: { fontSize: 10, color: "#2b5bbb" },
  avatarImage: { width: "100%", height: "100%", resizeMode: "cover" },
  infoContent: { flex: 1 },
  company: { fontSize: 15, fontWeight: "600", color: "#1b2d5a" },
  sub: { color: "#2b5bbb", marginTop: 2, fontSize: 12 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  btnOutline: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "#cfd9ee", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18 },
  btnText: { color: "#2b5bbb", fontSize: 12, fontWeight: "600" },
  badge: { position: 'absolute', right: -6, top: -6, backgroundColor: '#ff3b30', borderRadius: 10, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 15 },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eef3ff', justifyContent: 'center', alignItems: 'center' },
  phaseTitle: { fontSize: 13, color: '#1b2d5a', flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: { width: '48%', borderRadius: 14, padding: 10 },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 18, fontWeight: '600', marginTop: 5 },
});