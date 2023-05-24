import WebSocket from 'ws';
import { Player } from './modules/Player';
import { Game } from './modules/Game';
import { PlayerRepository } from './repository/PlayerRepository';

interface IWebSocket extends WebSocket {
  playerId: string;
}

class GameServer {
  private wss: WebSocket.Server;

  constructor(port: number, private playerRepo = new PlayerRepository()) {
    this.wss = new WebSocket.Server({ port });
    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private async handleConnection(ws: IWebSocket) {
    const player = new Player(ws);
    ws.playerId = player.playerId;

    // Match players when enough players are available
    await this.matchPlayers();

    // Handle errors
    player.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      // Handle WebSocket error
    });
  }

  private async matchPlayers() {
    const players = await this.playerRepo.fetchUnassignedPlayers();

    while (players.length >= 2) {
      const playerIds = players.splice(0, 2).map((player) => player.playerId);
      const matchedPlayers = this.getWSClients(playerIds);

      const game = new Game(matchedPlayers, true);
      await game.save(playerIds);

      this.startGame(game);
    }
  }

  private getWSClients(playerIds: string[]) {
    return playerIds.reduce((acc: WebSocket[], playerId: string) => {
      this.wss.clients.forEach((client: any) => {
        if (client.playerId === playerId) {
          acc.push(client);
        }
      });
      return acc;
    }, []);
  }

  private startGame(game: Game) {
    const playersMap = new Map<WebSocket, number>();
    let currentPlayerIndex = Math.floor(Math.random() * game.players.length);
    let wholeNumber = 0;
    let turnCount = 0;

    game.players.forEach((player, index) => {
      playersMap.set(player, index + 1);

      player.send(`Game started! You are Player ${index + 1}.`);

      if (index === currentPlayerIndex) {
        const firstPlayer = game.players[currentPlayerIndex];
        firstPlayer.send(`You have the first turn`);
      }

      player.on('message', (message: string) => {
        const parsedMessage = parseInt(message);

        if (turnCount !== 0 && parsedMessage !== -1 && parsedMessage !== 0 && parsedMessage !== 1) {
          player.send('Invalid input. User can only return 1, 0, -1');
          return;
        }

        if (index === currentPlayerIndex) {
          // Handle game logic based on received messages

          wholeNumber = turnCount !== 0 ? (wholeNumber + parsedMessage) / 3 : parsedMessage;

          if (wholeNumber === 1) {
            game.players.forEach((player) => player.send(`Player ${index} Won!`));
            return;
          }

          // Send the message to the other player in the game
          const otherPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
          const otherPlayer = game.players[otherPlayerIndex];

          otherPlayer.send(`Player ${index + 1}: ${wholeNumber}`);

          // Switch to the next player's turn
          currentPlayerIndex = otherPlayerIndex;
          turnCount += 1;
        } else {
          // It's not the player's turn
          player.send("It's not your turn.");
        }
      });

      /* player.on('close', () => {
        this.handlePlayerDisconnect(player, game);
      }); */
    });
  }
}

new GameServer(3000);
