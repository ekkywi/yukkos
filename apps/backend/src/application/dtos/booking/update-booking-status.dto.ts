import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookingStatus } from '../../../domain/entities/booking.entity';

export class UpdateBookingStatusDto {
  @ApiProperty({ 
    description: 'Status baru pemesanan', 
    enum: [BookingStatus.APPROVED, BookingStatus.REJECTED] 
  })
  @IsEnum(BookingStatus, { message: 'Status hanya boleh APPROVED atau REJECTED' })
  @IsNotEmpty()
  status!: BookingStatus;
}