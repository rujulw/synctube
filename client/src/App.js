// client/src/App.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SynctubePlayer from './SynctubePlayer';

const socket = io('http://localhost:3001'); // Connect to backend

function App() {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const playerRef = useRef(null);

  // Connect once on mount
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJoin = () => {
    if (roomId.trim()) {
      socket.emit('join-room', roomId);
      setJoined(true);
    }
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;
    console.log('Player ready');
  };

  const handlePlayerStateChange = (event) => {
    console.log('Player state changed:', event.data);
    // We'll handle sync logic here soon
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {!joined ? (
        <div>
          <h2>Enter Room ID</h2>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Room ID"
            style={{ padding: '0.5rem', marginRight: '1rem' }}
          />
          <button onClick={handleJoin}>Join</button>
        </div>
      ) : (
        <div>
          <h2>Room: {roomId}</h2>
          <SynctubePlayer
            videoId="R0hm96lL1CQ" // Default video
            onPlayerReady={handlePlayerReady}
            onPlayerStateChange={handlePlayerStateChange}
          />
        </div>
      )}
    </div>
  );
}

export default App;
