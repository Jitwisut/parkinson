import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

const C = {
  primary: "#0f4361",
  primaryContainer: "#2d5b7a",
  onSurfaceVariant: "#41474d",
  white: "#ffffff",
  navBg: "#ffffff",
  navBorder: "#e8ecf4",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.white,
        tabBarInactiveTintColor: C.onSurfaceVariant,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: C.navBg,
          borderTopWidth: 2,
          borderTopColor: C.navBorder,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 12,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          minHeight: 100,
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
        tabBarActiveBackgroundColor: C.primaryContainer,
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 4,
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontWeight: "600",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "หน้าหลัก",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="symptom-log"
        options={{
          title: "บันทึกอาการ",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="edit-note" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sensor"
        options={{
          title: "วัดอาการสั่น",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="sensors" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medication"
        options={{
          title: "เตือนทานยา",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="medication" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "รายงาน",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
