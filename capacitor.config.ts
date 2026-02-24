import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.toastmastersxr.practiceroom",
  appName: "Toastmasters XR Practice Room",
  webDir: "dist/public",
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    backgroundColor: "#1a1a2e",
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      showSpinner: false,
      launchAutoHide: true,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#1a1a2e",
    },
  },
};

export default config;
