/**
 * Script to verify deployment by checking key endpoints
 * This script can be run after deployment to ensure everything is working
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for the deployed URL
rl.question('Enter the deployed URL (e.g., https://naijaplay.vercel.app): ', (deployedUrl) => {
  console.log(`\n🔍 Verifying deployment at ${deployedUrl}...\n`);
  
  // Remove trailing slash if present
  const baseUrl = deployedUrl.endsWith('/') ? deployedUrl.slice(0, -1) : deployedUrl;
  
  // Endpoints to check
  const endpoints = [
    { name: 'Home page', path: '/' },
    { name: 'Health check API', path: '/api/health' },
    { name: 'Login page', path: '/login' }
  ];
  
  let failedChecks = 0;
  let completedChecks = 0;
  
  // Check each endpoint
  endpoints.forEach(({ name, path }) => {
    const url = `${baseUrl}${path}`;
    console.log(`Checking ${name} (${url})...`);
    
    https.get(url, (res) => {
      const { statusCode } = res;
      
      if (statusCode === 200) {
        console.log(`✅ ${name}: OK (${statusCode})`);
      } else {
        console.error(`❌ ${name}: Failed with status ${statusCode}`);
        failedChecks++;
      }
      
      // Collect response data for API endpoints
      if (path.startsWith('/api/')) {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(parsedData, null, 2)}`);
          } catch (e) {
            console.error(`   Could not parse response: ${e.message}`);
          }
          
          checkCompletion();
        });
      } else {
        checkCompletion();
      }
    }).on('error', (e) => {
      console.error(`❌ ${name}: Error - ${e.message}`);
      failedChecks++;
      checkCompletion();
    });
  });
  
  function checkCompletion() {
    completedChecks++;
    
    if (completedChecks === endpoints.length) {
      console.log('\n--- Deployment Verification Summary ---');
      
      if (failedChecks === 0) {
        console.log('✅ All checks passed! Your deployment appears to be working correctly.');
      } else {
        console.error(`❌ ${failedChecks} check(s) failed. Please investigate the issues.`);
      }
      
      rl.close();
    }
  }
}); 