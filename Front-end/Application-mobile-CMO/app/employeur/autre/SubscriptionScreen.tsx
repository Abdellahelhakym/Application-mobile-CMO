import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Linking, // 1. Ajout de l'import Linking
} from 'react-native';
import { getHestory } from '@/app/employeur/services/SubscriptionScreen';

const SCREEN_W = Dimensions.get('window').width;

interface HistoryItem {
  id: number;
  token_id: string;
  id_formule: number;
  date_paiement: string;
  montant: string;
  id_user: number;
  statut: number;
  date_heure: string;
  deleted: number;
}

// ── Data Statique avec les liens Stripe intégrés ──────────────────────────────
const plans = [
  {
    id: 'start',
    name: 'START RECRUT',
    subtitle: "L'essentiel pour démarrer",
    price: '149€',
    period: 'HT/MOIS',
    features: ['Accompagnement essentiel'],
    note: 'Vous gérez encore une partie du recrutement',
    buttonColor: '#1e4e2a',
    stripeUrl: 'https://buy.stripe.com/cNicN66Vp2XRcop2jjg3600', // Ajout du lien
  },
  {
    id: 'pro',
    name: 'PRO RECRUT',
    subtitle: 'Contrôle & délégation',
    price: '279€',
    period: 'HT/MOIS',
    features: ['Délégation maîtrisée'],
    note: 'Recommandé pour un recrutement fiable et sécurisé',
    buttonColor: '#2b5bbb',
    stripeUrl: 'https://buy.stripe.com/00w9AU7Ztbundst1ffg3601', // Ajout du lien
  },
  {
    id: 'full',
    name: 'FULL RECRUT',
    subtitle: 'Recrutement clé en main',
    price: '499€',
    period: 'HT/MOIS',
    features: ['Délégation totale'],
    note: 'La solution privilégiée par les employeurs exigeants',
    buttonColor: '#3a4f8f',
    stripeUrl: 'https://buy.stripe.com/8x200k5RlgOHbkl2jjg3602', // Ajout du lien
  },
  {
    id: 'custom',
    name: 'DEVIS PERSONNALISÉ',
    subtitle: 'Solution sur mesure',
    price: '',
    period: '',
    features: ['Volumes importants,', 'recrutement international ou', 'besoins hors standards'],
    isCustom: true,
    buttonColor: '#f0a11b',
    stripeUrl: null,
  },
];

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef3ff' },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#1b2d5a', fontSize: 14, fontWeight: '600' },
  topBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  packBadge: { backgroundColor: '#1b2d5a', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22 },
  packBadgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 40, gap: 14 },
  activeCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#1b2d5a', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3 },
  activeCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#f0a11b' },
  activeLabel: { fontSize: 10, color: '#8a99bb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  activeName: { fontSize: 15, color: '#1b2d5a', fontWeight: '700', marginTop: 1 },
  activeSub: { fontSize: 11, color: '#7a89ad', marginTop: 2 },
  changeBtn: { backgroundColor: '#eef3ff', borderWidth: 1.5, borderColor: '#c5cfe8', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  changeBtnText: { fontSize: 11, color: '#1b2d5a', fontWeight: '700', textAlign: 'center', lineHeight: 16 },
  historyTitle: { fontSize: 15, color: '#1b2d5a', fontWeight: '700', marginBottom: 10 },
  emptyText: { textAlign: 'center', color: '#8a99bb', marginTop: 20, fontSize: 14 },
  invoiceCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#1b2d5a', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 2 },
  invoiceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  invoicePackName: { fontSize: 14, color: '#1b2d5a', fontWeight: '700' },
  invoiceDate:     { fontSize: 12, color: '#8a99bb', fontWeight: '500', marginTop: 2 },
  invoiceBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  invoiceAmount:   { fontSize: 13, color: '#1b2d5a', fontWeight: '600' },
  badge:           { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeGreen:      { backgroundColor: '#d4f0de' },
  badgeOrange:     { backgroundColor: '#fde8c2' },
  badgeText:       { fontSize: 12, fontWeight: '600' },
  badgeTextGreen:  { color: '#1e6b3a' },
  badgeTextOrange: { color: '#c07000' },
  actionBtn: { backgroundColor: '#2b5bbb', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  plansHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#1b2d5a', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  backArrow: { fontSize: 20, color: '#1b2d5a' },
  plansTitle: { fontSize: 17, color: '#1b2d5a', fontWeight: '700' },
  plansContent: { padding: 16, gap: 16, paddingBottom: 100 },
  planCard: { borderRadius: 18, borderWidth: 1, borderColor: '#e1e9fb', overflow: 'hidden', backgroundColor: '#eef3ff' },
  planCardCustom: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#f0a11b' },
  planCardTop: { backgroundColor: '#fff', padding: 18, alignItems: 'center' },
  planName: { fontSize: 16, color: '#1b2d5a', fontWeight: '700' },
  planSubtitle: { fontSize: 13, color: '#5b6a8e', marginTop: 4 },
  planPrice: { fontSize: 26, color: '#1b2d5a', marginTop: 10, fontWeight: '700' },
  planPeriod: { fontSize: 12, color: '#5b6a8e' },
  planCardBottom: { backgroundColor: '#eef3ff', padding: 16, alignItems: 'center', gap: 4 },
  planFeature: { fontSize: 13, color: '#1b2d5a' },
  planBtn: { marginTop: 10, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 22 },
  planBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  planNote: { marginTop: 10, fontSize: 12, color: '#5b6a8e', textAlign: 'center' },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ statut }: { statut: number }) {
  const isAccepted = statut === 1; 
  return (
    <View style={[styles.badge, isAccepted ? styles.badgeGreen : styles.badgeOrange]}>
      <Text style={[styles.badgeText, isAccepted ? styles.badgeTextGreen : styles.badgeTextOrange]}>
        {isAccepted ? 'Accepté' : 'En attente'}
      </Text>
    </View>
  );
}

function ActionBtn() {
  return (
    <TouchableOpacity style={styles.actionBtn}>
      <Text style={styles.actionBtnText}>Télécharger ⬇</Text>
    </TouchableOpacity>
  );
}

function formatDate(dateString: string) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
}

function getPackNameByIdFormule(id_formule: number): string {
  switch (id_formule) {
    case 1: return 'START RECRUT';
    case 2: return 'PRO RECRUT';
    case 3: return 'FULL RECRUT';
    case 4: return 'DEVIS PERSONNALISÉ';
    default: return 'PACK INCONNU';
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SubscriptionScreen() {
  const [view, setView] = useState<'dashboard' | 'plans'>('dashboard');
  const [currentPack, setCurrentPack] = useState<string>('DEVIS PERSONNALISÉ');
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        const response = await getHestory();
        if (response) {
          if (response.pack) setCurrentPack(response.pack);
          if (Array.isArray(response.historique)) setHistoryList(response.historique);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptionData();
  }, []);

  // Fonction pour gérer la redirection vers Stripe
  const handlePlanSelection = async (plan: typeof plans[0]) => {
    if (plan.isCustom) {
      // Optionnel : Gérer l'action pour le devis personnalisé (ex: ouvrir mail ou formulaire)
      return;
    }

    if (plan.stripeUrl) {
      try {
        const supported = await Linking.canOpenURL(plan.stripeUrl);
        if (supported) {
          await Linking.openURL(plan.stripeUrl);
        } else {
          console.error("Impossible d'ouvrir ce lien : " + plan.stripeUrl);
        }
      } catch (error) {
        console.error("Erreur lors de l'ouverture du lien Stripe:", error);
      }
    }
  };

  if (view === 'plans') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#eef3ff" />
        <View style={styles.plansHeader}>
          <TouchableOpacity onPress={() => setView('dashboard')} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.plansTitle}>Choisir un pack</Text>
          <View style={{ width: 38 }} />
        </View>
        <ScrollView contentContainerStyle={styles.plansContent}>
          {plans.map((plan) => (
            <View key={plan.id} style={[styles.planCard, plan.isCustom && styles.planCardCustom]}>
              <View style={styles.planCardTop}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                {plan.price !== '' && (
                  <Text style={styles.planPrice}>
                    {plan.price} <Text style={styles.planPeriod}>{plan.period}</Text>
                  </Text>
                )}
              </View>
              <View style={styles.planCardBottom}>
                {plan.features.map((f, i) => <Text key={i} style={styles.planFeature}>{f}</Text>)}
                
                <TouchableOpacity
                  style={[styles.planBtn, { backgroundColor: plan.buttonColor }]}
                  onPress={() => handlePlanSelection(plan)} // Redirection Stripe au clic
                >
                  <Text style={styles.planBtnText}>
                    {plan.isCustom || currentPack === plan.name ? 'VOTRE PACK ACTUEL' : 'CHOISIR'}
                  </Text>
                </TouchableOpacity>

                {!plan.isCustom && <Text style={styles.planNote}>{plan.note}</Text>}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#eef3ff" />
      <View style={styles.topBar}>
        <View style={styles.packBadge}>
          <Text style={styles.packBadgeText}>Pack {currentPack}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2b5bbb" />
          <Text style={styles.loadingText}>Chargement de vos données...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.activeCard}>
            <View style={styles.activeCardLeft}>
              <View style={styles.activeDot} />
              <View>
                <Text style={styles.activeLabel}>Pack actif</Text>
                <Text style={styles.activeName}>{currentPack}</Text>
                <Text style={styles.activeSub}>Mis à jour dynamiquement</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.changeBtn} onPress={() => setView('plans')}>
              <Text style={styles.changeBtnText}>Changer{'\n'}de pack</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.historyTitle}>Historique de facturation</Text>

          {historyList.length === 0 ? (
            <Text style={styles.emptyText}>Aucun historique de paiement disponible.</Text>
          ) : (
            historyList.map((inv) => (
              <View key={inv.id.toString()} style={styles.invoiceCard}>
                <View style={styles.invoiceTop}>
                  <View>
                    <Text style={styles.invoicePackName}>
                      {getPackNameByIdFormule(inv.id_formule)}
                    </Text>
                    <Text style={styles.invoiceDate}>{formatDate(inv.date_paiement)}</Text>
                  </View>
                  <StatusBadge statut={inv.statut} />
                </View>
                <View style={styles.invoiceBottom}>
                  <Text style={styles.invoiceAmount}>{inv.montant} € HT</Text>
                  <ActionBtn />
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}