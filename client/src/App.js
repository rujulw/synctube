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

  // Generate room codes like "ABCD12"
  const generateRoomCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const createRoom = () => {
    const newRoom = generateRoomCode();
    setRoomId(newRoom);
    socket.emit("join-room", newRoom);
    setJoined(true);
  };

  const joinRoom = (code) => {
    if (code.trim()) {
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
          <RoomPage roomId={roomId} socket={socket} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
