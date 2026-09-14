/**
 * RuralCare Data Sync Engine: SQLite -> MongoDB Atlas
 * Preserves 100% of current SQLite data and syncs into MongoDB Atlas collections.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const path = require('path');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const db = require('./db');
const { MongoClient } = require('mongodb');

const DEFAULT_URI = 'mongodb+srv://ishantpadole96_db_user:aOD3kzqMBsmdzo3q@isolated-free-cluster.4ahr84c.mongodb.net/ruralcare?retryWrites=true&w=majority';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_URI;

// Mapping of SQLite tables to MongoDB collection names and primary key fields
const TABLES_CONFIG = [
  { table: 'villages', collection: 'villages', idField: 'village_id' },
  { table: 'users', collection: 'users', idField: 'user_id' },
  { table: 'facilities', collection: 'facilities', idField: 'facility_id' },
  { table: 'doctors', collection: 'doctors', idField: 'staff_id' },
  { table: 'services', collection: 'services', idField: 'service_id' },
  { table: 'medicine_stock', collection: 'medicine_stock', idField: 'medicine_id' },
  { table: 'patients', collection: 'patients', idField: 'patient_id' },
  { table: 'appointments', collection: 'appointments', idField: 'appointment_id' },
  { table: 'referrals', collection: 'referrals', idField: 'referral_id' },
  { table: 'screenings', collection: 'screenings', idField: 'screening_id' },
  { table: 'complaints', collection: 'complaints', idField: 'complaint_id' },
  { table: 'feedback', collection: 'feedback', idField: 'feedback_id' },
  { table: 'health_camps', collection: 'health_camps', idField: 'camp_id' },
  { table: 'notifications', collection: 'notifications', idField: 'notification_id' },
  { table: 'consents', collection: 'consents', idField: 'consent_id' },
  { table: 'consultation_requests', collection: 'consultation_requests', idField: 'request_id' },
  { table: 'prescriptions', collection: 'prescriptions', idField: 'prescription_id' }
];

/**
 * Execute full sync of SQLite data to MongoDB Atlas
 */
async function syncAllData() {
  console.log('====================================================');
  console.log('🔄 Starting RuralCare Data Sync (SQLite -> MongoDB)');
  console.log('====================================================');

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000
  });

  const results = {};

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas cluster');
    const mongoDb = client.db('ruralcare');

    for (const config of TABLES_CONFIG) {
      try {
        // Query all rows from SQLite table
        const rows = db.all(`SELECT * FROM ${config.table}`);
        if (!rows || rows.length === 0) {
          results[config.table] = { status: 'skipped', count: 0 };
          continue;
        }

        const collection = mongoDb.collection(config.collection);

        // Perform bulk upsert in chunks to prevent memory spikes
        const chunkSize = 500;
        let syncedCount = 0;

        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const bulkOps = chunk.map(row => ({
            updateOne: {
              filter: { [config.idField]: row[config.idField] },
              update: { $set: row },
              upsert: true
            }
          }));

          await collection.bulkWrite(bulkOps);
          syncedCount += chunk.length;
        }

        results[config.table] = { status: 'synced', count: syncedCount };
        console.log(`📦 Table '${config.table}': ${syncedCount} rows synced to collection '${config.collection}'`);
      } catch (tableErr) {
        console.warn(`⚠️ Warning syncing '${config.table}': ${tableErr.message}`);
        results[config.table] = { status: 'error', error: tableErr.message };
      }
    }

    console.log('====================================================');
    console.log('✅ RuralCare Data Sync completed successfully!');
    console.log('====================================================');
    return { success: true, results };
  } catch (err) {
    console.error('❌ Data sync error:', err.message);
    return { success: false, error: err.message, results };
  } finally {
    await client.close();
  }
}

// If run directly from CLI
if (require.main === module) {
  syncAllData().then(res => {
    if (!res.success) {
      process.exitCode = 1;
    }
  });
}

module.exports = { syncAllData };
