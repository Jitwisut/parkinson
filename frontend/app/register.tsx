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
  ScrollView,
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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("ข้อผิดพลาด", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.register({
        name,
        email,
        password,
        role: "PATIENT",
      });
      await signIn(response.token, response.user);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("สมัครสมาชิกไม่สำเร็จ", error.message || "เกิดข้อผิดพลาดบางอย่าง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="account-plus" size={48} color={C.primary} />
            </View>
            <Text style={styles.title}>สร้างบัญชีผู้ใช้</Text>
            <Text style={styles.subtitle}>กรอกข้อมูลเพื่อเริ่มต้นใช้งาน</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>ชื่อ - นามสกุล</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น สมชาย ใจดี"
              value={name}
              onChangeText={setName}
            />
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
              placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={C.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>สมัครสมาชิก</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>มีบัญชีอยู่แล้วใช่หรือไม่? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>เข้าสู่ระบบ</Text>
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
    backgroundColor: C.background,
  },
  scrollContent: {
    flexGrow: 1,
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
