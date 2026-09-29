import { Role, RoomType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma";

async function seedUsers() {
  console.log("\n========================================");
  console.log("🌱 Memulai seeding USERS (2 Juta Data)...");
  console.log("========================================");

  console.log("🧹 Membersihkan data bookings dan users lama...");
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();

  // 1. Hash password SEKALI saja di awal agar tidak berat
  console.log("🔐 Hashing default passwords...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const memberPassword = await bcrypt.hash("member123", 10);

  // 2. Buat akun manual testing
  console.log("👤 Membuat akun manual testing...");
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
    `🚀 Memulai seeding ${TOTAL_USERS.toLocaleString()} users secara bertahap (${CHUNK_SIZE.toLocaleString()} per batch, total ${totalBatches.toLocaleString()} batch)...`,
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
        `✅ Progress Users: ${endIndex.toLocaleString()} / ${TOTAL_USERS.toLocaleString()} (${percent}%) - Batch ${batch}/${totalBatches} [${elapsedSec}s]`,
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `🎉 Berhasil memasukkan ${TOTAL_USERS.toLocaleString()} user dalam ${totalTime} detik!`,
  );
}

async function seedRooms() {
  console.log("\n========================================");
  console.log("🌱 Memulai seeding ROOMS (2 Juta Data)...");
  console.log("========================================");

  console.log("🧹 Membersihkan data bookings dan rooms lama...");
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();

  // 1. Buat room manual testing
  console.log("🏢 Membuat room manual testing...");
  await prisma.room.createMany({
    data: [
      {
        code: "RM-MAIN-01",
        name: "Executive Meeting Room",
        type: RoomType.MEETING_ROOM,
        capacity: 12,
        hourlyRate: 150000,
        creditRatePerHour: 2.0,
        isActive: true,
      },
      {
        code: "HD-FLEX-01",
        name: "Dedicated Hot Desk A",
        type: RoomType.HOT_DESK,
        capacity: 1,
        hourlyRate: 25000,
        creditRatePerHour: 0.5,
        isActive: true,
      },
      {
        code: "ST-POD-01",
        name: "Studio Podcast Pro",
        type: RoomType.PODCAST_STUDIO,
        capacity: 4,
        hourlyRate: 100000,
        creditRatePerHour: 1.5,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // 2. Konfigurasi 2 Juta Data (Dibagi per 2.000)
  const TOTAL_ROOMS = 2_000_000;
  const CHUNK_SIZE = 2_000; // Tiap siklus: buat 2.000 -> kirim -> ulang
  const totalBatches = Math.ceil(TOTAL_ROOMS / CHUNK_SIZE);
  const roomTypes = [
    RoomType.MEETING_ROOM,
    RoomType.HOT_DESK,
    RoomType.PODCAST_STUDIO,
  ];

  console.log(
    `🚀 Memulai seeding ${TOTAL_ROOMS.toLocaleString()} rooms secara bertahap (${CHUNK_SIZE.toLocaleString()} per batch, total ${totalBatches.toLocaleString()} batch)...`,
  );

  const startTime = Date.now();

  for (let batch = 1; batch <= totalBatches; batch++) {
    // Array dibuat baru di setiap loop agar memori RAM langsung dibersihkan (GC)
    const roomsBatch = [];
    const startIndex = (batch - 1) * CHUNK_SIZE + 1;
    const endIndex = Math.min(batch * CHUNK_SIZE, TOTAL_ROOMS);

    // Generate 2.000 data
    for (let i = startIndex; i <= endIndex; i++) {
      roomsBatch.push({
        code: `ROOM-${i}`, // Max 20 chars, 'ROOM-2000000' is 12 chars
        name: `Room Dummy ${i}`,
        type: roomTypes[i % roomTypes.length],
        capacity: ((i % 10) + 1) * 2, // Kapasitas 2 - 20 orang
        hourlyRate: 50000 + (i % 10) * 10000, // Rp 50.000 - Rp 140.000
        creditRatePerHour: 1.0 + (i % 4) * 0.5, // 1.0 - 2.5 credits
        isActive: i % 50 !== 0, // 98% aktif
      });
    }

    // Insert 2.000 data ke database
    await prisma.room.createMany({
      data: roomsBatch,
      skipDuplicates: true,
    });

    // Logging progress setiap 10 batch (setiap 20.000 data)
    if (batch % 10 === 0 || batch === totalBatches) {
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
      const percent = ((endIndex / TOTAL_ROOMS) * 100).toFixed(1);
      console.log(
        `✅ Progress Rooms: ${endIndex.toLocaleString()} / ${TOTAL_ROOMS.toLocaleString()} (${percent}%) - Batch ${batch}/${totalBatches} [${elapsedSec}s]`,
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `🎉 Berhasil memasukkan ${TOTAL_ROOMS.toLocaleString()} room dalam ${totalTime} detik!`,
  );
}

async function main() {
  const target = process.argv[2]?.toLowerCase();

  if (target === "users") {
    await seedUsers();
  } else if (target === "rooms") {
    await seedRooms();
  } else {
    await seedUsers();
    await seedRooms();
  }
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
