import { PlayerRepository } from '../repository/PlayerRepository';
import WebSocket, { EventEmitter } from 'ws';
import { Game } from './Game';
const { v4: uuidv4 } = require('uuid');

export class Player extends EventEmitter {
  private ws: WebSocket;
  private _playerId: string;
  public game: Game | undefined;

  constructor(ws: WebSocket, private playerRepo = new PlayerRepository()) {
    super();
    this.ws = ws;
    this._playerId = uuidv4();
    this.playerRepo.save(this.playerId);

    this.ws.on('message', this.handleMessage.bind(this));
    this.ws.on('close', this.handleClose.bind(this));
  }

  get playerId(): string {
    return this._playerId;
  }

  send(message: string) {
    this.ws.send(message);
  }

  private handleMessage(message: WebSocket.Data) {
    this.emit('message', message.toString());
  }

  private handleClose() {
    this.emit('close');
  }

  public async remove() {
    return await this.playerRepo.remove(this.playerId);
  }
}
