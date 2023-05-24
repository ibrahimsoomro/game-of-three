import sqlite3 from 'sqlite3';

export const initDatabase = (db: sqlite3.Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.exec(
      `
      -- Drop existing tables if they exist
      DROP TABLE IF EXISTS game;
      DROP TABLE IF EXISTS player;

      -- Create the player table
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playerId TEXT NOT NULL,
        gameId INTEGER
      );

      -- Create the game table
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gameId INTEGER NOT NULL,
        players TEXT NOT NULL,
        active BOOLEAN NOT NULL
      );
    `,
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};
