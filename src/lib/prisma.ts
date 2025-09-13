import { PrismaClient } from "@prisma-app/client";

import { singleton } from "~/utils/singleton";

// Hard-code a unique key, so we can look up the client when this module gets re-imported
const prisma = singleton(
  "prisma",
  () => new PrismaClient({ datasourceUrl: process.env.DATABASE_URL }),
);
prisma.$connect();

export { prisma };
