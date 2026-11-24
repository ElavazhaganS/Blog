import path from "node:path";
import fs from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";

async function main() {
  const dbPath = path.resolve(process.cwd(), ".data/mongodb");
  fs.mkdirSync(dbPath, { recursive: true });

  console.log("Starting local MongoDB (first run downloads the binary)...");

  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: "devlog",
      dbPath,
      storageEngine: "wiredTiger",
    },
  });

  process.env.MONGODB_URI = mongod.getUri("devlog");
  process.env.JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";

  console.log(`MongoDB ready at ${process.env.MONGODB_URI}`);

  const shutdown = async () => {
    await mongod.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await import("./server.js");
}

main().catch((error) => {
  console.error("Could not start development server:", error);
  process.exit(1);
});
