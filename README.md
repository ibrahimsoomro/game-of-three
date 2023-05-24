# Game of Three

Game of Three is a multiplayer game where players take turns manipulating a number with the goal of reaching a value of 1. Each player can make a move by submitting -1, 0, 1 once the game is started. The game starts by one player submitting the initial number.

## Prerequisites

- Node.js
- WebSocket

## Getting Started

1. Clone the repository:

   ```bash
   git clone git@github.com:ibrahimsoomro/game-of-three.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm run start
   ```

4. Access the game client (you can create multiple clients using this command within the project directory):

   ```bash
   npx wscat -c ws://localhost:3000
   ```

## How to Play

1. Connect to the game server by accessing the game client URL in your the terminal.

2. Wait for other player to join. The game will automatically match players when enough are available.

3. Once the game starts, you will see the current state of the number and whose turn it is.

4. On your turn, you can perform one of the following moves:
   - Initiate the game with a desired number.
   - Rest of will only accept -1, 0, 1 as input from the user.
   - Game divides the resultant number with a constant 3.

   The goal is to manipulate the number strategically to reach 1 as a result.

5. Be careful with your moves. Invalid moves will result in an error message.

6. The game will continue until one player reaches 1 as a result. The winning player will be announced, and the game will end.

7. If you need to end the game prematurely, you can send the message "gameend" to exit the game.
