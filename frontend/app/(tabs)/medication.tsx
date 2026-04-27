// MedicationScreen — converted from HTML/Tailwind design
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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
import { SettingsMenu } from "../../components/settings-menu";
import { api } from "../../lib/api";

// ── Theme ──────────────────────────────────────────────────────────────────────
const C = {
  primary: "#0f4361",
  primaryContainer: "#2d5b7a",
  primaryFixed: "#cae6ff",
  onPrimary: "#ffffff",
  secondary: "#266a4f",
  secondaryFixed: "#acf1cf",
  secondaryContainer: "#a9eecc",
  onSecondaryFixedVariant: "#015138",
  tertiary: "#742500",
  tertiaryContainer: "#9b3400",
  background: "#f9f9ff",
  surface: "#f9f9ff",
  surfaceContainer: "#e7eeff",
  surfaceContainerHigh: "#dee8ff",
  surfaceContainerLow: "#f0f3ff",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#111c2d",
  onSurfaceVariant: "#41474d",
  outlineVariant: "#c1c7ce",
  outline: "#72787e",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  onError: "#ffffff",
  navBg: "#ffffff",
  navBorder: "#e8ecf4",
  white: "#ffffff",
};

// ── Types ──────────────────────────────────────────────────────────────────────
type MedStatus = "completed" | "overdue" | "pending";

interface Medication {
  id?: string;
  name: string;
  dose: string;
  status: MedStatus;
  overdueTime?: string;
}

interface TimeSection {
  label: string;
  time: string;
  icon: "wb-sunny" | "light-mode" | "dark-mode";
  meds: Medication[];
}

// ── Data ───────────────────────────────────────────────────────────────────────
const SCHEDULE: TimeSection[] = [
  {
    label: "ช่วงเช้า",
    time: "07:00",
    icon: "wb-sunny",
    meds: [
      {
        name: "Levodopa/Carbidopa",
        dose: "1 เม็ด (100/25 mg)",
        status: "completed",
      },
      {
        name: "Entacapone",
        dose: "1 เม็ด (200 mg)",
        status: "overdue",
        overdueTime: "08:00",
      },
    ],
  },
  {
    label: "กลางวัน",
    time: "12:00",
    icon: "light-mode",
    meds: [
      {
        name: "Levodopa/Carbidopa",
        dose: "1 เม็ด (100/25 mg)",
        status: "pending",
      },
    ],
  },
  {
    label: "เย็น",
    time: "18:00",
    icon: "dark-mode",
    meds: [
      {
        name: "Rasagiline",
        dose: "1 เม็ด (1 mg)",
        status: "pending",
      },
    ],
  },
];

export default function MedicationScreen() {
  const [schedule, setSchedule] = useState(SCHEDULE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadMedications() {
      setIsLoading(true);

      try {
        const medications = await api.listMedications();

        if (!mounted || medications.length === 0) {
          return;
        }

        setSchedule([
          {
            label: "From server",
            time: "Today",
            icon: "light-mode",
            meds: medications.map((medication) => ({
              id: medication.id,
              name: medication.name,
              dose: medication.doseMg ? `${medication.doseMg} mg` : "Dose not set",
              status: medication.active ? "pending" : "completed",
            })),
          },
        ]);
      } catch (error) {
        Alert.alert(
          "Could not load medications",
          error instanceof Error ? error.message : "Please check the server.",
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadMedications();

    return () => {
      mounted = false;
    };
  }, []);

  const handleTakenAlert = () => {
    Alert.alert("บันทึกแล้ว!", "ระบบบันทึกว่าคุณทานยาเรียบร้อยแล้ว ✓");
  };

  const handleCallCaregiver = () => {
    Alert.alert("โทรหาผู้ดูแล", "กำลังโทรหาผู้ดูแลฉุกเฉิน...");
  };

  const handleToggleMed = async (sectionIdx: number, medIdx: number) => {
    const selectedMed = schedule[sectionIdx]?.meds[medIdx];

    setSchedule((prev) => {
      const next = prev.map((section, si) => ({
        ...section,
        meds: section.meds.map((med, mi) => {
          if (si === sectionIdx && mi === medIdx) {
            return {
              ...med,
              status:
                med.status === "completed"
                  ? ("pending" as MedStatus)
                  : ("completed" as MedStatus),
            };
          }
          return med;
        }),
      }));
      return next;
    });

    if (!selectedMed?.id) {
      return;
    }

    try {
      await api.logMedication(
        selectedMed.id,
        selectedMed.status === "completed" ? "SKIPPED" : "TAKEN",
      );
    } catch (error) {
      Alert.alert(
        "Could not update medication",
        error instanceof Error ? error.message : "Please check the server.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.navBg} />

      {/* ── Top App Bar ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            <Text style={{ fontSize: 20 }}>💊</Text>
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
        {/* ══════════════════════════════════════════════════════
            OFF Period Alert (High Priority)
           ══════════════════════════════════════════════════════ */}
        <View style={styles.alertCard}>
          <View style={styles.alertTop}>
            <View style={styles.alertIconWrap}>
              <MaterialIcons name="warning" size={26} color={C.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>ระวังช่วง OFF</Text>
              <Text style={styles.alertBody}>
                เลยเวลาทานยา Levodopa มาแล้ว 15 นาที
                กรุณาทานยาทันทีเพื่อป้องกันอาการเกร็ง
              </Text>
            </View>
          </View>

          {/* Alert Buttons */}
          <View style={styles.alertButtons}>
            <TouchableOpacity
              style={styles.alertBtnPrimary}
              onPress={handleTakenAlert}
              activeOpacity={0.85}
            >
              <Text style={styles.alertBtnPrimaryText}>
                ฉันทานยาเรียบร้อยแล้ว
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.alertBtnSecondary}
              onPress={handleCallCaregiver}
              activeOpacity={0.75}
            >
              <Text style={styles.alertBtnSecondaryText}>
                โทรหาผู้ดูแลฉุกเฉิน
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            Quick Action Buttons
           ══════════════════════════════════════════════════════ */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} activeOpacity={0.75}>
            <MaterialIcons
              name="add-circle"
              size={24}
              color={C.onSurfaceVariant}
            />
            <Text style={styles.quickBtnText}>เพิ่มยา</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} activeOpacity={0.75}>
            <MaterialIcons
              name="notifications-active"
              size={24}
              color={C.onSurfaceVariant}
            />
            <Text style={styles.quickBtnText}>ตั้งค่าเสียง</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <Text style={styles.loadingText}>Loading medications from server...</Text>
        )}

        {/* ══════════════════════════════════════════════════════
            Medication Timeline
           ══════════════════════════════════════════════════════ */}
        {schedule.map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.timeSection}>
            {/* Section Header */}
            <View style={styles.timeSectionHeader}>
              <MaterialIcons name={section.icon} size={26} color={C.primary} />
              <Text style={styles.timeSectionTitle}>
                {section.label} ({section.time})
              </Text>
            </View>

            {/* Med Items */}
            {section.meds.map((med, medIdx) => {
              if (med.status === "completed") {
                // ── Completed ──
                return (
                  <TouchableOpacity
                    key={medIdx}
                    style={styles.medCompleted}
                    onPress={() => handleToggleMed(sectionIdx, medIdx)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.medCheckDone}>
                      <MaterialIcons
                        name="check-circle"
                        size={36}
                        color={C.secondary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.medName}>{med.name}</Text>
                      <Text style={styles.medDoseCompleted}>{med.dose}</Text>
                    </View>
                    <Text style={styles.medDoneLabel}>ทานแล้ว</Text>
                  </TouchableOpacity>
                );
              }

              if (med.status === "overdue") {
                // ── Overdue ──
                return (
                  <TouchableOpacity
                    key={medIdx}
                    style={styles.medOverdue}
                    onPress={() => handleToggleMed(sectionIdx, medIdx)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.medCheckEmpty} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.medName}>{med.name}</Text>
                      <Text style={styles.medDose}>{med.dose}</Text>
                    </View>
                    <View style={styles.overdueLabel}>
                      <Text style={styles.overdueLabelSmall}>เลยเวลา</Text>
                      <Text style={styles.overdueTime}>{med.overdueTime}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }

              // ── Pending ──
              return (
                <TouchableOpacity
                  key={medIdx}
                  style={styles.medPending}
                  onPress={() => handleToggleMed(sectionIdx, medIdx)}
                  activeOpacity={0.8}
                >
                  <View style={styles.medCheckEmpty} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.medName}>{med.name}</Text>
                    <Text style={styles.medDose}>{med.dose}</Text>
                  </View>
                  <Text style={styles.pendingLabel}>ยังไม่ถึงเวลา</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Bottom spacer for nav bar */}
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },

  // ── Header ──
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
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.primaryFixed,
    justifyContent: "center",
    alignItems: "center",
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: C.primaryContainer,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  settingsBtn: { padding: 8 },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },

  // ══════════════════════════════════════════════════════
  // OFF Period Alert
  // ══════════════════════════════════════════════════════
  alertCard: {
    backgroundColor: C.errorContainer,
    borderWidth: 4,
    borderColor: C.error,
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: C.error,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  alertTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  alertIconWrap: {
    backgroundColor: C.error,
    padding: 12,
    borderRadius: 16,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: C.onErrorContainer,
    lineHeight: 32,
  },
  alertBody: {
    fontSize: 16,
    color: C.onErrorContainer,
    lineHeight: 26,
    marginTop: 4,
  },
  alertButtons: {
    marginTop: 20,
    gap: 12,
  },
  alertBtnPrimary: {
    backgroundColor: C.error,
    borderRadius: 999,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: C.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  alertBtnPrimaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: C.onError,
    letterSpacing: 0.5,
  },
  alertBtnSecondary: {
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.error,
    borderRadius: 999,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  alertBtnSecondaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: C.error,
    letterSpacing: 0.5,
  },

  // ══════════════════════════════════════════════════════
  // Quick Action Buttons
  // ══════════════════════════════════════════════════════
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.surfaceContainerHigh,
    height: 64,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: C.outlineVariant,
  },
  quickBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 14,
    color: C.outline,
    textAlign: "center",
  },

  // ══════════════════════════════════════════════════════
  // Timeline Sections
  // ══════════════════════════════════════════════════════
  timeSection: {
    gap: 12,
  },
  timeSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  timeSectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: C.onSurface,
    lineHeight: 32,
  },

  // ── Completed Med Row ──
  medCompleted: {
    backgroundColor: C.secondaryFixed,
    borderWidth: 2,
    borderColor: C.secondary,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
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
  medCheckDone: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: C.white,
    justifyContent: "center",
    alignItems: "center",
  },
  medDoneLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: C.onSecondaryFixedVariant,
  },

  // ── Overdue Med Row ──
  medOverdue: {
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.error,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: C.error,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
    }),
  },
  medCheckEmpty: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: C.outlineVariant,
    backgroundColor: C.surfaceContainerLow,
  },
  overdueLabel: {
    alignItems: "center",
  },
  overdueLabelSmall: {
    fontSize: 12,
    color: C.error,
    fontWeight: "700",
  },
  overdueTime: {
    fontSize: 16,
    fontWeight: "700",
    color: C.error,
  },

  // ── Pending Med Row ──
  medPending: {
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  pendingLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: C.outline,
  },

  // ── Shared Med Text ──
  medName: {
    fontSize: 16,
    fontWeight: "700",
    color: C.onSurface,
    letterSpacing: 0.4,
  },
  medDose: {
    fontSize: 16,
    color: C.outline,
    marginTop: 2,
    lineHeight: 24,
  },
  medDoseCompleted: {
    fontSize: 16,
    color: C.onSecondaryFixedVariant,
    opacity: 0.8,
    marginTop: 2,
    lineHeight: 24,
  },
});
