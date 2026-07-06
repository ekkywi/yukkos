import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusListing, TypeListing } from '../../../domain/entities/listing.entity';

export class CreateListingDto {
    @ApiProperty({ example: 'Kos Bintang Terang', description: 'Nama properti kos' })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ example: 'Semarang', description: 'Kota' })
    @IsNotEmpty()
    @IsString()
    city!: string;

    @ApiProperty({ example: 'Jl. Tlogosari Raya No 15', description: 'Alamat lengkap' })
    @IsNotEmpty()
    @IsString()
    fullAddress!: string;

    @ApiProperty({ example: 850000, description: 'Harga sewa per bulan' })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    monthlyPrice!: number;

    @ApiProperty({ example: 'Kos nyaman, bersih, dan aman.', description: 'Deskirpsi fasilitas dan aturan' })
    @IsNotEmpty()
    @IsString()
    description!: string;

    @ApiProperty({ enum: TypeListing, example: TypeListing.MIXED, description: 'Target penghuni kos' })
    @IsNotEmpty()
    @IsEnum(TypeListing)
    type!: TypeListing;

    @ApiPropertyOptional({ enum: StatusListing, example: StatusListing.AVAILABLE })
    @IsOptional()
    @IsEnum(StatusListing)
    status?: StatusListing;

    @ApiPropertyOptional({ type: [Number], example: [1,2,3], description:'Daftar ID Fasilitas yang tersedia' })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    facilityIds?: number[];

    @ApiPropertyOptional({ description: 'URL gambar utama dari Cloudinary' })
    @IsOptional()
    @IsString()
    mainImage?: string;
}
