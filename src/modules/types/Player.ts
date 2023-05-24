import WebSocket from 'ws';

export interface IPlayer {
  playerId: string;
  ws: WebSocket;
  gameId?: number;
}
