import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
// Importing the env config guarantees `dotenv.config()` has run before
// `process.env.MONGODB_URI` is read below. Relying on the caller to import
// it is fragile: TypeScript elides imports whose bindings are unused (e.g.
// `import { env } from "./config/env"` in seed.ts), which silently skipped
// dotenv and made the seed script talk to a throwaway in-memory database.
import "./env";

let mongoServer: MongoMemoryServer | null = null;

/**
 * Describe a MongoDB connection string without ever leaking credentials.
 * Returns the host (which may include the port), the database name and a
 * human readable source label so startup logs make it obvious *which*
 * database the process is talking to.
 */
export function describeMongoUri(
  uri: string
): { host: string; database: string; source: string } {
  const match = /^mongodb(?:\+srv)?:\/\/(?:[^@/]*@)?([^/?#]*)(?:\/([^?#]*))?/i.exec(
    uri.trim()
  );
  const host = match?.[1] || "unknown-host";
  const database = match?.[2] || "(default)";
  const source = /\+srv:\/\//i.test(uri)
    ? "MongoDB Atlas (SRV)"
    : /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host)
      ? "Local MongoDB"
      : "MongoDB";
  return { host, database, source };
}

/** Strip the userinfo section of a connection string so it is safe to log. */
export function maskMongoUri(uri: string): string {
  return uri.replace(
    /^(mongodb(?:\+srv)?:\/\/)[^@/]*@/i,
    "$1***:***@"
  );
}

export async function connectDB(): Promise<void> {
  const uri = (process.env.MONGODB_URI || "").trim();
  const useMemoryDb = /^(1|true|yes|on)$/i.test(
    (process.env.USE_MEMORY_DB || "").trim()
  );

  if (!uri) {
    if (!useMemoryDb) {
      throw new Error(
        "MONGODB_URI is not set. Refusing to start against an implicit " +
          "in-memory MongoDB, because that silently serves empty data and " +
          "hides deployment misconfiguration. Set MONGODB_URI in backend/.env " +
          "(or the environment), or opt in explicitly with USE_MEMORY_DB=true " +
          "for local, throwaway data."
      );
    }
    mongoServer = await MongoMemoryServer.create({
      instance: { launchTimeout: 60000 },
    });
    const memUri = mongoServer.getUri();
    await mongoose.connect(memUri);
    const { database } = describeMongoUri(memUri);
    console.log(
      `[db] Using in-memory MongoDB (USE_MEMORY_DB=true) database="${database}" ` +
        "- data is NOT persisted."
    );
    return;
  }

  await mongoose.connect(uri);
  const { host, database, source } = describeMongoUri(uri);
  console.log(
    `[db] Connected to ${source} host="${host}" database="${database}" ` +
      `uri=${maskMongoUri(uri)}`
  );
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}
