import { router } from "expo-router";
import React, { useState } from "react";
import { signCandidat } from "./services/sign";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Eye, EyeOff } from "lucide-react-native";

export default function RegisterCandidateScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 

const [civilite, setCivilite] = useState("Monsieur");
  const [showCivilite, setShowCivilite] = useState(false);
  const [showCountry, setShowCountry] = useState(false);



  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "France",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

 const countryOptions = [
  "Autriche",
  "Belgique",
  "Bulgarie",
  "Croatie",
  "Chypre",
  "République tchèque",
  "Danemark",
  "Estonie",
  "Finlande",
  "France",
  "Allemagne",
  "Grèce",
  "Hongrie",
  "Irlande",
  "Italie",
  "Lettonie",
  "Lituanie",
  "Luxembourg",
  "Malte",
  "Pays-Bas",
  "Pologne",
  "Portugal",
  "Roumanie",
  "Slovaquie",
  "Slovénie",
  "Espagne",
  "Suède",
  "Maroc",
  "Tunisie",
  "Algerie"

];

          const handleChange = (field: any, value: any) => {
            setFormData({
              ...formData,
              [field]: value,
            });
          };

        async function handleRegister() {
          if (!validateForm()) return;

          try {
            const finalObject = {
              civilite: civilite,
              prenom: formData.firstName,
              nom: formData.lastName,
              pays: formData.country,
              email: formData.email,
              tel: formData.phone,
              password: formData.password,
         
            };
         

            const response = await signCandidat(finalObject);
            console.log("Réponse du serveur :", response);

            if (response.success) {
              alert("Inscription réussie !");
             
              router.push("./loginCan");
            } else {
              alert(response.message || "Erreur lors de l'inscription");
            }
          } catch (error) {
            console.error("Erreur lors de l'inscription :", error);
            alert("Erreur serveur");
          }
        }

  const validateForm = () => {
    if (!formData.firstName) {
      alert("Le prénom est obligatoire");
      return false;
    }

    if (!formData.lastName) {
      alert("Le nom est obligatoire");
      return false;
    }

    if (!formData.email) {
      alert("L'email est obligatoire");
      return false;
    }

    if (!formData.phone) {
      alert("Le téléphone est obligatoire");
      return false;
    }

    if (!formData.password) {
      alert("Le mot de passe est obligatoire");
      return false;
    }

    if (!formData.confirmPassword) {
      alert("Confirmation du mot de passe obligatoire");
      return false;
    }

   if (formData.password.length < 8) {
  alert("Mot de passe minimum 8 caractères");
  return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      alert("Le mot de passe doit contenir au moins une lettre majuscule");
      return false;
    }

    if (!/[a-z]/.test(formData.password)) {
      alert("Le mot de passe doit contenir au moins une lettre minuscule");
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      alert("Le mot de passe doit contenir au moins un chiffre");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return false;
    }

    if (!formData.acceptTerms) {
      alert("Veuillez accepter les conditions");
      return false;
    }

    return true;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TITLE */}
        <View style={styles.titleBox}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Bienvenue dans votre espace My CMO</Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          

          <Text style={styles.label}>Votre civilité *</Text>

          <TouchableOpacity
            style={styles.select}
            onPress={() => setShowCivilite(!showCivilite)}
          >
            <Text>{civilite}</Text>
          </TouchableOpacity>

          {showCivilite && (
            <View style={styles.dropdown}>
              {["Monsieur", "Madame"].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.option}
                  onPress={() => {
                    setCivilite(item);
                    setShowCivilite(false);
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Prénom */}
          <Text style={styles.label}>Prénom *</Text>
          <TextInput
            style={styles.input}
            placeholder="Le prénom"
            placeholderTextColor="#7a8ab8"
            value={formData.firstName}
            onChangeText={(text) => handleChange("firstName", text)}
          />

          {/* Nom */}
          <Text style={styles.label}>Nom *</Text>
          <TextInput
            style={styles.input}
            placeholder="Le nom"
            placeholderTextColor="#7a8ab8"
            value={formData.lastName}
            onChangeText={(text) => handleChange("lastName", text)}
          />

          {/* Pays */}
          <Text style={styles.label}>Pays</Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => setShowCountry(!showCountry)}
          >
            <Text>{formData.country}</Text>
          </TouchableOpacity>

          {showCountry && (
            <View style={styles.dropdown}>
              {countryOptions.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.option}
                  onPress={() => {
                    handleChange("country", item);
                    setShowCountry(false);
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Email */}
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="***@email.com"
            placeholderTextColor="#7a8ab8"
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
          />

          {/* Phone */}
          <Text style={styles.label}>Téléphone *</Text>
          <TextInput
            style={styles.input}
            placeholder="0********"
            placeholderTextColor="#7a8ab8"
            value={formData.phone}
            onChangeText={(text) => handleChange("phone", text)}
          />

          {/* Password */}
          <Text style={styles.label}>Mot de passe *</Text>
          <View style={styles.passwordBox}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor="#7a8ab8"
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={18} color="#5b6a8e" />
              ) : (
                <Eye size={18} color="#5b6a8e" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            Le mot de passe doit contenir 8 caractères minimum
          </Text>

          {/* Confirm */}
          <Text style={styles.label}>Confirmer *</Text>
          <View style={styles.passwordBox}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor="#7a8ab8"
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} color="#5b6a8e" />
              ) : (
                <Eye size={18} color="#5b6a8e" />
              )}
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={styles.row}>
            <Switch
              value={formData.acceptTerms}
              onValueChange={(value) => handleChange("acceptTerms", value)}
            />
            <Text style={styles.terms}>J'accepte les CGU et CGV</Text>
          </View>

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Valider</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6ff",
  
  },
  scrollContent: {
    paddingBottom: 120,
  },

  titleBox: {
    padding: 20,
  },

  title: {
    fontSize: 22,
    color: "#1f3872",
    fontWeight: "600",
  },

  subtitle: {
    color: "#3a4a74",
    marginTop: 5,
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 20,
  },

  label: {
    fontSize: 13,
    color: "#1f3872",
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#2b5bbb",
    padding: 12,
    borderRadius: 25,
    marginTop: 5,
    color: "#1f3872",
  },

  select: {
    borderWidth: 1,
    borderColor: "#2b5bbb",
    padding: 12,
    borderRadius: 25,
    marginTop: 5,
  },

  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2b5bbb",
    borderRadius: 25,
    paddingHorizontal: 12,
    marginTop: 5,
  },
dropdown: {
  borderWidth: 1,
  borderColor: "#2b5bbb",
  borderRadius: 15,
  marginTop: 5,
  backgroundColor: "#fff",
},

option: {
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},
  passwordInput: {
    flex: 1,
    padding: 10,
    color: "#1f3872",
  },

  hint: {
    fontSize: 11,
    color: "#5b6a8e",
    marginTop: 5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  terms: {
    marginLeft: 10,
    color: "#1f3872",
  },

  button: {
    backgroundColor: "#3f58a6",
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});