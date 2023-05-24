import WebSocket from 'ws';
import { PlayerRepository } from '../repository/PlayerRepository';
import { GameRepository } from '../repository/GameRepository';
const { v4: uuidv4 } = require('uuid');

export interface IWebSocket extends WebSocket {
  playerId: string;
}

export class Game {
  private players: IWebSocket[];
  private currentPlayerIndex: number;
  private wholeNumber: number;
  private turnCount: number;
  public gameId: string;

  constructor(
    players: IWebSocket[],
    private gameRepo = new GameRepository(),
    private playerRepo = new PlayerRepository()
  ) {
    this.players = players;
    this.currentPlayerIndex = Math.floor(Math.random() * players.length);
    this.wholeNumber = 0;
    this.turnCount = 0;
    this.gameId = uuidv4();
  }

  public async start(playerIds: string[]) {
    await this.save(playerIds);

    this.sendInitialMessages();

    for (const player of this.players) {
      player.on('message', (message: string) => {
        if (message === 'gameend') {
          return;
        }

        const parsedMessage = parseInt(message);

        if (this.turnCount !== 0 && parsedMessage !== -1 && parsedMessage !== 0 && parsedMessage !== 1) {
          this.sendToPlayer(player, 'Invalid input. User can only return 1, 0, -1');
          return;
        }

        if (this.isCurrentPlayer(player)) {
          this.handlePlayerMove(player, parsedMessage);
        } else {
          this.sendToPlayer(player, "It's not your turn.");
        }
      });
    }
  }

  private sendInitialMessages() {
    this.players.forEach((player, index) => {
      this.sendToPlayer(player, `Game started! You are Player ${index + 1}.`);

      if (index === this.currentPlayerIndex) {
        this.sendToPlayer(player, 'You have the first turn');
      }
    });
  }

  private handlePlayerMove(player: IWebSocket, move: number) {
    this.wholeNumber = this.turnCount !== 0 ? Math.round((this.wholeNumber + move) / 3) : move;

    if (this.wholeNumber === 1) {
      this.players.forEach((player) => this.sendToPlayer(player, `Player ${this.currentPlayerIndex + 1} Won!`));
      this.players.forEach((player) => player.emit('message', 'gameend'));

      return;
    }

    this.sendToOtherPlayer(`Player ${this.getPlayerIndex(player)}: ${this.wholeNumber}`);

    this.switchToNextPlayer();
    this.turnCount++;
  }

  private sendToPlayer(player: IWebSocket, message: string) {
    player.send(message);
  }

  private sendToOtherPlayer(message: string) {
    const otherPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    const otherPlayer = this.players[otherPlayerIndex];
    this.sendToPlayer(otherPlayer, message);
  }

  private isCurrentPlayer(player: IWebSocket) {
    return player === this.players[this.currentPlayerIndex];
  }

  private getPlayerIndex(player: IWebSocket) {
    return this.players.indexOf(player) + 1;
  }

  private switchToNextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  public handlePlayerDisconnect(disconPlayer: IWebSocket) {
    const index = this.players.indexOf(disconPlayer);
    this.players.splice(index, 1);

    const remainingPlayers = this.players.filter((player) => player !== disconPlayer);
    if (remainingPlayers.length === 1) {
      const winningPlayer = remainingPlayers[0];
      winningPlayer.send('Opponent disconnected. You win!');
    }
  }

  public hasPlayer(playerId: string): boolean {
    const res = this.players.find((player) => player.playerId === playerId);

    if (!res) {
      return false;
    }
    return true;
  }

  public getPlayers(): IWebSocket[] {
    return this.players;
  }

  public async save(playerIds: string[]) {
    await this.gameRepo.save({
      gameId: this.gameId,
      active: true,
      playerIds,
    });

    return await this.playerRepo.updateStatus(playerIds, this.gameId);
  }

  public async remove() {
    return await this.gameRepo.remove(this.gameId);
  }
}
