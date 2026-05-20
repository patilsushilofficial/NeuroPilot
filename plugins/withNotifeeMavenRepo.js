const { withProjectBuildGradle } = require('@expo/config-plugins');

const NOTIFEE_MARKER = '@notifee/react-native/android/libs';
const NOTIFEE_MAVEN_BLOCK = `
        maven {
            url "$rootDir/../node_modules/@notifee/react-native/android/libs"
        }`;

/**
 * Expo config plugin — adds Notifee's local Maven repository so
 * app.notifee:core resolves on Android (survives expo prebuild).
 */
const withNotifeeMavenRepo = (config) =>
  withProjectBuildGradle(config, (gradleConfig) => {
    if (gradleConfig.modResults.contents.includes(NOTIFEE_MARKER)) {
      return gradleConfig;
    }

    gradleConfig.modResults.contents = gradleConfig.modResults.contents.replace(
      /maven\s*\{\s*url\s*['"]https:\/\/www\.jitpack\.io['"]\s*\}/,
      (match) => `${match}${NOTIFEE_MAVEN_BLOCK}`
    );

    return gradleConfig;
  });

module.exports = withNotifeeMavenRepo;
