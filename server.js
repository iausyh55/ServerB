const WebSocket = require("ws");

const port = process.env.PORT || 8080;

const wss = new WebSocket.Server({
  port
});

const players = new Map();

function broadcastPlayers() {
  const packet = JSON.stringify({
    type: "players",
    players: [...players.values()]
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(packet);
    }
  });
}

wss.on("connection", socket => {

  console.log("Connected");

  socket.on("message", message => {

    try {

      const data = JSON.parse(message);

      if (data.type === "identify") {

        players.set(socket, {
          userId: data.userId,
          name: data.name
        });

        broadcastPlayers();
      }

    } catch (err) {
      console.error(err);
    }

  });

  socket.on("close", () => {

    players.delete(socket);

    broadcastPlayers();

  });

});

console.log(`Listening on ${port}`);