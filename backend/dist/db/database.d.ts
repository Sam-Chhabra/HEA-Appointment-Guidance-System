import Database from 'better-sqlite3';
export declare function getDb(): Database.Database;
export declare function initializeDatabase(): void;
export declare function closeDb(): void;
/**
 * Get an in-memory database for testing.
 */
export declare function getTestDb(): Database.Database;
