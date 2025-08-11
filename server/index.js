// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Stores the last videoId for each room
const roomVideoMap = {};

// Stores playback state per room
// { videoId, time, isPlaying, updatedAt }
const roomPlaybackState = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Send last videoId if exists
    if (roomVideoMap[roomId]) {
      socket.emit('video-loaded', roomVideoMap[roomId]);
    }

    // Send last playback state if exists
    if (roomPlaybackState[roomId]) {
      socket.emit('video-state', roomPlaybackState[roomId]);
    }
  });

  socket.on('load-video', ({ roomId, videoId }) => {
    console.log(`User ${socket.id} loaded video ${videoId} in room ${roomId}`);

    // Save videoId
    roomVideoMap[roomId] = videoId;

    // Reset playback state
    roomPlaybackState[roomId] = {
      videoId,
      time: 0,
      isPlaying: false,
      updatedAt: Date.now()
    };

    // Broadcast to others
    socket.to(roomId).emit('video-loaded', videoId);
  });

  socket.on('video-event', ({ roomId, event }) => {
    // Update playback state
    if (!roomPlaybackState[roomId]) {
      roomPlaybackState[roomId] = {
        videoId: roomVideoMap[roomId] || null,
        time: typeof event.time === 'number' ? event.time : 0,
        isPlaying: event.type === 'play',
        updatedAt: Date.now()
      };
    } else {
      roomPlaybackState[roomId].time =
        typeof event.time === 'number'
          ? event.time
          : roomPlaybackState[roomId].time;
      roomPlaybackState[roomId].isPlaying = event.type === 'play';
      roomPlaybackState[roomId].updatedAt = Date.now();
    }

    // Relay event
    socket.to(roomId).emit('video-event', event);
  });

  socket.on('chat-message', ({ roomId, msg }) => {
    console.log(`Message in ${roomId} from ${msg.user}: ${msg.text}`);
    socket.to(roomId).emit('chat-message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
