import { useState } from "react";

export default function LandingPage({ onCreateRoom, onJoinRoom }) {
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div
        className="w-full max-w-lg bg-[#1e1f22] rounded-2xl shadow-lg p-8 border border-purple-700 
                   transition duration-300 transform hover:scale-105 
                   hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
      >
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-4xl font-bold text-purple-400 tracking-wide">
            synctube
          </h1>
          <p className="text-gray-400 text-center">
            watch YouTube videos together in perfect sync.
          </p>

          <button
            onClick={onCreateRoom}
            className="w-full bg-purple-600 hover:bg-purple-700 text-lg font-semibold py-3 rounded-xl transition"
          >
            create room
          </button>

          <div className="flex items-center w-full text-gray-500">
            <hr className="flex-1 border-gray-700" />
            <span className="px-3">or</span>
            <hr className="flex-1 border-gray-700" />
          </div>

          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="enter code"
            className="w-full px-4 py-3 rounded-xl bg-[#2b2d31] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
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
  );
}
