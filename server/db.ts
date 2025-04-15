/**
 * Database connection configuration
 * Supports both MySQL and in-memory storage based on environment variables
 */

import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import * as mysql from 'mysql2/promise';
import * as schema from '@shared/schema';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from './vite';

// Load environment variables
dotenv.config();

// Get current file directory for migrations path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

// MySQL specific configuration
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'rover_management';

/**
 * Initialize database connection if MySQL connection parameters are provided
 * Otherwise, return null to use in-memory storage
 */
export async function initializeDatabase() {
  // If no DATABASE_URL is provided, check if we have individual MySQL connection params
  if (!DATABASE_URL && (!DB_HOST || !DB_USER || !DB_NAME)) {
    log('No database connection information provided, using in-memory storage', 'db');
    return null;
  }
  
  try {
    const connectionInfo = DATABASE_URL ? 
      `MySQL database from URL: ${DATABASE_URL.split('@')[1]}` : 
      `MySQL database: ${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    
    log(`Connecting to ${connectionInfo}`, 'db');
    
    // Create connection pool
    const connectionPool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Create drizzle instance
    const db = drizzle(connectionPool, { schema, mode: 'default' });
    
    // Run migrations in production (AWS deployment)
    if (NODE_ENV === 'production') {
      log('Running database migrations...', 'db');
      await migrate(db, {
        migrationsFolder: path.join(__dirname, '../drizzle')
      });
      log('Database migrations completed successfully', 'db');
    }
    
    log('MySQL database connection established', 'db');
    return db;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Failed to connect to MySQL database: ${errorMessage}`, 'db');
    log('Falling back to in-memory storage', 'db');
    return null;
  }
}