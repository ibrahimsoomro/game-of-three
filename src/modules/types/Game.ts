import WebSocket from 'ws';

export interface IGame {
  id: number;
  players: WebSocket[];
  active: boolean;
}
