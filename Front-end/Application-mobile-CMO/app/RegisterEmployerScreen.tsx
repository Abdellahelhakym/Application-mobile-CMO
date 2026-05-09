import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

const CreateAccountScreen: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Espace Employeur</Text>

      <View style={styles.card}>
        <Input label="Raison social *" placeholder="Raison social" />
        <Input label="Votre nom" placeholder="Le nom" />
        <Input label="Votre prenom" placeholder="Le prénom" />
        <Input
          label="Votre adresse email *"
          placeholder="xxxxxxx@example.com"
        />
        <Input
          label="Votre N° de telephone *"
          placeholder="Votre N° de téléphone"
        />

        <Text style={styles.label}>Le pays d'origine</Text>
        <View style={styles.input}>
          <Text>France</Text>
        </View>

        <Text style={styles.label}>Le mot de passe *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            secureTextEntry={!passwordVisible}
            placeholder="••••••••"
            style={styles.passwordInput}
            placeholderTextColor="#7a8ab8"
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Text style={styles.eye}>👁</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.helper}>
          Le mot de passe doit contenir au moins 8 caractères alphanumerique
          (Maj, Min, Chiffre)
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Choisissez l'offre qui vous convient
      </Text>

      <OfferCard
        title="START RECRUT"
        subtitle="L'essentiel pour démarrer"
        price="149€ HT/MOIS"
        desc="Accompagnement essentiel"
      />

      <OfferCard
        title="PRO RECRUT"
        subtitle="Confiez & déléguez!"
        price="279€ HT/MOIS"
        desc="Délégation maîtrisée"
        badge="POPULAIRE"
      />

      <OfferCard
        title="FULL RECRUT"
        subtitle="Recrutement clé en main"
        price="499€ HT/MOIS"
        desc="Délégation totale"
      />

      <View style={styles.customCard}>
        <Text style={styles.customTitle}>DEVIS PERSONNALISÉ</Text>
        <Text style={styles.customSubtitle}>SOLUTION SUR MESURE</Text>
        <Text style={styles.customDesc}>
          Volumes importants, recrutement international ou besoins hors
          standards
        </Text>
        <TouchableOpacity style={styles.customBtn}>
          <Text style={styles.btnText}>Choisir cette offre</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.checkboxRow}>
        <Text>☐ J'accepte les CGU et CGV</Text>
      </View>

      <View style={styles.recaptcha}>
        <Text>☐ I'm not a robot</Text>
      </View>

      <TouchableOpacity style={styles.submit}>
        <Text style={styles.submitText}>S'inscrire »</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Avez-vous deja un compte ?</Text>
    </ScrollView>
  );
};

const Input = ({ label, placeholder }: any) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#7a8ab8"
      style={styles.input}
    />
  </View>
);

const OfferCard = ({
  title,
  subtitle,
  price,
  desc,
  badge,
}: any) => (
  <View style={styles.offer}>
    {badge && <Text style={styles.badge}>{badge}</Text>}
    <Text style={styles.offerTitle}>{title}</Text>
    <Text style={styles.offerSubtitle}>{subtitle}</Text>
    <Text style={styles.price}>{price}</Text>
    <Text style={styles.offerDesc}>{desc}</Text>
    <TouchableOpacity style={styles.btn}>
      <Text style={styles.btnText}>Choisir cette offre</Text>
    </TouchableOpacity>
  </View>
);

export default CreateAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2F4B8F",
  },
  subtitle: {
    marginBottom: 10,
    color: "#666",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#3E63DD",
    borderRadius: 25,
    padding: 12,
    marginBottom: 5,
    color: "#2F4B8F",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3E63DD",
    borderRadius: 25,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    color: "#2F4B8F",
  },
  eye: {
    fontSize: 16,
  },
  helper: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 18,
    marginVertical: 10,
  },
  offer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#2F4B8F",
    color: "#FFF",
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  offerTitle: {
    fontWeight: "bold",
  },
  offerSubtitle: {
    color: "#666",
  },
  price: {
    fontSize: 20,
    marginVertical: 5,
  },
  offerDesc: {
    color: "#666",
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#2F4B8F",
    padding: 12,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  btnText: {
    color: "#FFF",
  },
  customCard: {
    backgroundColor: "#FBE7D6",
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    alignItems: "center",
  },
  customTitle: {
    color: "#C96F2D",
    fontWeight: "bold",
  },
  customSubtitle: {
    fontSize: 12,
  },
  customDesc: {
    textAlign: "center",
    marginVertical: 10,
  },
  customBtn: {
    backgroundColor: "#C96F2D",
    padding: 12,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  checkboxRow: {
    marginVertical: 10,
  },
  recaptcha: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  submit: {
    backgroundColor: "#2F4B8F",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  submitText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    marginTop: 15,
    color: "#666",
  },
});