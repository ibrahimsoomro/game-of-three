import sqlite3 from 'sqlite3';
import { PlayerRepository } from '../PlayerRepository';
import { initDatabase } from '../config/initDatabase';
import { sqliteManager } from '../config/sqlite';

jest.mock('../config/sqlite', () => ({
  sqliteManager: {
    db: new sqlite3.Database(':memory:'),
  },
}));

initDatabase(sqliteManager.db);

describe('PlayerRepository', () => {
  let playerRepository: PlayerRepository;
  const db = sqliteManager.db;

  beforeAll(() => {
    playerRepository = new PlayerRepository();
  });

  afterEach(async () => {
    await db.exec('DELETE FROM players');
  });

  afterAll((done) => {
    db.close(done);
  });

  describe('save', () => {
    it('should save a player and return the last inserted ID', async () => {
      const playerId = '123';

      const lastInsertedId = await playerRepository.save(playerId);
      expect(lastInsertedId).toBe(1);
    });
  });

  describe('remove', () => {
    it('should remove a player', async () => {
      const playerId = '123';

      await playerRepository.save(playerId);

      await playerRepository.remove(playerId);
      const player = await playerRepository.fetchByPlayerId(playerId);

      expect(player).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    it('should update the game ID for the specified players', async () => {
      const playerIds = ['123', '456'];
      const gameId = 'game1';

      // Insert players before updating their status
      await playerRepository.save(playerIds[0]);
      await playerRepository.save(playerIds[1]);

      const changes = await playerRepository.updateStatus(playerIds, gameId);

      expect(changes).toBe(2);

      // Check if the game ID was updated correctly in the database
      const players = await playerRepository.fetchUnassignedPlayers();
      players.forEach((player) => {
        expect(player.gameId).toBe(gameId);
      });
    });
  });

  describe('fetchPlayers', () => {
    it('should fetch all players without a game ID', async () => {
      const playerIds = ['123', '456'];

      // Insert players with and without a game ID
      await playerRepository.save(playerIds[0]);
      await playerRepository.save(playerIds[1]);
      await playerRepository.updateStatus([playerIds[0]], 'game1');

      const players = await playerRepository.fetchUnassignedPlayers();

      expect(players).toHaveLength(1);
      expect(players[0].playerId).toBe(playerIds[1]);
      expect(players[0].gameId).toBeNull();
    });
  });
});
