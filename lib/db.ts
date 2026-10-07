import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Detect serverless environment (Vercel, AWS Lambda, Netlify)
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY
  );

  if (isServerless) {
    const tmpDbPath = path.join("/tmp", "dev.db");

    // Copy bundled seed database to /tmp if it doesn't exist yet
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.join(__dirname, "..", "prisma", "dev.db"),
        path.join(__dirname, "prisma", "dev.db"),
        path.join("/var/task", "prisma", "dev.db"),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            try {
              fs.chmodSync(tmpDbPath, 0o666);
            } catch {}
            break;
          } catch (e) {
            console.error("Failed to copy db candidate to /tmp:", candidate, e);
          }
        }
      }
    }

    return `file:${tmpDbPath}`;
  }

  // Local development / Persistent server environment
  const localDb = path.resolve(process.cwd(), "prisma", "dev.db");
  return `file:${localDb}`;
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
