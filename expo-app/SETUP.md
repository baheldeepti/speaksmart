# Toastmasters XR - Expo App Store Build Guide

## Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Apple Developer Account ($99/year)
- Expo account (free at expo.dev)

## Step 1: Publish the Web App
Before building the native app, publish the web version on Replit so it has a live URL.
Update `app.json` → `extra.appUrl` with your published Replit URL.

## Step 2: Install Dependencies
```bash
cd expo-app
npm install
```

## Step 3: Configure EAS
1. Log in to Expo:
   ```bash
   eas login
   ```
2. Link to your Expo project:
   ```bash
   eas init
   ```
   This will update the `projectId` in `app.json` automatically.

3. Update `eas.json` with your Apple credentials:
   - `appleId`: Your Apple ID email
   - `ascAppId`: Your App Store Connect app ID
   - `appleTeamId`: Your Apple Developer Team ID

## Step 4: Build for iOS
```bash
# Preview build (for testing on device)
eas build --platform ios --profile preview

# Production build (for App Store submission)
eas build --platform ios --profile production
```

## Step 5: Submit to App Store
```bash
eas submit --platform ios --profile production
```

## Step 6: App Store Connect
1. Go to appstoreconnect.apple.com
2. Fill in app metadata, screenshots, description
3. Set age rating, privacy policy URL
4. Submit for review

## Notes
- The app loads your web game in a native WebView
- All game logic runs from the published Replit URL
- Update the game by redeploying on Replit — no app update needed
- Privacy policy is built into the web app at /privacy
