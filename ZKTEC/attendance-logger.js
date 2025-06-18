const ZKLib = require("node-zklib");
const cron = require("node-cron");
const moment = require("moment");

// Device connection info
const DEVICE_IP = "127.0.0.1"; // Replace with your device IP
const DEVICE_PORT = 4370; // Usually 4370 for ZKTeco devices

// Create a new instance of ZKLib
const zk = new ZKLib(DEVICE_IP, DEVICE_PORT, 10000, 4000);

async function fetchAttendance() {
  try {
    console.log(`[${moment().format()}] ⏳ Connecting to device...`);

    const d = await zk.createSocket();
    console.log("gemememen");
    console.log(d);

    const info = await zk.getInfo();
    console.log("Device Info:", info);

    const users = await zk.getUsers();
    console.log(`Users count: ${users.data.length}`);

    const attendances = await zk.getAttendances();

    if (!attendances.data || attendances.data.length === 0) {
      console.log("📭 No new attendance logs.");
    } else {
      console.log(`📋 Found ${attendances.data.length} attendance records:`);

      attendances.data.forEach((log, index) => {
        const { userId, timestamp, verifyType, type } = log;
        const status = type === "0" ? "Check-In" : "Check-Out";
        console.log(`\n🔹 Record #${index + 1}`);
        console.log(`👤 User ID     : ${userId}`);
        console.log(`🕒 Timestamp   : ${timestamp}`);
        console.log(`✅ Verify Type : ${verifyType}`);
        console.log(`🔁 Status      : ${status}`);
      });
    }

    await zk.disconnect();
    console.log("🔌 Disconnected from device.\n");
  } catch (error) {
    console.error("❌ Error fetching data:", error);
  }
}

// Schedule to run every 5 minutes
cron.schedule("*/5 * * * * *", () => {
  console.log("\n⏰ Scheduled task started");
  fetchAttendance();
});
