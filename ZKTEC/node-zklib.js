const dgram = require("dgram");
const client = dgram.createSocket("udp4");

const HOST = "127.0.0.1";
const PORT = 4370;

// Send dummy request to simulate CMD_ATTLOG_RRQ trigger
const dummyRequest = Buffer.from([0x07, 0x00, 0x00, 0x00]); // fake command

client.send(dummyRequest, PORT, HOST, (err) => {
  if (err) console.error("❌ Send error:", err);
  else console.log("📨 Sent dummy CMD_ATTLOG_RRQ");
});

client.on("message", (data) => {
  console.log("📥 Response Received");
  console.log("📦 Buffer:", data);
  console.log("🧾 Hex:", data.toString("hex"));

  const recordLength = 12;
  const recordCount = data.length / recordLength;

  for (let i = 0; i < recordCount; i++) {
    const offset = i * recordLength;
    const userId = data.readUInt32LE(offset);
    const timestampRaw = data.readUInt32LE(offset + 4);
    const timestamp = new Date(timestampRaw * 1000);
    const verifyMode = data.readUInt8(offset + 8);
    const status = data.readUInt8(offset + 9);
    const workCode = data.readUInt8(offset + 10);

    console.log(`\n🧑 Record ${i + 1}`);
    console.log(`➡️ User ID: ${userId}`);
    console.log(`🕒 Timestamp: ${timestamp}`);
    console.log(`🔍 Verify Mode: ${verifyMode}`);
    console.log(`🔁 Status: ${status === 0 ? "Check-In" : "Check-Out"}`);
    console.log(`💼 Work Code: ${workCode}`);
  }

  client.close();
});
