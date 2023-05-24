import sqlite3 from 'sqlite3';
import { GameRepository } from '../GameRepository';
import { initDatabase } from '../config/initDatabase';
import { sqliteManager } from '../config/sqlite';

jest.mock('../config/sqlite', () => ({
  sqliteManager: {
    db: new sqlite3.Database(':memory:'),
  },
}));

initDatabase(sqliteManager.db);

describe('GameRepository', () => {
  let gameRepository: GameRepository;
  const db = sqliteManager.db;

  beforeAll(() => {
    gameRepository = new GameRepository();
  });

  afterEach(async () => {
    await db.exec('DELETE FROM games');
  });

  afterAll((done) => {
    db.close(done);
  });

  describe('save', () => {
    it('should save a game to the database', async () => {
      const attrs = {
        gameId: 'game1',
        active: true,
        playerIds: ['player1', 'player2'],
      };

      const result = await gameRepository.save(attrs);

      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('fetchGames', () => {
    it('should fetch all games from the database', async () => {
      await gameRepository.save({
        gameId: 'game1',
        active: true,
        playerIds: ['player1', 'player2'],
      });
      await gameRepository.save({
        gameId: 'game2',
        active: false,
        playerIds: ['player3', 'player4'],
      });

      const games = await gameRepository.fetchGames();

      expect(games).toBeDefined();
      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBe(2);
    });
  });

  describe('fetchGameById', () => {
    it('should fetch a game by its gameId', async () => {
      await gameRepository.save({
        gameId: 'game1',
        active: true,
        playerIds: ['player1', 'player2'],
      });

      const game = await gameRepository.fetchGameById('game1');

      expect(game).toBeDefined();
      expect(game.gameId).toBe('game1');
      expect(game.active).toBe(1);
      expect(game.players).toBe('["player1","player2"]');
    });

    it('should return null if game ID is not found', async () => {
      const game = await gameRepository.fetchGameById('unknownId');

      expect(game).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    it('should update the active status of a game', async () => {
      await gameRepository.save({
        gameId: 'game1',
        active: true,
        playerIds: ['player1', 'player2'],
      });

      await gameRepository.updateStatus('game1', false);

      const updatedGame = await gameRepository.fetchGameById('game1');
      expect(updatedGame).toBeDefined();
      expect(updatedGame.active).toBe(0);
    });
  });

  describe('remove', () => {
    it('should remove a game from the database', async () => {
      await gameRepository.save({
        gameId: 'game1',
        active: true,
        playerIds: ['player1', 'player2'],
      });

      await gameRepository.remove('game1');

      const removedGame = await gameRepository.fetchGameById('game1');
      expect(removedGame).toBeUndefined();
    });
  });
});
