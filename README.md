# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

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

### Security Notes

- **Never commit** `key.properties` or `*.keystore` files to version control
- **Keep your keystore safe** - if lost, you cannot update your app
- The signing files are automatically gitignored for security
