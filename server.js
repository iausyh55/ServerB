const WebSocket = require("ws");

const port = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port });

const users = new Map();

function broadcastPlayers() {
    const players = [];

    for (const [socket, player] of users) {
        players.push(player);
    }

    const message = JSON.stringify({
        type: "players",
        players: players
    });

    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

wss.on("connection", (ws) => {

    ws.on("message", (raw) => {

        try {
            const data = JSON.parse(raw);

            if (data.type === "join") {

                users.set(ws, {
                    userId: data.userId,
                    username: data.username
                });

                broadcastPlayers();
            }

        } catch (err) {
            console.error(err);
        }

    });

    ws.on("close", () => {
        users.delete(ws);
        broadcastPlayers();
    });
});

console.log("WebSocket server started");