const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const TEMPLATE_ROOT = path.join(__dirname, 'android-focus-notification');

const copyDir = (source, destination) => {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDir(from, to);
      continue;
    }

    fs.copyFileSync(from, to);
  }
};

/**
 * Copies the custom focus-timer notification native module and layout assets
 * into the Android project on prebuild.
 */
const withFocusTimerNotification = (config) =>
  withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.projectRoot;
      const androidRoot = path.join(projectRoot, 'android', 'app', 'src', 'main');

      copyDir(
        path.join(TEMPLATE_ROOT, 'java'),
        path.join(androidRoot, 'java', 'com', 'neuropilot', 'app', 'focus')
      );
      copyDir(path.join(TEMPLATE_ROOT, 'res'), path.join(androidRoot, 'res'));

      const mainApplicationPath = path.join(
        androidRoot,
        'java',
        'com',
        'neuropilot',
        'app',
        'MainApplication.kt'
      );

      if (fs.existsSync(mainApplicationPath)) {
        let contents = fs.readFileSync(mainApplicationPath, 'utf8');

        if (!contents.includes('FocusTimerNotificationPackage')) {
          contents = contents.replace(
            'import com.facebook.react.PackageList',
            'import com.facebook.react.PackageList\nimport com.neuropilot.app.focus.FocusTimerNotificationPackage'
          );

          contents = contents.replace(
            'return PackageList(this).packages',
            `val packages = PackageList(this).packages.toMutableList()
            packages.add(FocusTimerNotificationPackage())
            return packages`
          );

          fs.writeFileSync(mainApplicationPath, contents);
        }
      }

      const manifestPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
      if (fs.existsSync(manifestPath)) {
        let manifest = fs.readFileSync(manifestPath, 'utf8');
        const receiver =
          '<receiver android:name=".focus.FocusTimerActionReceiver" android:exported="false"/>';

        if (!manifest.includes('FocusTimerActionReceiver')) {
          manifest = manifest.replace(
            '</application>',
            `    ${receiver}\n  </application>`
          );
          fs.writeFileSync(manifestPath, manifest);
        }
      }

      return modConfig;
    },
  ]);

module.exports = withFocusTimerNotification;
