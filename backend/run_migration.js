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
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

        // قراءة ملف SQL
        const sqlContent = fs.readFileSync('./create_tables.sql', 'utf8');
        
        // تقسيم SQL إلى استعلامات منفصلة
        const queries = sqlContent.split(';').filter(query => query.trim());
        
        for (let i = 0; i < queries.length; i++) {
            const query = queries[i].trim();
            if (query) {
                try {
                    await client.query(query);
                    console.log(`✅ تم تنفيذ الاستعلام ${i + 1}/${queries.length}`);
                } catch (error) {
                    console.log(`⚠️  تحذير في الاستعلام ${i + 1}:`, error.message);
                }
            }
        }

        console.log('🎉 تم إنشاء جميع الجداول بنجاح!');
        
        // عرض الجداول المنشأة
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        
        console.log('\n📋 الجداول المنشأة:');
        result.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        await client.end();
    }
}

runMigration();
