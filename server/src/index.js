require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const { createApp } = require("./app");
const { registerSocketHandlers } = require("./socket");
const { startOffCheckJob } = require("./jobs/offCheck");

const PORT = Number(process.env.PORT || 4000);

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);
registerSocketHandlers(io);
startOffCheckJob(io);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${PORT}`);
});
