import sqlite3 from 'sqlite3';
import { mocked } from 'jest-mock';
import { Game, IWebSocket } from '../Game';
import { initDatabase } from '../../repository/config/initDatabase';
import { sqliteManager } from '../../repository/config/sqlite';
import { PlayerRepository } from '../../repository/PlayerRepository';
import { GameRepository } from '../../repository/GameRepository';

// Mock the dependencies
jest.mock('../../repository/PlayerRepository');
jest.mock('../../repository/GameRepository');

jest.mock('../../repository/config/sqlite', () => ({
  sqliteManager: {
    db: new sqlite3.Database(':memory:'),
  },
}));

initDatabase(sqliteManager.db);

// Helper function to create a mock WebSocket instance
const createMockWebSocket = (): jest.Mocked<IWebSocket> => {
  const ws: any = {
    send: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
  };
  return ws;
};

describe('Game', () => {
  let players: jest.Mocked<IWebSocket>[];
  let gameRepo: GameRepository;
  let playerRepo: PlayerRepository;
  let game: Game;

  beforeEach(() => {
    // Reset mocks and test data
    jest.clearAllMocks();

    // Create mock WebSocket players
    players = [createMockWebSocket(), createMockWebSocket()];

    // Create a new Game instance
    gameRepo = mocked(new GameRepository());
    playerRepo = mocked(new PlayerRepository());
    game = new Game(players, gameRepo, playerRepo);
  });

  describe('start', () => {
    it('should save the game and send initial messages', async () => {
      const playerIds = ['player1', 'player2'];

      await game.start(playerIds);

      // Verify that the save method is called
      expect(gameRepo.save).toHaveBeenCalledWith({
        gameId: game.gameId,
        active: true,
        playerIds,
      });
    });
  });

  describe('hasPlayer', () => {
    it('should return true if the player exists in the game', () => {
      const playerId = 'player1';
      players[0].playerId = playerId;

      const result = game.hasPlayer(playerId);

      expect(result).toBe(true);
    });

    it('should return false if the player does not exist in the game', () => {
      const playerId = 'player3';

      const result = game.hasPlayer(playerId);

      expect(result).toBe(false);
    });
  });

  describe('getPlayers', () => {
    it('should return the array of players', () => {
      const result = game.getPlayers();

      expect(result).toBe(players);
    });
  });

  describe('save', () => {
    it('should save the game and update player statuses', async () => {
      const playerIds = ['player1', 'player2'];

      await game.save(playerIds);

      // Verify that the save method of the GameRepository is called
      expect(gameRepo.save).toHaveBeenCalledWith({
        gameId: game.gameId,
        active: true,
        playerIds,
      });

      // Verify that the updateStatus method of the PlayerRepository is called
      expect(playerRepo.updateStatus).toHaveBeenCalledWith(playerIds, game.gameId);
    });
  });

  describe('remove', () => {
    it('should remove the game', async () => {
      await game.remove();

      // Verify that the remove method of the GameRepository is called
      expect(gameRepo.remove).toHaveBeenCalledWith(game.gameId);
    });
  });
});
