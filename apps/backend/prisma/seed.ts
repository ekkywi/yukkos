import { PrismaClient, Role, StatusListing, TypeListing } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Memulai proses seeding database...');

  // 1. Membuat Akun Provider Default
  const hashedPassword = await bcrypt.hash('password123', 10);
  const provider = await prisma.user.upsert({
    where: { email: 'admin@yukkos.com' },
    update: {},
    create: {
      email: 'admin@yukkos.com',
      name: 'Admin Pemilik Kos',
      password: hashedPassword,
      role: Role.PROVIDER,
    },
  });
  console.log(`User Provider dibuat: ${provider.email}`);

  // 2. Membuat Master Data Fasilitas
  const wifi = await prisma.facility.upsert({ where: { name: 'WiFi' }, update: {}, create: { name: 'WiFi' } });
  const ac = await prisma.facility.upsert({ where: { name: 'AC' }, update: {}, create: { name: 'AC' } });
  const kamarMandiDalam = await prisma.facility.upsert({ where: { name: 'Kamar Mandi Dalam' }, update: {}, create: { name: 'Kamar Mandi Dalam' } });
  const parkirMobil = await prisma.facility.upsert({ where: { name: 'Parkir Mobil' }, update: {}, create: { name: 'Parkir Mobil' } });

  // 3. Membuat Listing Kos 1 (Kos Putra)
  const kos1 = await prisma.listing.create({
    data: {
      name: 'Kos Bintang Terang',
      city: 'Semarang',
      fullAddress: 'Jl. Tlogosari Raya No. 15, Pedurungan, Semarang',
      monthlyPrice: 850000,
      description: 'Kos nyaman dan tenang, cocok untuk mahasiswa.',
      status: StatusListing.AVAILABLE,
      type: TypeListing.MALE,
      provider: {
        connect: {
          id: provider.id,
        },
      },
      facilities: {
        create: [
          { facility: { connect: { id: wifi.id } } },
          { facility: { connect: { id: kamarMandiDalam.id } } },
        ],
      },
    },
  });

  // 4. Membuat Listing Kos 2 (Kos Putri)
  const kos2 = await prisma.listing.create({
    data: {
      name: 'Kos Eksklusif Mawar',
      city: 'Semarang',
      fullAddress: 'Jl. Majapahit No. 100, Gayamsari, Semarang',
      monthlyPrice: 1500000,
      description: 'Kos eksklusif dengan fasilitas lengkap.',
      status: StatusListing.FULL,
      type: TypeListing.FEMALE,
      provider: {
        connect: {
          id: provider.id,
        },
      },
      facilities: {
        create: [
          { facility: { connect: { id: wifi.id } } },
          { facility: { connect: { id: ac.id } } },
          { facility: { connect: { id: kamarMandiDalam.id } } },
          { facility: { connect: { id: parkirMobil.id } } },
        ],
      },
    },
  });

  console.log('Seeding selesai.');
  console.log(`Dibuat: ${kos1.name} (Tipe: ${kos1.type}, ID: ${kos1.id})`);
  console.log(`Dibuat: ${kos2.name} (Tipe: ${kos2.type}, ID: ${kos2.id})`);
}

main()
  .catch((e) => {
    console.error('Galat saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
