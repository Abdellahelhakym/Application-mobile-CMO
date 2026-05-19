import React from 'react';
import {router} from 'expo-router';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Button,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';


const CheckIcon = () => (
  <View style={styles.checkIcon}>
    <Text style={{ color: '#2b5bbb', fontSize: 10 }}>✓</Text>
  </View>
);

const candidatItems = [
  'Profil visible par des employeurs sérieux',
  'CV analysé et profil vérifié',
  'Offres ciblées et accompagnement personnalisé',
];

const employeurItems = [
  'Accès à une large base de candidats vérifiés',
  'Profils adaptés à vos besoins spécifiques',
  'Réduction du turnover et gain de temps',
];

export default function Index() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('./../img/logo.png')}
            style={styles.logo}
          />
        
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.title}>
            La stabilité de votre{'\n'}
            main d'œuvre{'\n'}
            commence ici !
          </Text>

          <Text style={styles.desc}>
            Connectez-vous et accédez à votre espace personnalisé.
          </Text>
        </View>


        {/* CARD EMPLOYEUR */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Feather name="user-plus" size={26} color="#2b5bbb" />
          </View>

          <Text style={styles.cardTitle}>Je suis Employeur</Text>
          <Text style={styles.cardSubtitle}>
            Recrutez rapidement des profils qualifiés et fiables
          </Text>

          {employeurItems.map((item) => (
            <View key={item} style={styles.row}>
              <CheckIcon />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}

         
           <View style={styles.cta}>
           <TouchableOpacity
           
            onPress={() => {
              router.push('/loginEmp');
            }}
          >
            <Text style={styles.ctaText}>
             Continuer en tant qu'Employeur
            </Text>
          </TouchableOpacity>
          </View>
        </View>

        
        {/* CARD CANDIDAT */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Feather name="user" size={26} color="#2b5bbb" />
          </View>

          <Text style={styles.cardTitle}>Je suis Candidat</Text>
          <Text style={styles.cardSubtitle}>
            Trouvez votre prochain emploi et soyez accompagné à chaque étape
          </Text>

          {candidatItems.map((item) => (
            <View key={item} style={styles.row}>
              <CheckIcon />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}

          <View style={styles.cta}>
           <TouchableOpacity
           
            onPress={() => {
              router.push('/loginCan');
            }}
          >
            <Text style={styles.ctaText}>
              Continuer en tant que Candidat
            </Text>
          </TouchableOpacity>
          </View>
        </View>


        {/* STATS */}
        <View style={styles.stats}>
          {[
            { value: '+15', label: "Ans d'expérience" },
            { value: '+116', label: 'Partenaires' },
            { value: '+986', label: 'Placements/an' },
            { value: '+116k', label: 'Candidats' },
          ].map((s) => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          © 2024 CMO · Tous droits réservés
        </Text>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#122f78',
  },

  content: {
    padding: 20,
  },

  header: {
    alignItems: 'center',
    marginTop: 20,
  },

  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },

  subtitle: {
    fontSize: 10,
    color: '#e6d7cc',
    letterSpacing: 3,
    marginTop: 5,
    textTransform: 'uppercase',
  },

  hero: {
    marginTop: 30,
    alignItems: 'center',
  },

  title: {
    fontSize: 26,
    color: '#f6eadf',
    textAlign: 'center',
    fontWeight: '600',
  },

  desc: {
    marginTop: 10,
    color: '#a8bce8',
    textAlign: 'center',
    fontSize: 13,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
  },

  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#dce8ff',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#122f78',
    textAlign: 'center',
  },

  cardSubtitle: {
    fontSize: 12,
    color: '#4a6090',
    textAlign: 'center',
    marginVertical: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  itemText: {
    fontSize: 12,
    color: '#2b5bbb',
    marginLeft: 8,
  },

  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#2b5bbb',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cta: {
    marginTop: 12,
    backgroundColor: '#122f78',
    padding: 12,
    borderRadius: 10,
  },

  ctaText: {
    color: '#f6eadf',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
  },

  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 30,
  },

  statBox: {
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 22,
    color: '#6ea2ff',
    fontWeight: '700',
  },

  statLabel: {
    fontSize: 12,
    color: '#e1d5ca',
    textAlign: 'center',
  },

  footer: {
    textAlign: 'center',
    color: '#6b82b8',
    fontSize: 11,
    marginTop: 20,
  },
});