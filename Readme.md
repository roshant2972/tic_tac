# Multiplayer Tic Tac Toe

A real-time multiplayer Tic Tac Toe game built with **React** (frontend) and **Node.js + Express + WebSocket** (backend).  
Players can create or join rooms and play synchronised matches without refreshing the page.


**Deploy link [Tic tac toe](https://tic-tac-navy.vercel.app/)

---

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture & Flow](#architecture--flow)
- [Socket Events](#socket-events)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone](#clone)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Project Structure](#project-structure)
- [How to Play](#how-to-play)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Demo

** Mobile View** [Mobile view ](tic/tick/public/mobileView.png)
**Desktop View** [Desktop view](tic/tick/public/desktopView.png)

---

## Features

- Real-time gameplay using Socket.IO (WebSockets)
- Room-based matches (unique room per game)
- Synchronized board state between two players
- Win / loss / draw detection
- Responsive UI (desktop + mobile)
- Basic reconnection & player-left handling

---

## Tech Stack

**Frontend**
- React ( Vite)
- Websocket.io-client
- Tailwind CSS 

**Backend**
- Node.js
- Express
- socket.io
- (Optional) nodemon for development

---

## Architecture & Flow

1. Client connects to backend via Socket.IO.
2. Player creates a room (server generates room id) or joins an existing room.
3. Server pairs players and emits room updates to both clients.
4. Players emit moves; server validates and broadcasts updated board state.
5. Server checks for win/draw and emits `gameOver` when the match ends.

---

## Socket Events

> These are suggested events — adapt to your implementation.

**Client → Server**
- `createRoom` — `{ playerName }`
- `joinRoom` — `{ roomId, playerName }`
- `makeMove` — `{ roomId, index }` (index 0..8)
- `restartGame` — `{ roomId }`
- `leaveRoom` — `{ roomId }`

**Server → Client**
- `roomCreated` — `{ roomId, player }`
- `roomJoined` — `{ roomId, players }`
- `roomUpdate` — `{ roomId, players, status }`
- `moveMade` — `{ roomId, board, nextTurn }`
- `gameOver` — `{ roomId, result, winningCombo? }` (result: "win"|"draw"|"resign")
- `error` — `{ message }`
- `playerLeft` — `{ roomId, player }`

---

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn

### Clone

```bash
git clone https://github.com/your-username/multiplayer-tic-tac-toe.git
cd multiplayer-tic-tac-toe

