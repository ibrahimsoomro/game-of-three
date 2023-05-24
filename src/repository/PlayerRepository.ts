import { sqliteManager } from './config/sqlite';
import sqlite3 from 'sqlite3';

export class PlayerRepository {
  constructor(private db: sqlite3.Database = sqliteManager.db) {}

  public async save(id: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO players (playerId) VALUES (?)', [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  public async remove(playerId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM players WHERE playerId = (?)', [playerId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  public async updateStatus(playerIds: string[], gameId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const placeholders = playerIds.map(() => '?').join(',');
      this.db.run(
        `UPDATE players SET gameId = ? WHERE playerId IN (${placeholders})`,
        [gameId, ...playerIds],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  public fetchUnassignedPlayers(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM players WHERE gameId IS NULL', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  public fetchByPlayerId(playerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM players WHERE playerID = ? ', [playerId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}
