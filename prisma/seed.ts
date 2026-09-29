import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma";

async function main() {
  console.log("🌱 Starting database seed...");

  console.log("🧹 Cleaning up old users...");
  await prisma.user.deleteMany();

  // 1. Hash password SEKALI saja di awal agar tidak berat
  console.log("🔐 Hashing default passwords...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const memberPassword = await bcrypt.hash("member123", 10);

  // 2. Buat akun manual testing
  await prisma.user.createMany({
    data: [
      {
        name: "testing admin",
        email: "admin@gmail.com",
        password: adminPassword,
        role: Role.ADMIN,
      },
      {
        name: "testing member",
        email: "member@gmail.com",
        password: memberPassword,
        role: Role.MEMBER,
      },
    ],
  });

  // 3. Konfigurasi 2 Juta Data (Dibagi per 2.000)
  const TOTAL_USERS = 2_000_000;
  const CHUNK_SIZE = 2_000; // Tiap siklus: bikin 2.000 -> kirim -> ulang
  const totalBatches = Math.ceil(TOTAL_USERS / CHUNK_SIZE);

  console.log(
    `🚀 Memulai seeding ${TOTAL_USERS.toLocaleString()} data secara bertahap (${CHUNK_SIZE.toLocaleString()} per batch, total ${totalBatches.toLocaleString()} batch)...`,
  );

  const startTime = Date.now();

  for (let batch = 1; batch <= totalBatches; batch++) {
    // Array dibuat baru di setiap loop agar memori RAM langsung dibersihkan (GC)
    const usersBatch = [];
    const startIndex = (batch - 1) * CHUNK_SIZE + 1;
    const endIndex = Math.min(batch * CHUNK_SIZE, TOTAL_USERS);

    // Generate 2.000 data
    for (let i = startIndex; i <= endIndex; i++) {
      usersBatch.push({
        name: `User Dummy ${i}`,
        email: `dummy.user.${i}@example.com`,
        password: memberPassword,
        role: i % 50 === 0 ? Role.ADMIN : Role.MEMBER,
      });
    }

    // Insert 2.000 data ke database
    await prisma.user.createMany({
      data: usersBatch,
      skipDuplicates: true,
    });

    // Logging progress setiap 10 batch (setiap 20.000 data) biar terminal gak terlalu penuh
    if (batch % 10 === 0 || batch === totalBatches) {
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
      const percent = ((endIndex / TOTAL_USERS) * 100).toFixed(1);
      console.log(
        `✅ Progress: ${endIndex.toLocaleString()} / ${TOTAL_USERS.toLocaleString()} (${percent}%) - Batch ${batch}/${totalBatches} [${elapsedSec}s]`,
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `🎉 Berhasil memasukkan ${TOTAL_USERS.toLocaleString()} user dalam ${totalTime} detik!`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
