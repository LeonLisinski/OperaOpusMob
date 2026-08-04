const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Worklets/Reanimated na Expo-u: inlineRequires mora biti uključen.
// v. https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
