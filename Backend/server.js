require("dotenv").config();
const app = require("./app");
const { testConnection } = require("./config/db");

const PORT = process.env.PORT || 5000;


async function startServer() {
  try {
    const connResult = await testConnection();
    if (connResult && connResult.healthy) {

      console.log("Database connected successfully");
    } else {
      console.warn("Database connection issue:", connResult?.error || "unknown error");
    }

    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
