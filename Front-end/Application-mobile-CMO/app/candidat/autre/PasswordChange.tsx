import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,Linking,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { changePassword } from "../services/PasswordChange";
type ValidationRule = {
  label: string;
  test: (value: string) => boolean;
};

const validationRules: ValidationRule[] = [
  { label: "Minimum 12 caractères", test: (v) => v.length >= 12 },
  { label: "Une lettre majuscule", test: (v) => /[A-Z]/.test(v) },
  { label: "Une lettre minuscule", test: (v) => /[a-z]/.test(v) },
  { label: "Un chiffre", test: (v) => /[0-9]/.test(v) },
  { label: "Un caractère spécial", test: (v) => /[^a-zA-Z0-9]/.test(v) },
];

const ChangePasswordScreen: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const allRulesPassed = validationRules.every((r) => r.test(newPassword));
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;

  const showValidation = newPasswordTouched && !allRulesPassed;

  const handleSubmit = async () => {
    setSubmitted(true);

    const payload = {
      currentPassword: oldPassword,
      newPassword,
      confirmPassword,
    };

    if (!payload.currentPassword) {
      alert("Ancien mot de passe requis.");
      return;
    }
    if (!payload.newPassword) {
      alert("Nouveau mot de passe requis.");
      return;
    }
    if (!payload.confirmPassword) {
      alert("Confirmation du nouveau mot de passe requise.");
      return;
    }
    if (!allRulesPassed) {
      alert("Le nouveau mot de passe ne respecte pas les règles requises.");
      return;
    }
    if (!passwordsMatch) {
      alert("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      return;
    }

    try {
      const result = await changePassword(payload.currentPassword, payload.newPassword);

      if (!result || result.success === false || result.error) {
        const message =
          (result && (result.message || result.error)) ||
          "Échec du changement de mot de passe.";
        alert(message);
        return;
      }

      alert("Mot de passe modifié avec succès !");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNewPasswordTouched(false);
      setSubmitted(false);
    } catch (error: any) {
      alert(error?.message || "Échec du changement de mot de passe.");
      console.error(error);
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Old Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Ancien mot de passe</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder=""
                secureTextEntry={!showOld}
                value={oldPassword}
                onChangeText={setOldPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowOld((v) => !v)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showOld ? (
                  <EyeOff size={18} color="#5b6a8e" />
                ) : (
                  <Eye size={18} color="#5b6a8e" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nouveau mot de passe</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder=""
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={(v) => {
                  setNewPassword(v);
                  setNewPasswordTouched(true);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowNew((v) => !v)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showNew ? (
                  <EyeOff size={18} color="#5b6a8e" />
                ) : (
                  <Eye size={18} color="#5b6a8e" />
                )}
              </TouchableOpacity>
            </View>

            {/* Validation rules */}
            {showValidation && (
              <View style={styles.validationContainer}>
                <Text style={styles.validationTitle}>
                  Veuillez ajouter tous les caractères nécessaires :
                </Text>
                {validationRules.map((rule) => {
                  const passed = rule.test(newPassword);
                  return (
                    <Text
                      key={rule.label}
                      style={[
                        styles.validationRule,
                        passed
                          ? styles.validationPassed
                          : styles.validationFailed,
                      ]}
                    >
                      {passed ? "✓ " : "• "}
                      {rule.label}
                    </Text>
                  );
                })}
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  submitted && !passwordsMatch && styles.inputError,
                ]}
                placeholder=""
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm((v) => !v)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showConfirm ? (
                  <EyeOff size={18} color="#5b6a8e" />
                ) : (
                  <Eye size={18} color="#5b6a8e" />
                )}
              </TouchableOpacity>
            </View>
            {submitted && confirmPassword.length > 0 && !passwordsMatch && (
              <Text style={styles.errorText}>
                Les mots de passe ne correspondent pas.
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Modifier le mot de passe</Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotBtn} onPress={() => Linking.openURL("https://mycmo.conceptmaindoeuvre.com/mot-de-passe-oublie")}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#f0f2f8",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: 60,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 28,
    shadowColor: "#9eaac7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a3a6b",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#d0d8e8",
    borderRadius: 8,
    backgroundColor: "#f8f9fc",
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: "#1a3a6b",
    paddingVertical: 0,
  },
  inputError: {
    borderColor: "#e53935",
  },
  eyeBtn: {
    paddingLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  validationContainer: {
    marginTop: 10,
    paddingLeft: 4,
  },
  validationTitle: {
    fontSize: 12.5,
    color: "#444",
    marginBottom: 4,
  },
  validationRule: {
    fontSize: 13,
    marginVertical: 1.5,
  },
  validationPassed: {
    color: "#2e7d32",
  },
  validationFailed: {
    color: "#c62828",
  },
  errorText: {
    color: "#c62828",
    fontSize: 12.5,
    marginTop: 5,
    paddingLeft: 2,
  },
  submitBtn: {
    backgroundColor: "#1a3a6b",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#1a3a6b",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  forgotBtn: {
    alignItems: "center",
  },
  forgotText: {
    color: "#1a6bbd",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ChangePasswordScreen;