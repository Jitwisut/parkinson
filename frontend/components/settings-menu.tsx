import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const C = {
  primaryContainer: "#2d5b7a",
  surface: "#ffffff",
  border: "#e8ecf4",
  text: "#111c2d",
  danger: "#ba1a1a",
  backdrop: "rgba(17, 28, 45, 0.18)",
};

export function SettingsMenu() {
  const [visible, setVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signOut } = useAuth();
  const router = useRouter();

  const closeMenu = () => setVisible(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/login");
    } finally {
      setIsSigningOut(false);
      closeMenu();
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        activeOpacity={0.7}
        onPress={() => setVisible(true)}
      >
        <MaterialIcons name="settings" size={28} color={C.primaryContainer} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={closeMenu} />
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.8}
              onPress={handleSignOut}
              disabled={isSigningOut}
            >
              <MaterialIcons name="logout" size={20} color={C.danger} />
              <Text style={styles.menuText}>
                {isSigningOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: 8,
  },
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.backdrop,
  },
  menu: {
    position: "absolute",
    top: 90,
    right: 20,
    minWidth: 188,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
  },
});
