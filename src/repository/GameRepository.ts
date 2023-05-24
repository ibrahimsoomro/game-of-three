import { sqliteManager } from './config/sqlite';
import sqlite3 from 'sqlite3';

export class GameRepository {
  constructor(private db: sqlite3.Database = sqliteManager.db) {}

  public save(attrs: { gameId: string; active: boolean; playerIds: string[] }): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO games (gameId, players, active) VALUES (?, ?, ?)',
        [attrs.gameId, JSON.stringify(attrs.playerIds), attrs.active],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  public fetchGames(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM games', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  public fetchGameById(gameId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM games WHERE gameId = ?', [gameId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  public async updateStatus(gameId: string, active: boolean): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(`UPDATE games SET active = ? WHERE gameId = ?`, [active, gameId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  public async remove(gameId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM games WHERE gameId = ?', [gameId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }
}
