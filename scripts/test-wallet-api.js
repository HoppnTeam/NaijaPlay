#!/usr/bin/env node

/**
 * This script tests the wallet API endpoints
 * 
 * Usage:
 * node scripts/test-wallet-api.js
 */

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_AMOUNT = 1000; // ₦1,000 (100,000 kobo)

async function testWalletAPI() {
  console.log('🧪 Testing Wallet API');
  console.log('=====================');

  try {
    // Test 1: Initialize a deposit
    console.log('\n📝 Test 1: Initialize a deposit');
    console.log('--------------------------------');
    
    const initResponse = await fetch(`${API_BASE_URL}/wallet/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: TEST_AMOUNT * 100, // Convert to kobo
        email: TEST_EMAIL,
      }),
    });

    const initData = await initResponse.json();
    
    if (!initResponse.ok) {
      throw new Error(`Failed to initialize deposit: ${initData.error || 'Unknown error'}`);
    }

    console.log('✅ Deposit initialization successful');
    console.log('Authorization URL:', initData.authorization_url);
    console.log('Reference:', initData.reference);

    // Test 2: Verify a payment (this will likely fail in test mode without a valid reference)
    console.log('\n📝 Test 2: Verify a payment');
    console.log('---------------------------');
    console.log('Note: This test will likely fail without a valid reference from a real payment');
    
    const verifyResponse = await fetch(`${API_BASE_URL}/wallet/topup?reference=${initData.reference}`);
    const verifyData = await verifyResponse.json();
    
    if (verifyResponse.ok) {
      console.log('✅ Payment verification successful');
      console.log('Response:', verifyData);
    } else {
      console.log('❌ Payment verification failed (expected in test mode)');
      console.log('Error:', verifyData.error);
    }

    console.log('\n✨ Tests completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testWalletAPI().catch(console.error); 