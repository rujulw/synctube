import { useState } from "react";
import { io } from "socket.io-client";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import RoomPage from "./pages/RoomPage";

const socket = io("https://synctube-backend.onrender.com");

function App() {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  // Generate room codes like "ABCD12"
  const generateRoomCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const createRoom = (name) => {
    if (!name.trim()) return;
    setUsername(name);
    const newRoom = generateRoomCode();
    setRoomId(newRoom);
    socket.emit("join-room", newRoom);
    setJoined(true);
  };

  const joinRoom = (code, name) => {
    if (code.trim() && name.trim()) {
      setUsername(name);
      socket.emit("join-room", code.toUpperCase());
      setRoomId(code.toUpperCase());
      setJoined(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {!joined ? (
          <LandingPage onCreateRoom={createRoom} onJoinRoom={joinRoom} />
        ) : (
          <RoomPage roomId={roomId} socket={socket} username={username} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
