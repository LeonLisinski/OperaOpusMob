import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Store / produkcijski identitet = Ionic Capacitor (`com.opera.mobile`, Opera Mobile).
 * Preview/dev koriste `.preview` suffix da se APK može sideloadati uz Play verziju
 * (drugi potpis) — production EAS submit ide na isti package kao Ionic.
 */
const APP_VARIANT = process.env.APP_VARIANT ?? 'production';
const isPreview = APP_VARIANT === 'preview' || APP_VARIANT === 'development';

const packageName = isPreview ? 'com.opera.mobile.preview' : 'com.opera.mobile';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Opera Mobile',
  slug: 'operamobile',
  version: '2.0.11',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'operamobile',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: packageName,
    buildNumber: '20011',
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSPhotoLibraryUsageDescription:
        'Aplikacija koristi datoteke i fotografije kao privitke poslovnih dokumenata.',
      CFBundleAllowMixedLocalizations: true,
    },
  },
  android: {
    package: packageName,
    versionCode: 20011,
    softwareKeyboardLayoutMode: 'resize',
    adaptiveIcon: {
      // Isti vizual kao Ionic `assets/icon.png` (zeleni graf na teal pozadini).
      backgroundColor: '#2A4549',
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#2A4549',
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
      },
    ],
    'expo-secure-store',
    'expo-sharing',
    'expo-document-picker',
    '@react-native-community/datetimepicker',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '00e0fcea-dd27-4092-a601-3df534e4ba1d',
    },
    appVariant: APP_VARIANT,
  },
  owner: 'svampluss-team',
});
