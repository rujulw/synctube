import { useState } from "react";

export default function LandingPage({ onCreateRoom, onJoinRoom }) {
  const [roomCode, setRoomCode] = useState("");

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row text-white"
      style={{
      
        backgroundRepeat: "repeat",
      }}
    >
      {/* LEFT BRANDING SECTION */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-center md:text-left">
        <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
          synctube
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-md">
          watch YouTube videos together in perfect sync. create a room and share
          the code with friends.
        </p>
      </div>

      {/* RIGHT CARD SECTION */}
      <div className="flex-1 flex justify-center items-center p-8">
        <div className="w-full max-w-lg bg-[#1e1f22] rounded-2xl shadow-lg border border-purple-700 transform transition duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]">
          <div className="p-8 flex flex-col items-center space-y-6">
            {/* Create Room Button */}
            <button
              onClick={onCreateRoom}
              className="w-full bg-purple-600 hover:bg-purple-700 text-lg font-semibold py-3 rounded-xl transition"
            >
              create room
            </button>

            {/* Divider */}
            <div className="flex items-center w-full text-gray-500">
              <hr className="flex-1 border-gray-700" />
              <span className="px-3">or</span>
              <hr className="flex-1 border-gray-700" />
            </div>

            {/* Join Room */}
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="enter room code"
              className="w-full px-4 py-3 rounded-xl bg-[#2b2d31] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 lowercase"
            />
            <button
              onClick={() => onJoinRoom(roomCode)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-lg font-semibold py-3 rounded-xl transition"
            >
              join room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
