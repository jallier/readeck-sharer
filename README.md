# Readeck Sharer

A mobile app for quickly sharing articles and links to your [Readeck](https://readeck.org/) library. Built with SvelteKit and Capacitor for Android.

This app is just a simple stopgap to make sending articles to readeck from your phone easier, using the native android share menu.

## Development Setup

### Prerequisites

Before you can develop this app, you'll need:

1. **Node.js** (v18 or later)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **Android Development Environment:**
   - **Android Studio** - Download from [developer.android.com](https://developer.android.com/studio)
   - **Android SDK** (installed via Android Studio)
   - **Java JDK 17** (Android Studio can install this for you)

3. **Capacitor CLI:**

   ```bash
   npm install -g @capacitor/cli
   ```

4. **A Readeck Server Instance** for testing:
   - You can run [Readeck locally](https://readeck.org/en/docs/installation/) for development
   - Or use an existing Readeck server you have access to
   - You'll need an API token from your Readeck account settings

### Initial Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd readeck-sharer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Verify Android setup:**
   ```bash
   npx cap doctor android
   ```
   This will check if your Android environment is properly configured.

### Development Workflow

1. **Start the web development server:**

   ```bash
   npm run dev
   ```

   This runs the SvelteKit app in your browser for rapid development.

2. **Build and sync to Android:**

   ```bash
   npm run build
   npx cap sync android
   ```

3. **Run on Android device/emulator:**

   ```bash
   npm run app:run
   ```

   Note: This will run step 2 automatically, so you don't need to run those commands every time.

   Or manually open in Android Studio:

   ```bash
   npx cap open android
   ```

### Common Development Commands

```bash
# Web development
npm run dev                    # Start web dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Android development
npm run app:run                # Build, sync, and run on Android
npx cap sync android           # Sync web assets to Android
npx cap open android           # Open project in Android Studio

# Code quality
npm run lint                   # Run linter
npm run format                 # Format code with Prettier
npm run check                  # Type check with Svelte
```

### Troubleshooting

**Android Studio not finding SDK:**

- Open Android Studio → Tools → SDK Manager
- Install Android SDK Platform 34 (or latest)
- Note the SDK path and update your `ANDROID_HOME` environment variable

**Capacitor sync errors:**

- Run `npx cap doctor` to diagnose issues
- Make sure you've run `npm run build` before syncing

## Android Release Build

To build a signed Android APK for release:

### Prerequisites

You need to create the following files (these are gitignored for security):

1. **`android/key.properties`** - Contains signing credentials:

   ```properties
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=readeck-sharer
   storeFile=../readeck-sharer-release-key.keystore
   ```

2. **`android/readeck-sharer-release-key.keystore`** - Your signing keystore file

   Generate with:

   ```bash
   cd android
   keytool -genkey -v -keystore readeck-sharer-release-key.keystore -alias readeck-sharer -keyalg RSA -keysize 2048 -validity 10000
   ```

### Building

Once you have the signing files configured:

```bash
# Build signed release APK
npm run build:android:release
```

The signed APK will be located at:

```
android/app/build/outputs/apk/release/app-release.apk
```

## Technologies Used

- **[SvelteKit](https://kit.svelte.dev/)** - Web framework
- **[Capacitor](https://capacitorjs.com/)** - Native mobile wrapper
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Send Intent Plugin](https://github.com/carsten-klaffke/send-intent)** - Android share intent handling

### Security Notes

- **Never commit** `key.properties` or `*.keystore` files to version control
- **Keep your keystore safe** - if lost, you cannot update your app
