const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // `.expo/types` je generirano (expo-router typegen) — ne lintamo tuđi output.
    ignores: ['dist/*', '.expo/*'],
  },
]);
