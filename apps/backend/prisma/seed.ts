import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Memulai proses seeding database...');

  const wifi = await prisma.facility.upsert({
    where: { name: 'WiFi' },
    update: {},
    create: { name: 'WiFi' },
  });

  const ac = await prisma.facility.upsert({
    where: { name: 'AC' },
    update: {},
    create: { name: 'AC' },
  });

  const kamarMandiDalam = await prisma.facility.upsert({
    where: { name: 'Kamar Mandi Dalam' },
    update: {},
    create: { name: 'Kamar Mandi Dalam' },
  });

  const parkirMobil = await prisma.facility.upsert({
    where: { name: 'Parkir Mobil' },
    update: {},
    create: { name: 'Parkir Mobil' },
  });

  const kos1 = await prisma.listing.create({
    data: {
      name: 'Kos Bintang Terang',
      city: 'Semarang',
      fullAddress: 'Jl. Tlogosari Raya No. 15, Pedurungan, Semarang',
      monthlyPrice: 850000,
      description: 'Kos nyaman dan tenang, cocok untuk mahasiswa. Dekat dengan jalan raya dan akses transportasi mudah.',
      status: 'AVAILABLE',
      facilities: {
        create: [
          { facilityId: wifi.id },
          { facilityId: kamarMandiDalam.id },
        ],
      },
    },
  });

  const kos2 = await prisma.listing.create({
    data: {
      name: 'Kos Eksklusif Mawar',
      city: 'Semarang',
      fullAddress: 'Jl. Majapahit No. 100, Gayamsari, Semarang',
      monthlyPrice: 1500000,
      description: 'Kos eksklusif dengan fasilitas lengkap menyerupai apartemen.',
      status: 'FULL',
      facilities: {
        create: [
          { facilityId: wifi.id },
          { facilityId: ac.id },
          { facilityId: kamarMandiDalam.id },
          { facilityId: parkirMobil.id },
        ],
      },
    },
  });

  console.log('Seeding selesai.');
  console.log(`Dibuat: ${kos1.name} (ID: ${kos1.id})`);
  console.log(`Dibuat: ${kos2.name} (ID: ${kos2.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });