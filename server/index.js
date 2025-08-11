// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store room data
const rooms = new Map(); // roomId -> { videoId, messages }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { videoId: null, messages: [] });
    }

    const room = rooms.get(roomId);
    
    // Send current room state to new user
    if (room.videoId) {
      socket.emit('video-loaded', room.videoId);
    }
    
    // Send chat history
    if (room.messages.length > 0) {
      socket.emit('chat-history', room.messages);
    }
  });

  socket.on('load-video', ({ roomId, videoId }) => {
    console.log(`Loading video ${videoId} in room ${roomId}`);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { videoId, messages: [] });
    } else {
      rooms.get(roomId).videoId = videoId;
    }

    // Broadcast to everyone in the room including sender
    io.to(roomId).emit('video-loaded', videoId);
  });

  socket.on('video-event', ({ roomId, event }) => {
    socket.to(roomId).emit('video-event', event);
  });

  socket.on('chat-message', ({ roomId, msg }) => {
    console.log(`Message in ${roomId} from ${msg.user}: ${msg.text}`);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { videoId: null, messages: [] });
    }
    
    const room = rooms.get(roomId);
    room.messages.push(msg);
    
    // Broadcast to everyone in the room including sender
    io.to(roomId).emit('chat-message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});