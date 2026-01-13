import io from 'socket.io-client';

let socket = null;

export const socketService = {
  // الاتصال بـ Socket.io
  connect: (url = process.env.REACT_APP_API_URL || 'http://localhost:5000') => {
    if (!socket) {
      socket = io(url, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('متصل بـ Socket.io');
      });

      socket.on('disconnect', () => {
        console.log('قطع الاتصال بـ Socket.io');
      });

      socket.on('connect_error', (error) => {
        console.error('خطأ في الاتصال:', error);
      });
    }
    return socket;
  },

  // قطع الاتصال
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  // الاستماع للأحداث
  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  },

  // إرسال الأحداث
  emit: (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  },

  // إزالة الاستماع للأحداث
  off: (event) => {
    if (socket) {
      socket.off(event);
    }
  },

  // الحصول على Socket
  getSocket: () => socket,

  // التحقق من الاتصال
  isConnected: () => socket && socket.connected,
};
