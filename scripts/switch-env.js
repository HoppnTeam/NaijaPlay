#!/usr/bin/env node

/**
 * This script switches between local and production Supabase environments
 * by updating the .env.local file
 * 
 * Usage: node scripts/switch-env.js [local|production]
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Get the environment from command line arguments
const env = process.argv[2];

if (!env || (env !== 'local' && env !== 'production')) {
  console.error('Please specify environment: local or production');
  process.exit(1);
}

// Path to .env.local file
const envPath = path.join(__dirname, '..', '.env.local');

// Load current environment variables
let envConfig = {};
try {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envConfig = dotenv.parse(envFile);
} catch (error) {
  console.log('No existing .env.local file found. Creating a new one.');
}

// Update environment variables based on selected environment
if (env === 'local') {
  console.log('Switching to local Supabase environment...');
  
  // Local Supabase URL and anon key
  envConfig.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
  envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  envConfig.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
  
  // Keep production keys for reference and migration script
  if (!envConfig.NEXT_PUBLIC_SUPABASE_URL_PROD) {
    console.log('Please add production keys to .env.local for migration script:');
    console.log('NEXT_PUBLIC_SUPABASE_URL_PROD=<your_production_url>');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD=<your_production_anon_key>');
    console.log('SUPABASE_SERVICE_ROLE_KEY_PROD=<your_production_service_role_key>');
  }
} else {
  console.log('Switching to production Supabase environment...');
  
  // Use production keys if they exist
  if (envConfig.NEXT_PUBLIC_SUPABASE_URL_PROD) {
    envConfig.NEXT_PUBLIC_SUPABASE_URL = envConfig.NEXT_PUBLIC_SUPABASE_URL_PROD;
    envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD;
    envConfig.SUPABASE_SERVICE_ROLE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY_PROD;
  } else {
    console.error('Production Supabase keys not found in .env.local');
    console.error('Please add the following variables to your .env.local file:');
    console.error('NEXT_PUBLIC_SUPABASE_URL_PROD=<your_production_url>');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD=<your_production_anon_key>');
    console.error('SUPABASE_SERVICE_ROLE_KEY_PROD=<your_production_service_role_key>');
    process.exit(1);
  }
}

// Write updated environment variables to .env.local
const envContent = Object.entries(envConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(envPath, envContent);

console.log(`Successfully switched to ${env} Supabase environment.`);
console.log('Remember to restart your Next.js server for changes to take effect.'); 