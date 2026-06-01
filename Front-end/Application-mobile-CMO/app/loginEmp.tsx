import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { setPsaudo, setTokenId } from "./employeur/services/token_id";
import { loginEmp } from "./services/login";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const isEmailValid = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

  const handleLogin = async () => {
    if (isLoading) {
      return;
    }

    if (!email) {
      setEmailError("L'email est obligatoire");
      return;
    }

    if (!isEmailValid(email)) {
      setEmailError("Email invalide (ex: nom@domaine.fr)");
      return;
    }

    setEmailError("");

    try {
      setIsLoading(true);
      const response = await loginEmp({ email, password });

      if (response.success) {
        await setTokenId(response.token_id);
        const pseudo = response.user?.pseudo ?? response.pseudo;
        if (pseudo) {
          await setPsaudo(pseudo);
        }
        router.replace("/employeur/tabs/EmployerDashboard");
      } else {
        alert(response.error || response.message || "Email ou mot de passe incorrect");
      }
    } catch (error) {
      console.log(error);
      alert("Erreur serveur");
    } finally {
      setIsLoading(false);
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
            {/* Identifiant */}
            <Text style={styles.label}>Identifiant</Text>
            <TextInput
              placeholder="Votre email"
              placeholderTextColor="#7a8ab8"
              style={[styles.input, !!emailError && styles.inputError]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!!emailError && (
              <Text style={styles.errorText}>{emailError}</Text>
            )}

            {/* Password */}
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordBox}>
              <TextInput
                placeholder="Votre mot de passe"
                placeholderTextColor="#7a8ab8"
                secureTextEntry={!showPassword}
                style={styles.inputFlex}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#5b6a8e"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot */}
            <TouchableOpacity
              onPress={() => router.push("/ForgotPasswordScreen")}
            >
              <Text style={styles.forgot}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.primaryText}>Se connecter</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.push("/RegisterEmployerScreen")}
              >
                <Text style={styles.secondaryText}>Créer un compte</Text>
              </TouchableOpacity>
            </View>

          
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
    padding: 18,
    borderWidth: 1,
    borderColor: "#e1e9fb",
  },

  label: {
    fontSize: 13,
    color: "#2b5bbb",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e9fb",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
    color: "#000",
  },
  inputError: {
    borderColor: "#d9534f",
  },
  errorText: {
    fontSize: 11,
    color: "#d9534f",
    marginBottom: 10,
    marginLeft: 12,
    fontWeight: "500",
  },

  inputFlex: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#000",
  },

  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e9fb",
    borderRadius: 30,
    paddingRight: 12,
    marginBottom: 14,
  },

  forgot: {
    textAlign: "right",
    color: "#4c6bd6",
    fontSize: 12,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: "#122F78",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },

  secondaryBtn: {
    flex: 1,
    backgroundColor: "#e8efff",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },

  secondaryText: {
    color: "#122F78",
    fontWeight: "600",
  },

  backBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#cfd9ee",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },

  backText: {
    color: "#2b5bbb",
    fontWeight: "600",
  },
});