import { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const SERVER_URL = "ws://localhost:3001";

function App() {
  const [roomId, setRoomId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState("X");
  const [gameStatus, setGameStatus] = useState("");
  const [wins, setWins] = useState({ X: 0, O: 0 });

  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(SERVER_URL);
    ws.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      handleServerMessage(data);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const handleServerMessage = (data) => {
    if (data.type === "roomCreated") {
      setRoomId(data.roomId);
      setPlayer(data.player);
      setGameStatus(`You are Player ${data.player}`);
    } else if (data.type === "assignPlayer") {
      setPlayer(data.player);
      setGameStatus(`You are Player ${data.player}`);
    } else if (data.type === "updateBoard") {
      setBoard(data.board);
      setCurrentTurn(data.currentPlayer);
      setWins(data.wins);
    } else if (data.type === "gameOver") {
      setGameStatus(data.winner === "draw" ? "Game Draw!" : `Winner: ${data.winner}`);
      setWins(data.wins);
    }
  };

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const joinOrCreateRoom = () => {
    sendMessage({ type: "createRoom" });
  };

  const makeMove = (index) => {
    if (roomId && player === currentTurn && !board[index]) {
      sendMessage({ type: "makeMove", index, player });

      const newBoard = [...board];
      newBoard[index] = player;
      setBoard(newBoard);
      setCurrentTurn(player === "X" ? "O" : "X");
    }
  };

  return (
    <div className="game-container">
      <div className="glass-box">
        <h1 className="game-title">Tic Tac Toe</h1>
  
        {!player && (
          <button onClick={joinOrCreateRoom} className="btn btn-lg btn-primary mb-3 shadow">
            <i className="bi bi-play-fill"></i> Join Game
          </button>
        )}
  
        {roomId && (
          <div className="room-info">
            <span className="room-id">Room ID: {roomId}</span>
          </div>
        )}
  
        <div className="game-status">
          {player ? (
            <h2 className={`turn-indicator ${currentTurn === player ? "your-turn" : "opponent-turn"}`}>
              {gameStatus} {player === currentTurn ? "(Your Turn)" : "(Opponent's Turn)"}
            </h2>
          ) : (
            <span style={{ visibility: "hidden" }}>Waiting...</span>
          )}
        </div>
  
        <h3 className="win-tracker">
          🏆 X Wins: <span className="x-wins">{wins.X}</span> | O Wins: <span className="o-wins">{wins.O}</span>
        </h3>
  
        <div className="board">
          {board.map((cell, index) => (
            <div
              key={index}
              className={`cell ${cell === "X" ? "filled-x" : cell === "O" ? "filled-o" : "empty"}`}
              onClick={() => makeMove(index)}
            >
              {cell}
            </div>
          ))}
        </div>
  
        <footer className="footer">
          <p>Victory is always possible for the 🧑‍🦱 person who refuses to stop fighting 💪.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
