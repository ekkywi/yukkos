import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: 'ID hunian yang ingin disewa' })
  @IsString()
  @IsNotEmpty()
  listingId!: string;

  @ApiProperty({ description: 'Tanggal rencana mulai sewa (Format ISO 8601, contoh: 2026-08-01T00:00:00Z)' })
  @IsDateString()
  @IsNotEmpty()
  checkInDate!: string;

  @ApiProperty({ description: 'Durasi sewa dalam bulan (Minimal 1)' })
  @IsNumber()
  @Min(1)
  durationMonths!: number;
}
