// SymptomLogScreen.jsx
// Requires: expo, @expo/vector-icons, react-native-safe-area-context, react-native-modal
// Install: npx expo install @expo/vector-icons react-native-safe-area-context react-native-modal

import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "react-native-modal";
import { SettingsMenu } from "./components/settings-menu";
import { api } from "./lib/api";

// ── Theme ────────────────────────────────────────────────────────────────────
const C = {
  primary: "#0f4361",
  primaryContainer: "#2d5b7a",
  primaryFixed: "#cae6ff",
  onPrimary: "#ffffff",
  secondary: "#266a4f",
  secondaryContainer: "#a9eecc",
  tertiary: "#742500",
  tertiaryContainer: "#9b3400",
  background: "#f9f9ff",
  surface: "#f9f9ff",
  surfaceContainer: "#e7eeff",
  surfaceContainerHigh: "#dee8ff",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#111c2d",
  onSurfaceVariant: "#41474d",
  outlineVariant: "#c1c7ce",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  navBg: "#ffffff",
  navBorder: "#e8ecf4",
  white: "#ffffff",
};

// ── Tremor data ───────────────────────────────────────────────────────────────
const TREMOR_LEVELS = [
  { value: 0, label: "ไม่มี" },
  { value: 1, label: "เล็กน้อย" },
  { value: 2, label: "ปานกลาง" },
  { value: 3, label: "ชัดเจน" },
  { value: 4, label: "มาก" },
  { value: 5, label: "รุนแรง" },
];

const WALKING_OPTIONS = [
  {
    key: "normal",
    label: "ปกติ",
    icon: "check-circle",
    colorActive: C.secondary,
  },
  {
    key: "difficult",
    label: "ติดขัด",
    icon: "radio-button-checked",
    colorActive: C.primary,
  },
  {
    key: "unable",
    label: "เดินไม่ได้",
    icon: "radio-button-unchecked",
    colorActive: C.error,
  },
];

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function SymptomLogScreen() {
  const [tremorLevel, setTremorLevel] = useState(2);
  const [walking, setWalking] = useState("difficult");
  const [freezing, setFreezing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);

    try {
      await api.createSymptom({
        tremorLevel,
        rigidityLevel: freezing ? 4 : 1,
        walkingDifficulty: walking !== "normal",
        freezingGait: freezing,
        mood: 3,
        energyLevel: 3,
        source: "manual",
        recordedAt: new Date().toISOString(),
      });

      setSuccessModalVisible(true);
    } catch (error) {
      Alert.alert(
        "บันทึกไม่สำเร็จ",
        error instanceof Error ? error.message : "กรุณาตรวจสอบการเชื่อมต่อเซิร์ฟเวอร์",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setSuccessModalVisible(false);
    // รีเซ็ตฟอร์ม (ถ้าต้องการ) หรือกลับไปหน้าหลัก
    setTremorLevel(2);
    setWalking("difficult");
    setFreezing(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.navBg} />

      {/* ── Top App Bar ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👴</Text>
          </View>
          <Text style={styles.appTitle}>Parkinson Care</Text>
        </View>
        <SettingsMenu />
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section heading */}
        <View style={styles.sectionHeading}>
          <Text style={styles.headlineMd}>อาการของคุณเป็นอย่างไรในขณะนี้?</Text>
          <Text style={styles.subheading}>
            บันทึกอาการเพื่อติดตามความก้าวหน้าของการรักษา
          </Text>
        </View>

        {/* ── Tremor Level ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="vibrate"
              size={28}
              color={C.primary}
            />
            <Text style={styles.cardTitle}>ระดับการสั่น</Text>
          </View>
          <View style={styles.tremorGrid}>
            {TREMOR_LEVELS.map((item) => {
              const selected = tremorLevel === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.tremorBtn,
                    selected && styles.tremorBtnSelected,
                  ]}
                  onPress={() => setTremorLevel(item.value)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.tremorNumber,
                      selected && styles.tremorNumberSelected,
                    ]}
                  >
                    {item.value}
                  </Text>
                  <Text
                    style={[
                      styles.tremorLabel,
                      selected && styles.tremorLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Walking Difficulty ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="directions-walk" size={28} color={C.primary} />
            <Text style={styles.cardTitle}>เดินลำบากไหม?</Text>
          </View>
          <View style={styles.walkingList}>
            {WALKING_OPTIONS.map((opt) => {
              const selected = walking === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.walkingBtn,
                    selected && styles.walkingBtnSelected,
                    opt.key === "unable" && selected && styles.walkingBtnError,
                  ]}
                  onPress={() => setWalking(opt.key)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.walkingLabel,
                      selected && { color: opt.colorActive, fontWeight: "700" },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <MaterialIcons
                    name={selected ? opt.icon : "radio-button-unchecked"}
                    size={26}
                    color={selected ? opt.colorActive : C.outlineVariant}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Freezing Gait ── */}
        <View style={styles.card}>
          <View style={styles.freezingRow}>
            <View style={styles.freezingLeft}>
              <MaterialIcons
                name="pause-circle-filled"
                size={28}
                color={C.tertiary}
              />
              <View style={styles.freezingText}>
                <Text style={styles.cardTitle}>มีอาการตัวแข็งหรือไม่?</Text>
                <Text style={styles.freezingSubtitle}>(Freezing Gait)</Text>
              </View>
            </View>
            <View style={styles.freezingToggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, !freezing && styles.toggleBtnActive]}
                onPress={() => setFreezing(false)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.toggleText,
                    !freezing && styles.toggleTextActive,
                  ]}
                >
                  ไม่ใช่
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, freezing && styles.toggleBtnYes]}
                onPress={() => setFreezing(true)}
                activeOpacity={0.75}
              >
                <Text
                  style={[styles.toggleText, freezing && styles.toggleTextYes]}
                >
                  ใช่
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[styles.submitBtn, isSaving && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          <Text style={styles.submitText}>
            {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Text>
        </TouchableOpacity>

        {/* Bottom spacer for nav bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Success Modal ── */}
      <Modal
        isVisible={isSuccessModalVisible}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.5}
        onBackdropPress={handleCloseModal}
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            <MaterialIcons name="check-circle" size={72} color={C.secondary} />
          </View>
          <Text style={styles.modalTitle}>บันทึกสำเร็จ</Text>
          <Text style={styles.modalMessage}>
            ข้อมูลอาการของคุณถูกบันทึกเรียบร้อยแล้ว
          </Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleCloseModal}
            activeOpacity={0.8}
          >
            <Text style={styles.modalButtonText}>ตกลง</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: C.navBg,
    borderBottomWidth: 2,
    borderBottomColor: C.navBorder,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primaryFixed,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 20 },
  appTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: C.primaryContainer,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  settingsBtn: { padding: 8 },

  // Scroll
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },

  // Section heading
  sectionHeading: { paddingVertical: 8, gap: 6 },
  headlineMd: {
    fontSize: 26,
    fontWeight: "700",
    color: C.primary,
    lineHeight: 34,
  },
  subheading: {
    fontSize: 16,
    color: C.onSurfaceVariant,
    lineHeight: 24,
  },

  // Card
  card: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: C.navBorder,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.primary,
    letterSpacing: 0.4,
    flex: 1,
  },

  // Tremor Grid
  tremorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tremorBtn: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.surfaceContainerLowest,
    flexGrow: 1,
  },
  tremorBtnSelected: {
    borderColor: C.primaryContainer,
    backgroundColor: C.primaryContainer,
    transform: [{ scale: 1.05 }],
  },
  tremorNumber: {
    fontSize: 26,
    fontWeight: "700",
    color: C.onSurface,
  },
  tremorNumberSelected: { color: C.white },
  tremorLabel: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    marginTop: 2,
  },
  tremorLabelSelected: { color: C.white },

  // Walking
  walkingList: { gap: 12 },
  walkingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    minHeight: 64,
    backgroundColor: C.surfaceContainerLowest,
  },
  walkingBtnSelected: {
    borderColor: C.primaryContainer,
    backgroundColor: C.surfaceContainerHigh,
  },
  walkingBtnError: {
    borderColor: C.error,
    backgroundColor: C.errorContainer,
  },
  walkingLabel: {
    fontSize: 18,
    color: C.onSurface,
  },

  // Freezing
  freezingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  freezingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  freezingText: { flex: 1 },
  freezingSubtitle: {
    fontSize: 13,
    color: C.onSurfaceVariant,
    marginTop: 2,
  },
  freezingToggle: {
    flexDirection: "row",
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    backgroundColor: C.surfaceContainerLowest,
  },
  toggleBtnActive: {
    borderColor: C.primaryContainer,
    backgroundColor: C.primaryFixed,
  },
  toggleBtnYes: {
    borderColor: "transparent",
    backgroundColor: C.tertiaryContainer,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.onSurfaceVariant,
  },
  toggleTextActive: { color: C.primary },
  toggleTextYes: { color: C.white },

  // Submit
  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 999,
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitText: {
    fontSize: 20,
    fontWeight: "700",
    color: C.white,
    letterSpacing: 0.5,
  },

  // Bottom Nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: C.navBg,
    borderTopWidth: 2,
    borderTopColor: C.navBorder,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#2d5b7a",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 12 },
    }),
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  navItemActive: {
    backgroundColor: C.primaryContainer,
    paddingHorizontal: 20,
    transform: [{ scale: 1.05 }],
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: C.onSurfaceVariant,
  },
  navLabelActive: {
    color: C.white,
    fontWeight: "700",
  },

  // Modal Styles
  modalContent: {
    backgroundColor: C.surfaceContainerLowest,
    padding: 30,
    borderRadius: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconContainer: {
    backgroundColor: C.secondaryContainer,
    borderRadius: 50,
    padding: 16,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: C.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: C.onSurfaceVariant,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: C.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: C.white,
    fontSize: 18,
    fontWeight: "700",
  },
});

