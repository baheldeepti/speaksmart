import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Platform,
  BackHandler,
  Linking,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";

const APP_URL = Constants.expoConfig?.extra?.appUrl || "https://toastmasters-xr.replit.app";

function GameWebView() {
  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (Platform.OS === "android") {
      const onBackPress = () => {
        if (webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }
  }, []);

  if (error) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>
          Unable to load Toastmasters XR. Please check your internet connection and try again.
        </Text>
        <Text
          style={styles.retryButton}
          onPress={() => {
            setError(false);
            setLoading(true);
          }}
        >
          Retry
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <WebView
        ref={webViewRef}
        source={{ uri: APP_URL }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setError(true)}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          if (nativeEvent.statusCode >= 500) {
            setError(true);
          }
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true}
        contentMode="mobile"
        cacheEnabled={true}
        onShouldStartLoadWithRequest={(event: WebViewNavigation) => {
          if (
            event.url.startsWith("http") &&
            !event.url.includes("toastmasters") &&
            !event.url.includes("replit.app") &&
            !event.url.includes("localhost")
          ) {
            Linking.openURL(event.url);
            return false;
          }
          return true;
        }}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4299e1" />
            <Text style={styles.loadingText}>Loading Toastmasters XR...</Text>
          </View>
        )}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4299e1" />
          <Text style={styles.loadingText}>Loading Toastmasters XR...</Text>
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GameWebView />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  webview: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    padding: 32,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  loadingText: {
    color: "#a0aec0",
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    color: "#e94560",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  errorText: {
    color: "#a0aec0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    color: "#4299e1",
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#4299e1",
    borderRadius: 8,
    overflow: "hidden",
  },
});
