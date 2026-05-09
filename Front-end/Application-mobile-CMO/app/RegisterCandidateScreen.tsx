import React, { useState } from "react";
import { router } from "expo-router";
import { login } from "./services/login";
import { setTokenId } from "./candidat/services/token_id";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  

  const handleLogin = async () => {
    try {
      console.log("Login data:", { email, password });
       const loginObject = { email, password };

      const response = await login(loginObject);
      console.log("Login response:", response);

      if(response.success) {

          await setTokenId(response.token_id);
        router.push("/candidat/tabs/DashboardScreen");

      } else {
        alert("Email ou mot de passe incorrect");
      }

    } catch (error) {
      console.log(error);
      alert("Erreur serveur");
    }
   
   
  };

  return (
    <View style={styles.container}>
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
          {/* Email */}
          <Text style={styles.label}>Identifiant</Text>
          <TextInput
            placeholder="Votre email"
            placeholderTextColor="#7a8ab8"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          {/* Password */}
          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.passwordBox}>
            <TextInput
              placeholder="Votre mot de passe"
              placeholderTextColor="#7a8ab8"
              style={styles.inputFlex}
              secureTextEntry={!showPassword}
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
          <Text style={styles.forgot}>Mot de passe oublié ?</Text>

          {/* Buttons */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
              <Text style={styles.primaryText}>Se connecter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.push("/RegisterCandidateScreen")}
            >
              <Text style={styles.secondaryText}>Créer un compte</Text>
            </TouchableOpacity>
          </View>

          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.backText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6ff",
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
    marginBottom: 14,
    color: "#000",
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

  captcha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e1e9fb",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#cfd9ee",
    borderRadius: 3,
    marginRight: 8,
  },

  captchaText: {
    flex: 1,
    fontSize: 12,
    color: "#5b6a8e",
  },

  recaptcha: {
    fontSize: 10,
    color: "#7a8ab8",
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