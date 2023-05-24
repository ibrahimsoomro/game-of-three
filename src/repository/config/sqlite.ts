import sqlite3 from 'sqlite3';
import { initDatabase } from './initDatabase';

class SqliteManager {
  public db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(':memory:');

    initDatabase(this.db)
      .then(() => {
        console.log('Database initialized successfully');
        // Perform additional initialization tasks or start the application
      })
      .catch((err) => {
        console.error('Failed to initialize database:', err);
        // Handle the error and potentially exit the application
      });
  }
}

export const sqliteManager = new SqliteManager();
