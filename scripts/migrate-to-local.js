#!/usr/bin/env node

/**
 * This script migrates data from production Supabase to local Supabase
 * It uses the Supabase JS client to fetch data from production and insert it into local
 * 
 * Usage: node scripts/migrate-to-local.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

// Tables to migrate (in order of dependencies)
const tables = [
  'players',
  'teams',
  'team_players'
];

// Schema mappings for tables with different schemas
const schemaMappings = {
  leagues: {
    // Map production columns to local columns
    id: 'id',
    name: 'name',
    type: 'description', // Map type to description
    max_teams: 'max_teams',
    entry_fee: 'entry_fee',
    total_prize: null, // No equivalent in local
    start_date: null, // No equivalent in local
    end_date: null, // No equivalent in local
    status: 'status',
    created_by: 'created_by',
    created_at: 'created_at'
  }
};

// Seed data for tables that don't exist in production
const seedData = {
  gameweeks: [
    {
      id: uuidv4(),
      number: 1,
      start_date: new Date('2024-03-01').toISOString(),
      end_date: new Date('2024-03-07').toISOString(),
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      number: 2,
      start_date: new Date('2024-03-08').toISOString(),
      end_date: new Date('2024-03-14').toISOString(),
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      number: 3,
      start_date: new Date('2024-03-15').toISOString(),
      end_date: new Date('2024-03-21').toISOString(),
      status: 'in_progress',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      number: 4,
      start_date: new Date('2024-03-22').toISOString(),
      end_date: new Date('2024-03-28').toISOString(),
      status: 'upcoming',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  tokens: [
    {
      id: uuidv4(),
      name: 'Basic Token Pack',
      description: '100 tokens for basic gameplay',
      price: 1000, // ₦1,000
      value: 100,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Premium Token Pack',
      description: '500 tokens for premium gameplay',
      price: 4500, // ₦4,500
      value: 500,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Ultimate Token Pack',
      description: '1000 tokens for ultimate gameplay',
      price: 8000, // ₦8,000
      value: 1000,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// Function to check if a table exists in production
async function tableExistsInProduction(supabase, table) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      return false;
    }
    
    return !error;
  } catch (error) {
    return false;
  }
}

// Function to check if a table exists in local
async function tableExistsInLocal(supabase, table) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      return false;
    }
    
    return !error;
  } catch (error) {
    return false;
  }
}

// Function to fetch all data from a table
async function fetchTableData(supabase, table) {
  console.log(`Fetching data from ${table}...`);
  const { data, error } = await supabase.from(table).select('*');
  
  if (error) {
    console.error(`Error fetching data from ${table}:`, error);
    return [];
  }
  
  console.log(`Fetched ${data.length} rows from ${table}`);
  return data;
}

// Function to transform data based on schema mapping
function transformData(data, table) {
  if (!schemaMappings[table]) {
    return data; // No transformation needed
  }
  
  console.log(`Transforming data for ${table} based on schema mapping...`);
  
  const mapping = schemaMappings[table];
  return data.map(row => {
    const transformedRow = {};
    
    // Apply the mapping
    Object.keys(mapping).forEach(prodColumn => {
      const localColumn = mapping[prodColumn];
      if (localColumn && row[prodColumn] !== undefined) {
        transformedRow[localColumn] = row[prodColumn];
      }
    });
    
    // Add required fields that might be missing
    if (table === 'leagues') {
      transformedRow.updated_at = transformedRow.created_at || new Date().toISOString();
      transformedRow.is_private = false;
      transformedRow.join_code = null;
    }
    
    return transformedRow;
  });
}

// Function to insert data into a table
async function insertTableData(supabase, table, data) {
  if (!data || data.length === 0) {
    console.log(`No data to insert into ${table}`);
    return;
  }
  
  console.log(`Inserting ${data.length} rows into ${table}...`);
  
  // Transform data if needed
  const transformedData = transformData(data, table);
  
  // Insert in batches of 100 to avoid request size limits
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < transformedData.length; i += batchSize) {
    const batch = transformedData.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(batch).select();
    
    if (error) {
      console.error(`Error inserting batch into ${table}:`, error);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
    }
  }
  
  console.log(`Inserted ${successCount} rows into ${table} (${errorCount} errors)`);
}

// Function to clear a table
async function clearTable(supabase, table) {
  console.log(`Clearing table ${table}...`);
  
  try {
    // Use a more reliable way to delete all rows
    const { error } = await supabase.from(table).delete().gte('id', '00000000-0000-0000-0000-000000000000');
    
    if (error) {
      console.error(`Error clearing table ${table}:`, error);
    } else {
      console.log(`Cleared table ${table}`);
    }
  } catch (error) {
    console.error(`Error clearing table ${table}:`, error);
  }
}

// Function to export data to a JSON file
function exportToJson(data, table) {
  const dir = path.join(__dirname, '../supabase/seed_data');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const filePath = path.join(dir, `${table}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Exported data to ${filePath}`);
}

// Function to seed data for tables that don't exist in production
async function seedTable(supabase, table) {
  if (!seedData[table]) {
    console.log(`No seed data available for ${table}`);
    return;
  }
  
  console.log(`Seeding ${seedData[table].length} rows into ${table}...`);
  
  // Clear the table first
  await clearTable(supabase, table);
  
  // Insert the seed data
  const { error } = await supabase.from(table).insert(seedData[table]).select();
  
  if (error) {
    console.error(`Error seeding ${table}:`, error);
  } else {
    console.log(`Successfully seeded ${table}`);
  }
}

// Main migration function
async function migrateData() {
  console.log('Starting migration from production to local...');
  
  // Check which tables exist in both production and local
  const tablesToMigrate = [];
  
  for (const table of tables) {
    const existsInProduction = await tableExistsInProduction(prodSupabase, table);
    const existsInLocal = await tableExistsInLocal(localSupabase, table);
    
    if (existsInProduction && existsInLocal) {
      tablesToMigrate.push(table);
      console.log(`✅ Table '${table}' exists in both databases`);
    } else {
      if (!existsInProduction) {
        console.log(`⚠️ Table '${table}' does not exist in production. Skipping.`);
      }
      if (!existsInLocal) {
        console.log(`⚠️ Table '${table}' does not exist in local. Skipping.`);
      }
    }
  }
  
  // Check if leagues table exists in both databases
  const leaguesExistsInProduction = await tableExistsInProduction(prodSupabase, 'leagues');
  const leaguesExistsInLocal = await tableExistsInLocal(localSupabase, 'leagues');
  
  if (leaguesExistsInProduction && leaguesExistsInLocal) {
    tablesToMigrate.push('leagues');
    console.log(`✅ Table 'leagues' exists in both databases (with schema mapping)`);
  }
  
  // Only migrate data for tables that exist in both databases
  for (const table of tablesToMigrate) {
    try {
      // Fetch data from production
      const data = await fetchTableData(prodSupabase, table);
      
      if (data.length > 0) {
        // Export to JSON for backup
        exportToJson(data, table);
        
        // Clear the local table
        await clearTable(localSupabase, table);
        
        // Insert data into local
        await insertTableData(localSupabase, table, data);
      }
    } catch (error) {
      console.error(`Error migrating table ${table}:`, error);
    }
  }
  
  // Seed data for tables that don't exist in production
  console.log('\nSeeding data for tables that don\'t exist in production...');
  
  // Check which tables to seed
  const tablesToSeed = [];
  
  for (const table in seedData) {
    const existsInLocal = await tableExistsInLocal(localSupabase, table);
    
    if (existsInLocal) {
      tablesToSeed.push(table);
      console.log(`✅ Table '${table}' exists in local and will be seeded`);
    } else {
      console.log(`⚠️ Table '${table}' does not exist in local. Cannot seed.`);
    }
  }
  
  // Seed the tables
  for (const table of tablesToSeed) {
    try {
      await seedTable(localSupabase, table);
    } catch (error) {
      console.error(`Error seeding table ${table}:`, error);
    }
  }
  
  console.log('Migration completed!');
}

// Run the migration
migrateData().catch(console.error); 