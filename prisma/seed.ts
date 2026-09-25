import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma";

async function main() {
  console.log("🌱 Starting database seed...");

  await prisma.user.deleteMany();

  // 2. Hash passwords
  const userHashedPassword = await bcrypt.hash("admin123", 10);
  const adminHashedPassword = await bcrypt.hash("member123", 10);
  // 3. Seed Users
  await prisma.user.create({
    data: {
      name: "testing admin",
      email: "admin@gmail.com",
      password: userHashedPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      name: "testing member",
      email: "member@gmail.com",
      password: adminHashedPassword,
      role: Role.MEMBER,
    },
  });
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
