import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma/prisma.service';
import { FacilityResponseDto } from '../../application/dtos/facility/facility-response.dto';

@ApiTags('Master - Fasilitas')
@Controller('v1/facilities')
export class FacilityController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar fasilitas master untuk form hunian' })
  @ApiResponse({ status: 200, description: 'Berhasil mendapatkan daftar fasilitas.' })
  async findAll(): Promise<{ success: true; count: number; data: FacilityResponseDto[] }> {
    const facilities = await this.prisma.facility.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      success: true,
      count: facilities.length,
      data: facilities,
    };
  }
}
