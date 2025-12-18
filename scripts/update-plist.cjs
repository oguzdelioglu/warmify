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

// ========================================
// AUTO-GENERATE APP ICONS
// ========================================
console.log('\n📱 Configuring App Icons...');

const iconSourcePath = path.join(__dirname, '../assets/icon.png');
const iconsetPath = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');

if (!fs.existsSync(iconSourcePath)) {
  console.log('⚠️ Icon source not found at assets/icon.png - skipping icon generation');
} else {
  // Ensure iconset directory exists
  if (!fs.existsSync(iconsetPath)) {
    fs.mkdirSync(iconsetPath, { recursive: true });
  }

  // Icon sizes needed for iOS
  const iconSizes = [
    { size: 20, scales: [1, 2, 3] },
    { size: 29, scales: [1, 2, 3] },
    { size: 40, scales: [1, 2, 3] },
    { size: 60, scales: [2, 3] },
    { size: 76, scales: [1, 2] },
    { size: 83.5, scales: [2] },
    { size: 1024, scales: [1], name: 'AppIcon-1024.png' }
  ];

  const { execSync } = require('child_process');
  
  iconSizes.forEach(({ size, scales, name }) => {
    scales.forEach(scale => {
      const actualSize = Math.round(size * scale);
      const filename = name || `AppIcon-${size}x${size}@${scale}x.png`;
      const outputPath = path.join(iconsetPath, filename);
      
      try {
        execSync(`sips -z ${actualSize} ${actualSize} "${iconSourcePath}" --out "${outputPath}"`, { stdio: 'ignore' });
      } catch (e) {
        console.log(`⚠️ Failed to generate ${filename}`);
      }
    });
  });

  // Create Contents.json
  const contentsJson = {
    images: [
      { filename: 'AppIcon-20x20@2x.png', idiom: 'iphone', scale: '2x', size: '20x20' },
      { filename: 'AppIcon-20x20@3x.png', idiom: 'iphone', scale: '3x', size: '20x20' },
      { filename: 'AppIcon-29x29@2x.png', idiom: 'iphone', scale: '2x', size: '29x29' },
      { filename: 'AppIcon-29x29@3x.png', idiom: 'iphone', scale: '3x', size: '29x29' },
      { filename: 'AppIcon-40x40@2x.png', idiom: 'iphone', scale: '2x', size: '40x40' },
      { filename: 'AppIcon-40x40@3x.png', idiom: 'iphone', scale: '3x', size: '40x40' },
      { filename: 'AppIcon-60x60@2x.png', idiom: 'iphone', scale: '2x', size: '60x60' },
      { filename: 'AppIcon-60x60@3x.png', idiom: 'iphone', scale: '3x', size: '60x60' },
      { filename: 'AppIcon-20x20@1x.png', idiom: 'ipad', scale: '1x', size: '20x20' },
      { filename: 'AppIcon-20x20@2x.png', idiom: 'ipad', scale: '2x', size: '20x20' },
      { filename: 'AppIcon-29x29@1x.png', idiom: 'ipad', scale: '1x', size: '29x29' },
      { filename: 'AppIcon-29x29@2x.png', idiom: 'ipad', scale: '2x', size: '29x29' },
      { filename: 'AppIcon-40x40@1x.png', idiom: 'ipad', scale: '1x', size: '40x40' },
      { filename: 'AppIcon-40x40@2x.png', idiom: 'ipad', scale: '2x', size: '40x40' },
      { filename: 'AppIcon-76x76@1x.png', idiom: 'ipad', scale: '1x', size: '76x76' },
      { filename: 'AppIcon-76x76@2x.png', idiom: 'ipad', scale: '2x', size: '76x76' },
      { filename: 'AppIcon-83.5x83.5@2x.png', idiom: 'ipad', scale: '2x', size: '83.5x83.5' },
      { filename: 'AppIcon-1024.png', idiom: 'ios-marketing', scale: '1x', size: '1024x1024' }
    ],
    info: { author: 'xcode', version: 1 }
  };

  fs.writeFileSync(
    path.join(iconsetPath, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );

  console.log('✅ App icons generated and configured');
}
