// Tremor Sensor Screen — Accelerometer-based tremor measurement
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Accelerometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../lib/api";

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

type Phase = "idle" | "countdown" | "measuring" | "done";

const MEASURE_DURATION_MS = 10_000; // 10 seconds
const SAMPLE_INTERVAL_MS = 100;

export default function SensorScreen() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [rmsResult, setRmsResult] = useState<number | null>(null);
  const [baseline, setBaseline] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [tremorScore, setTremorScore] = useState<number | null>(null);

  const samplesRef = useRef<{ ax: number; ay: number; az: number }[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Load baseline on mount
  useEffect(() => {
    api.getBaseline().then((b) => {
      if (b) setBaseline(b.rmsBaseline);
    }).catch(() => {});
  }, []);

  // Pulse animation during measuring
  useEffect(() => {
    if (phase === "measuring") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [phase]);

  const startMeasurement = () => {
    setPhase("countdown");
    setCountdown(3);
    setRmsResult(null);
    setTremorScore(null);
    samplesRef.current = [];

    let c = 3;
    const cdInterval = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(cdInterval);
        runAccelerometer();
      } else {
        setCountdown(c);
      }
    }, 1000);
  };

  const runAccelerometer = () => {
    setPhase("measuring");
    setProgress(0);
    samplesRef.current = [];

    Accelerometer.setUpdateInterval(SAMPLE_INTERVAL_MS);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      samplesRef.current.push({ ax: x, ay: y, az: z });
    });

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(elapsed / MEASURE_DURATION_MS, 1);
      setProgress(pct);

      if (pct >= 1) {
        clearInterval(progressInterval);
        sub.remove();
        finalizeMeasurement();
      }
    }, 200);
  };

  const finalizeMeasurement = () => {
    const samples = samplesRef.current;
    if (samples.length === 0) {
      Alert.alert("Error", "ไม่สามารถอ่านค่า sensor ได้ กรุณาลองใหม่บนมือถือจริง");
      setPhase("idle");
      return;
    }

    // Calculate RMS = sqrt(mean(ax² + ay² + az²))
    const sumSq = samples.reduce((acc, s) => acc + s.ax * s.ax + s.ay * s.ay + s.az * s.az, 0);
    const rms = Math.sqrt(sumSq / samples.length);
    setRmsResult(rms);

    // Calculate tremor score 0-5 based on baseline
    if (baseline && baseline > 0) {
      const ratio = rms / baseline;
      const score = Math.min(5, Math.max(0, Math.round((ratio - 1) * 5)));
      setTremorScore(score);
    }

    setPhase("done");
  };

  const handleSaveResult = async () => {
    if (rmsResult === null) return;
    setIsSaving(true);

    const samples = samplesRef.current;
    const avgAx = samples.reduce((s, v) => s + v.ax, 0) / samples.length;
    const avgAy = samples.reduce((s, v) => s + v.ay, 0) / samples.length;
    const avgAz = samples.reduce((s, v) => s + v.az, 0) / samples.length;

    try {
      await api.sendTremorReading({
        ax: Number(avgAx.toFixed(6)),
        ay: Number(avgAy.toFixed(6)),
        az: Number(avgAz.toFixed(6)),
        rms: Number(rmsResult.toFixed(6)),
        recordedAt: new Date().toISOString(),
      });
      Alert.alert("บันทึกแล้ว ✓", `RMS: ${rmsResult.toFixed(4)}\nจำนวนตัวอย่าง: ${samples.length}`);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "ไม่สามารถบันทึกได้");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCalibrate = async () => {
    if (rmsResult === null) return;
    try {
      await api.setBaseline(Number(rmsResult.toFixed(6)));
      setBaseline(rmsResult);
      Alert.alert("ตั้งค่า Baseline แล้ว ✓", `Baseline RMS = ${rmsResult.toFixed(4)}`);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "ไม่สามารถตั้ง baseline ได้");
    }
  };

  const getSeverityColor = (score: number) => {
    if (score <= 1) return C.secondary;
    if (score <= 3) return C.primaryContainer;
    return C.error;
  };

  const getSeverityLabel = (score: number) => {
    const labels = ["ไม่มี", "เล็กน้อย", "ปานกลาง", "ชัดเจน", "มาก", "รุนแรง"];
    return labels[score] || "ไม่ทราบ";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.navBg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            <MaterialCommunityIcons name="vibrate" size={22} color={C.primary} />
          </View>
          <Text style={styles.appTitle}>Parkinson Care</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
          <MaterialIcons name="settings" size={28} color={C.primaryContainer} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section Heading */}
        <View style={styles.sectionHeading}>
          <Text style={styles.headlineMd}>วัดอาการสั่นอัตโนมัติ</Text>
          <Text style={styles.subheading}>ถือมือถือนิ่งๆ 10 วินาที เพื่อวัดระดับอาการสั่น</Text>
        </View>

        {/* Baseline Info */}
        <View style={styles.baselineCard}>
          <MaterialIcons name="tune" size={24} color={C.onSecondaryContainer} />
          <View style={{ flex: 1 }}>
            <Text style={styles.baselineLabel}>Baseline (ค่าปกติ)</Text>
            <Text style={styles.baselineValue}>
              {baseline ? `RMS = ${baseline.toFixed(4)}` : "ยังไม่ได้ตั้งค่า — วัดครั้งแรกแล้วกด Calibrate"}
            </Text>
          </View>
        </View>

        {/* Measurement Area */}
        <View style={styles.measureCard}>
          {phase === "idle" && (
            <>
              <View style={styles.idleIcon}>
                <MaterialCommunityIcons name="hand-back-right" size={64} color={C.primaryContainer} />
              </View>
              <Text style={styles.measureInstruction}>
                วางมือถือบนฝ่ามือที่ยื่นออกไปข้างหน้า{"\n"}แล้วกดปุ่มด้านล่างเพื่อเริ่มวัด
              </Text>
              <TouchableOpacity style={styles.startBtn} onPress={startMeasurement} activeOpacity={0.85}>
                <MaterialCommunityIcons name="play-circle" size={28} color={C.white} />
                <Text style={styles.startBtnText}>เริ่มวัดอาการสั่น</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === "countdown" && (
            <View style={styles.countdownArea}>
              <Text style={styles.countdownLabel}>เตรียมตัว...</Text>
              <Text style={styles.countdownNumber}>{countdown}</Text>
              <Text style={styles.countdownHint}>ถือมือถือให้นิ่ง</Text>
            </View>
          )}

          {phase === "measuring" && (
            <View style={styles.measuringArea}>
              <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                <MaterialCommunityIcons name="vibrate" size={48} color={C.white} />
              </Animated.View>
              <Text style={styles.measuringLabel}>กำลังวัด... อย่าขยับ</Text>
              {/* Progress Bar */}
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
            </View>
          )}

          {phase === "done" && rmsResult !== null && (
            <View style={styles.resultArea}>
              <MaterialIcons name="check-circle" size={48} color={C.secondary} />
              <Text style={styles.resultTitle}>วัดเสร็จแล้ว!</Text>

              <View style={styles.resultGrid}>
                <View style={styles.resultBox}>
                  <Text style={styles.resultLabel}>RMS</Text>
                  <Text style={styles.resultValue}>{rmsResult.toFixed(4)}</Text>
                </View>
                <View style={styles.resultBox}>
                  <Text style={styles.resultLabel}>ตัวอย่าง</Text>
                  <Text style={styles.resultValue}>{samplesRef.current.length}</Text>
                </View>
              </View>

              {tremorScore !== null && (
                <View style={[styles.scoreBadge, { backgroundColor: getSeverityColor(tremorScore) }]}>
                  <Text style={styles.scoreText}>
                    ระดับการสั่น: {tremorScore}/5 — {getSeverityLabel(tremorScore)}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
                  onPress={handleSaveResult}
                  disabled={isSaving}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="cloud-upload" size={24} color={C.white} />
                  <Text style={styles.saveBtnText}>{isSaving ? "กำลังบันทึก..." : "บันทึกผล"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.calibrateBtn} onPress={handleCalibrate} activeOpacity={0.75}>
                  <MaterialIcons name="tune" size={24} color={C.primary} />
                  <Text style={styles.calibrateBtnText}>ตั้งเป็น Baseline</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.retryBtn} onPress={startMeasurement} activeOpacity={0.75}>
                  <MaterialIcons name="refresh" size={24} color={C.onSurfaceVariant} />
                  <Text style={styles.retryBtnText}>วัดอีกครั้ง</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* How it works */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>วิธีการทำงาน</Text>
          {[
            { icon: "smartphone" as const, text: "ใช้ Accelerometer ในมือถือวัดความเร่ง" },
            { icon: "timer" as const, text: "วัด 10 วินาที แล้วคำนวณค่า RMS" },
            { icon: "compare-arrows" as const, text: "เปรียบเทียบกับ Baseline เพื่อให้คะแนน 0-5" },
            { icon: "cloud-upload" as const, text: "ส่งข้อมูลไปเก็บใน server อัตโนมัติ" },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <MaterialIcons name={item.icon} size={22} color={C.primaryContainer} />
              <Text style={styles.infoText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: C.navBg,
    borderBottomWidth: 2, borderBottomColor: C.navBorder,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarWrap: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: C.primaryFixed,
    justifyContent: "center", alignItems: "center",
  },
  appTitle: { fontSize: 22, fontWeight: "700", color: C.primaryContainer, letterSpacing: 0.5, marginLeft: 4 },
  settingsBtn: { padding: 8 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },

  sectionHeading: { paddingVertical: 8, gap: 6 },
  headlineMd: { fontSize: 26, fontWeight: "700", color: C.primary, lineHeight: 34 },
  subheading: { fontSize: 16, color: C.onSurfaceVariant, lineHeight: 24 },

  baselineCard: {
    backgroundColor: C.secondaryContainer, paddingHorizontal: 20, paddingVertical: 16,
    borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 14,
    borderWidth: 2, borderColor: C.secondary,
  },
  baselineLabel: { fontSize: 12, fontWeight: "700", color: C.onSecondaryContainer, textTransform: "uppercase", opacity: 0.8 },
  baselineValue: { fontSize: 16, fontWeight: "600", color: C.onSecondaryContainer, marginTop: 2 },

  measureCard: {
    backgroundColor: C.surfaceContainerLowest, borderRadius: 24, padding: 24,
    borderWidth: 2, borderColor: C.outlineVariant, alignItems: "center", minHeight: 300,
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: C.primaryContainer, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 4 },
    }),
  },

  idleIcon: { marginBottom: 20, opacity: 0.6 },
  measureInstruction: { fontSize: 16, color: C.onSurfaceVariant, textAlign: "center", lineHeight: 26, marginBottom: 24 },
  startBtn: {
    backgroundColor: C.primary, borderRadius: 999, paddingVertical: 20, paddingHorizontal: 40,
    flexDirection: "row", alignItems: "center", gap: 12,
    ...Platform.select({
      ios: { shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  startBtnText: { fontSize: 20, fontWeight: "700", color: C.white },

  countdownArea: { alignItems: "center", gap: 8 },
  countdownLabel: { fontSize: 18, color: C.onSurfaceVariant },
  countdownNumber: { fontSize: 80, fontWeight: "700", color: C.primary },
  countdownHint: { fontSize: 16, color: C.outline },

  measuringArea: { alignItems: "center", gap: 16, width: "100%" },
  pulseCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: C.primaryContainer,
    justifyContent: "center", alignItems: "center",
  },
  measuringLabel: { fontSize: 20, fontWeight: "600", color: C.primary },
  progressBg: {
    width: "100%", height: 12, borderRadius: 6, backgroundColor: C.surfaceContainerHigh, overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 6, backgroundColor: C.primaryContainer },
  progressText: { fontSize: 14, fontWeight: "700", color: C.outline },

  resultArea: { alignItems: "center", gap: 16, width: "100%" },
  resultTitle: { fontSize: 24, fontWeight: "700", color: C.secondary },
  resultGrid: { flexDirection: "row", gap: 12, width: "100%" },
  resultBox: {
    flex: 1, backgroundColor: C.surfaceContainerHigh, borderRadius: 16, padding: 16, alignItems: "center",
  },
  resultLabel: { fontSize: 12, fontWeight: "700", color: C.outline, textTransform: "uppercase" },
  resultValue: { fontSize: 28, fontWeight: "700", color: C.primary, marginTop: 4 },
  scoreBadge: {
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999,
  },
  scoreText: { fontSize: 16, fontWeight: "700", color: C.white },

  actionButtons: { gap: 12, width: "100%", marginTop: 8 },
  saveBtn: {
    backgroundColor: C.primary, borderRadius: 999, paddingVertical: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    ...Platform.select({
      ios: { shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  saveBtnText: { fontSize: 18, fontWeight: "700", color: C.white },
  calibrateBtn: {
    borderWidth: 2, borderColor: C.primary, borderRadius: 999, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  calibrateBtnText: { fontSize: 16, fontWeight: "700", color: C.primary },
  retryBtn: {
    borderWidth: 2, borderColor: C.outlineVariant, borderRadius: 999, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  retryBtnText: { fontSize: 16, fontWeight: "700", color: C.onSurfaceVariant },

  infoCard: {
    backgroundColor: C.surfaceContainer, borderRadius: 24, padding: 20, gap: 14,
  },
  infoTitle: { fontSize: 16, fontWeight: "700", color: C.primary, marginBottom: 4 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoText: { fontSize: 14, color: C.onSurfaceVariant, flex: 1, lineHeight: 22 },
});
