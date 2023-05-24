import WebSocket from 'ws';
import { Player } from './modules/Player';
import { IWebSocket, Game } from './modules/Game';
import { PlayerRepository } from './repository/PlayerRepository';
import { GameRepository } from './repository/GameRepository';

export class GameServer {
  private wss: WebSocket.Server;
  private playerRepo: PlayerRepository;
  private gameRepo: GameRepository;
  private activeGames: Game[];

  constructor(port: number, gameRepo = new GameRepository(), playerRepo = new PlayerRepository()) {
    this.wss = new WebSocket.Server({ port });
    this.gameRepo = gameRepo;
    this.playerRepo = playerRepo;
    this.activeGames = [];

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private async handleConnection(ws: IWebSocket) {
    const player = new Player(ws);
    ws.playerId = player.playerId;

    // Match players when enough players are available
    await this.matchPlayers();

    player.on('message', async (message: string) => {
      if (message.toLowerCase() === 'gameend') {
        await this.handleGameEnd(player);
      }
    });

    // Handle errors
    player.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      // Handle WebSocket error
    });

    player.on('close', async () => {
      await this.handlePlayerDisconnect(player);
    });
  }

  private async matchPlayers() {
    const players = await this.playerRepo.fetchUnassignedPlayers();

    while (players.length >= 2) {
      const playerIds = players.splice(0, 2).map((player) => player.playerId);
      const matchedPlayers = this.getWSClients(playerIds);

      const game = new Game(matchedPlayers);
      await game.start(playerIds);

      this.activeGames.push(game);
    }
  }

  private getWSClients(playerIds: string[]) {
    return playerIds.reduce((acc: IWebSocket[], playerId: string) => {
      this.wss.clients.forEach((client: any) => {
        if (client.playerId === playerId) {
          acc.push(client);
        }
      });
      return acc;
    }, []);
  }

  private async handlePlayerDisconnect(disconPlayer: Player) {
    const game = this.activeGames.find((game) => game.hasPlayer(disconPlayer.playerId));
    const [disconPlayerWSClient] = this.getWSClients([disconPlayer.playerId]);

    if (game) {
      game.handlePlayerDisconnect(disconPlayerWSClient);

      await this.playerRepo.remove(disconPlayer.playerId);
      await this.removeGame(game);
    }
  }

  private async handleGameEnd(disconPlayer: Player) {
    const game = this.activeGames.find((game) => game.hasPlayer(disconPlayer.playerId));
    console.log('test');
    if (game) {
      const players = game.getPlayers();
      await this.playerRepo.remove(disconPlayer.playerId);
      await this.removeGame(game);

      players.forEach((player) => player.close());
    }
  }

  private async removeGame(game: Game) {
    await this.gameRepo.remove(game.gameId);

    const index = this.activeGames.indexOf(game);
    if (index !== -1) {
      this.activeGames.splice(index, 1);
    }
  }
}

new GameServer(3000);
