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
  console.log('Memulai proses seeding universal (Kos, Apartemen, Kontrakan)...');

  // 1. Akun Provider
  const hashedPassword = await bcrypt.hash('password123', 10);
  const provider = await prisma.user.upsert({
    where: { email: 'admin@yukkos.com' },
    update: {},
    create: {
      email: 'admin@yukkos.com',
      name: 'Yukkos Offical',
      password: hashedPassword,
      role: Role.PROVIDER,
    },
  });

  // 2. Master Fasilitas
  const facilityNames = [
    'WiFi', 'AC', 'Kamar Mandi Dalam', 'Kamar Mandi Luar', 'Parkir Mobil', 
    'Parkir Motor', 'Dapur Bersama', 'Kulkas Umum', 'Ruang Cuci Jemur', 
    'Akses Kunci 24 Jam', 'CCTV Keamanan', 'Pembersihan Kamar',
    'Kolam Renang', 'Gym', 'Balkon' // Tambahan fasilitas apartemen
  ];

  const facilityRecords = await Promise.all(
    facilityNames.map((name) =>
      prisma.facility.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  // 3. Metadata Kota & Area
  const cities = ['Semarang', 'Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya', 'Malang'];
  const areaMapping: Record<string, string[]> = {
    Semarang: ['Tembalang', 'Tlogosari', 'Pedurungan', 'Pleburan', 'Ngaliyan'],
    Jakarta: ['Tebet', 'Kemang', 'Grogol', 'Salemba', 'Kuningan'],
    Bandung: ['Dago', 'Jatinangor', 'Cihampelas', 'Buahbatu', 'Dipatiukur'],
    Yogyakarta: ['Sleman', 'Depok', 'Gondokusuman', 'Malioboro', 'Seturan'],
    Surabaya: ['Gubeng', 'Sukolilo', 'Rungkut', 'Ketintang', 'Mulyorejo'],
    Malang: ['Lowokwaru', 'Suhat', 'Klojen', 'Dinoyo', 'Blimbing']
  };

  const adjectives = ['Eksklusif', 'Nyaman', 'Aman', 'Premium', 'Elite', 'Modern'];
  
  let createdCount = 0;

  // 4. Proses Generasi Data (60 Properti)
  for (let i = 1; i <= 60; i++) {
    const city = i <= 30 ? 'Semarang' : cities[i % (cities.length - 1) + 1];
    const availableAreas = areaMapping[city];
    const area = availableAreas[Math.floor(Math.random() * availableAreas.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    // Logika Penentuan Kategori (Properti Tiruan)
    const categoryRand = Math.random();
    let propertyKind = 'KOS'; // 60% probabilitas
    if (categoryRand > 0.8) propertyKind = 'APARTMENT'; // 20% probabilitas
    else if (categoryRand > 0.6) propertyKind = 'HOUSE'; // 20% probabilitas

    let name, basePrice, description, type;

    if (propertyKind === 'APARTMENT') {
      name = `Apartemen ${adjective} ${area} Tower ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`;
      basePrice = Math.floor(Math.random() * 50 + 30) * 100000; // Harga 3jt - 8jt
      description = `Sewa Apartemen ${name} unit Studio/2BR dengan fasilitas super lengkap dan view kota ${city}. Cocok untuk eksekutif muda.`;
      type = TypeListing.MIXED; // Apartemen selalu campur
    } else if (propertyKind === 'HOUSE') {
      name = `Rumah Kontrakan ${area} Blok ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`;
      basePrice = Math.floor(Math.random() * 35 + 15) * 100000; // Harga 1.5jt - 5jt
      description = `Rumah sewaan keluarga di lingkungan nyaman ${area}, ${city}. Bebas banjir, dekat akses tol dan sekolah.`;
      type = TypeListing.MIXED; // Rumah keluarga selalu campur
    } else {
      name = `Kos ${adjective} ${area} No. ${i}`;
      basePrice = Math.floor(Math.random() * 21 + 10) * 50000; // Harga 500k - 1.5jt
      if (city === 'Jakarta') basePrice += 500000;
      else if (city === 'Yogyakarta' || city === 'Malang') basePrice = Math.max(400000, basePrice - 150000);
      
      const typeRand = Math.random();
      type = typeRand < 0.4 ? TypeListing.MIXED : (typeRand < 0.7 ? TypeListing.MALE : TypeListing.FEMALE);
      description = `Hunian kos ${type.toLowerCase()} terbaik di ${city}, tepatnya di kawasan ${area}. Fasilitas lengkap sesuai standar kenyamanan.`;
    }

    const status = Math.random() < 0.8 ? StatusListing.AVAILABLE : StatusListing.FULL;

    const shuffledFacilities = [...facilityRecords].sort(() => 0.5 - Math.random());
    const selectedFacilities = shuffledFacilities.slice(0, Math.floor(Math.random() * 4) + 4);
    const facilityConnects = selectedFacilities.map(f => ({ facility: { connect: { id: f.id } } }));

    await prisma.listing.create({
      data: {
        name,
        city,
        fullAddress: `Jl. Utama ${area} No. ${i}, Kota ${city}`,
        monthlyPrice: basePrice,
        description,
        status,
        type,
        provider: { connect: { id: provider.id } },
        facilities: { create: facilityConnects },
      },
    });

    createdCount++;
  }

  console.log(`\n=== PROSES SEEDING BERHASIL ===`);
  console.log(`Total: ${createdCount} properti (Campuran Kos, Apartemen, dan Kontrakan di 6 Kota).`);
}

main()
  .catch((e) => {
    console.error('Proses seeding gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });