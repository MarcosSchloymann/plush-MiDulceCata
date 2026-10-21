import path from "path";
import dotenv from "dotenv";
import { prisma } from "../src/db";
import { bootstrap } from "../src/bootstrap";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

bootstrap()
  .then(async () => {
    console.log("Base lista.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
