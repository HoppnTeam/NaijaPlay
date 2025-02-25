#!/usr/bin/env node

/**
 * This script checks the schema of tables in both production and local Supabase instances
 * 
 * Usage: node scripts/check-schema.js [table_name]
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Production Supabase client
const prodSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_PROD,
  process.env.SUPABASE_SERVICE_ROLE_KEY_PROD
);

// Local Supabase client
const localSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get the table name from command line arguments
const tableName = process.argv[2] || 'leagues';

async function checkSchema() {
  console.log(`Checking schema for table '${tableName}'...`);
  
  // Check production schema
  console.log('\nPRODUCTION SCHEMA:');
  try {
    // Fetch a single row to get the schema
    const { data: prodData, error: prodError } = await prodSupabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (prodError) {
      console.error(`Error fetching from production:`, prodError);
    } else {
      if (prodData.length > 0) {
        // Get the column names from the first row
        const columns = Object.keys(prodData[0]);
        console.log(`Columns: ${columns.join(', ')}`);
        
        // Print the data types
        columns.forEach(column => {
          const value = prodData[0][column];
          const type = value === null ? 'null' : typeof value;
          console.log(`- ${column}: ${type}`);
        });
      } else {
        console.log('No data found in production table');
      }
    }
  } catch (error) {
    console.error(`Unexpected error with production:`, error);
  }
  
  // Check local schema
  console.log('\nLOCAL SCHEMA:');
  try {
    // Fetch a single row to get the schema
    const { data: localData, error: localError } = await localSupabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (localError) {
      console.error(`Error fetching from local:`, localError);
      
      // Try to get the schema definition
      console.log('\nTrying to get schema definition...');
      const { data: defData, error: defError } = await localSupabase
        .rpc('get_table_definition', { table_name: tableName });
      
      if (defError) {
        console.error(`Error getting schema definition:`, defError);
      } else {
        console.log(defData);
      }
    } else {
      if (localData.length > 0) {
        // Get the column names from the first row
        const columns = Object.keys(localData[0]);
        console.log(`Columns: ${columns.join(', ')}`);
        
        // Print the data types
        columns.forEach(column => {
          const value = localData[0][column];
          const type = value === null ? 'null' : typeof value;
          console.log(`- ${column}: ${type}`);
        });
      } else {
        console.log('No data found in local table');
        
        // Try to insert a dummy row to get the schema
        console.log('\nTrying to insert a dummy row to get schema...');
        const { error: insertError } = await localSupabase
          .from(tableName)
          .insert({})
          .select();
        
        if (insertError) {
          console.log('Error details:');
          console.log(insertError);
        }
      }
    }
  } catch (error) {
    console.error(`Unexpected error with local:`, error);
  }
}

checkSchema().catch(console.error); 