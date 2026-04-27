import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// ── Theme ────────────────────────────────────────────────────────────────────
const C = {
  primary: "#0f4361",
  primaryContainer: "#2d5b7a",
  onPrimary: "#ffffff",
  background: "#f9f9ff",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#111c2d",
  onSurfaceVariant: "#41474d",
  outlineVariant: "#c1c7ce",
  navBorder: "#e8ecf4",
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.login({ email, password });
      await signIn(response.token, response.user);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", error.message || "เกิดข้อผิดพลาดบางอย่าง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="brain" size={48} color={C.primary} />
          </View>
          <Text style={styles.title}>Parkinson Care</Text>
          <Text style={styles.subtitle}>เข้าสู่ระบบเพื่อใช้งาน</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>อีเมล</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>รหัสผ่าน</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={C.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ยังไม่มีบัญชีใช่หรือไม่? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.linkText}>สมัครสมาชิก</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: C.navBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    backgroundColor: "#e7eeff",
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: C.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: C.onSurfaceVariant,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: C.onSurface,
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.outlineVariant,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: C.onSurface,
  },
  button: {
    backgroundColor: C.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 12,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: C.onPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: C.onSurfaceVariant,
    fontSize: 15,
  },
  linkText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: "bold",
  },
});
