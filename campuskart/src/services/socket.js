/**
 * CampusKart Socket.IO Client Service
 * Handles real-time messaging, notifications, and presence.
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
let socket = null;
const listeners = {};

export const socketService = {
  connect(token) {
    if (socket?.connected) return;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    // Default event listeners
    socket.on('new_message', (data) => {
      this._emit('new_message', data);
    });

    socket.on('offer_update', (data) => {
      this._emit('offer_update', data);
    });

    socket.on('notification', (data) => {
      this._emit('notification', data);
    });

    socket.on('presence_typing', (data) => {
      this._emit('presence_typing', data);
    });

    socket.on('presence_online', (data) => {
      this._emit('presence_online', data);
    });
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    for (const key in listeners) {
      delete listeners[key];
    }
  },

  joinConversation(conversationId) {
    if (socket?.connected) {
      socket.emit('conversation:join', { conversationId });
    }
  },

  leaveConversation(conversationId) {
    if (socket?.connected) {
      socket.emit('conversation:leave', { conversationId });
    }
  },

  sendTyping(conversationId, isTyping) {
    if (socket?.connected) {
      socket.emit('presence:typing', { conversationId, isTyping });
    }
  },

  on(event, callback) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
  },

  off(event, callback) {
    if (!listeners[event]) return;
    if (callback) {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    } else {
      delete listeners[event];
    }
  },

  _emit(event, data) {
    if (!listeners[event]) return;
    for (const callback of listeners[event]) {
      callback(data);
    }
  },

  isConnected() {
    return socket?.connected || false;
  },
};
