import { PrismaClient } from "@prisma/client";
declare global {
    var prisma: PrismaClient | undefined;
}
declare let prisma: PrismaClient;
export default prisma;
//# sourceMappingURL=index.d.ts.map