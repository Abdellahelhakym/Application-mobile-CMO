import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router'; 

export default function AssistanceCMO() {


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#edf2fb" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Titre principal */}
        <Text style={styles.headerTitle}>Assistance CMO</Text>

        {/* Intro - Mains secouées */}
        <View style={styles.introCard}>
          <View style={styles.handshakeCircle}>
            <FontAwesome5 name="handshake" size={26} color="#2b52a1" />
          </View>
          <Text style={styles.cardTitleBlue}>
            Vous résidez hors de l'Union européenne et un employeur souhaite poursuivre votre candidature ?
          </Text>
          <Text style={styles.cardTextSecondary}>
            Certaines démarches administratives peuvent être nécessaires avant de pouvoir travailler en France. CMO peut vous accompagner à chaque étape de votre procédure.
          </Text>
        </View>

        {/* 1. Cadeau */}
        <View style={styles.card}>
          <View style={styles.iconCircleOutline}>
            <MaterialCommunityIcons name="gift-outline" size={32} color="#2b52a1" />
          </View>
          <Text style={styles.sectionTitle}>1. Ce qui reste toujours gratuit</Text>
          <Text style={styles.cardTextSecondary}>
            L'inscription sur MYCMO, la consultation des offres, les candidatures, la recherche d'un employeur et la mise en relation avec les employeurs sont entièrement gratuites.
          </Text>
          <Text style={[styles.cardTextSecondary, styles.boldText]}>
            Vous ne payez jamais CMO pour obtenir un emploi ou être présenté à un employeur.
          </Text>
        </View>

        {/* 2. Icône 95 € (Exact comme l'image 1) */}
        <View style={styles.card}>
          <View style={styles.iconCircleOutline}>
            <Text style={styles.priceBadgeText}>95 €</Text>
          </View>
          <Text style={styles.sectionTitle}>2. À quoi correspondent les 95 € ?</Text>
          <Text style={styles.cardTextSecondary}>
            Les 95 € correspondent exclusivement à une prestation d'assistance et d'accompagnement.
          </Text>
          <Text style={styles.listHeader}>Selon votre situation, CMO peut notamment vous accompagner pour :</Text>
          
          <View style={styles.bulletList}>
            {[
              "Comprendre les différentes étapes de votre procédure",
              "Vérifier et organiser les informations nécessaires à votre dossier",
              "Vous assister dans vos échanges avec l'employeur",
              "Faciliter la communication lorsque vous rencontrez des difficultés en français",
              "Vous accompagner dans les premières démarches administratives",
              "Assurer le suivi de votre dossier avec votre conseiller CMO"
            ].map((item, index) => (
              <View key={index} style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.cardTextSecondary, { marginTop: 10 }]}>
            Chaque situation étant différente, certaines procédures peuvent nécessiter un traitement personnalisé.
          </Text>
        </View>

        {/* 3. Icône Bouclier + Coche (Exact comme l'image 2) */}
        <View style={styles.card}>
          <View style={styles.iconCircleOutline}>
            <MaterialCommunityIcons name="shield-check" size={38} color="#2b52a1" />
          </View>
          <Text style={styles.sectionTitle}>3. Et si je ne bénéficie pas de l'assistance ?</Text>
          <Text style={styles.cardTextSecondary}>
            CMO dispose d'une période maximale de 6 mois pour vous fournir l'accompagnement prévu.
          </Text>
          <Text style={styles.cardTextSecondary}>
            Si, au terme de ces 6 mois, vous n'avez bénéficié d'aucune des prestations d'accompagnement prévues pour une raison imputable à CMO, l'assistance est annulée et les 95 € vous sont intégralement remboursés.
          </Text>
          <Text style={styles.cardTextSecondary}>
            Le remboursement concerne l'absence de réalisation de l'assistance. Il ne dépend pas de l'obtention d'un emploi ou de la décision finale d'un employeur.
          </Text>
        </View>

        {/* 4. Icône Document + Euro (Exact comme l'image 3) */}
        <View style={styles.card}>
          <View style={styles.iconCircleOutline}>
            <View style={styles.documentIconWrapper}>
              <Ionicons name="document-text" size={32} color="#2b52a1" />
              <View style={styles.euroBadge}>
                <MaterialIcons name="euro" size={12} color="#2b52a1" />
              </View>
            </View>
          </View>
          <Text style={styles.sectionTitle}>4. Des frais supplémentaires sont-ils possibles ?</Text>
          <Text style={styles.cardTextSecondary}>
            Oui. Si votre recrutement se poursuit, votre situation peut nécessiter des démarches administratives complémentaires, notamment dans le cadre d'une demande d'autorisation de travail.
          </Text>
          <Text style={styles.cardTextSecondary}>
            Ces prestations ne sont pas automatiquement incluses dans les 95 €.
          </Text>
          <Text style={styles.cardTextSecondary}>
            Avant tout paiement supplémentaire, CMO vous informe de la prestation nécessaire et de son coût.
          </Text>
          <Text style={[styles.cardTextSecondary, styles.boldText]}>
            Aucun frais supplémentaire ne correspond à l'achat d'un emploi, d'une autorisation de travail ou d'un visa.
          </Text>
        </View>

        {/* 5. Important */}
        <View style={styles.card}>
          <View style={styles.iconCircleOutline}>
            <Ionicons name="alert-circle-outline" size={34} color="#2b52a1" />
          </View>
          <Text style={styles.sectionTitle}>5. Important</Text>
          <Text style={styles.cardTextSecondary}>
            CMO vous accompagne et assure les démarches qui lui sont confiées, mais les décisions administratives appartiennent exclusivement aux autorités compétentes.
          </Text>
          <Text style={[styles.cardTextSecondary, styles.boldText]}>
            CMO ne peut donc jamais garantir l'obtention d'une autorisation administrative ou d'un visa.
          </Text>
        </View>

        {/* Section Contact / WhatsApp */}
        <View style={styles.whatsappCard}>
          <Text style={styles.whatsappTitle}>Besoin d'une assistance offerte avec un agent CMO ?</Text>
          <Text style={styles.whatsappSubtitle}>Cliquez sur le lien suivant pour discuter gratuitement via WhatsApp.</Text>
          
          <TouchableOpacity style={styles.whatsappButton} onPress={ () => router.push('/candidat/autre/Chat')}>
            <FontAwesome5 name="whatsapp" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.whatsappButtonText}>Discutez avec votre agent CMO</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>© 2026 CMO</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf2fb',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0d3b66',
    marginBottom: 16,
    textAlign: 'center',
  },
  introCard: {
    backgroundColor: '#fff7eb',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  handshakeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#e2edff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleBlue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0d3b66',
    lineHeight: 22,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  // Cercle bleu fin qui entoure chaque icône
  iconCircleOutline: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#2b52a1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  // Style pour le badge "95 €"
  priceBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2b52a1',
  },
  // Style pour le document avec symbole Euro
  documentIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  euroBadge: {
    position: 'absolute',
    bottom: -2,
    right: -6,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#2b52a1',
    borderRadius: 10,
    padding: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0d3b66',
    marginBottom: 12,
  },
  cardTextSecondary: {
    fontSize: 14,
    color: '#526075',
    lineHeight: 20,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: '700',
    color: '#1a2b49',
  },
  listHeader: {
    fontSize: 14,
    color: '#526075',
    marginBottom: 8,
  },
  bulletList: {
    marginBottom: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletDot: {
    fontSize: 14,
    color: '#526075',
    marginRight: 8,
  },
  bulletText: {
    fontSize: 14,
    color: '#526075',
    flex: 1,
    lineHeight: 20,
  },
  whatsappCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  whatsappTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0d3b66',
    textAlign: 'center',
    marginBottom: 8,
  },
  whatsappSubtitle: {
    fontSize: 14,
    color: '#526075',
    textAlign: 'center',
    marginBottom: 16,
  },
  whatsappButton: {
    backgroundColor: '#122F78',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
  },
  whatsappButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#8a99ad',
    marginBottom: 20,
  },
});