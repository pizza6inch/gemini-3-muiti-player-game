import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Track all connected players
  const players = {};

  io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Initialize player with a default position
    players[socket.id] = { id: socket.id, position: [0, 1, 0] };
    
    // Send existing players to the newly connected player
    socket.emit("currentPlayers", players);
    
    // Broadcast the new player to everyone else
    socket.broadcast.emit("newPlayer", players[socket.id]);

    socket.on("move", (position) => {
      if (players[socket.id]) {
        players[socket.id].position = position;
        // Broadcast to other players
        socket.broadcast.emit("playerMoved", { id: socket.id, position });
      }
    });

    socket.on("chat", (message) => {
      io.emit("chatMessage", { id: socket.id, message });
    });

    socket.on("disconnect", () => {
      console.log(`Player disconnected: ${socket.id}`);
      delete players[socket.id];
      io.emit("playerDisconnected", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
