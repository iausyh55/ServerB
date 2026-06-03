const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;

const server = new WebSocket.Server({
    port: PORT
});

const users = new Map();

function broadcast() {
    const packet = JSON.stringify({
        type: "players",
        players: [...users.values()]
    });

    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(packet);
        }
    });
}

server.on("connection", socket => {

    socket.on("message", raw => {

        try {

            const data = JSON.parse(raw);

            if (data.type === "join") {

                users.set(socket, {
                    userId: data.userId,
                    username: data.username
                });

                broadcast();
            }

        } catch (e) {
            console.error(e);
        }

    });

    socket.on("close", () => {
        users.delete(socket);
        broadcast();
    });

});

console.log(`Running on port ${PORT}`);
