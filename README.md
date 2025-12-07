This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Prerequisites

Before setting up this project, ensure you have the following software installed with the specified versions:

### Core Development Tools

- **Node.js**: >=18.0.0 (see [Node.js installation guide](https://nodejs.org/))
- **npm** or **yarn**: Latest stable version
- **TypeScript**: ^5.8.3

### React Native Stack

- **React Native**: 0.81.0
- **React**: 19.1.0
- **Metro Bundler**: Included with React Native

### Android Development

- **Android Studio**: Latest stable version (see [Android Studio download](https://developer.android.com/studio))
- **Android SDK**:
  - Minimum SDK: 24 (Android 7.0 Nougat)
  - Target SDK: 36
  - Compile SDK: 36
  - Build Tools: 36.0.0
- **Gradle**: 8.14.3
- **Kotlin**: 2.1.20
- **NDK**: 27.1.12297006
- **Android Gradle Plugin**: Compatible with Gradle 8.14.3
- **Java Development Kit (JDK)**: Version compatible with React Native 0.81.0 (typically JDK 17 or 21)

### iOS Development (if applicable)

- **macOS**: Required for iOS development
- **Xcode**: Latest stable version (see [Xcode download](https://developer.apple.com/xcode/))
- **iOS Deployment Target**: 15.1
- **CocoaPods**: >= 1.13, != 1.15.0, != 1.15.1
- **Ruby**: >= 2.6.10

### Firebase

- **Firebase Android SDK**: 34.6.0 (BOM)
- **Firebase iOS SDK**: Managed via CocoaPods
- **@react-native-firebase packages**: ^23.5.0
  - @react-native-firebase/app: ^23.5.0
  - @react-native-firebase/auth: ^23.5.0
  - @react-native-firebase/firestore: ^23.5.0

### Verifying Your Installation

Before proceeding, verify that you have the correct versions installed:

```sh
# Check Node.js version
node --version

# Check npm version
npm --version
# OR check yarn version
yarn --version

# Check Java version (for Android)
java -version

# Check ADB version (Android Debug Bridge)
adb version

# Check Gradle version (if installed globally)
gradle --version
```

## Firebase Setup

This app uses Firebase for authentication and data storage. The following Firebase services are integrated:

- **Firebase Authentication** (@react-native-firebase/auth: ^23.5.0)
- **Cloud Firestore** (@react-native-firebase/firestore: ^23.5.0)
- **Firebase App** (@react-native-firebase/app: ^23.5.0)

You need to configure Firebase credentials before running the app. The native Firebase SDK versions are managed automatically:
- **Android**: Firebase BOM 34.6.0 (see `android/app/build.gradle`)
- **iOS**: Managed via CocoaPods

### Android Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the Android app icon to add an Android app
4. Enter your package name: `com.calendarapp`
5. Download the `google-services.json` file
6. Place the file in `android/app/google-services.json`

> **Important**: The `google-services.json` file contains sensitive credentials and is not tracked in git. Make sure to add your own Firebase configuration file before building the app.

You can use `android/app/google-services.json.example` as a reference for the file structure.

> **Note**: The Google Services Gradle plugin (version 4.4.4) is already configured in the project. The `google-services.json` file will be automatically processed during the build.

### iOS Setup (if applicable)

1. In Firebase Console, add an iOS app to your project
2. Download the `GoogleService-Info.plist` file
3. Place the file in `ios/GoogleService-Info.plist`
4. After adding the file, run:
   ```sh
   cd ios
   bundle exec pod install
   cd ..
   ```

> **Note**: Make sure you have completed the iOS prerequisites (CocoaPods, Ruby) before setting up Firebase for iOS.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

#### Running on Android Emulator

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

#### Running on Physical Android Device

To run the app on a physical Android device, follow these steps:

1. **Enable Developer Options on your device:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times until you see "You are now a developer!"

2. **Enable USB Debugging:**
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
   - Enable "Stay awake" (optional, but recommended)

3. **Connect your device:**
   - Connect your Android device to your computer via USB cable
   - On your device, you may see a prompt asking to "Allow USB debugging" - tap "Allow" or "OK"
   - Check "Always allow from this computer" if you want to skip this prompt in the future

4. **Verify device connection:**
   ```sh
   adb devices
   ```
   You should see your device listed. If you see "unauthorized", check your device and accept the USB debugging prompt.

5. **Run the app:**
   ```sh
   # Using npm
   npm run android

   # OR using Yarn
   yarn android
   ```

6. **Troubleshooting:**
   - **Device not detected**: Make sure USB drivers are installed (Windows users may need to install device-specific drivers)
   - **Unauthorized device**: Revoke USB debugging authorizations on your device (Settings → Developer Options → Revoke USB debugging authorizations) and reconnect
   - **Connection issues**: Try a different USB cable or USB port
   - **ADB not found**: Make sure Android SDK Platform Tools are installed and added to your PATH
   - **Build fails**: Ensure your device meets the minimum SDK requirement (Android 7.0 Nougat / API 24)

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
