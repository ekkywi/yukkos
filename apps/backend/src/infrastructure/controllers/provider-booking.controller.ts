import { Controller, Get, Patch, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateBookingStatusUseCase } from '../../application/use-cases/booking/update-booking-status.use-case';
import { UpdateBookingStatusDto } from '../../application/dtos/booking/update-booking-status.dto';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { I_BOOKING_REPOSITORY } from '../../domain/repositories/i-booking.repository';
import type { IBookingRepository } from '../../domain/repositories/i-booking.repository';
import { Inject } from '@nestjs/common';

@ApiTags('Provider - Manajemen Pesanan Masuk')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/provider/bookings')
export class ProviderBookingController {
  constructor(
    private readonly updateBookingStatusUseCase: UpdateBookingStatusUseCase,
    @Inject(I_BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Melihat seluruh pesanan masuk ke properti saya' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil daftar pesanan.' })
  async getMyBookings(@Request() req: any) {
    const providerId = req.user?.sub;
    if (!providerId) throw new BadRequestException('Kredensial tidak valid.');

    const data = await this.bookingRepository.findAllByProviderId(providerId);
    return { success: true, data };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Menerima (APPROVE) atau Menolak (REJECT) pesanan' })
  @ApiResponse({ status: 200, description: 'Status pesanan berhasil diperbarui.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @Request() req: any
  ) {
    const providerId = req.user?.sub;
    if (!providerId) throw new BadRequestException('Kredensial tidak valid.');

    const data = await this.updateBookingStatusUseCase.execute(providerId, id, dto.status);
    return { success: true, message: `Pesanan berhasil di-${dto.status.toLowerCase()}`, data };
  }
}