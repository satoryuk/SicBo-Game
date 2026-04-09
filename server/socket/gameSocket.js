const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ Player connected: ${socket.id}`);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      io.to(roomId).emit("player_joined", { socketId: socket.id });
    });

    socket.on("broadcast_roll", ({ roomId, result }) => {
      io.to(roomId).emit("roll_result", result);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Player disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };
