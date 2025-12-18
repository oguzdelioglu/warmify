const fs = require('fs');
const path = require('path');

const plistPath = path.join(__dirname, '../ios/App/App/Info.plist');

console.log('Checking Info.plist configuration...');

if (!fs.existsSync(plistPath)) {
  console.log('⚠️ Info.plist not found at ' + plistPath);
  console.log('Skipping plist configuration. Ensure "npx cap add ios" has been run.');
  process.exit(0);
}

let plistContent = fs.readFileSync(plistPath, 'utf8');
let modified = false;

const keysToAdd = {
  'NSCameraUsageDescription': 'Warmify needs camera access to analyze your workout form and providing real-time feedback.',
  'NSMicrophoneUsageDescription': 'Warmify needs microphone access to hear your commands during the workout.',
  'NSUserTrackingUsageDescription': 'We use this to improve our ad targeting and measure performance.'
};

for (const [key, value] of Object.entries(keysToAdd)) {
  // Simple check if key exists
  if (!plistContent.includes(`<key>${key}</key>`)) {
    console.log(`➕ Adding missing key: ${key}`);
    
    // Inject before the last closing </dict> of the root dict
    // Typical Info.plist ends with </dict>\n</plist>. 
    // We look for the last </dict>
    
    const entry = `\t<key>${key}</key>\n\t<string>${value}</string>\n`;
    const lastDictIndex = plistContent.lastIndexOf('</dict>');
    
    if (lastDictIndex !== -1) {
        plistContent = plistContent.slice(0, lastDictIndex) + entry + plistContent.slice(lastDictIndex);
        modified = true;
    } else {
        console.error('❌ Could not find closing </dict> tag in Info.plist');
    }
  } else {
      console.log(`✅ ${key} already exists.`);
  }
}

if (modified) {
  fs.writeFileSync(plistPath, plistContent);
  console.log('🎉 Info.plist updated successfully with permissions.');
} else {
  console.log('👍 Info.plist is already up to date.');
}
