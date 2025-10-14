const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();

        // قراءة ملف SQL
        const sqlContent = fs.readFileSync('./create_tables.sql', 'utf8');
        
        // تقسيم SQL إلى استعلامات منفصلة
        const queries = sqlContent.split(';').filter(query => query.trim());
        
        for (let i = 0; i < queries.length; i++) {
            const query = queries[i].trim();
            if (query) {
                try {
                    await client.query(query);
                } catch (error) {
                }
            }
        }

        
        // عرض الجداول المنشأة
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);

    } catch (error) {
    } finally {
        await client.end();
    }
}

runMigration();
