import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { signEmployeur } from "./services/sign";

const CreateAccountScreen: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [country, setCountry] = useState("France");
  const [showCountry, setShowCountry] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState("START RECRUT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    companyName: "",
    lastName: "",
    firstName: "",
    email: "",
    phone: "",
    password: "Le mot de passe doit contenir 8 caractères minimum",
    acceptTerms: "",
  });

  const isEmailValid = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

  const isPhoneValid = (value: string) => /^0\d{9}$/.test(value);

  const validateForm = () => {
    const newErrors = {
      companyName: "",
      lastName: "",
      firstName: "",
      email: "",
      phone: "",
      password: "Le mot de passe doit contenir 8 caractères minimum",
      acceptTerms: "",
    };
    let isValid = true;

    if (!companyName) {
      newErrors.companyName = "La raison sociale est obligatoire";
      isValid = false;
    }

    if (!lastName) {
      newErrors.lastName = "Le nom est obligatoire";
      isValid = false;
    }

    if (!firstName) {
      newErrors.firstName = "Le prénom est obligatoire";
      isValid = false;
    }

    if (!email) {
      newErrors.email = "L'email est obligatoire";
      isValid = false;
    } else if (!isEmailValid(email)) {
      newErrors.email = "Email invalide (ex: nom@domaine.fr)";
      isValid = false;
    }

    if (!phone) {
      newErrors.phone = "Le téléphone est obligatoire";
      isValid = false;
    } else if (!isPhoneValid(phone)) {
      newErrors.phone = "Numéro invalide (ex: 0612345678)";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Le mot de passe est obligatoire";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir 8 caractères minimum";
      isValid = false;
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une majuscule";
      isValid = false;
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une minuscule";
      isValid = false;
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Le mot de passe doit contenir au moins un chiffre";
      isValid = false;
    } else {
      newErrors.password = "";
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = "Veuillez accepter les CGU et CGV";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (field: string, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));

    if (field === "companyName") {
      setCompanyName(value);
    } else if (field === "lastName") {
      setLastName(value);
    } else if (field === "firstName") {
      setFirstName(value);
    } else if (field === "email") {
      setEmail(value);
    } else if (field === "phone") {
      setPhone(value);
    } else if (field === "password") {
      setPassword(value);
    }
  };

  const offerCodeByName: Record<string, number> = {
    "START RECRUT": 0,
    "PRO RECRUT": 1,
    "FULL RECRUT": 2,
    "DEVIS PERSONNALISE": 3,
  };

  const formuleIdByName: Record<string, number> = {
    "START RECRUT": 1,
    "PRO RECRUT": 2,
    "FULL RECRUT": 3,
    "DEVIS PERSONNALISE": 4,
  };

  const countryOptions = ["France", "Belgique", "Espagne", "Portugal", "Italie"];

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const employeur = {
      raison_social: companyName,
      pays_origine: country,
      responsable: lastName,
      prenom_responsable: firstName,
      num_tel: phone,
      email,
      password,
      offre: offerCodeByName[selectedOffer],
      id_formule: formuleIdByName[selectedOffer],
    };

    try {
      const result = await signEmployeur(employeur);

      if (result.success) {
        Alert.alert("Succès", result.message || "Inscription réussie", [
          {
            text: "OK",
            onPress: () => router.push("./loginEmp"),
          },
        ]);
      } else {
        Alert.alert("Erreur", result.message || "Échec de l'inscription");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Espace Employeur</Text>

      <View style={styles.card}>
        <Input
          label="Raison social *"
          placeholder="Raison social"
          value={companyName}
          onChangeText={(value: string) => handleChange("companyName", value)}
          error={errors.companyName}
        />
        <Input
          label="Votre nom"
          placeholder="Le nom"
          value={lastName}
          onChangeText={(value: string) => handleChange("lastName", value)}
          error={errors.lastName}
        />
        <Input
          label="Votre prenom"
          placeholder="Le prénom"
          value={firstName}
          onChangeText={(value: string) => handleChange("firstName", value)}
          error={errors.firstName}
        />
        <Input
          label="Votre adresse email *"
          placeholder="xxxxxxx@example.com"
          value={email}
          onChangeText={(value: string) => handleChange("email", value)}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Votre N° de telephone *"
          placeholder="Votre N° de téléphone"
          value={phone}
          onChangeText={(value: string) => handleChange("phone", value)}
          error={errors.phone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Le pays d'origine</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowCountry(!showCountry)}
          activeOpacity={0.8}
        >
          <Text>{country}</Text>
        </TouchableOpacity>
        {showCountry && (
          <View style={styles.dropdown}>
            {countryOptions.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.option}
                onPress={() => {
                  setCountry(item);
                  setShowCountry(false);
                }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Le mot de passe *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            secureTextEntry={!passwordVisible}
            placeholder="••••••••"
            style={[
              styles.passwordInput,
              !!errors.password && errors.password !== "Le mot de passe doit contenir 8 caractères minimum" && styles.inputError,
            ]}
            placeholderTextColor="#7a8ab8"
            value={password}
            onChangeText={(value) => handleChange("password", value)}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Text style={styles.eye}>👁</Text>
          </TouchableOpacity>
        </View>
        <Text
          style={[
            styles.helper,
            !!errors.password && errors.password !== "Le mot de passe doit contenir 8 caractères minimum" && styles.helperError,
          ]}
        >
          {errors.password ||
            "Le mot de passe doit contenir au moins 8 caractères alphanumerique (Maj, Min, Chiffre)"}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Choisissez l'offre qui vous convient
      </Text>

      <OfferCard
        title="START RECRUT"
        subtitle="L'essentiel pour démarrer"
        price="149€"
        priceSuffix="HT/MOIS"
        desc="Accompagnement essentiel"
        hint="Vous gérez encore une partie du recrutement"
        color="#2E6B4D"
        selected={selectedOffer === "START RECRUT"}
        onSelect={() => setSelectedOffer("START RECRUT")}
      />

      <OfferCard
        title="PRO RECRUT"
        subtitle="Contrôle & délégation"
        price="279€"
        priceSuffix="HT/MOIS"
        desc="Délégation maîtrisée"
        hint="Recommandé pour un recrutement fiable et sécurisé"
        color="#3A7BFF"
        selected={selectedOffer === "PRO RECRUT"}
        onSelect={() => setSelectedOffer("PRO RECRUT")}
      />

      <OfferCard
        title="FULL RECRUT"
        subtitle="Recrutement clé en main"
        price="499€"
        priceSuffix="HT/MOIS"
        desc="Délégation totale"
        hint="La solution privilégiée par les employeurs exigeants"
        color="#1E3D8F"
        selected={selectedOffer === "FULL RECRUT"}
        onSelect={() => setSelectedOffer("FULL RECRUT")}
      />

      <OfferCard
        title="DEVIS PERSONNALISÉ"
        subtitle="SOLUTION SUR"
        price="MESURE"
        desc=""
        hint="Volumes importants, recrutement international ou besoins hors standards"
        color="#D68A3B"
        isCustom
        selected={selectedOffer === "DEVIS PERSONNALISE"}
        onSelect={() => setSelectedOffer("DEVIS PERSONNALISE")}
      />

      <View style={styles.checkboxRow}>
        <Switch
          value={acceptTerms}
          onValueChange={(value) => {
            setAcceptTerms(value);
            setErrors((prev) => ({ ...prev, acceptTerms: "" }));
          }}
        />
        <Text style={styles.terms}>J'accepte les CGU et CGV</Text>
      </View>
      {!!errors.acceptTerms && (
        <Text style={styles.errorText}>{errors.acceptTerms}</Text>
      )}

      <TouchableOpacity
        style={styles.submit}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitText}>
          {isSubmitting ? "En cours..." : "S'inscrire »"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Avez-vous deja un compte ?</Text>
    </ScrollView>
  );
};

const Input = ({ label, placeholder, value, onChangeText, error, keyboardType, autoCapitalize }: any) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#7a8ab8"
      style={[styles.input, !!error && styles.inputError]}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
    {!!error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const OfferCard = ({
  title,
  subtitle,
  price,
  priceSuffix,
  desc,
  hint,
  color,
  selected,
  onSelect,
  isCustom,
}: any) => (
  <TouchableOpacity style={styles.offerCard} onPress={onSelect} activeOpacity={0.85}>
    <View style={styles.offerTop}>
      <Text style={[styles.offerTitle, { color }]}>{title}</Text>
      <Text style={styles.offerSubtitle}>{subtitle}</Text>
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color }]}>{price}</Text>
        {!!priceSuffix && <Text style={styles.priceSuffix}>{priceSuffix}</Text>}
      </View>
    </View>
    <View style={styles.offerBottom}>
      {!!desc && <Text style={styles.offerDesc}>{desc}</Text>}
      <View style={[styles.offerButton, { backgroundColor: color }]}>
        <Text style={styles.offerButtonText}>Choisir cette offre</Text>
        <View style={styles.radioOuter}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
      {!!hint && <Text style={styles.offerHint}>{hint}</Text>}
      {isCustom && <Text style={styles.offerHintSpacer} />}
    </View>
  </TouchableOpacity>
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
  inputError: {
    borderColor: "#d9534f",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#3E63DD",
    borderRadius: 16,
    marginTop: 6,
    overflow: "hidden",
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
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
  helperError: {
    color: "#d9534f",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 18,
    marginVertical: 10,
    color: "#1f3872",
  },
  offerCard: {
    backgroundColor: "#EEF3FF",
    borderRadius: 24,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  offerTop: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  offerBottom: {
    backgroundColor: "#EEF3FF",
    paddingHorizontal: 18,
    paddingBottom: 16,
    paddingTop: 10,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  offerSubtitle: {
    color: "#2E3A67",
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 8,
  },
  price: {
    fontSize: 34,
    fontWeight: "800",
  },
  priceSuffix: {
    color: "#1f3872",
    fontWeight: "700",
    marginLeft: 6,
    marginBottom: 6,
  },
  offerDesc: {
    color: "#2E3A67",
    fontWeight: "600",
    marginBottom: 10,
  },
  offerButton: {
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  offerButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  offerHint: {
    marginTop: 12,
    color: "#2E3A67",
    fontWeight: "600",
  },
  offerHintSpacer: {
    height: 4,
  },
  checkboxRow: {
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  terms: {
    marginLeft: 10,
  },
  errorText: {
    color: "#d9534f",
    fontSize: 12,
    marginTop: 4,
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