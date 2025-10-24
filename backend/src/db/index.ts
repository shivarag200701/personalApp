// lib/prisma.ts
import { PrismaClient } from "../src/generated/client.js";

// Extend the global object to store the PrismaClient instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Create or retrieve the PrismaClient instance
export const prisma = global.prisma || new PrismaClient();

// In development, store the instance on the global object to reuse across hot-reloads
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
