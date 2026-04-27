import { SafeAreaProvider } from "react-native-safe-area-context";
import SymptomLogScreen from "../SymptomLogScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <SymptomLogScreen />
    </SafeAreaProvider>
  );
}
