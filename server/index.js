// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Store the last videoId for each room
const roomVideoMap = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Send last videoId to new user (if it exists)
    if (roomVideoMap[roomId]) {
      socket.emit('video-loaded', roomVideoMap[roomId]);
    }
  });

  socket.on('load-video', ({ roomId, videoId }) => {
    console.log(`User ${socket.id} loaded video ${videoId} in room ${roomId}`);

    // Save the videoId for this room
    roomVideoMap[roomId] = videoId;

    // Broadcast to others in room
    socket.to(roomId).emit('video-loaded', videoId);
  });

  socket.on('video-event', ({ roomId, event }) => {
    socket.to(roomId).emit('video-event', event);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Use Render's dynamic port or fallback to 3001 locally
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
