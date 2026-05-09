import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';

export default function SubscriptionScreen() {
  const plans = [
    {
      id: 'start',
      name: 'START RECRUT',
      subtitle: "L'essentiel pour démarrer",
      price: '149€',
      period: 'HT/MOIS',
      features: ['Accompagnement essentiel'],
      note: 'Vous gérez encore une partie du recrutement',
      tone: styles.toneDefault,
      buttonTone: styles.btnGreen
    },
    {
      id: 'pro',
      name: 'PRO RECRUT',
      subtitle: 'Contrôle & délégation',
      price: '279€',
      period: 'HT/MOIS',
      features: ['Délégation maîtrisée'],
      note: 'Recommandé pour un recrutement fiable et sécurisé',
      tone: styles.toneDefault,
      buttonTone: styles.btnBlue
    },
    {
      id: 'full',
      name: 'FULL RECRUT',
      subtitle: 'Recrutement clé en main',
      price: '499€',
      period: 'HT/MOIS',
      features: ['Délégation totale'],
      note: 'La solution privilégiée par les employeurs exigeants',
      tone: styles.toneDefault,
      buttonTone: styles.btnDark
    },
    {
      id: 'custom',
      name: 'DEVIS PERSONNALISÉ',
      subtitle: 'Solution sur mesure',
      price: '',
      period: '',
      features: [
        'Volumes importants,',
        'recrutement international ou',
        'besoins hors standards'
      ],
      note: 'VOTRE PACK ACTUEL',
      tone: styles.toneCustom,
      buttonTone: styles.btnOrange
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {plans.map((plan) => (
          <View key={plan.id} style={[styles.card, plan.tone]}>
            
            {/* Top */}
            <View style={styles.cardTop}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planSubtitle}>{plan.subtitle}</Text>

              {plan.price !== '' && (
                <Text style={styles.price}>
                  {plan.price}{' '}
                  <Text style={styles.period}>{plan.period}</Text>
                </Text>
              )}
            </View>

            {/* Bottom */}
            <View style={styles.cardBottom}>
              <Text style={styles.feature}>
                {plan.features[0]}
              </Text>

              <TouchableOpacity
                style={[styles.button, plan.buttonTone]}
              >
                <Text style={styles.buttonText}>
                  {plan.id === 'custom'
                    ? 'VOTRE PACK ACTUEL'
                    : 'CHOISIR'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.note}>{plan.note}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff'
  },

  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 120
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e9fb',
    overflow: 'hidden'
  },

  toneDefault: {
    backgroundColor: '#eef3ff'
  },

  toneCustom: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#f0a11b'
  },

  cardTop: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center'
  },

  planName: {
    fontSize: 18,
    color: '#1b2d5a',
    fontWeight: '600'
  },

  planSubtitle: {
    fontSize: 14,
    color: '#5b6a8e',
    marginTop: 4
  },

  price: {
    fontSize: 26,
    color: '#1b2d5a',
    marginTop: 10
  },

  period: {
    fontSize: 12,
    color: '#5b6a8e'
  },

  cardBottom: {
    backgroundColor: '#eef3ff',
    padding: 16,
    alignItems: 'center'
  },

  feature: {
    fontSize: 14,
    color: '#1b2d5a'
  },

  button: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20
  },

  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600'
  },

  note: {
    marginTop: 12,
    fontSize: 13,
    color: '#1b2d5a',
    textAlign: 'center'
  },

  btnGreen: { backgroundColor: '#1e4e2a' },
  btnBlue: { backgroundColor: '#2b5bbb' },
  btnDark: { backgroundColor: '#3a4f8f' },
  btnOrange: { backgroundColor: '#f0a11b' }
});