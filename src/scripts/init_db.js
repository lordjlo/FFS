const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function initDb() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Attempting to connect to:', process.env.DATABASE_URL.split('@')[1]); // Log host part only
        await client.connect();
        console.log('Connected to Supabase database via Pooler.');

        const schemaPath = path.join(__dirname, '../../supabase_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema initialization...');
        await client.query(schemaSql);
        console.log('Database schema initialized successfully!');

    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await client.end();
    }
}

initDb();
