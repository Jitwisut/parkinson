function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("join:patient", (patientId) => {
      socket.join(`patient:${patientId}`);
    });

    socket.on("join:caregiver", (caregiverId) => {
      socket.join(`caregiver:${caregiverId}`);
    });
  });
}

module.exports = { registerSocketHandlers };
