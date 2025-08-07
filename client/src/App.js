// client/src/App.jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001'); // Backend server

function App() {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);

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
          <h2>Joined room: {roomId}</h2>
          <p>You are now connected via WebSocket!</p>
        </div>
      )}
    </div>
  );
}

export default App;
