import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const server = app.listen(env.PORT, () => {
  console.log(`
  🚀 Kasir POS Server is running!
  -----------------------------------------------
  🌐 Local URL:     http://localhost:${env.PORT}
  📖 API Docs:      http://localhost:${env.PORT}/docs (Scalar UI)
  📋 OpenAPI Spec:  http://localhost:${env.PORT}/openapi.json
  💚 Health Check:  http://localhost:${env.PORT}/health
  -----------------------------------------------
  Environment:      ${env.NODE_ENV}
  `);
});

// Graceful Shutdown handling
const handleGracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("🔒 HTTP server closed.");
    try {
      await prisma.$disconnect();
      console.log("💾 Database disconnected.");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error during disconnect:", err);
      process.exit(1);
    }
  });

  // Force close after 10s if hanging
  setTimeout(() => {
    console.error(
      "⚠️ Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
