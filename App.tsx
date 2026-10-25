import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <Text style={styles.eyebrow}>PRIEMYSELNÁ MOBILNÁ APLIKÁCIA</Text>
        <Text style={styles.title}>Stavuno</Text>
        <Text style={styles.subtitle}>Stavba pod kontrolou.</Text>
        <Text style={styles.body}>
          Základ projektu je pripravený. Funkcie MVP budú pridávané v
          samostatných, kontrolovateľných krokoch.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8F5EF",
  },
  card: {
    padding: 28,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE4E1",
  },
  eyebrow: {
    marginBottom: 12,
    color: "#2E7D67",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  title: {
    color: "#153D35",
    fontSize: 42,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    color: "#2E7D67",
    fontSize: 20,
    fontWeight: "600",
  },
  body: {
    marginTop: 24,
    color: "#42524E",
    fontSize: 16,
    lineHeight: 24,
  },
});

