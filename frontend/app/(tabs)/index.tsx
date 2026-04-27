// Dashboard / Home Screen — converted from HTML design
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { api, type MonthlyReport } from "../../lib/api";
import { SettingsMenu } from "../../components/settings-menu";

// ── Theme ──────────────────────────────────────────────────────────────────────
const C = {
  primary: "#0f4361",
  primaryContainer: "#2d5b7a",
  primaryFixed: "#cae6ff",
  onPrimary: "#ffffff",
  secondary: "#266a4f",
  secondaryContainer: "#a9eecc",
  onSecondaryContainer: "#2b6e53",
  tertiary: "#742500",
  tertiaryContainer: "#9b3400",
  tertiaryFixed: "#ffdbcf",
  background: "#f9f9ff",
  surface: "#f9f9ff",
  surfaceContainer: "#e7eeff",
  surfaceContainerHigh: "#dee8ff",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#111c2d",
  onSurfaceVariant: "#41474d",
  outlineVariant: "#c1c7ce",
  outline: "#72787e",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  navBg: "#ffffff",
  navBorder: "#e8ecf4",
  white: "#ffffff",
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const [serverStatus, setServerStatus] = useState("checking");
  const [report, setReport] = useState<MonthlyReport | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const [health, monthlyReport] = await Promise.all([
          api.health(),
          api.getMonthlyReport(),
        ]);

        if (mounted) {
          setServerStatus(health.status);
          setReport(monthlyReport);
        }
      } catch {
        if (mounted) {
          setServerStatus("offline");
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const handleTakeMedicine = () => {
    Alert.alert("บันทึกแล้ว!", "ยาเพิ่มโดปามีน (Levodopa/Carbidopa) ✓");
  };

  const handleQuickLog = () => {
    // Could navigate to symptom log tab
    Alert.alert("บันทึกด่วน", "เปิดหน้าบันทึกอาการ");
  };

  const handleCallCaregiver = () => {
    Alert.alert("โทรหาผู้ดูแล", "กำลังโทรหาผู้ดูแลของคุณ...");
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "สมชาย";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.navBg} />

      {/* ── Top App Bar ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdY8lfffJa3iq2KhVy_9jy17lfFOZpu6S_mG4qAf7lCAmkO1OsKz13757R41vzZ0kSfvwpEZPNHp3I6wB1h5Zb1_yDtiQtSA1bV0Q8oITc67Esb8FVYF9XAaOCcFKzdpsDRN0bgPUbyw2J4LSsEdQyxCBUKbdRWoV8qnuI3QVX0VU0z5iQoTknYdswEymaJZEhHu9StwTNkZ3rih-JYI3onVblwma6nwOcBBvaxnj7Qzllrrq-tV35Adz3uDiNa9eINkoKv9w2vLAk",
            }}
            style={styles.avatar}
          />
          <Text style={styles.appTitle}>Parkinson Care</Text>
        </View>
        <SettingsMenu />
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ── */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>สวัสดีตอนเช้า, คุณ{firstName}</Text>
          <Text style={styles.greetingSub}>
            วันนี้เป็นวันที่ดีในการดูแลตัวเอง
          </Text>
        </View>

        {/* ── Status Badge ── */}
        <View style={styles.statusBadge}>
          <MaterialIcons name="check-circle" size={30} color={C.onSecondaryContainer} />
          <View>
            <Text style={styles.statusLabel}>สถานะปัจจุบัน</Text>
            <Text style={styles.statusValue}>
              {serverStatus === "ok" ? "Server connected" : "Server offline"}
            </Text>
          </View>
        </View>

        {/* ── Medication Card ── */}
        <View style={styles.medCard}>
          <View style={styles.medCardHeader}>
            <View style={styles.medCardLeft}>
              <View style={styles.medIconWrap}>
                <MaterialIcons name="medication" size={28} color={C.white} />
              </View>
              <Text style={styles.medTitle}>ยาครั้งต่อไป</Text>
            </View>
            <Text style={styles.medTime}>10:00 น.</Text>
          </View>
          <View style={styles.medNameBox}>
            <Text style={styles.medName}>
              ยาเพิ่มโดปามีน (Levodopa/Carbidopa)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.medBtn}
            onPress={handleTakeMedicine}
            activeOpacity={0.85}
          >
            <MaterialIcons name="done-all" size={24} color={C.white} />
            <Text style={styles.medBtnText}>กินแล้ว</Text>
          </TouchableOpacity>
        </View>

        {/* ── Bento Grid ── */}
        <View style={styles.bentoGrid}>
          {/* Quick Log Card */}
          <View style={styles.bentoCard}>
            <View>
              <Text style={styles.bentoTitle}>วันนี้คุณรู้สึกอย่างไรบ้าง?</Text>
              <Text style={styles.bentoSub}>บันทึกอาการปัจจุบันของคุณ</Text>
            </View>
            <TouchableOpacity
              style={styles.bentoBtn}
              onPress={handleQuickLog}
              activeOpacity={0.75}
            >
              <MaterialIcons name="edit-note" size={24} color={C.primary} />
              <Text style={styles.bentoBtnText}>บันทึกด่วน</Text>
            </TouchableOpacity>
          </View>

          {/* Emergency Card */}
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <MaterialIcons name="warning" size={30} color={C.tertiary} />
              <Text style={styles.emergencyTitle}>แจ้งเตือนด่วน</Text>
            </View>
            <Text style={styles.emergencySub}>
              หากเข้าสู่ช่วง OFF หรือมีอาการสั่นรุนแรง
            </Text>
            <TouchableOpacity
              style={styles.emergencyBtn}
              onPress={handleCallCaregiver}
              activeOpacity={0.85}
            >
              <MaterialIcons name="call" size={22} color={C.white} />
              <Text style={styles.emergencyBtnText}>โทรหาผู้ดูแล</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Daily Summary ── */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryHeading}>สรุปวันนี้</Text>
          <View style={styles.summaryList}>
            {/* Exercise */}
            <View style={[styles.summaryRow, styles.summaryRowBorder]}>
              <View style={styles.summaryLeft}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: C.secondaryContainer },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="dumbbell"
                    size={24}
                    color={C.secondary}
                  />
                </View>
                <View>
                  <Text style={styles.summaryItemTitle}>ออกกำลังกาย</Text>
                  <Text style={styles.summaryItemSub}>
                    {report ? `บันทึกอาการ ${report.symptomCount} ครั้ง` : "เป้าหมาย 30 นาที"}
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="check-box"
                size={26}
                color={C.secondary}
              />
            </View>
            {/* Water */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: C.surfaceContainerHigh },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="water"
                    size={24}
                    color={C.primary}
                  />
                </View>
                <View>
                  <Text style={styles.summaryItemTitle}>ดื่มน้ำ</Text>
                  <Text style={styles.summaryItemSub}>
                    {report ? `OFF alert ${report.offEpisodeCount} ครั้ง` : "6/8 แก้ว"}
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="check-box-outline-blank"
                size={26}
                color={C.outline}
              />
            </View>
          </View>
        </View>

        {/* Bottom spacer */}
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
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: C.primaryContainer,
  },
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
    paddingTop: 8,
    gap: 16,
  },

  // Greeting
  greeting: { paddingVertical: 8, gap: 4 },
  greetingTitle: {
    fontSize: 26,
    fontWeight: "600",
    color: C.primary,
    lineHeight: 34,
  },
  greetingSub: {
    fontSize: 18,
    color: C.outline,
    lineHeight: 28,
  },

  // Status Badge
  statusBadge: {
    backgroundColor: C.secondaryContainer,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 2,
    borderColor: C.secondary,
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
  statusLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.onSecondaryContainer,
    textTransform: "uppercase",
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: "600",
    color: C.onSecondaryContainer,
  },

  // Medication Card
  medCard: {
    backgroundColor: C.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: C.primaryContainer,
    padding: 20,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: C.primaryContainer,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 30,
      },
      android: { elevation: 4 },
    }),
  },
  medCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  medCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  medIconWrap: {
    backgroundColor: C.primaryContainer,
    padding: 12,
    borderRadius: 999,
  },
  medTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: C.primary,
  },
  medTime: {
    fontSize: 22,
    fontWeight: "600",
    color: C.primaryContainer,
  },
  medNameBox: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },
  medName: {
    fontSize: 18,
    color: C.onSurface,
    lineHeight: 28,
  },
  medBtn: {
    backgroundColor: C.primary,
    borderRadius: 999,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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
  medBtnText: {
    fontSize: 20,
    fontWeight: "600",
    color: C.white,
  },

  // Bento Grid
  bentoGrid: { gap: 16 },
  bentoCard: {
    backgroundColor: C.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: C.outlineVariant,
    padding: 20,
    borderRadius: 24,
    minHeight: 200,
    justifyContent: "space-between",
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
  bentoTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: C.primary,
    marginBottom: 6,
  },
  bentoSub: {
    fontSize: 16,
    color: C.outline,
    lineHeight: 24,
    marginBottom: 16,
  },
  bentoBtn: {
    borderWidth: 2,
    borderColor: C.primary,
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  bentoBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: C.primary,
    letterSpacing: 0.5,
  },

  // Emergency Card
  emergencyCard: {
    backgroundColor: C.tertiaryFixed,
    padding: 20,
    borderRadius: 24,
    minHeight: 200,
    justifyContent: "space-between",
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
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: C.tertiary,
  },
  emergencySub: {
    fontSize: 16,
    color: C.tertiaryContainer,
    lineHeight: 24,
    marginBottom: 16,
  },
  emergencyBtn: {
    backgroundColor: C.tertiary,
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emergencyBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: C.white,
  },

  // Summary Section
  summarySection: { gap: 12 },
  summaryHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: C.outline,
    textTransform: "uppercase",
    letterSpacing: 2,
    paddingHorizontal: 8,
  },
  summaryList: {
    backgroundColor: C.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#f1f5f9",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.onSurface,
  },
  summaryItemSub: {
    fontSize: 14,
    color: C.outline,
    marginTop: 2,
  },
});
