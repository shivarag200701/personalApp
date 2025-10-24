// lib/prisma.ts
import { PrismaClient } from "../src/generated/client.js";
// Create or retrieve the PrismaClient instance
export const prisma = global.prisma || new PrismaClient();
// In development, store the instance on the global object to reuse across hot-reloads
if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}
//# sourceMappingURL=index.js.map