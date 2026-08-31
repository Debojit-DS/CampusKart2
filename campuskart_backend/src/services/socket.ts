import type { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';

interface SocketUser {
  userId: string;
  campusId: string;
}

const connectedUsers = new Map<string, string>(); // userId -> socketId
let io: SocketServer | null = null;

export function initializeSocketIO(socketServer: SocketServer) {
  io = socketServer;

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('UNAUTHORIZED'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
        sub: string;
        campusId: string;
      };

      socket.data.user = {
        userId: decoded.sub,
        campusId: decoded.campusId,
      } as SocketUser;

      next();
    } catch {
      next(new Error('INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as SocketUser;

    // Track connected user
    connectedUsers.set(user.userId, socket.id);
    socket.join(`user:${user.userId}`);

    // Join a conversation room
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave a conversation room
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing indicator
    socket.on('presence:typing', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('presence:typing', {
        conversationId,
        userId: user.userId,
      });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(user.userId);
    });
  });
}

// Utility to emit events from route handlers
export function emitToUser(userId: string, event: string, data: unknown) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToConversation(conversationId: string, event: string, data: unknown) {
  if (!io) return;
  io.to(`conversation:${conversationId}`).emit(event, data);
}

export function isUserConnected(userId: string): boolean {
  return connectedUsers.has(userId);
}

export { connectedUsers };
