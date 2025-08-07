import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SynctubePlayer from './SynctubePlayer';

const socket = io('http://localhost:3001');

function App() {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const playerRef = useRef(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });
  
    socket.on('video-loaded', (id) => {
      console.log('Received video ID from other user:', id);
      setVideoId(id);
    });
  
    socket.on('video-event', (event) => {
      console.log('Received video event from other user:', event);
      if (playerRef.current) {
        if (event.type === 'play') {
          playerRef.current.playVideo();
        } else if (event.type === 'pause') {
          playerRef.current.pauseVideo();
        }
      }
    });
  
    // Clean up socket on page unload
    const handleBeforeUnload = () => {
      socket.disconnect();
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off('connect');
      socket.off('video-loaded');
      socket.off('video-event');
    };
  }, []);
  

  const handleJoin = () => {
    if (roomId.trim()) {
      console.log('Joining room:', roomId);
      socket.emit('join-room', roomId);
      setJoined(true);
    }
  };

  const handleLoadVideo = () => {
    const id = extractVideoId(url);
    if (id) {
      console.log('Loading video with ID:', id);
      setVideoId(id);
      socket.emit('load-video', { roomId, videoId: id });
    } else {
      alert('Invalid YouTube URL');
    }
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;
    console.log('Player ready');
  };

  const handlePlayerStateChange = (event) => {
    console.log('Player state changed:', event.data);
  
    // 1 = play, 2 = pause
    if (event.data === 1 || event.data === 2) {
      socket.emit('video-event', {
        roomId,
        event: {
          type: event.data === 1 ? 'play' : 'pause',
        },
      });
    }
  };  

  const extractVideoId = (ytUrl) => {
    try {
      const urlObj = new URL(ytUrl);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      } else if (
        urlObj.hostname === 'www.youtube.com' ||
        urlObj.hostname === 'youtube.com' ||
        urlObj.hostname === 'm.youtube.com'
      ) {
        return urlObj.searchParams.get('v');
      }
    } catch (e) {
      return null;
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
            autoFocus
            style={{ padding: '0.5rem', marginRight: '1rem' }}
          />
          <button onClick={handleJoin}>Join</button>
        </div>
      ) : (
        <div>
          <h2>Room: {roomId}</h2>

          <div style={{ margin: '1rem 0' }}>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here"
              style={{ padding: '0.5rem', width: '400px', marginRight: '1rem' }}
            />
            <button onClick={handleLoadVideo}>Load Video</button>
          </div>

          {videoId && (
            <SynctubePlayer
              videoId={videoId}
              onPlayerReady={handlePlayerReady}
              onPlayerStateChange={handlePlayerStateChange}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
