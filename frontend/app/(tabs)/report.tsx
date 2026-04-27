// ReportScreen — converted from HTML/Tailwind design
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
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
import { api, type MonthlyReport } from "../../lib/api";

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
  surfaceContainerLow: "#f0f3ff",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#111c2d",
  onSurfaceVariant: "#41474d",
  outlineVariant: "#c1c7ce",
  outline: "#72787e",
  error: "#ba1a1a",
  navBg: "#ffffff",
  navBorder: "#e8ecf4",
  white: "#ffffff",
};

const DAY_LABELS = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

export default function ReportScreen() {
  const [report, setReport] = useState<MonthlyReport | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadReport() {
      try {
        const result = await api.getMonthlyReport();

        if (mounted) {
          setReport(result);
        }
      } catch (error) {
        Alert.alert(
          "Could not load report",
          error instanceof Error ? error.message : "Please check the server.",
        );
      }
    }

    loadReport();

    return () => {
      mounted = false;
    };
  }, []);

  const handleShare = () => {
    Alert.alert("ส่งรายงาน", "กำลังเตรียมรายงานเพื่อส่งให้แพทย์ของคุณ...");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.navBg} />

      {/* ── Top App Bar ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            <Text style={{ fontSize: 20 }}>📊</Text>
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
            Summary Hero Card
           ══════════════════════════════════════════════════════ */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>รายงานรายสัปดาห์</Text>
              <Text style={styles.heroTitle}>สรุปภาพรวมอาการ</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>7 วันที่ผ่านมา</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {/* Med Adherence */}
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>การกินยาตรงเวลา</Text>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValue, { color: C.secondary }]}>
                  {report ? `${report.medicationCompliance}%` : "94%"}
                </Text>
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color={C.secondary}
                />
              </View>
            </View>
            {/* OFF Frequency */}
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>ความถี่ช่วง OFF</Text>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValue, { color: C.tertiary }]}>
                  {report ? `${report.offEpisodeCount} ครั้ง` : "2 ครั้ง"}
                </Text>
                <MaterialIcons name="warning" size={24} color={C.tertiary} />
              </View>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            Tremor Trend Graph
           ══════════════════════════════════════════════════════ */}
        <View style={styles.graphCard}>
          <View style={styles.graphHeader}>
            <MaterialIcons name="auto-graph" size={30} color={C.primary} />
            <Text style={styles.graphTitle}>แนวโน้มระดับการสั่น</Text>
          </View>

          {/* Graph Area */}
          <View style={styles.graphArea}>
            {/* Grid lines */}
            <View style={styles.gridLines}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.gridLine} />
              ))}
            </View>

            {/* SVG Line Chart */}
            <View style={styles.svgWrap}>
              <Svg
                width="100%"
                height="160"
                viewBox="0 0 700 200"
                preserveAspectRatio="none"
              >
                <Defs>
                  <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#0f4361" />
                    <Stop offset="100%" stopColor="#cae6ff" />
                  </LinearGradient>
                </Defs>
                <Path
                  d="M0,120 Q50,140 100,80 T200,100 T300,40 T400,90 T500,70 T600,130 T700,60"
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Data Points */}
                <Circle cx="100" cy="80" r="8" fill="#0f4361" stroke="white" strokeWidth="3" />
                <Circle cx="300" cy="40" r="8" fill="#0f4361" stroke="white" strokeWidth="3" />
                <Circle cx="500" cy="70" r="8" fill="#0f4361" stroke="white" strokeWidth="3" />
                <Circle cx="700" cy="60" r="8" fill="#0f4361" stroke="white" strokeWidth="3" />
              </Svg>
            </View>

            {/* Day Labels */}
            <View style={styles.dayLabelsRow}>
              {DAY_LABELS.map((label, i) => (
                <Text
                  key={i}
                  style={[
                    styles.dayLabel,
                    i === 2 && { color: C.primary, fontWeight: "700" },
                  ]}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>

          {/* Insight text */}
          <View style={styles.insightRow}>
            <MaterialIcons name="lightbulb" size={22} color={C.secondary} />
            <Text style={styles.insightText}>
              ระดับการสั่นลดลง 15% เมื่อเทียบกับสัปดาห์ก่อน
            </Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            Insights Bento
           ══════════════════════════════════════════════════════ */}
        <View style={styles.insightCard}>
          <View style={styles.insightIconWrap}>
            <MaterialIcons name="medication" size={36} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightCardTitle}>วินัยการทานยา</Text>
            <Text style={styles.insightCardBody}>
              {report
                ? `บันทึกอาการทั้งหมด ${report.symptomCount} ครั้งใน 30 วันที่ผ่านมา`
                : "ทานยาตรงเวลาครบทุกมื้อใน 3 วันล่าสุด"}
            </Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            Share Button
           ══════════════════════════════════════════════════════ */}
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <MaterialIcons name="share" size={28} color={C.white} />
          <Text style={styles.shareBtnText}>ส่งรายงานให้คุณหมอ</Text>
        </TouchableOpacity>

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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primaryFixed,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: C.primary,
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
  // Hero Summary Card
  // ══════════════════════════════════════════════════════
  heroCard: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 32,
    padding: 24,
    borderWidth: 2,
    borderColor: C.primaryFixed,
    ...Platform.select({
      ios: {
        shadowColor: C.primaryContainer,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 30,
      },
      android: { elevation: 3 },
    }),
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: C.primary,
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: C.primary,
    marginTop: 4,
    lineHeight: 32,
  },
  heroBadge: {
    backgroundColor: C.secondaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.onSecondaryContainer,
  },

  // Stats
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: C.surfaceContainerLow,
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: C.outline,
    marginBottom: 8,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 40,
  },

  // ══════════════════════════════════════════════════════
  // Graph Card
  // ══════════════════════════════════════════════════════
  graphCard: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 32,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: C.primaryContainer,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 30,
      },
      android: { elevation: 3 },
    }),
  },
  graphHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  graphTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: C.primary,
  },

  // Graph area
  graphArea: {
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 16,
    paddingBottom: 8,
    minHeight: 220,
  },
  gridLines: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    bottom: 40,
    justifyContent: "space-between",
  },
  gridLine: {
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  svgWrap: {
    height: 160,
    marginBottom: 8,
  },
  dayLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
  },

  // Insight
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 20,
  },
  insightText: {
    fontSize: 16,
    color: C.outline,
    lineHeight: 26,
    flex: 1,
  },

  // ══════════════════════════════════════════════════════
  // Insight Bento Card
  // ══════════════════════════════════════════════════════
  insightCard: {
    backgroundColor: C.surfaceContainerHigh,
    borderRadius: 32,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  insightIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: C.white,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  insightCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.primary,
    letterSpacing: 0.5,
  },
  insightCardBody: {
    fontSize: 16,
    color: C.onSurface,
    opacity: 0.8,
    lineHeight: 24,
    marginTop: 4,
  },

  // ══════════════════════════════════════════════════════
  // Share Button
  // ══════════════════════════════════════════════════════
  shareBtn: {
    backgroundColor: C.primary,
    borderRadius: 999,
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  shareBtnText: {
    fontSize: 20,
    fontWeight: "600",
    color: C.white,
  },
});
