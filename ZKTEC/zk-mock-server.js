const net = require("net");

const PORT = 4370;

const server = net.createServer((socket) => {
  console.log("Client connected");

  socket.on("data", (data) => {
    const cmd = data.toString().trim().toLowerCase();

    console.log(`Received command: ${cmd}`);

    if (cmd === "getinfo") {
      const response = {
        logCapacity: 5000,
        userCount: 3,
        logCount: 10,
      };
      socket.write(JSON.stringify(response));
    } else if (cmd === "getusers") {
      const response = {
        data: [
          { userId: 1, name: "Alice" },
          { userId: 2, name: "Bob" },
          { userId: 3, name: "Charlie" },
        ],
      };
      socket.write(JSON.stringify(response));
    } else if (cmd === "getattendances") {
      const response = {
        data: [
          {
            userId: 1,
            timestamp: new Date().toISOString(),
            verifyType: "Fingerprint",
            type: "0",
          },
          {
            userId: 2,
            timestamp: new Date().toISOString(),
            verifyType: "Card",
            type: "1",
          },
        ],
      };
      socket.write(JSON.stringify(response));
    } else {
      socket.write(JSON.stringify({ error: "Unknown command" }));
    }
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Mock ZK server listening on port ${PORT}`);
});
