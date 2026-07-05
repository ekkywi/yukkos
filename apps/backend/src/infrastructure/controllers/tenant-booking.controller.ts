import { Controller, Post, Get, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateBookingUseCase } from '../../application/use-cases/booking/create-booking.use-case';
import { GetTenantBookingsUseCase } from '../../application/use-cases/booking/get-tenant-bookings.use-case';
import { CreateBookingDto } from '../../application/dtos/booking/create-booking.dto';
import { JwtAuthGuard } from '../security/jwt-auth.guard';

@ApiTags('Tenant - Pemesanan Kos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/tenant/bookings')
export class TenantBookingController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly getTenantBookingsUseCase: GetTenantBookingsUseCase,
) {}

  @Post()
  @ApiOperation({ summary: 'Mengajukan pemesanan kos baru' })
  @ApiResponse({ status: 201, description: 'Pengajuan sewa berhasil dibuat.' })
  @ApiResponse({ status: 400, description: 'Kos tidak tersedia atau data tidak valid.' })
  @ApiResponse({ status: 404, description: 'Kos tidak ditemukan.' })
  async create(@Body() dto: CreateBookingDto, @Request() req: any) {
    const tenantId = req.user?.sub;
    if (!tenantId) {
      throw new BadRequestException('Kredensial penyewa tidak valid atau tidak ditemukan.');
    }

    const data = await this.createBookingUseCase.execute(tenantId, dto);
    
    return {
      success: true,
      message: 'Pengajuan sewa berhasil dikirim ke pemilik properti.',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Melihat riwayat pengajuan sewa kos saya' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil data riwayat.' })
  async getMyBookings(@Request() req: any) {
    const tenantId = req.user?.sub;
    if (!tenantId) {
      throw new BadRequestException('Kredensial penyewa tidak valid atau tidak ditemukan.');
    }

    const data = await this.getTenantBookingsUseCase.execute(tenantId);
    
    return {
      success: true,
      data,
    };
  }
}