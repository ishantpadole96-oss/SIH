const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
const seedDbPath = path.join(__dirname, 'ruralcare.db');
let DB_PATH = process.env.DB_PATH;

if (!DB_PATH) {
  if (isVercel) {
    DB_PATH = path.join('/tmp', 'ruralcare.db');
    // If seed database exists in repo, copy to writable /tmp on cold start
    if (fs.existsSync(seedDbPath) && !fs.existsSync(DB_PATH)) {
      try {
        fs.copyFileSync(seedDbPath, DB_PATH);
      } catch (e) {
        console.warn('Could not copy seed db to /tmp, will initialize fresh:', e.message);
      }
    }
  } else {
    DB_PATH = path.join(__dirname, 'ruralcare.db');
  }
}

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open SQLite database connection
const db = new DatabaseSync(DB_PATH);

// Enforce foreign key constraints
db.exec('PRAGMA foreign_keys = ON;');
try {
  db.exec('PRAGMA journal_mode = WAL;');
} catch (e) {
  db.exec('PRAGMA journal_mode = DELETE;');
}

// Initialize database schema
function initSchema() {
  if (fs.existsSync(SCHEMA_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schemaSql);
  }
}

initSchema();

/**
 * Helper wrappers around DatabaseSync prepared statements
 */
const dbHelper = {
  db,
  
  /**
   * Run a query that returns multiple rows
   * @param {string} sql 
   * @param {Array} params 
   * @returns {Array<Object>}
   */
  all(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },

  /**
   * Run a query that returns a single row
   * @param {string} sql 
   * @param {Array} params 
   * @returns {Object|undefined}
   */
  get(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  },

  /**
   * Execute an INSERT, UPDATE, or DELETE statement
   * @param {string} sql 
   * @param {Array} params 
   * @returns {{ changes: number, lastInsertRowid: number|bigint }}
   */
  run(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  },

  /**
   * Execute raw SQL (e.g. multiple statements)
   * @param {string} sql 
   */
  exec(sql) {
    return db.exec(sql);
  },

  /**
   * Run multiple database operations in a transaction
   * @param {Function} callback 
   */
  transaction(callback) {
    db.exec('BEGIN TRANSACTION;');
    try {
      const result = callback();
      db.exec('COMMIT;');
      return result;
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }
};

module.exports = dbHelper;
