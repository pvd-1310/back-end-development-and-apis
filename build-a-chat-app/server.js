import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import { Socket } from 'dgram';
import { type } from 'os';
import { text } from 'stream/consumers';

const PORT = 3001;

const server = http.createServer((req, res) => {
  const isScript = req.url === "/script.js";
  const filePath = isScript
    ? "./public/script.js"
    : "./public/index.html";
  const contentType = isScript
    ? "application/javascript"
    : "text/html";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

function broadcast(message){
    const data = JSON.stringify(message);

    wss.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN){
            client.send(data);
        }
    });
}

wss.on("connection", (socket, req) => {
    const username = new URL(
        req.url,
        "http://localhost"
    ).searchParams.get("username");

    broadcast({
        type: "system",
        text: `${username} joined`,
    });

    socket.on("message", (data) => {
        let message;

        try {
            message = JSON.parse(data.toString());
        } catch {
            return;
        }

        const { username, text } = message;

        broadcast({
            type: "chat",
            username,
            text
        });
    });

    socket.on("close", () => {
        broadcast({
            type: "system",
            text: `${username} left`
        });
    });
});

server.listen(PORT, () => {
  console.log("Chat server running at http://localhost:3001");
});