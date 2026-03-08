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
  // Track apples on the map
  let apples = {};

  // Periodically spawn apples
  const spawnApple = () => {
    const id = Math.random().toString(36).substring(7);
    const apple = {
      id,
      x: Math.random() * 90 + 5, 
      y: Math.random() * 90 + 5,
    };
    apples[id] = apple;
    io.emit("newApple", apple);
  };

  setInterval(() => {
    if (Object.keys(apples).length < 15) {
      spawnApple();
    }
  }, 3000);

  io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Initialize player with score
    players[socket.id] = { id: socket.id, position: { x: 50, y: 50 }, score: 0 };
    
    // Send existing data
    socket.emit("currentPlayers", players);
    socket.emit("currentApples", apples);
    
    socket.broadcast.emit("newPlayer", players[socket.id]);

    socket.on("move", (position) => {
      if (players[socket.id]) {
        players[socket.id].position = position;
        socket.broadcast.emit("playerMoved", { id: socket.id, position });
      }
    });

    socket.on("eatApple", (appleId) => {
      if (apples[appleId] && players[socket.id]) {
        delete apples[appleId];
        players[socket.id].score += 10;
        io.emit("appleEaten", { appleId, playerId: socket.id, newScore: players[socket.id].score });
      }
    });

    socket.on("requestCurrentPlayers", () => {
      socket.emit("currentPlayers", players);
      socket.emit("currentApples", apples); // Also send apples on manual sync
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
