let ioInstance = null;

exports.initializeSockets = (io) => {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log(`[Notification Service] Client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`[Notification Service] Client disconnected: ${socket.id}`);
    });
  });
};

exports.broadcastEvent = (topic, message) => {
  if (ioInstance) {
    ioInstance.emit(topic, message);
  }
};
