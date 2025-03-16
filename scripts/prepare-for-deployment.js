/**
 * Script to prepare the project for deployment
 * - Creates a clean .env.example file
 * - Checks for any sensitive data that might be committed
 */

const fs = require('fs');
const path = require('path');

// Define paths
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');

// Check if .env.local exists
if (!fs.existsSync(envLocalPath)) {
  console.error('❌ .env.local file not found. Please create it first.');
  process.exit(1);
}

// Read .env.local
const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');

// Create a sanitized version for .env.example
const envExampleContent = envLocalContent
  .split('\n')
  .map(line => {
    // Skip empty lines or comments
    if (!line || line.startsWith('#')) return line;
    
    // Extract the key
    const key = line.split('=')[0].trim();
    
    // Replace the value with a placeholder
    return `${key}=your_${key.toLowerCase().replace(/[^a-z0-9]/g, '_')}_value`;
  })
  .join('\n');

// Write to .env.example
fs.writeFileSync(envExamplePath, envExampleContent);

console.log('✅ Created .env.example with sanitized values');

// Check for sensitive files that shouldn't be committed
const sensitivePatterns = [
  '.env.local',
  '.env.development.local',
  '.env.production.local',
  '.env.test.local',
  'supabase/.temp',
];

// Check .gitignore to ensure sensitive patterns are included
const gitignorePath = path.join(__dirname, '..', '.gitignore');
const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

const missingPatterns = sensitivePatterns.filter(pattern => 
  !gitignoreContent.includes(pattern)
);

if (missingPatterns.length > 0) {
  console.warn('⚠️ Warning: The following sensitive patterns are not in .gitignore:');
  missingPatterns.forEach(pattern => console.warn(`  - ${pattern}`));
  console.warn('Consider adding them to prevent committing sensitive data.');
} else {
  console.log('✅ .gitignore contains all necessary patterns for sensitive files');
}

console.log('\n🚀 Project is ready for deployment!');
console.log('Please follow the steps in DEPLOYMENT_CHECKLIST.md to deploy to GitHub and Vercel.'); 