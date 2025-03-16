/**
 * Script to run all pre-deployment checks
 * - Runs tests
 * - Checks database tables
 * - Checks for sensitive data
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Running comprehensive project checks...\n');

const commands = [
  { name: 'Unit tests', cmd: 'npm test' },
  { name: 'Database check', cmd: 'node scripts/check-database.js' },
  { name: 'Pre-deployment check', cmd: 'node scripts/pre-deployment-check.js' }
];

let hasErrors = false;

for (const { name, cmd } of commands) {
  try {
    console.log(`\n🔍 Running ${name}...`);
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ ${name} passed`);
  } catch (error) {
    console.error(`❌ ${name} failed.`);
    hasErrors = true;
    
    // Don't exit immediately, try to run all checks
    if (name !== 'Pre-deployment check') {
      continue;
    }
    
    process.exit(1);
  }
}

if (hasErrors) {
  console.error('\n❌ Some checks failed. Please fix the issues before deploying.');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed! Your project is ready for deployment.');
  console.log('Run the following command to prepare for deployment:');
  console.log('  npm run prepare-deploy');
} 