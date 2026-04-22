import Constants from "expo-constants";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

/**
 * Reader-only mobile shell.
 *
 * Because Apple's App Store and Google Play prohibit Stripe-based purchases
 * of digital content, the mobile app wraps the web reader in a WebView rather
 * than embedding a native purchase UI. Users sign in and purchase on
 * lmntm.app (web) and return to this app to read — Apple explicitly allows
 * this "reader app" pattern.
 *
 * When we later ship native in-app purchase, replace this WebView with a
 * native TOC + reader tied to the store's IAP receipts.
 */

const WEB_URL = (Constants.expoConfig?.extra as { webAppUrl?: string } | undefined)?.webAppUrl
  ?? "https://lmntm.app";

export default function Home() {
  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <WebView
        source={{ uri: WEB_URL }}
        originWhitelist={["https://*"]}
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures
        decelerationRate="normal"
        style={styles.web}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#c5ced9" },
  web: { flex: 1 },
});
