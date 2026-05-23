/**
 * Version Bumping Script for NeuroPilot (React Native / Expo)
 * 
 * Synchronizes versioning across:
 * 1. package.json (version)
 * 2. app.json (expo.version, android.versionCode, ios.buildNumber)
 * 3. android/app/build.gradle (versionCode, versionName)
 * 4. ios/NeuroPilot/Info.plist (CFBundleShortVersionString, CFBundleVersion)
 * 5. ios/NeuroPilot.xcodeproj/project.pbxproj (MARKETING_VERSION, CURRENT_PROJECT_VERSION)
 * 
 * Usage:
 *   node scripts/bump-version.js [patch | minor | major | x.y.z]
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

// Helper to log with pretty colors
function logSuccess(msg) { console.log(`\x1b[32m✔\x1b[0m ${msg}`); }
function logInfo(msg) { console.log(`\x1b[36mℹ\x1b[0m ${msg}`); }
function logError(msg) { console.error(`\x1b[31m✖ Error: ${msg}\x1b[0m`); }

// 1. Get CLI arguments
const bumpType = process.argv[2];
if (!bumpType) {
  logError('Please specify a bump type ("patch", "minor", "major") or a specific version (e.g. "1.1.0").');
  process.exit(1);
}

// 2. Read package.json to get the current version
const packageJsonPath = path.join(projectRoot, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  logError('package.json not found in the root directory.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version || '1.0.0';

// 3. Determine the new version
let newVersion = '';
const semverRegex = /^(\d+)\.(\d+)\.(\d+)$/;

if (['patch', 'minor', 'major'].includes(bumpType)) {
  const match = currentVersion.match(semverRegex);
  if (!match) {
    logError(`Current version "${currentVersion}" in package.json is not valid semver (X.Y.Z).`);
    process.exit(1);
  }

  let major = parseInt(match[1], 10);
  let minor = parseInt(match[2], 10);
  let patch = parseInt(match[3], 10);

  if (bumpType === 'patch') patch += 1;
  else if (bumpType === 'minor') { minor += 1; patch = 0; }
  else if (bumpType === 'major') { major += 1; minor = 0; patch = 0; }

  newVersion = `${major}.${minor}.${patch}`;
} else {
  // Check if target is a valid version string
  if (!semverRegex.test(bumpType)) {
    logError(`Provided version "${bumpType}" is not a valid semver string or action (patch, minor, major).`);
    process.exit(1);
  }
  newVersion = bumpType;
}

logInfo(`Bumping version from ${currentVersion} to ${newVersion}...`);

// 4. Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
logSuccess('Updated package.json');

// 5. Update app.json (expo.version, android.versionCode, ios.buildNumber)
const appJsonPath = path.join(projectRoot, 'app.json');
let newVersionCode = 1;
let newBuildNumber = '1';

if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  if (appJson.expo) {
    appJson.expo.version = newVersion;
    
    // Increment Android versionCode
    if (appJson.expo.android && typeof appJson.expo.android.versionCode === 'number') {
      appJson.expo.android.versionCode += 1;
      newVersionCode = appJson.expo.android.versionCode;
    } else {
      if (!appJson.expo.android) appJson.expo.android = {};
      appJson.expo.android.versionCode = 1;
    }

    // Increment iOS buildNumber
    if (appJson.expo.ios && appJson.expo.ios.buildNumber) {
      const currentBuild = parseInt(appJson.expo.ios.buildNumber, 10);
      newBuildNumber = isNaN(currentBuild) ? '1' : (currentBuild + 1).toString();
      appJson.expo.ios.buildNumber = newBuildNumber;
    } else {
      if (!appJson.expo.ios) appJson.expo.ios = {};
      appJson.expo.ios.buildNumber = '1';
    }

    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
    logSuccess(`Updated app.json (versionCode: ${newVersionCode}, buildNumber: ${newBuildNumber})`);
  }
} else {
  logInfo('app.json not found, skipping...');
}

// 6. Update android/app/build.gradle
const buildGradlePath = path.join(projectRoot, 'android/app/build.gradle');
if (fs.existsSync(buildGradlePath)) {
  let gradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Update versionCode
  const prevGradleContent = gradleContent;
  gradleContent = gradleContent.replace(/(versionCode\s+)\d+/, `$1${newVersionCode}`);
  
  // Update versionName
  gradleContent = gradleContent.replace(/(versionName\s+)"[^"]*"/, `$1"${newVersion}"`);

  if (gradleContent !== prevGradleContent) {
    fs.writeFileSync(buildGradlePath, gradleContent, 'utf8');
    logSuccess(`Updated android/app/build.gradle (versionCode: ${newVersionCode}, versionName: "${newVersion}")`);
  } else {
    logInfo('No changes needed or matching patterns found in android/app/build.gradle');
  }
} else {
  logInfo('android/app/build.gradle not found, skipping Android native update...');
}

// 7. Update ios/NeuroPilot/Info.plist
const infoPlistPath = path.join(projectRoot, 'ios/NeuroPilot/Info.plist');
if (fs.existsSync(infoPlistPath)) {
  let plistContent = fs.readFileSync(infoPlistPath, 'utf8');
  const prevPlistContent = plistContent;

  // CFBundleShortVersionString -> versionName (e.g. 1.0.0)
  plistContent = plistContent.replace(
    /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]*(<\/string>)/,
    `$1${newVersion}$2`
  );

  // CFBundleVersion -> versionCode/buildNumber (e.g. 2)
  plistContent = plistContent.replace(
    /(<key>CFBundleVersion<\/key>\s*<string>)[^<]*(<\/string>)/,
    `$1${newBuildNumber}$2`
  );

  if (plistContent !== prevPlistContent) {
    fs.writeFileSync(infoPlistPath, plistContent, 'utf8');
    logSuccess(`Updated ios/NeuroPilot/Info.plist (CFBundleShortVersionString: "${newVersion}", CFBundleVersion: "${newBuildNumber}")`);
  } else {
    logInfo('No changes needed or matching patterns found in ios/NeuroPilot/Info.plist');
  }
} else {
  logInfo('ios/NeuroPilot/Info.plist not found, skipping iOS native update...');
}

// 8. Update ios/NeuroPilot.xcodeproj/project.pbxproj
const projectPbxprojPath = path.join(projectRoot, 'ios/NeuroPilot.xcodeproj/project.pbxproj');
if (fs.existsSync(projectPbxprojPath)) {
  let pbxprojContent = fs.readFileSync(projectPbxprojPath, 'utf8');
  const prevPbxprojContent = pbxprojContent;

  // MARKETING_VERSION
  pbxprojContent = pbxprojContent.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${newVersion};`);
  
  // CURRENT_PROJECT_VERSION
  pbxprojContent = pbxprojContent.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${newBuildNumber};`);

  if (pbxprojContent !== prevPbxprojContent) {
    fs.writeFileSync(projectPbxprojPath, pbxprojContent, 'utf8');
    logSuccess(`Updated ios/NeuroPilot.xcodeproj/project.pbxproj (MARKETING_VERSION: ${newVersion}, CURRENT_PROJECT_VERSION: ${newBuildNumber})`);
  } else {
    logInfo('No changes needed or matching patterns found in project.pbxproj');
  }
} else {
  logInfo('ios/NeuroPilot.xcodeproj/project.pbxproj not found, skipping Xcode project update...');
}

logSuccess(`Successfully bumped version to ${newVersion}! 🎉`);
