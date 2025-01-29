const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let activeRoom = null;

wss.on("connection", (ws) => {
  ws.id = uuidv4();
  console.log(`User ${ws.id} connected`);

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "createRoom") {
      if (!activeRoom) {
        activeRoom = {
          id: "TIC-TAC-ROOM",
          players: {},
          board: Array(9).fill(null),
          currentPlayer: "X",
          wins: { X: 0, O: 0 }, // Track wins
        };
        console.log(`Room Created: ${activeRoom.id}`);
      }

      ws.roomId = activeRoom.id;
      const playerSymbol = Object.keys(activeRoom.players).length === 0 ? "X" : "O";
      activeRoom.players[ws.id] = playerSymbol;

      ws.send(JSON.stringify({ type: "roomCreated", roomId: activeRoom.id, player: playerSymbol }));
      broadcastRoomState(activeRoom.id);
    }

    if (data.type === "joinRoom") {
      if (activeRoom && Object.keys(activeRoom.players).length < 2) {
        ws.roomId = activeRoom.id;
        const playerSymbol = "O"; // Second player is always 'O'
        activeRoom.players[ws.id] = playerSymbol;

        ws.send(JSON.stringify({ type: "assignPlayer", player: playerSymbol }));
        broadcastRoomState(activeRoom.id);
      } else {
        ws.send(JSON.stringify({ type: "roomFull" }));
      }
    }

    if (data.type === "makeMove" && ws.roomId) {
      const { index, player } = data;
      if (
        activeRoom.players[ws.id] === player &&
        player === activeRoom.currentPlayer &&
        !activeRoom.board[index]
      ) {
        activeRoom.board[index] = player;
        activeRoom.currentPlayer = player === "X" ? "O" : "X"; // Switch turns
        broadcastRoomState(activeRoom.id);
        checkWinner(activeRoom.id);
      }
    }
  });

  ws.on("close", () => {
    if (ws.roomId && activeRoom) {
      delete activeRoom.players[ws.id];

      if (Object.keys(activeRoom.players).length === 0) {
        activeRoom = null;
      } else {
        broadcastRoomState(activeRoom.id);
      }
    }
    console.log(`User ${ws.id} disconnected`);
  });
});

function broadcastRoomState(roomId) {
  if (activeRoom) {
    wss.clients.forEach((client) => {
      if (client.roomId === roomId && client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "updateBoard",
            board: activeRoom.board,
            currentPlayer: activeRoom.currentPlayer,
            wins: activeRoom.wins,
          })
        );
      }
    });
  }
}

function checkWinner(roomId) {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  for (let combo of winningCombinations) {
    const [a, b, c] = combo;
    if (activeRoom.board[a] && activeRoom.board[a] === activeRoom.board[b] && activeRoom.board[a] === activeRoom.board[c]) {
      activeRoom.wins[activeRoom.board[a]]++; // Increment winner's score
      broadcastGameOver(roomId, activeRoom.board[a]);
      resetGame(roomId);
      return;
    }
  }

  if (activeRoom.board.every(cell => cell !== null)) {
    broadcastGameOver(roomId, "draw");
    resetGame(roomId);
  }
}

function broadcastGameOver(roomId, winner) {
  wss.clients.forEach((client) => {
    if (client.roomId === roomId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "gameOver", winner, wins: activeRoom.wins }));
    }
  });
}

function resetGame(roomId) {
  activeRoom.board = Array(9).fill(null);
  activeRoom.currentPlayer = "X";
  setTimeout(() => broadcastRoomState(roomId), 1000);
}

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
