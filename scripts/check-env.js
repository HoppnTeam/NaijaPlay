#!/usr/bin/env node

/**
 * This script checks the current Supabase environment
 * 
 * Usage: node scripts/check-env.js
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
let envConfig = {};

try {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envConfig = dotenv.parse(envFile);
} catch (error) {
  console.error('Error reading .env.local file:', error.message);
  process.exit(1);
}

// Check if using local or production environment
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const isLocal = supabaseUrl && supabaseUrl.includes('127.0.0.1');

console.log('Current Supabase Environment:');
console.log('----------------------------');
console.log(`Environment: ${isLocal ? 'LOCAL' : 'PRODUCTION'}`);
console.log(`URL: ${supabaseUrl}`);

if (isLocal) {
  console.log('\nLocal Supabase Dashboard:');
  console.log('URL: http://127.0.0.1:54323');
  console.log('Email: admin@example.com');
  console.log('Password: admin');
  
  console.log('\nLocal Email Testing:');
  console.log('URL: http://127.0.0.1:54324');
  
  // Check if Supabase is running using Docker
  try {
    // Check if the Postgres container is running
    const dockerPs = execSync('docker ps --filter "name=supabase_db" --format "{{.Names}}"', { stdio: 'pipe' }).toString().trim();
    
    if (dockerPs) {
      console.log('\nLocal Supabase Status: RUNNING');
      console.log(`Active container: ${dockerPs}`);
    } else {
      console.log('\nLocal Supabase Status: NOT RUNNING');
      console.log('Run "npm run supabase:start" to start the local instance');
    }
  } catch (error) {
    console.log('\nLocal Supabase Status: NOT RUNNING');
    console.log('Run "npm run supabase:start" to start the local instance');
    console.log(`Error checking Docker: ${error.message}`);
  }
} else {
  console.log('\nUsing production Supabase instance');
  console.log('To switch to local development:');
  console.log('1. Run "npm run supabase:start" to start local Supabase');
  console.log('2. Run "npm run supabase:local" to switch to local environment');
}

// Check if production keys are available for migration
if (!envConfig.NEXT_PUBLIC_SUPABASE_URL_PROD) {
  console.log('\nWarning: Production Supabase keys not found in .env.local');
  console.log('Migration script will not work without production keys');
  console.log('Add the following to your .env.local file:');
  console.log('NEXT_PUBLIC_SUPABASE_URL_PROD=<your_production_url>');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD=<your_production_anon_key>');
  console.log('SUPABASE_SERVICE_ROLE_KEY_PROD=<your_production_service_role_key>');
} 