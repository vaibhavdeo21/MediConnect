const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./db');

let io = null;
const onlineUsers = new Map(); // userId -> Set of socketIds

const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const role = socket.userRole;

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room
    socket.join(`user:${userId}`);

    // Update doctor online status
    if (role === 'doctor') {
      try {
        await pool.query(
          'UPDATE doctors SET is_online = TRUE, last_active_at = NOW() WHERE user_id = $1',
          [userId]
        );
        io.emit('doctor:online', { userId, isOnline: true });
      } catch (err) {
        console.error('Doctor online update error:', err.message);
      }
    }

    console.log(`Socket connected: user ${userId} (${role})`);

    // Handle doctor status toggle
    socket.on('doctor:status', async (data) => {
      try {
        await pool.query(
          'UPDATE doctors SET is_emergency_active = $1, last_active_at = NOW() WHERE user_id = $2',
          [data.active, userId]
        );
        io.emit('doctor:status_change', { userId, isEmergencyActive: data.active });
      } catch (err) {
        console.error('Status toggle error:', err.message);
      }
    });

    // Handle notification read
    socket.on('notification:read', async (data) => {
      try {
        await pool.query(
          'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
          [data.notificationId, userId]
        );
      } catch (err) {
        console.error('Notification read error:', err.message);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);

          // Update doctor offline status only when all tabs closed
          if (role === 'doctor') {
            try {
              await pool.query(
                'UPDATE doctors SET is_online = FALSE, last_active_at = NOW() WHERE user_id = $1',
                [userId]
              );
              io.emit('doctor:online', { userId, isOnline: false });
            } catch (err) {
              console.error('Doctor offline update error:', err.message);
            }
          }
        }
      }
      console.log(`Socket disconnected: user ${userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

const isUserOnline = (userId) => {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
};

module.exports = {
  setupSocket,
  getIO,
  emitToUser,
  emitToRoom,
  getOnlineUsers,
  isUserOnline,
};
