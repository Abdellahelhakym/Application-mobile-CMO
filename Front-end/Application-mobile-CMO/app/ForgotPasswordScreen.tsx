import { router } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { forgotPassword } from "./candidat/services/PasswordChange";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

 const handleSubmit = async () => {
  setSubmitted(true);

  if (!email) {
    alert("Veuillez saisir votre identifiant (email).");
    return;
  }

  if (!isValidEmail(email)) {
    return;
  }

  try {
    await forgotPassword(email);

    alert(`Un email de réinitialisation a été envoyé à ${email}`);

    setEmail("");
    setSubmitted(false);
    router.back();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de l'envoi de l'email.";
    console.log(error);
    alert(message);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("./../img/logoBlue.png")}
              style={styles.logo}
            />
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Récupérer votre mot de passe</Text>

            {/* Email Input */}
            <Text style={styles.label}>Votre identifiant</Text>
            <TextInput
              placeholder="Votre identifiant"
              placeholderTextColor="#7a8ab8"
              style={[styles.input, submitted && !isValidEmail(email) && styles.inputError]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {submitted && email && !isValidEmail(email) && (
              <Text style={styles.errorText}>Veuillez saisir un email valide.</Text>
            )}
            {submitted && !email && (
              <Text style={styles.errorText}>Le champ identifiant est obligatoire.</Text>
            )}

            

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Valider</Text>
            </TouchableOpacity>
          </View>
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
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  wrapper: {
    maxWidth: 380,
    width: "100%",
    alignSelf: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  logo: {
    width: 140,
    height: 60,
    resizeMode: "contain",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e1e9fb",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a3a6b",
    marginBottom: 20,
    textAlign: "center",
  },

  label: {
    fontSize: 13,
    color: "#2b5bbb",
    marginBottom: 8,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e9fb",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    color: "#000",
    fontSize: 14,
  },

  inputError: {
    borderColor: "#e53935",
  },

  errorText: {
    color: "#e53935",
    fontSize: 12,
    marginBottom: 12,
  },

  captcha: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d0d8e8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: "#f8f9fc",
  },

  captchaText: {
    fontSize: 13,
    color: "#333",
  },

  submitBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },

  submitText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});